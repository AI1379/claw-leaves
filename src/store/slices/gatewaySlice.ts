import { StateCreator } from "zustand";
import { GatewayStatus, GatewayStatusPayload } from "../types";
import { listen } from "@tauri-apps/api/event";

export interface GatewaySlice {
    gatewayStatus: GatewayStatus;
    gatewayUrl: string;
    gatewayLatencyMs: number | null;
    updateGateway: (payload: GatewayStatusPayload) => void;
}

export const createGatewaySlice: StateCreator<GatewaySlice> = (set) => {
    // Initialize the listener
    listen<GatewayStatusPayload>("gateway-status", (event) => {
        set({
            gatewayStatus: event.payload.status,
            gatewayUrl: event.payload.url,
            gatewayLatencyMs: event.payload.latency_ms,
        });
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
