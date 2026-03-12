import { StateCreator } from "zustand";
import { LogEntry, LogLevel, LogSource } from "../types";
import { toast } from "sonner";
import { AppState } from "../appStore";

export interface LogSlice {
    logs: LogEntry[];
    addLog: (level: LogLevel, source: LogSource, message: string, showToast?: boolean) => void;
    clearLogs: () => void;
}

export const createLogSlice: StateCreator<AppState, [], [], LogSlice> = (set) => ({
    logs: [],
    addLog: (level, source, message, showToast = false) => {
        const id = crypto.randomUUID();
        const timestamp = Date.now();
        const newLog: LogEntry = { id, timestamp, level, source, message };

        set((state) => ({ logs: [newLog, ...state.logs] }));

        if (showToast) {
            switch (level) {
                case "success":
                    toast.success(message);
                    break;
                case "warning":
                    toast.warning(message);
                    break;
                case "error":
                    toast.error(message);
                    break;
                case "info":
                default:
                    toast.info(message);
                    break;
            }
        }
    },
    clearLogs: () => set({ logs: [] }),
});
