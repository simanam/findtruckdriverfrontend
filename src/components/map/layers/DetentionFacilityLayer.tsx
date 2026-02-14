"use client";

import { MapMarker as Marker } from "../MapMarker";
import { cn } from "@/lib/utils";
import { Star, Clock } from "lucide-react";

interface DetentionFacilityLayerProps {
    facilities?: any[];
    onFacilitySelect?: (facility: any) => void;
}

function getDotBorder(avgMinutes: number): string {
    if (avgMinutes <= 0) return "border-slate-400";
    if (avgMinutes < 30) return "border-emerald-400";
    if (avgMinutes < 120) return "border-yellow-400";
    return "border-red-400";
}

function formatDetentionTime(minutes: number): string {
    if (minutes <= 0) return "No data";
    if (minutes < 60) return `${Math.round(minutes)}m avg`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}m avg` : `${hours}h avg`;
}

const FACILITY_TYPE_EMOJI: Record<string, string> = {
    shipper: "📦",
    receiver: "📥",
    warehouse: "🏭",
    mechanic: "🔧",
    truck_stop: "⛽",
    rest_area: "🅿️",
    broker: "📋",
    weigh_station: "⚖️",
    service_plaza: "🏪",
    other: "📍",
};

export function DetentionFacilityLayer({ facilities, onFacilitySelect }: DetentionFacilityLayerProps) {
    if (!facilities || facilities.length === 0) return null;

    return (
        <>
            {facilities.map((fac) => {
                if (!fac.location) return null;

                const avgDetention = parseFloat(fac.avg_detention_minutes) || 0;
                const rating = parseFloat(fac.avg_overall_rating) || 0;
                const emoji = FACILITY_TYPE_EMOJI[fac.facility_type] || "📍";

                // Build subtitle: city, state or address
                const subtitle = fac.city && fac.state
                    ? `${fac.city}, ${fac.state}`
                    : fac.address || "";

                return (
                    <Marker
                        key={fac.id}
                        longitude={fac.location[0]}
                        latitude={fac.location[1]}
                        anchor="bottom"
                        zIndex={1}
                        onClick={() => onFacilitySelect?.(fac)}
                    >
                        <div className="group relative flex flex-col items-center cursor-pointer">
                            {/* Compact dot marker */}
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg",
                                    "transition-transform group-hover:scale-125",
                                    getDotBorder(avgDetention),
                                    "bg-slate-900/90"
                                )}
                            >
                                <span className="text-sm leading-none">{emoji}</span>
                            </div>

                            {/* Small name label below dot */}
                            <div className="mt-0.5 px-1.5 py-0.5 bg-slate-900/80 rounded text-center max-w-[100px]">
                                <span className="text-[9px] font-medium text-slate-300 truncate block">
                                    {fac.name}
                                </span>
                            </div>

                            {/* Hover tooltip with details */}
                            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-20">
                                <div className="bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700/50 px-3 py-2 min-w-[160px] max-w-[220px]">
                                    {/* Name */}
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-semibold text-white truncate">
                                            {fac.name}
                                        </span>
                                    </div>

                                    {/* Address / Location */}
                                    {subtitle && (
                                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                            {subtitle}
                                        </p>
                                    )}

                                    {/* Stats */}
                                    <div className="flex items-center gap-3 text-[10px] mt-1.5">
                                        {rating > 0 && (
                                            <div className="flex items-center gap-0.5">
                                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                                <span className="text-yellow-400 font-medium">{rating.toFixed(1)}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-0.5 text-slate-400">
                                            <Clock className="w-3 h-3" />
                                            <span className="font-medium">
                                                {formatDetentionTime(avgDetention)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Tap hint */}
                                    <p className="text-[8px] text-slate-600 mt-1">Tap for details</p>

                                    {/* Arrow */}
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900/95 border-b border-r border-slate-700/50 rotate-45" />
                                </div>
                            </div>
                        </div>
                    </Marker>
                );
            })}
        </>
    );
}
