import { Terminal as TerminalIcon } from "lucide-react";

export function Exec() {
    return (
        <div className="view">
            <div className="view__header">
                <TerminalIcon size={18} strokeWidth={1.75} />
                <h1 className="view__title">Exec</h1>
            </div>
            <div className="view__content">
                <div className="placeholder">
                    <span className="placeholder__badge">Milestone 2</span>
                    <p className="placeholder__text">
                        Command allow-list management and exec approval UI will live here.
                    </p>
                </div>
            </div>
        </div>
    );
}
