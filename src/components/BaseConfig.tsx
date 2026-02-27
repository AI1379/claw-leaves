import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Save, RefreshCw } from "lucide-react";

interface BaseConfig {
    openclaw_cmd: string;
}

export function BaseConfig() {
    const [config, setConfig] = useState<BaseConfig | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const cfg = await invoke<BaseConfig>("get_config");
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
            <h2 className="config-panel__title">Base Configuration</h2>

            {message && (
                <div className={`alert alert--${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="config-form">
                <div className="config-form__group">
                    <label>OpenClaw Command</label>
                    <input
                        type="text"
                        value={config.openclaw_cmd}
                        onChange={(e) => setConfig({ ...config, openclaw_cmd: e.target.value })}
                        placeholder="openclaw"
                    />
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
