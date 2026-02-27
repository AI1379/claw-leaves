import { create } from "zustand";
import { GatewaySlice, createGatewaySlice } from "./slices/gatewaySlice";
import { TunnelSlice, createTunnelSlice } from "./slices/tunnelSlice";
import { UISlice, createUISlice } from "./slices/uiSlice";

// Combined Store Type
export type AppState = GatewaySlice & TunnelSlice & UISlice;

export const useAppStore = create<AppState>()((...a) => ({
  ...createGatewaySlice(...a),
  ...createTunnelSlice(...a),
  ...createUISlice(...a),
}));

// Re-export types for convenience
export * from "./types";
