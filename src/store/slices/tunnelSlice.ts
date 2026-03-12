import { StateCreator } from "zustand";
import { SSHTunnelStatus, SSHTunnelStatusPayload, SshTunnelConfig } from "../types";
import { AppState } from "../appStore";

import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

export interface TunnelSlice {
    tunnelStatus: SSHTunnelStatus | "reconnecting";
    tunnelEndpoint?: string;
    tunnels?: SshTunnelConfig[];
    setTunnelStatus: (status: SSHTunnelStatus | "reconnecting") => void;
    openTunnel: () => Promise<void>;
    closeTunnel: () => Promise<void>;
}

export const createTunnelSlice: StateCreator<AppState, [], [], TunnelSlice> = (set, get) => {
    // Initialize SSH Tunnel listener
    listen<SSHTunnelStatusPayload>("ssh-tunnel-status", (event) => {
        const prevStatus = get().tunnelStatus;
        const nextStatus = event.payload.status as SSHTunnelStatus | "reconnecting";
        
        set({
            tunnelStatus: nextStatus,
            tunnelEndpoint: `${event.payload.remote_host}`,
            tunnels: event.payload.tunnels,
        });

        if (prevStatus !== nextStatus) {
            if (nextStatus === "online") {
                get().addLog("success", "tunnel", `SSH Tunnel connected to ${event.payload.remote_host}`, true);
            } else if (nextStatus === "offline" && prevStatus === "online") {
                get().addLog("warning", "tunnel", "SSH Tunnel disconnected", true);
            } else if (nextStatus === "reconnecting") {
                get().addLog("warning", "tunnel", "SSH Tunnel reconnecting...", true);
            }
        }
    }).catch(console.error);

    return {
        tunnelStatus: "checking",
        tunnels: [],
        setTunnelStatus: (status: SSHTunnelStatus | "reconnecting") => set({ tunnelStatus: status }),
        openTunnel: async () => {
            set({ tunnelStatus: "checking" });
            get().addLog("info", "tunnel", "Opening SSH tunnel...");
            try {
                await invoke("open_ssh_tunnel");
            } catch (error) {
                console.error("Failed to open SSH tunnel:", error);
                get().addLog("error", "tunnel", `Failed to open SSH tunnel: ${error}`, true);
                set({ tunnelStatus: "offline" });
            }
        },
        closeTunnel: async () => {
            get().addLog("info", "tunnel", "Closing SSH tunnel...");
            try {
                await invoke("close_ssh_tunnel");
            } catch (error) {
                console.error("Failed to close SSH tunnel:", error);
                get().addLog("error", "tunnel", `Failed to close SSH tunnel: ${error}`, true);
            }
        },
    }
};
