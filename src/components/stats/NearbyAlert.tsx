"use client";

import { AlertTriangle, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface NearbyAlertProps {
    className?: string;
}

export function NearbyAlert({ className }: NearbyAlertProps) {
    return (
        <div
            className={cn(
                "p-4 rounded-xl max-w-sm w-full",
                "bg-slate-900/80 backdrop-blur-md border border-slate-700/50",
                "shadow-xl shadow-black/30",
                "transition-all hover:bg-slate-900/90",
                className
            )}
        >
            <div className="flex items-center gap-2 mb-3 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                <MapPin className="w-3 h-3 text-sky-400" />
                <span>Nearby Alert</span>
            </div>

            <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-rose-500" />
                    </div>
                </div>

                <div>
                    <h3 className="text-slate-100 font-semibold mb-1">Heavy Detention Detected</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        <span className="text-rose-400 font-medium">10 drivers</span> waiting at <span className="text-slate-200">Sysco Foods Distribution</span>.
                        Avg wait time: <span className="text-amber-400 font-medium">3.2 hours</span>.
                    </p>

                    <button className="mt-3 text-sm text-sky-400 hover:text-sky-300 font-medium transition-colors">
                        Tap to view details →
                    </button>
                </div>
            </div>
        </div>
    );
}
