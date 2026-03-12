import { AppConfig } from "../store/types";

interface BaseConfigProps {
    config: AppConfig;
    onChange: (config: AppConfig) => void;
}

export function BaseConfig({ config, onChange }: BaseConfigProps) {
    return (
        <div className="config-panel">
            <h2 className="config-panel__title">Base Configuration</h2>

            <div className="config-form">
                <div className="config-form__group">
                    <label>OpenClaw Command</label>
                    <input
                        type="text"
                        value={config.openclaw_cmd}
                        onChange={(e) => onChange({ ...config, openclaw_cmd: e.target.value })}
                        placeholder="openclaw"
                    />
                </div>
            </div>
        </div>
    );
}
