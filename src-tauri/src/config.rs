use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum ForwardType {
    Local,
    Reverse,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SshTunnelConfig {
    pub local_port: u16,
    pub remote_port: u16,
    pub forward_type: ForwardType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    /// The URL to probe for Gateway health checks (e.g. "http://127.0.0.1:18789")
    pub gateway_url: String,

    /// How many seconds to sleep between each health-check probe
    pub health_check_interval_secs: u64,

    // --- Base Configuration ---
    pub openclaw_cmd: String,

    // --- SSH Tunnel Configuration ---
    pub ssh_host: String,
    pub ssh_user: String,
    pub ssh_port: u16,
    pub ssh_key_path: Option<String>,
    pub tunnels: Vec<SshTunnelConfig>,
    pub ssh_backoff_min_secs: u64,

    // --- Node Service Configuration ---
    pub node_host: String,
    pub node_port: u16,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            gateway_url: "http://127.0.0.1:18789".to_string(),
            health_check_interval_secs: 5,
            openclaw_cmd: if cfg!(windows) {
                "openclaw.cmd"
            } else {
                "openclaw"
            }
            .to_string(),
            ssh_host: "".to_string(),
            ssh_user: "".to_string(),
            ssh_port: 22,
            ssh_key_path: None,
            tunnels: vec![SshTunnelConfig {
                local_port: 18789,
                remote_port: 18789,
                forward_type: ForwardType::Local,
            }],
            ssh_backoff_min_secs: 2,
            node_host: "127.0.0.1".to_string(),
            node_port: 18789,
        }
    }
}

/// Returns the path to the config file:
///   Windows → %APPDATA%\claw-leaves\config.yaml
///   Linux   → ~/.config/claw-leaves/config.yaml
///   macOS   → ~/Library/Application Support/claw-leaves/config.yaml
fn config_path() -> PathBuf {
    let base = dirs::config_dir().unwrap_or_else(|| PathBuf::from("."));
    base.join("claw-leaves").join("config.yaml")
}

/// Load config from disk. If the file does not exist, write defaults and return them.
pub fn load() -> AppConfig {
    let path = config_path();

    if path.exists() {
        match fs::read_to_string(&path) {
            Ok(contents) => match serde_yaml::from_str::<AppConfig>(&contents) {
                Ok(cfg) => return cfg,
                Err(e) => {
                    eprintln!("[config] Failed to parse config.yaml: {e}. Using defaults.");
                }
            },
            Err(e) => {
                eprintln!("[config] Failed to read config.yaml: {e}. Using defaults.");
            }
        }
    }

    // First run or parse error: write defaults to disk
    let defaults = AppConfig::default();
    if let Err(e) = save(&defaults) {
        eprintln!("[config] Failed to write default config: {e}");
    }
    defaults
}

/// Persist the given config to disk.
pub fn save(cfg: &AppConfig) -> Result<(), Box<dyn std::error::Error>> {
    let path = config_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    let yaml = serde_yaml::to_string(cfg)?;
    fs::write(&path, yaml)?;
    Ok(())
}
#[tauri::command]
pub fn get_config() -> AppConfig {
    load()
}

#[tauri::command]
pub fn save_config(cfg: AppConfig) -> Result<(), String> {
    save(&cfg).map_err(|e| e.to_string())
}
