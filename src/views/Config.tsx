import { Settings as SettingsIcon } from "lucide-react";
import { TunnelConfig } from "../components/TunnelConfig";

export function Config() {
    return (
        <div className="view">
            <div className="view__header">
                <SettingsIcon size={18} strokeWidth={1.75} />
                <h1 className="view__title">Config</h1>
            </div>
            <div className="view__content">
                <TunnelConfig />
            </div>
        </div>
    );
}
