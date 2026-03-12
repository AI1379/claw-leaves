import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Settings as SettingsIcon, Save, RefreshCw } from "lucide-react";
import { TunnelConfig } from "../components/TunnelConfig";
import { NodeConfig } from "../components/NodeConfig";
import { BaseConfig } from "../components/BaseConfig";
import { AppConfig } from "../store/types";

export function Config() {
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
            // Hide success message after 3 seconds
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error("Failed to save config:", error);
            setMessage({ type: "error", text: "Failed to save configuration" });
        } finally {
            setSaving(false);
        }
    };

    if (!config) {
        return (
            <div className="view">
                <div className="view__header">
                    <SettingsIcon size={18} strokeWidth={1.75} />
                    <h1 className="view__title">Config</h1>
                </div>
                <div className="view__content text-center py-8">
                    <RefreshCw className="animate-spin mx-auto mb-2 text-primary" />
                    <p>Loading configuration...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="view">
            <div className="view__header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                    <SettingsIcon size={18} strokeWidth={1.75} />
                    <h1 className="view__title">Config</h1>
                </div>

                <button
                    className="btn btn--primary"
                    onClick={saveConfig}
                    disabled={saving}
                >
                    {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                    <span>Save All Changes</span>
                </button>
            </div>

            <div className="view__content">
                {message && (
                    <div className={`alert alert--${message.type}`} style={{ marginBottom: '1.5rem' }}>
                        {message.text}
                    </div>
                )}

                <div className="config-sections">
                    <BaseConfig config={config} onChange={(c) => setConfig(c)} />
                    <hr className="config-divider" style={{ margin: '2rem 0' }} />
                    <TunnelConfig config={config} onChange={(c) => setConfig(c)} />
                    <hr className="config-divider" style={{ margin: '2rem 0' }} />
                    <NodeConfig config={config} onChange={(c) => setConfig(c)} />
                </div>

                <div className="config-form__actions" style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        className="btn btn--primary"
                        onClick={saveConfig}
                        disabled={saving}
                    >
                        {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                        <span>Save All Changes</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
