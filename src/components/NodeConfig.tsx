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
    node_host: string;
    node_port: number;
}

export function NodeConfig() {
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
        <div className="config-panel" style={{ marginTop: '2rem' }}>
            <h2 className="config-panel__title">Node Service Configuration</h2>

            {message && (
                <div className={`alert alert--${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="config-form">
                <div className="config-form__row">
                    <div className="config-form__group">
                        <label>Node Host</label>
                        <input
                            type="text"
                            value={config.node_host}
                            onChange={(e) => setConfig({ ...config, node_host: e.target.value })}
                            placeholder="127.0.0.1"
                        />
                    </div>
                    <div className="config-form__group">
                        <label>Node Port</label>
                        <input
                            type="number"
                            value={config.node_port}
                            onChange={(e) => setConfig({ ...config, node_port: parseInt(e.target.value) || 18789 })}
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
                        <span>Save Node Settings</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
