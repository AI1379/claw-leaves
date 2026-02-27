use std::process::{Child, Command};
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, State};
use tokio::time::{sleep, Duration};

#[derive(Clone, serde::Serialize)]
pub struct SSHTunnelStatusPayload {
    pub status: String, // "online" | "offline" | "checking"
    pub local_port: u16,
    pub remote_port: u16,
    pub remote_host: String,
}

pub struct TunnelManager {
    pub child: Mutex<Option<Child>>,
}

impl TunnelManager {
    pub fn new() -> Self {
        Self {
            child: Mutex::new(None),
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

    // ssh -N -L <local_port>:127.0.0.1:<remote_port> <user>@<host> -p <port>
    let mut cmd = Command::new("ssh");
    cmd.arg("-N")
        .arg("-L")
        .arg(format!("{}:127.0.0.1:{}", cfg.local_port, cfg.remote_port))
        .arg(format!("{}@{}", cfg.ssh_user, cfg.ssh_host))
        .arg("-p")
        .arg(cfg.ssh_port.to_string());

    if let Some(key_path) = &cfg.ssh_key_path {
        cmd.arg("-i").arg(key_path);
    }

    println!("[tunnel] Starting SSH tunnel: {:?}", cmd);

    let child = cmd.spawn().map_err(|e| e.to_string())?;
    *lock = Some(child);

    // Emit checking status
    app.emit(
        "ssh-tunnel-status",
        SSHTunnelStatusPayload {
            status: "checking".to_string(),
            local_port: cfg.local_port,
            remote_port: cfg.remote_port,
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

    let cfg = crate::config::load();
    app.emit(
        "ssh-tunnel-status",
        SSHTunnelStatusPayload {
            status: "offline".to_string(),
            local_port: cfg.local_port,
            remote_port: cfg.remote_port,
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
            let (status, lp, rp, host) = {
                let cfg = crate::config::load();
                let state = handle.state::<TunnelManager>();
                let mut lock = state.child.lock().unwrap();

                let current_status = if let Some(child) = lock.as_mut() {
                    match child.try_wait() {
                        Ok(None) => "online".to_string(), // Still running
                        Ok(Some(s)) => {
                            println!("[tunnel] SSH process exited with status: {}", s);
                            *lock = None;
                            "offline".to_string()
                        }
                        Err(e) => {
                            eprintln!("[tunnel] Error checking SSH process: {}", e);
                            "offline".to_string()
                        }
                    }
                } else {
                    "offline".to_string()
                };

                (
                    current_status,
                    cfg.local_port,
                    cfg.remote_port,
                    cfg.ssh_host.clone(),
                )
            };

            let payload = SSHTunnelStatusPayload {
                status,
                local_port: lp,
                remote_port: rp,
                remote_host: host,
            };

            if let Err(e) = handle.emit("ssh-tunnel-status", &payload) {
                eprintln!("[tunnel] Failed to emit ssh-tunnel-status: {e}");
            }

            sleep(Duration::from_secs(2)).await;
        }
    });
}
