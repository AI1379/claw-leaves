import { StateCreator } from "zustand";
import { AppView } from "../types";
import { AppState } from "../appStore";

export interface UISlice {
    currentView: AppView;
    setView: (view: AppView) => void;
}

export const createUISlice: StateCreator<AppState, [], [], UISlice> = (set) => ({
    currentView: "overview",
    setView: (view) => set({ currentView: view }),
});
