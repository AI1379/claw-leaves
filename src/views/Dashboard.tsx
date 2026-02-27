import { StatusCard } from "../components/StatusCard";
import { TunnelStatusCard } from "../components/TunnelStatusCard";
import { Wifi } from "lucide-react";

export function Dashboard() {
    return (
        <div className="view">
            <div className="view__header">
                <Wifi size={18} strokeWidth={1.75} />
                <h1 className="view__title">Overview</h1>
            </div>

            <div className="view__content">
                <div className="section__grid">
                    <section className="section">
                        <h2 className="section__title">Gateway</h2>
                        <StatusCard />
                    </section>
                    <section className="section">
                        <h2 className="section__title">SSH Tunnel</h2>
                        <TunnelStatusCard />
                    </section>
                    <section className="section">
                        <h2 className="section__title">Node Service</h2>
                        <div className="placeholder">
                            <span className="placeholder__badge">Soon</span>
                            <div className="placeholder__text">
                                Node Service management will be implemented here.
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
