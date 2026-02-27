import { StateCreator } from "zustand";
import { SSHTunnelStatus } from "../types";

export interface TunnelSlice {
    tunnelStatus: SSHTunnelStatus;
    tunnelEndpoint?: string;
    setTunnelStatus: (status: SSHTunnelStatus) => void;
}

export const createTunnelSlice: StateCreator<TunnelSlice> = (set) => ({
    tunnelStatus: "offline",
    setTunnelStatus: (status: SSHTunnelStatus) => set({ tunnelStatus: status }),
});
