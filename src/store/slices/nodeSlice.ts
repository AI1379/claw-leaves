import { StateCreator } from "zustand";
import { NodeServiceStatus, NodeServiceStatusPayload } from "../types";
import { AppState } from "../appStore";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

export interface NodeSlice {
    nodeStatus: NodeServiceStatus;
    nodeEndpoint?: string;
    setNodeStatus: (status: NodeServiceStatus) => void;
    openNodeService: () => Promise<void>;
    closeNodeService: () => Promise<void>;
}

export const createNodeSlice: StateCreator<AppState, [], [], NodeSlice> = (set, get) => {
    // Initialize Node Service listener
    listen<NodeServiceStatusPayload>("node-service-status", (event) => {
        const prevStatus = get().nodeStatus;
        const nextStatus = event.payload.status;

        set({
            nodeStatus: nextStatus,
            nodeEndpoint: `${event.payload.host}:${event.payload.port}`,
        });

        if (prevStatus !== nextStatus) {
            if (nextStatus === "online") {
                get().addLog("success", "node", `Node service connected`, true);
            } else if (nextStatus === "offline" && prevStatus === "online") {
                get().addLog("warning", "node", "Node service disconnected", true);
            }
        }
    }).catch(console.error);

    return {
        nodeStatus: "offline",
        setNodeStatus: (status: NodeServiceStatus) => set({ nodeStatus: status }),
        openNodeService: async () => {
            set({ nodeStatus: "checking" });
            get().addLog("info", "node", "Opening node service...");
            try {
                await invoke("open_node_service");
            } catch (error) {
                console.error("Failed to open node service:", error);
                get().addLog("error", "node", `Failed to open node service: ${error}`, true);
                set({ nodeStatus: "offline" });
            }
        },
        closeNodeService: async () => {
            get().addLog("info", "node", "Closing node service...");
            try {
                await invoke("close_node_service");
            } catch (error) {
                console.error("Failed to close node service:", error);
                get().addLog("error", "node", `Failed to close node service: ${error}`, true);
            }
        },
    }
};
