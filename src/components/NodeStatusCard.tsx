import { useAppStore } from "../store/appStore";
import { Server, Loader2 } from "lucide-react";
import clsx from "clsx";
import { NodeServiceStatus } from "../store/types";

const STATUS_LABEL: Record<NodeServiceStatus, string> = {
    online: "Running",
    offline: "Stopped",
    checking: "Starting…",
};

export function NodeStatusCard() {
    const { nodeStatus, nodeEndpoint, openNodeService, closeNodeService } = useAppStore();

    return (
        <div className={clsx("status-card", `status-card--${nodeStatus}`)}>
            <div className="status-card__header">
                {nodeStatus === "checking" ? (
                    <Loader2 size={18} className="status-card__icon animate-spin" />
                ) : (
                    <Server size={18} className="status-card__icon" />
                )}
                <span className="status-card__label">Node Service</span>
                <span className="status-card__badge">
                    {STATUS_LABEL[nodeStatus]}
                </span>
            </div>

            <div className="status-card__body">
                <div className="status-card__row">
                    <span className="status-card__key">Endpoint</span>
                    <span className="status-card__val">{nodeEndpoint || "Not running"}</span>
                </div>
                <div className="status-card__row">
                    {nodeStatus === "online" ? (
                        <button
                            className="status-card__button status-card__button--stop"
                            onClick={() => closeNodeService()}
                        >
                            Stop Node
                        </button>
                    ) : (
                        <button
                            className="status-card__button"
                            onClick={() => openNodeService()}
                            disabled={nodeStatus === "checking"}
                        >
                            {nodeStatus === "checking" ? "Starting..." : "Start Node"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
