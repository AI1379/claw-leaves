import { StateCreator } from "zustand";
import { GatewayStatus, GatewayStatusPayload } from "../types";
import { AppState } from "../appStore";
import { listen } from "@tauri-apps/api/event";

export interface GatewaySlice {
    gatewayStatus: GatewayStatus;
    gatewayUrl: string;
    gatewayLatencyMs: number | null;
    updateGateway: (payload: GatewayStatusPayload) => void;
}

export const createGatewaySlice: StateCreator<AppState, [], [], GatewaySlice> = (set, get) => {
    // Initialize the listener
    listen<GatewayStatusPayload>("gateway-status", (event) => {
        const prevStatus = get().gatewayStatus;
        const nextStatus = event.payload.status;

        set({
            gatewayStatus: nextStatus,
            gatewayUrl: event.payload.url,
            gatewayLatencyMs: event.payload.latency_ms,
        });

        if (prevStatus !== nextStatus) {
            if (nextStatus === "online") {
                get().addLog("success", "gateway", `Connected to Gateway (${event.payload.url})`, true);
            } else if (nextStatus === "offline" && prevStatus === "online") {
                get().addLog("error", "gateway", "Disconnected from Gateway", true);
            }
        }
    }).catch(console.error);

    return {
        gatewayStatus: "checking",
        gatewayUrl: "http://127.0.0.1:18789",
        gatewayLatencyMs: null,
        updateGateway: (payload) => set({
            gatewayStatus: payload.status,
            gatewayUrl: payload.url,
            gatewayLatencyMs: payload.latency_ms,
        }),
    };
};
