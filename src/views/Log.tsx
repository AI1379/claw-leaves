import { ScrollText as LogIcon } from "lucide-react";

export function Log() {
    return (
        <div className="view">
            <div className="view__header">
                <LogIcon size={18} strokeWidth={1.75} />
                <h1 className="view__title">Log</h1>
            </div>
            <div className="view__content">
                <div className="placeholder">
                    <span className="placeholder__badge">Milestone 3</span>
                    <p className="placeholder__text">
                        Event log and notification history will be displayed here.
                    </p>
                </div>
            </div>
        </div>
    );
}
