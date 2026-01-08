import { InteractiveMap } from "@/components/map/InteractiveMap";
import { LiveStatsBar } from "@/components/stats/LiveStatsBar";
import { Menu } from "lucide-react";

export default function MapPage() {
    return (
        <main className="relative w-full h-screen overflow-hidden bg-slate-950">
            {/* Header for Authenticated User */}
            <div className="absolute top-0 left-0 right-0 z-50 p-4 pointer-events-none flex justify-between items-start">
                {/* Toggle Button */}
                <button className="pointer-events-auto p-3 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/50 text-slate-200 shadow-xl">
                    <Menu className="w-6 h-6" />
                </button>

                {/* Stats */}
                <div className="pointer-events-auto">
                    <LiveStatsBar />
                </div>

                {/* Profile (Placeholder) */}
                <div className="pointer-events-auto w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-2xl shadow-xl">
                    👨‍✈️
                </div>
            </div>

            {/* Map Layer */}
            <div className="absolute inset-0 z-0">
                <InteractiveMap />
            </div>
        </main>
    );
}
