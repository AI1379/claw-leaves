import { StateCreator } from "zustand";
import { NodeServiceStatus, NodeServiceStatusPayload } from "../types";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

export interface NodeSlice {
    nodeStatus: NodeServiceStatus;
    nodeEndpoint?: string;
    setNodeStatus: (status: NodeServiceStatus) => void;
    openNodeService: () => Promise<void>;
    closeNodeService: () => Promise<void>;
}

export const createNodeSlice: StateCreator<NodeSlice> = (set) => {
    // Initialize Node Service listener
    listen<NodeServiceStatusPayload>("node-service-status", (event) => {
        set({
            nodeStatus: event.payload.status,
            nodeEndpoint: `${event.payload.host}:${event.payload.port}`,
        });
    }).catch(console.error);

    return {
        nodeStatus: "offline",
        setNodeStatus: (status: NodeServiceStatus) => set({ nodeStatus: status }),
        openNodeService: async () => {
            set({ nodeStatus: "checking" });
            try {
                await invoke("open_node_service");
            } catch (error) {
                console.error("Failed to open node service:", error);
                set({ nodeStatus: "offline" });
            }
        },
        closeNodeService: async () => {
            try {
                await invoke("close_node_service");
            } catch (error) {
                console.error("Failed to close node service:", error);
            }
        },
    }
};
