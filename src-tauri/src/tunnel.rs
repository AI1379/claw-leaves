use std::process::{Child, Command};
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, State};
use tokio::time::{sleep, Duration};

use crate::config::{ForwardType, SshTunnelConfig};

#[derive(Clone, serde::Serialize)]
pub struct SSHTunnelStatusPayload {
    pub status: String, // "online" | "offline" | "checking" | "reconnecting"
    pub tunnels: Vec<SshTunnelConfig>,
    pub remote_host: String,
}

pub struct TunnelManager {
    pub child: Mutex<Option<Child>>,
    pub target_state: Mutex<bool>,
    pub retry_count: Mutex<u32>,
}

impl TunnelManager {
    pub fn new() -> Self {
        Self {
            child: Mutex::new(None),
            target_state: Mutex::new(false),
            retry_count: Mutex::new(0),
        }
    }
}

#[tauri::command]
pub async fn open_ssh_tunnel(
    app: AppHandle,
    state: State<'_, TunnelManager>,
) -> Result<(), String> {
    let cfg = crate::config::load();

    // Kill existing tunnel if any
    let mut lock = state.child.lock().unwrap();
    if let Some(mut child) = lock.take() {
        let _ = child.kill();
    }

    *state.target_state.lock().unwrap() = true;
    *state.retry_count.lock().unwrap() = 0;

    // ssh -N -L <local_port>:127.0.0.1:<remote_port> ...
    let mut cmd = Command::new("ssh");
    cmd.arg("-N");

    for tunnel in &cfg.tunnels {
        let fwd = match tunnel.forward_type {
            ForwardType::Local => "-L",
            ForwardType::Reverse => "-R",
        };
        cmd.arg(fwd).arg(format!(
            "{}:127.0.0.1:{}",
            tunnel.local_port, tunnel.remote_port
        ));
    }

    cmd.arg(format!("{}@{}", cfg.ssh_user, cfg.ssh_host))
        .arg("-p")
        .arg(cfg.ssh_port.to_string());

    if let Some(key_path) = &cfg.ssh_key_path {
        cmd.arg("-i").arg(key_path);
    }

    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        cmd.creation_flags(CREATE_NO_WINDOW);
    }

    let child = cmd.spawn().map_err(|e| e.to_string())?;
    *lock = Some(child);

    // Emit checking status
    app.emit(
        "ssh-tunnel-status",
        SSHTunnelStatusPayload {
            status: "checking".to_string(),
            tunnels: cfg.tunnels.clone(),
            remote_host: cfg.ssh_host.clone(),
        },
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn close_ssh_tunnel(
    app: AppHandle,
    state: State<'_, TunnelManager>,
) -> Result<(), String> {
    let mut lock = state.child.lock().unwrap();
    if let Some(mut child) = lock.take() {
        let _ = child.kill();
    }

    *state.target_state.lock().unwrap() = false;
    *state.retry_count.lock().unwrap() = 0;

    let cfg = crate::config::load();
    app.emit(
        "ssh-tunnel-status",
        SSHTunnelStatusPayload {
            status: "offline".to_string(),
            tunnels: cfg.tunnels.clone(),
            remote_host: cfg.ssh_host.clone(),
        },
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

/// Spawn a background task that checks if the SSH process is still alive.
pub fn start_tunnel_monitor(app: AppHandle, _state: State<'_, TunnelManager>) {
    let handle = app.clone();

    tauri::async_runtime::spawn(async move {
        loop {
            let (status, current_tunnels, host, should_restart, backoff_secs) = {
                let cfg = crate::config::load();
                let state = handle.state::<TunnelManager>();
                let mut lock = state.child.lock().unwrap();
                let target_state = *state.target_state.lock().unwrap();
                let mut retry_count = state.retry_count.lock().unwrap();

                let mut should_restart = false;
                let mut current_status = "offline".to_string();

                if target_state {
                    let is_alive = if let Some(child) = lock.as_mut() {
                        match child.try_wait() {
                            Ok(None) => true, // Still running
                            Ok(Some(s)) => {
                                println!("[tunnel] SSH process exited with status: {}", s);
                                *lock = None;
                                false
                            }
                            Err(e) => {
                                eprintln!("[tunnel] Error checking SSH process: {}", e);
                                false
                            }
                        }
                    } else {
                        false
                    };

                    if is_alive {
                        current_status = "online".to_string();
                        if *retry_count > 0 {
                            *retry_count = 0;
                        }
                    } else {
                        current_status = "reconnecting".to_string();
                        should_restart = true;
                    }
                } else {
                    current_status = "offline".to_string();
                    *retry_count = 0;
                }

                let backoff_secs = if should_restart {
                    let delay = cfg.ssh_backoff_min_secs * (2_u64.pow(*retry_count));
                    let max_delay = 60;
                    *retry_count += 1;
                    std::cmp::min(delay, max_delay)
                } else {
                    0
                };

                (
                    current_status,
                    cfg.tunnels.clone(),
                    cfg.ssh_host.clone(),
                    should_restart,
                    backoff_secs,
                )
            };

            let payload = SSHTunnelStatusPayload {
                status,
                tunnels: current_tunnels.clone(),
                remote_host: host,
            };

            if let Err(e) = handle.emit("ssh-tunnel-status", &payload) {
                eprintln!("[tunnel] Failed to emit ssh-tunnel-status: {e}");
            }

            if should_restart {
                sleep(Duration::from_secs(backoff_secs)).await;
                // Re-launch the process
                let cfg = crate::config::load();
                let state = handle.state::<TunnelManager>();
                let mut lock = state.child.lock().unwrap();
                let target_state = *state.target_state.lock().unwrap();

                if target_state && lock.is_none() {
                    let mut cmd = Command::new("ssh");
                    cmd.arg("-N");
                    for tunnel in &cfg.tunnels {
                        let fwd_arg = match tunnel.forward_type {
                            ForwardType::Local => "-L",
                            ForwardType::Reverse => "-R",
                        };
                        cmd.arg(fwd_arg).arg(format!(
                            "{}:127.0.0.1:{}",
                            tunnel.local_port, tunnel.remote_port
                        ));
                    }
                    cmd.arg(format!("{}@{}", cfg.ssh_user, cfg.ssh_host))
                        .arg("-p")
                        .arg(cfg.ssh_port.to_string());

                    if let Some(key_path) = &cfg.ssh_key_path {
                        cmd.arg("-i").arg(key_path);
                    }

                    #[cfg(windows)]
                    {
                        use std::os::windows::process::CommandExt;
                        const CREATE_NO_WINDOW: u32 = 0x08000000;
                        cmd.creation_flags(CREATE_NO_WINDOW);
                    }

                    match cmd.spawn() {
                        Ok(child) => *lock = Some(child),
                        Err(e) => eprintln!("[tunnel] Failed to restart SSH tunnel: {}", e),
                    }
                }
            } else {
                sleep(Duration::from_secs(2)).await;
            }
        }
    });
}
