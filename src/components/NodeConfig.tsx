import { AppConfig } from "../store/types";

interface NodeConfigProps {
    config: AppConfig;
    onChange: (config: AppConfig) => void;
}

export function NodeConfig({ config, onChange }: NodeConfigProps) {
    return (
        <div className="config-panel">
            <h2 className="config-panel__title">Node Service Configuration</h2>

            <div className="config-form">
                <div className="config-form__row">
                    <div className="config-form__group">
                        <label>Node Host</label>
                        <input
                            type="text"
                            value={config.node_host}
                            onChange={(e) => onChange({ ...config, node_host: e.target.value })}
                            placeholder="127.0.0.1"
                        />
                    </div>
                    <div className="config-form__group">
                        <label>Node Port</label>
                        <input
                            type="number"
                            value={config.node_port}
                            onChange={(e) => onChange({ ...config, node_port: parseInt(e.target.value) || 18789 })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
