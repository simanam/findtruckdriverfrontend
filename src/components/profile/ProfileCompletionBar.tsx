"use client";

import { cn } from "@/lib/utils";

interface ProfileCompletionBarProps {
    percentage: number;
    className?: string;
}

export function ProfileCompletionBar({ percentage, className }: ProfileCompletionBarProps) {
    const clampedPercentage = Math.min(100, Math.max(0, percentage));

    // Determine color based on percentage
    const getBarColor = () => {
        if (clampedPercentage < 30) return "from-rose-500 to-rose-400";
        if (clampedPercentage < 60) return "from-amber-500 to-yellow-400";
        if (clampedPercentage < 90) return "from-sky-500 to-sky-400";
        return "from-emerald-500 to-emerald-400";
    };

    const getTextColor = () => {
        if (clampedPercentage < 30) return "text-rose-400";
        if (clampedPercentage < 60) return "text-amber-400";
        if (clampedPercentage < 90) return "text-sky-400";
        return "text-emerald-400";
    };

    return (
        <div className={cn("w-full", className)}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Profile Completion
                </span>
                <span className={cn("text-sm font-bold", getTextColor())}>
                    {clampedPercentage}%
                </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                    className={cn(
                        "h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-out",
                        getBarColor()
                    )}
                    style={{ width: `${clampedPercentage}%` }}
                />
            </div>
        </div>
    );
}
