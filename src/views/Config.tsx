import { Settings as SettingsIcon } from "lucide-react";

export function Config() {
    return (
        <div className="view">
            <div className="view__header">
                <SettingsIcon size={18} strokeWidth={1.75} />
                <h1 className="view__title">Config</h1>
            </div>
            <div className="view__content">
                <div className="placeholder">
                    <span className="placeholder__badge">Milestone 2</span>
                    <p className="placeholder__text">
                        SSH tunnel settings and connection mode will be configured here.
                    </p>
                </div>
            </div>
        </div>
    );
}
