import { useAppStore, type SSHTunnelStatus } from "../store/appStore";
import { Shield, ShieldOff, Loader2 } from "lucide-react";
import clsx from "clsx";

const STATUS_LABEL: Record<SSHTunnelStatus, string> = {
    online: "Active",
    offline: "Inactive",
    checking: "Connecting…",
};

export function TunnelStatusCard() {
    const { tunnelStatus, tunnelEndpoint, localPort, openTunnel, closeTunnel } = useAppStore();

    return (
        <div className={clsx("status-card", `status-card--${tunnelStatus}`)}>
            <div className="status-card__header">
                <span className="status-card__dot"></span>
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
                <div className="status-card__row">
                    <span className="status-card__key">Local Port</span>
                    <span className="status-card__val">{localPort || "Disconnected"}</span>
                </div>
                <div className="status-card__row">
                    {tunnelStatus === "online" ? (
                        <button
                            className="status-card__button status-card__button--stop"
                            onClick={() => closeTunnel()}
                        >
                            Stop Tunnel
                        </button>
                    ) : (
                        <button
                            className="status-card__button"
                            onClick={() => openTunnel()}
                            disabled={tunnelStatus === "checking"}
                        >
                            {tunnelStatus === "checking" ? "Connecting..." : "Open Tunnel"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}