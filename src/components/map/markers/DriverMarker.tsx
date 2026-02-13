"use client";

import { Avatar } from "@/components/ui/Avatar";
import { StatusDot } from "@/components/ui/StatusDot";
import { cn } from "@/lib/utils";
import { MapMarker as Marker } from "../MapMarker";

interface DriverMarkerProps {
    driver: {
        driver_id: string;
        handle: string;
        display_name?: string;
        cb_handle?: string;
        avatar_id: string;
        status: string;
        location: {
            latitude: number;
            longitude: number;
        };
        distance_miles?: number;
    };
    onClick?: () => void;
}

export function DriverMarker({ driver, onClick }: DriverMarkerProps) {
    const { avatar_id, status, location } = driver;
    const displayLabel = driver.display_name || driver.cb_handle || driver.handle;

    return (
        <Marker
            longitude={location.longitude}
            latitude={location.latitude}
            onClick={(e) => {
                e?.originalEvent?.stopPropagation();
                onClick?.();
            }}
        >
            <div className="relative group cursor-pointer transition-transform hover:scale-110 z-10">
                <Avatar
                    id={avatar_id}
                    size={40}
                    className={cn(
                        "border-2 shadow-lg bg-slate-900",
                        status === 'rolling' ? "border-emerald-500 ring-2 ring-emerald-500/20" :
                            status === 'waiting' ? "border-rose-500 ring-2 ring-rose-500/20" :
                                "border-sky-500 ring-2 ring-sky-500/20"
                    )}
                />

                {/* Floating status dot */}
                <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5 border border-slate-700">
                    <StatusDot status={status as any} size="sm" showPulse={status === 'rolling'} />
                </div>

                {/* Tooltip */}
                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900/95 text-white text-xs font-bold rounded-lg whitespace-nowrap pointer-events-none z-50 border border-slate-700 shadow-xl">
                    {displayLabel}
                    {driver.distance_miles !== undefined && (
                        <span className="font-normal text-slate-400 ml-1">
                            ({driver.distance_miles.toFixed(1)}mi)
                        </span>
                    )}
                </div>
            </div>
        </Marker>
    );
}
