use std::process::{Child, Command};
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, State};
use tokio::time::{sleep, Duration};

#[derive(Clone, serde::Serialize)]
pub struct NodeServiceStatusPayload {
    pub status: String, // "online" | "offline" | "checking"
    pub host: String,
    pub port: u16,
}

pub struct NodeManager {
    pub child: Mutex<Option<Child>>,
}

impl NodeManager {
    pub fn new() -> Self {
        Self {
            child: Mutex::new(None),
        }
    }
}

#[tauri::command]
pub async fn open_node_service(
    app: AppHandle,
    state: State<'_, NodeManager>,
) -> Result<(), String> {
    let cfg = crate::config::load();

    // Kill existing node process if any
    let mut lock = state.child.lock().unwrap();
    if let Some(mut child) = lock.take() {
        let _ = child.kill();
    }

    // openclaw node run --host <host> --port <port>
    let split_cmd = cfg.openclaw_cmd.split_whitespace().collect::<Vec<&str>>();
    let mut cmd = Command::new(split_cmd[0]);
    cmd.args(&split_cmd[1..])
        .arg("node")
        .arg("run")
        .arg("--host")
        .arg(&cfg.node_host)
        .arg("--port")
        .arg(cfg.node_port.to_string());

    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        cmd.creation_flags(CREATE_NO_WINDOW);
    }

    println!("[node] Starting openclaw node: {:?}", cmd);

    let child = cmd
        .spawn()
        .map_err(|e| format!("Failed to spawn openclaw: {}", e))?;
    *lock = Some(child);

    // Emit checking status
    app.emit(
        "node-service-status",
        NodeServiceStatusPayload {
            status: "checking".to_string(),
            host: cfg.node_host.clone(),
            port: cfg.node_port,
        },
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn close_node_service(
    app: AppHandle,
    state: State<'_, NodeManager>,
) -> Result<(), String> {
    let mut lock = state.child.lock().unwrap();
    if let Some(mut child) = lock.take() {
        // TODO: Current implementation is not that good, but it works.
        // A better way must be found if we want to capture the stdout and stderr.
        if cfg!(windows) {
            let _ = Command::new("taskkill")
                .arg("/F")
                .arg("/T")
                .arg("/PID")
                .arg(child.id().to_string())
                .spawn()
                .unwrap()
                .wait()
                .unwrap();
        } else {
            let _ = child
                .kill()
                .map_err(|e| println!("[node] Failed to kill node process: {}", e));
        }
    } else {
        println!("[node] No node process to kill");
    }

    println!("[node] Node process killed");

    let cfg = crate::config::load();
    app.emit(
        "node-service-status",
        NodeServiceStatusPayload {
            status: "offline".to_string(),
            host: cfg.node_host.clone(),
            port: cfg.node_port,
        },
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

pub fn start_node_monitor(app: AppHandle, _state: State<'_, NodeManager>) {
    let handle = app.clone();

    tauri::async_runtime::spawn(async move {
        loop {
            let (status, host, port) = {
                let cfg = crate::config::load();
                let state = handle.state::<NodeManager>();
                let mut lock = state.child.lock().unwrap();

                let current_status = if let Some(child) = lock.as_mut() {
                    match child.try_wait() {
                        Ok(None) => "online".to_string(),
                        Ok(Some(s)) => {
                            println!("[node] Node process exited with status: {}", s);
                            *lock = None;
                            "offline".to_string()
                        }
                        Err(e) => {
                            eprintln!("[node] Error checking node process: {}", e);
                            "offline".to_string()
                        }
                    }
                } else {
                    "offline".to_string()
                };

                (current_status, cfg.node_host.clone(), cfg.node_port)
            };

            let payload = NodeServiceStatusPayload { status, host, port };

            if let Err(e) = handle.emit("node-service-status", &payload) {
                eprintln!("[node] Failed to emit node-service-status: {e}");
            }

            sleep(Duration::from_secs(2)).await;
        }
    });
}
