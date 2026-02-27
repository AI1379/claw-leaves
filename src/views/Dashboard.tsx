import { StatusCard } from "../components/StatusCard";
import { Wifi } from "lucide-react";

export function Dashboard() {
    return (
        <div className="view">
            <div className="view__header">
                <Wifi size={18} strokeWidth={1.75} />
                <h1 className="view__title">Overview</h1>
            </div>

            <div className="view__content">
                <section className="section">
                    <h2 className="section__title">Gateway</h2>
                    <StatusCard />
                </section>
            </div>
        </div>
    );
}
