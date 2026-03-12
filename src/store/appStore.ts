import { create } from "zustand";
import { GatewaySlice, createGatewaySlice } from "./slices/gatewaySlice";
import { TunnelSlice, createTunnelSlice } from "./slices/tunnelSlice";
import { NodeSlice, createNodeSlice } from "./slices/nodeSlice";
import { UISlice, createUISlice } from "./slices/uiSlice";
import { LogSlice, createLogSlice } from "./slices/logSlice";

// Combined Store Type
export type AppState = GatewaySlice & TunnelSlice & NodeSlice & UISlice & LogSlice;

export const useAppStore = create<AppState>()((...a) => ({
  ...createGatewaySlice(...a),
  ...createTunnelSlice(...a),
  ...createNodeSlice(...a),
  ...createUISlice(...a),
  ...createLogSlice(...a),
}));

// Re-export types for convenience
export * from "./types";
