export type GatewayStatus = "online" | "offline" | "checking";
export type SSHTunnelStatus = "online" | "offline" | "checking";
export type NodeServiceStatus = "online" | "offline" | "checking";
export type AppView = "overview" | "config" | "exec" | "log";

export interface GatewayStatusPayload {
    status: "online" | "offline";
    url: string;
    latency_ms: number | null;
}
