import { useAppStore, type GatewayStatus } from "../store/appStore";
import clsx from "clsx";

const STATUS_LABEL: Record<GatewayStatus, string> = {
    online: "Online",
    offline: "Offline",
    checking: "Checking…",
};

export function StatusCard() {
    const { gatewayStatus, gatewayUrl, gatewayLatencyMs } = useAppStore();

    return (
        <div className={clsx("status-card", `status-card--${gatewayStatus}`)}>
            <div className="status-card__header">
                <span className="status-card__dot" />
                <span className="status-card__label">Gateway</span>
                <span className="status-card__badge">
                    {STATUS_LABEL[gatewayStatus]}
                </span>
            </div>

            <div className="status-card__body">
                <div className="status-card__row">
                    <span className="status-card__key">Endpoint</span>
                    <span className="status-card__val">{gatewayUrl}</span>
                </div>

                <div className="status-card__row">
                    <span className="status-card__key">Latency</span>
                    <span className="status-card__val">
                        {gatewayStatus === "online" && gatewayLatencyMs !== null
                            ? `${gatewayLatencyMs} ms`
                            : "—"}
                    </span>
                </div>
            </div>
        </div>
    );
}
