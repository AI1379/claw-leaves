mod config;
mod health;
mod node_manager;
mod tray;
mod tunnel;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let cfg = config::load();
    let cfg_for_health = cfg.clone();

    tauri::Builder::default()
        .manage(tunnel::TunnelManager::new())
        .manage(node_manager::NodeManager::new())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .setup(move |app| {
            tray::setup_tray(app)?;
            health::start_health_checker(app.handle().clone(), cfg_for_health);

            let tunnel_manager = app.handle().state::<tunnel::TunnelManager>();
            tunnel::start_tunnel_monitor(app.handle().clone(), tunnel_manager);

            let node_manager = app.handle().state::<node_manager::NodeManager>();
            node_manager::start_node_monitor(app.handle().clone(), node_manager);

            Ok(())
        })
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                if window.label() == "main" {
                    window.hide().unwrap();
                    api.prevent_close();
                }
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            tunnel::open_ssh_tunnel,
            tunnel::close_ssh_tunnel,
            node_manager::open_node_service,
            node_manager::close_node_service,
            config::get_config,
            config::save_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
