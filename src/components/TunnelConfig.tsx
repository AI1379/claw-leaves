import { AppConfig } from "../store/types";

interface TunnelConfigProps {
    config: AppConfig;
    onChange: (config: AppConfig) => void;
}

export function TunnelConfig({ config, onChange }: TunnelConfigProps) {
    return (
        <div className="config-panel">
            <h2 className="config-panel__title">SSH Tunnel Configuration</h2>

            <div className="config-form">
                <div className="config-form__group">
                    <label>SSH Host</label>
                    <input
                        type="text"
                        value={config.ssh_host}
                        onChange={(e) => onChange({ ...config, ssh_host: e.target.value })}
                        placeholder="e.g. your-server.com"
                    />
                </div>

                <div className="config-form__row">
                    <div className="config-form__group">
                        <label>SSH User</label>
                        <input
                            type="text"
                            value={config.ssh_user}
                            onChange={(e) => onChange({ ...config, ssh_user: e.target.value })}
                            placeholder="root"
                        />
                    </div>
                    <div className="config-form__group">
                        <label>SSH Port</label>
                        <input
                            type="number"
                            value={config.ssh_port}
                            onChange={(e) => onChange({ ...config, ssh_port: parseInt(e.target.value) || 22 })}
                        />
                    </div>
                </div>

                <div className="config-form__group">
                    <label>SSH Key Path (Optional)</label>
                    <input
                        type="text"
                        value={config.ssh_key_path || ""}
                        onChange={(e) => onChange({ ...config, ssh_key_path: e.target.value || null })}
                        placeholder="C:\Users\name\.ssh\id_rsa"
                    />
                </div>

                <div className="config-form__group">
                    <label>Backoff Minimum Delay (s)</label>
                    <input
                        type="number"
                        value={config.ssh_backoff_min_secs}
                        onChange={(e) => onChange({ ...config, ssh_backoff_min_secs: parseInt(e.target.value) || 2 })}
                    />
                </div>

                <hr className="config-divider" />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Port Forwards</h3>
                    <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        onClick={() => onChange({
                            ...config,
                            tunnels: [...config.tunnels, { local_port: 18789, remote_port: 18789, forward_type: "local" }]
                        })}
                    >
                        Add Tunnel
                    </button>
                </div>

                {config.tunnels.map((tunnel, idx) => (
                    <div key={idx} className="config-form__row" style={{ alignItems: 'flex-end', marginBottom: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.05)', borderRadius: '8px' }}>
                        <div className="config-form__group" style={{ marginBottom: 0, flex: 1 }}>
                            <label>Type</label>
                            <select
                                value={tunnel.forward_type}
                                onChange={(e) => {
                                    const newTunnels = [...config.tunnels];
                                    newTunnels[idx].forward_type = e.target.value as "local" | "reverse";
                                    onChange({ ...config, tunnels: newTunnels });
                                }}
                                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', width: '100%' }}
                            >
                                <option value="local">Local (-L)</option>
                                <option value="reverse">Reverse (-R)</option>
                            </select>
                        </div>
                        <div className="config-form__group" style={{ marginBottom: 0, flex: 1 }}>
                            <label>Local Port</label>
                            <input
                                type="number"
                                value={tunnel.local_port}
                                onChange={(e) => {
                                    const newTunnels = [...config.tunnels];
                                    newTunnels[idx].local_port = parseInt(e.target.value) || 0;
                                    onChange({ ...config, tunnels: newTunnels });
                                }}
                            />
                        </div>
                        <div className="config-form__group" style={{ marginBottom: 0, flex: 1 }}>
                            <label>Remote Port</label>
                            <input
                                type="number"
                                value={tunnel.remote_port}
                                onChange={(e) => {
                                    const newTunnels = [...config.tunnels];
                                    newTunnels[idx].remote_port = parseInt(e.target.value) || 0;
                                    onChange({ ...config, tunnels: newTunnels });
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '0.2rem' }}>
                            <button
                                type="button"
                                className="btn btn--danger"
                                onClick={() => {
                                    const newTunnels = config.tunnels.filter((_, i) => i !== idx);
                                    onChange({ ...config, tunnels: newTunnels });
                                }}
                                style={{ padding: '0.5rem 1rem' }}
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
