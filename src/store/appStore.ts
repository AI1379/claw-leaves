import { create } from "zustand";
import { listen } from "@tauri-apps/api/event";

export type GatewayStatus = "online" | "offline" | "checking";
export type AppView = "overview" | "config" | "exec" | "log";

interface GatewayStatusPayload {
  status: "online" | "offline";
  url: string;
  latency_ms: number | null;
}

interface AppState {
  gatewayStatus: GatewayStatus;
  gatewayUrl: string;
  gatewayLatencyMs: number | null;
  currentView: AppView;
  setView: (view: AppView) => void;
}

export const useAppStore = create<AppState>((set) => ({
  gatewayStatus: "checking",
  gatewayUrl: "http://127.0.0.1:18789",
  gatewayLatencyMs: null,
  currentView: "overview",
  setView: (view) => set({ currentView: view }),
}));

// Set up Tauri event listener once at module level
listen<GatewayStatusPayload>("gateway-status", (event) => {
  useAppStore.setState({
    gatewayStatus: event.payload.status,
    gatewayUrl: event.payload.url,
    gatewayLatencyMs: event.payload.latency_ms,
  });
}).catch(console.error);
