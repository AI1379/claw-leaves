import { useAppStore, type SSHTunnelStatus } from "../store/appStore";
import { Shield, ShieldOff, Loader2 } from "lucide-react";
import clsx from "clsx";

const STATUS_LABEL: Record<SSHTunnelStatus, string> = {
    online: "Active",
    offline: "Inactive",
    checking: "Connecting…",
};

export function TunnelStatusCard() {
    const { tunnelStatus, tunnelEndpoint } = useAppStore();

    return (
        <div className={clsx("status-card", `status-card--tunnel-${tunnelStatus}`)}>
            <div className="status-card__header">
                {tunnelStatus === "online" ? (
                    <Shield size={18} className="text-success" />
                ) : tunnelStatus === "checking" ? (
                    <Loader2 size={18} className="animate-spin" />
                ) : (
                    <ShieldOff size={18} className="text-muted" />
                )}
                <span className="status-card__label">SSH Tunnel</span>
                <span className="status-card__badge">
                    {STATUS_LABEL[tunnelStatus]}
                </span>
            </div>

            <div className="status-card__body">
                <div className="status-card__row">
                    <span className="status-card__key">Endpoint</span>
                    <span className="status-card__val">{tunnelEndpoint || "Disconnected"}</span>
                </div>
            </div>
        </div>
    );
}