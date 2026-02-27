import { type AppView, useAppStore } from "../store/appStore";
import {
    LayoutDashboard,
    Settings,
    Terminal,
    ScrollText,
    Leaf,
} from "lucide-react";
import clsx from "clsx";

interface NavItem {
    id: AppView;
    label: string;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}

const NAV_ITEMS: NavItem[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "config", label: "Config", icon: Settings },
    { id: "exec", label: "Exec", icon: Terminal },
    { id: "log", label: "Log", icon: ScrollText },
];

export function Sidebar() {
    const { currentView, setView } = useAppStore();

    return (
        <aside className="sidebar">
            <div className="sidebar__logo">
                <Leaf size={24} strokeWidth={2} />
            </div>

            <nav className="sidebar__nav">
                {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        className={clsx("sidebar__item", {
                            "sidebar__item--active": currentView === id,
                        })}
                        onClick={() => setView(id)}
                        title={label}
                    >
                        <Icon size={20} strokeWidth={1.75} />
                        <span className="sidebar__label">{label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
}
