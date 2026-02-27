use crate::config::AppConfig;
use tauri::{AppHandle, Emitter};
use tokio::time::{sleep, Duration};

#[derive(Clone, serde::Serialize)]
pub struct GatewayStatusPayload {
    pub status: String, // "online" | "offline"
    pub url: String,
    pub latency_ms: Option<u64>,
}

/// Spawn a background task that probes the Gateway on the configured interval.
pub fn start_health_checker(app: AppHandle, cfg: AppConfig) {
    tauri::async_runtime::spawn(async move {
        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(3))
            .build()
            .unwrap_or_default();

        let interval = Duration::from_secs(cfg.health_check_interval_secs.max(1));

        loop {
            let start = tokio::time::Instant::now();
            let result = client.get(&cfg.gateway_url).send().await;
            let elapsed_ms = start.elapsed().as_millis() as u64;

            let payload = match result {
                Ok(resp) if resp.status().is_success() || resp.status().as_u16() < 500 => {
                    GatewayStatusPayload {
                        status: "online".to_string(),
                        url: cfg.gateway_url.clone(),
                        latency_ms: Some(elapsed_ms),
                    }
                }
                _ => GatewayStatusPayload {
                    status: "offline".to_string(),
                    url: cfg.gateway_url.clone(),
                    latency_ms: None,
                },
            };

            if let Err(e) = app.emit("gateway-status", &payload) {
                eprintln!("[health] Failed to emit gateway-status: {e}");
            }

            sleep(interval).await;
        }
    });
}
