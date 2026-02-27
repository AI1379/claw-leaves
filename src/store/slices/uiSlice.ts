import { StateCreator } from "zustand";
import { AppView } from "../types";

export interface UISlice {
    currentView: AppView;
    setView: (view: AppView) => void;
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
    currentView: "overview",
    setView: (view) => set({ currentView: view }),
});
