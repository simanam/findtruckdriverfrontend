"use client";

import { Activity, Truck, ParkingSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveStatsBarProps {
    className?: string;
}

export function LiveStatsBar({ className }: LiveStatsBarProps) {
    return (
        <div
            className={cn(
                "flex items-center gap-4 px-4 py-2 rounded-full",
                "bg-slate-900/60 backdrop-blur-md border border-slate-700/50",
                "shadow-lg shadow-black/20",
                "text-xs md:text-sm font-medium text-slate-100",
                className
            )}
        >
            <div className="flex items-center gap-1.5 text-emerald-400">
                <Truck className="w-4 h-4" />
                <span>1,247 Rolling</span>
            </div>
            <div className="w-px h-4 bg-slate-700 mx-1" />
            <div className="flex items-center gap-1.5 text-rose-500">
                <Activity className="w-4 h-4" />
                <span>342 Waiting</span>
            </div>
            <div className="w-px h-4 bg-slate-700 mx-1" />
            <div className="flex items-center gap-1.5 text-blue-400">
                <ParkingSquare className="w-4 h-4" />
                <span>891 Parked</span>
            </div>
        </div>
    );
}
