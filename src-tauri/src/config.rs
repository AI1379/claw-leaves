use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    /// The URL to probe for Gateway health checks (e.g. "http://127.0.0.1:18789")
    pub gateway_url: String,

    /// How many seconds to sleep between each health-check probe
    pub health_check_interval_secs: u64,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            gateway_url: "http://127.0.0.1:18789".to_string(),
            health_check_interval_secs: 5,
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
