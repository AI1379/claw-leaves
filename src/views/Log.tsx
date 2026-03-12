import { ScrollText as LogIcon, Trash2 } from "lucide-react";
import { useAppStore } from "../store/appStore";

export function Log() {
    const { logs, clearLogs } = useAppStore();

    return (
        <div className="view">
            <div className="view__header" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LogIcon size={18} strokeWidth={1.75} />
                    <h1 className="view__title">Log</h1>
                </div>
                {logs.length > 0 && (
                    <button className="status-card__button status-card__button--stop" style={{ padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={clearLogs}>
                        <Trash2 size={14} /> Clear
                    </button>
                )}
            </div>
            <div className="view__content" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {logs.length === 0 ? (
                    <div className="placeholder">
                        <span className="placeholder__badge">No Logs</span>
                        <p className="placeholder__text">
                            System events and notifications will appear here.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                        {logs.map((log) => (
                            <div key={log.id} style={{ padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '11px', textTransform: 'uppercase', padding: '2px 6px', borderRadius: '4px', background: 'var(--bg-active)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                            {log.source}
                                        </span>
                                        <span style={{ fontSize: '12px', color: log.level === 'error' ? 'var(--color-danger)' : log.level === 'success' ? 'var(--color-success)' : log.level === 'warning' ? 'var(--color-warning)' : 'var(--text-secondary)' }}>
                                            {log.level.toUpperCase()}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '4px' }}>
                                    {log.message}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
