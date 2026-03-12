export type GatewayStatus = "online" | "offline" | "checking";
export type SSHTunnelStatus = "online" | "offline" | "checking";
export type NodeServiceStatus = "online" | "offline" | "checking";
export type AppView = "overview" | "config" | "exec" | "log";

export interface GatewayStatusPayload {
    status: "online" | "offline";
    url: string;
    latency_ms: number | null;
}

export interface SshTunnelConfig {
    local_port: number;
    remote_port: number;
    forward_type: "local" | "reverse";
}

export interface SSHTunnelStatusPayload {
    status: "online" | "offline" | "checking" | "reconnecting";
    tunnels: SshTunnelConfig[];
    remote_host: string;
}

export interface NodeServiceStatusPayload {
    status: NodeServiceStatus;
    host: string;
    port: number;
}

export interface AppConfig {
    gateway_url: string;
    health_check_interval_secs: number;
    openclaw_cmd: string;
    ssh_host: string;
    ssh_user: string;
    ssh_port: number;
    ssh_key_path: string | null;
    tunnels: SshTunnelConfig[];
    ssh_backoff_min_secs: number;
    node_host: string;
    node_port: number;
}

export type LogLevel = "info" | "success" | "warning" | "error";
export type LogSource = "system" | "gateway" | "tunnel" | "node";

export interface LogEntry {
    id: string;
    timestamp: number;
    level: LogLevel;
    source: LogSource;
    message: string;
}