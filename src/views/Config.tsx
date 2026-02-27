import { Settings as SettingsIcon } from "lucide-react";
import { TunnelConfig } from "../components/TunnelConfig";
import { NodeConfig } from "../components/NodeConfig";
import { BaseConfig } from "../components/BaseConfig";

export function Config() {
    return (
        <div className="view">
            <div className="view__header">
                <SettingsIcon size={18} strokeWidth={1.75} />
                <h1 className="view__title">Config</h1>
            </div>
            <div className="view__content">
                <BaseConfig />
                <TunnelConfig />
                <NodeConfig />
            </div>
        </div>
    );
}
