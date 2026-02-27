import { StateCreator } from "zustand";
import { SSHTunnelStatus, SSHTunnelStatusPayload } from "../types";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

export interface TunnelSlice {
    tunnelStatus: SSHTunnelStatus;
    tunnelEndpoint?: string;
    localPort?: number;
    setTunnelStatus: (status: SSHTunnelStatus) => void;
    openTunnel: () => Promise<void>;
    closeTunnel: () => Promise<void>;
}

export const createTunnelSlice: StateCreator<TunnelSlice> = (set) => {
    // Initialize SSH Tunnel listener
    listen<SSHTunnelStatusPayload>("ssh-tunnel-status", (event) => {
        set({
            tunnelStatus: event.payload.status as SSHTunnelStatus,
            tunnelEndpoint: `${event.payload.remote_host}:${event.payload.remote_port}`,
            localPort: event.payload.local_port,
        });
    }).catch(console.error);

    return {
        tunnelStatus: "checking",
        localPort: 18789,
        setTunnelStatus: (status: SSHTunnelStatus) => set({ tunnelStatus: status }),
        openTunnel: async () => {
            set({ tunnelStatus: "checking" });
            try {
                await invoke("open_ssh_tunnel");
            } catch (error) {
                console.error("Failed to open SSH tunnel:", error);
                set({ tunnelStatus: "offline" });
            }
        },
        closeTunnel: async () => {
            try {
                await invoke("close_ssh_tunnel");
            } catch (error) {
                console.error("Failed to close SSH tunnel:", error);
            }
        },
    }
};
