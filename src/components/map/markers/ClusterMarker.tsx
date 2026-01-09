import { Avatar } from "@/components/ui/Avatar";
import { StatusDot } from "@/components/ui/StatusDot";
import { cn } from "@/lib/utils";
import { MapMarker as Marker } from "../MapMarker";

interface ClusterMarkerProps {
    cluster: {
        geohash: string;
        center: [number, number];
        hero: {
            avatar_id: string;
            handle: string;
            status: string;
            is_current_user?: boolean;
        } | null;
        counts: { rolling: number; waiting: number; parked: number };
        total: number;
        display_text: string;
        is_hotspot: boolean;
        includes_current_user: boolean;
    };
    onClick?: () => void;
}

export function ClusterMarker({ cluster, onClick }: ClusterMarkerProps) {
    const { hero, is_hotspot, includes_current_user, display_text, total } = cluster;

    // "Single Driver" Mode (Unclustered Look)
    if (total === 1 && hero) {
        return (
            <Marker
                longitude={cluster.center[0]}
                latitude={cluster.center[1]}
                onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    onClick?.();
                }}
            >
                <div className="relative group cursor-pointer transition-transform hover:scale-110">
                    <Avatar
                        id={hero.avatar_id}
                        size={48} // Big size for single driver
                        className={cn(
                            "border-2 shadow-xl",
                            hero.status === 'rolling' ? "border-emerald-500 ring-4 ring-emerald-500/20" :
                                hero.status === 'waiting' ? "border-rose-500 ring-4 ring-rose-500/20" :
                                    "border-sky-500 ring-4 ring-sky-500/20",
                            includes_current_user && "border-yellow-400 ring-yellow-400/50"
                        )}
                    />
                    {/* Floating status dot */}
                    <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-1 border border-slate-700">
                        <StatusDot status={hero.status} size="sm" showPulse />
                    </div>

                    {/* Tooltip */}
                    <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900/95 text-white text-xs font-bold rounded-lg whitespace-nowrap pointer-events-none z-50 border border-slate-700 shadow-xl">
                        {hero.handle}
                    </div>
                </div>
            </Marker>
        );
    }

    // Default Clustered View
    return (
        <Marker
            longitude={cluster.center[0]}
            latitude={cluster.center[1]}
            onClick={(e) => {
                e.originalEvent.stopPropagation();
                onClick?.();
            }}
        >
            <div className={cn(
                "group relative flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105",
                is_hotspot && "animate-pulse-slow"
            )}>

                {/* Main Card */}
                <div className={cn(
                    "relative flex items-center gap-2 px-3 py-1.5 rounded-full shadow-xl overflow-hidden backdrop-blur-md border transition-all",
                    // Default style
                    "bg-slate-900/90 border-slate-700",
                    // Hotspot style (red glow)
                    is_hotspot && "border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)]",
                    // Current user style (gold glow)
                    includes_current_user && "border-yellow-400/80 shadow-[0_0_20px_rgba(250,204,21,0.4)] bg-slate-900"
                )}>

                    {/* Hero Avatar */}
                    {hero && (
                        <div className="relative -ml-1">
                            <Avatar
                                id={hero.avatar_id}
                                size={23}
                                className={cn(
                                    "border border-slate-600",
                                    hero.is_current_user && "border-yellow-400 ring-1 ring-yellow-400"
                                )}
                            />
                            <div className="absolute -bottom-0.5 -right-0.5 bg-slate-900 rounded-full p-0.5">
                                <StatusDot status={hero.status} size="sm" />
                            </div>
                        </div>
                    )}

                    {/* Text & Counts */}
                    <div className="flex flex-col items-start pr-1">
                        <span className={cn(
                            "text-xs font-bold leading-none",
                            includes_current_user ? "text-yellow-400" : "text-white"
                        )}>
                            {display_text}
                        </span>

                        {/* Mini status bar */}
                        <div className="flex gap-1 mt-1">
                            <div className="h-1 w-1 rounded-full bg-emerald-500" />
                            <div className="h-1 w-1 rounded-full bg-rose-500" />
                            <div className="h-1 w-1 rounded-full bg-sky-500" />
                        </div>
                    </div>

                </div>

                {/* Triangle pointer */}
                <div className={cn(
                    "w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] -mt-1",
                    includes_current_user ? "border-t-yellow-400/80" : "border-t-slate-900/90"
                )} />

            </div>
        </Marker>
    );
}
