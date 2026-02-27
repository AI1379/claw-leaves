import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Save, RefreshCw } from "lucide-react";

interface AppConfig {
    gateway_url: string;
    health_check_interval_secs: number;
    ssh_host: string;
    ssh_user: string;
    ssh_port: number;
    ssh_key_path: string | null;
    local_port: number;
    remote_port: number;
}

export function TunnelConfig() {
    const [config, setConfig] = useState<AppConfig | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const cfg = await invoke<AppConfig>("get_config");
            setConfig(cfg);
        } catch (error) {
            console.error("Failed to load config:", error);
            setMessage({ type: "error", text: "Failed to load configuration" });
        }
    };

    const saveConfig = async () => {
        if (!config) return;
        setSaving(true);
        setMessage(null);
        try {
            await invoke("save_config", { cfg: config });
            setMessage({ type: "success", text: "Configuration saved successfully" });
        } catch (error) {
            console.error("Failed to save config:", error);
            setMessage({ type: "error", text: "Failed to save configuration" });
        } finally {
            setSaving(false);
        }
    };

    if (!config) {
        return (
            <div className="p-4 text-center">
                <RefreshCw className="animate-spin mx-auto mb-2" />
                <p>Loading configuration...</p>
            </div>
        );
    }

    return (
        <div className="config-panel">
            <h2 className="config-panel__title">SSH Tunnel Configuration</h2>

            {message && (
                <div className={`alert alert--${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="config-form">
                <div className="config-form__group">
                    <label>SSH Host</label>
                    <input
                        type="text"
                        value={config.ssh_host}
                        onChange={(e) => setConfig({ ...config, ssh_host: e.target.value })}
                        placeholder="e.g. your-server.com"
                    />
                </div>

                <div className="config-form__row">
                    <div className="config-form__group">
                        <label>SSH User</label>
                        <input
                            type="text"
                            value={config.ssh_user}
                            onChange={(e) => setConfig({ ...config, ssh_user: e.target.value })}
                            placeholder="root"
                        />
                    </div>
                    <div className="config-form__group">
                        <label>SSH Port</label>
                        <input
                            type="number"
                            value={config.ssh_port}
                            onChange={(e) => setConfig({ ...config, ssh_port: parseInt(e.target.value) || 22 })}
                        />
                    </div>
                </div>

                <div className="config-form__group">
                    <label>SSH Key Path (Optional)</label>
                    <input
                        type="text"
                        value={config.ssh_key_path || ""}
                        onChange={(e) => setConfig({ ...config, ssh_key_path: e.target.value || null })}
                        placeholder="C:\Users\name\.ssh\id_rsa"
                    />
                </div>

                <hr className="config-divider" />

                <div className="config-form__row">
                    <div className="config-form__group">
                        <label>Local Forward Port</label>
                        <input
                            type="number"
                            value={config.local_port}
                            onChange={(e) => setConfig({ ...config, local_port: parseInt(e.target.value) || 18789 })}
                        />
                    </div>
                    <div className="config-form__group">
                        <label>Remote Destination Port</label>
                        <input
                            type="number"
                            value={config.remote_port}
                            onChange={(e) => setConfig({ ...config, remote_port: parseInt(e.target.value) || 18789 })}
                        />
                    </div>
                </div>

                <div className="config-form__actions">
                    <button
                        className="btn btn--primary"
                        onClick={saveConfig}
                        disabled={saving}
                    >
                        {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                        <span>Save Settings</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
