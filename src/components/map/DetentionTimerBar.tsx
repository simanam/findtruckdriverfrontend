"use client";

import { useState, useEffect, useRef } from "react";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";
import { DetentionSession, useDetentionStore } from "@/stores/detentionStore";
import { cn } from "@/lib/utils";

interface DetentionTimerBarProps {
    session: DetentionSession;
}

function formatTimer(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function DetentionTimerBar({ session }: DetentionTimerBarProps) {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [expanded, setExpanded] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout>(null);

    const freeTimeSeconds = session.free_time_minutes * 60;

    // Calculate elapsed from checked_in_at
    const calculateElapsed = () => {
        const checkedIn = new Date(session.checked_in_at).getTime();
        const now = Date.now();
        return Math.max(0, Math.floor((now - checkedIn) / 1000));
    };

    // Timer
    useEffect(() => {
        setElapsedSeconds(calculateElapsed());

        intervalRef.current = setInterval(() => {
            setElapsedSeconds(calculateElapsed());
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [session.checked_in_at]);

    // Recalculate on visibility change (tab focus)
    useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState === "visible") {
                setElapsedSeconds(calculateElapsed());
            }
        };
        document.addEventListener("visibilitychange", handleVisibility);
        return () => document.removeEventListener("visibilitychange", handleVisibility);
    }, [session.checked_in_at]);

    // Determine color phase
    const isInFreeTime = elapsedSeconds < freeTimeSeconds;
    const isApproaching = elapsedSeconds >= freeTimeSeconds * 0.75 && elapsedSeconds < freeTimeSeconds;
    const isInDetention = elapsedSeconds >= freeTimeSeconds;
    const detentionSeconds = Math.max(0, elapsedSeconds - freeTimeSeconds);

    const timerColor = isInDetention
        ? "text-red-400"
        : isApproaching
            ? "text-yellow-400"
            : "text-emerald-400";

    const bgColor = isInDetention
        ? "bg-red-500/10 border-red-500/20"
        : isApproaching
            ? "bg-yellow-500/10 border-yellow-500/20"
            : "bg-emerald-500/10 border-emerald-500/20";

    const glowColor = isInDetention
        ? "shadow-red-500/20"
        : isApproaching
            ? "shadow-yellow-500/20"
            : "shadow-emerald-500/20";

    return (
        <div className="fixed top-40 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-4 pointer-events-none">
            <div
                className={cn(
                    "rounded-2xl border shadow-lg pointer-events-auto transition-all duration-300",
                    bgColor, glowColor
                )}
            >
                {/* Main bar */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full flex items-center gap-3 px-4 py-3"
                >
                    {/* Pulsing dot */}
                    <div className="relative">
                        <Clock className={cn("w-5 h-5", timerColor)} />
                        {isInDetention && (
                            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                            </span>
                        )}
                    </div>

                    {/* Timer */}
                    <div className="flex-1 text-left">
                        <div className={cn("text-lg font-mono font-bold tabular-nums", timerColor)}>
                            {formatTimer(elapsedSeconds)}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate flex items-center gap-1.5">
                            <span>{session.facility_name}</span>
                            {session.load_type && session.load_type !== "none" && (
                                <span className={cn(
                                    "px-1 rounded text-[8px] font-bold uppercase shrink-0",
                                    session.load_type === "pickup" ? "text-blue-400 bg-blue-400/15" :
                                    session.load_type === "dropoff" ? "text-orange-400 bg-orange-400/15" :
                                    "text-purple-400 bg-purple-400/15"
                                )}>
                                    {session.load_type === "pickup" ? "PU" : session.load_type === "dropoff" ? "DO" : "PU/DO"}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Status badge */}
                    <div className={cn(
                        "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                        isInDetention
                            ? "bg-red-500/20 text-red-400"
                            : "bg-emerald-500/20 text-emerald-400"
                    )}>
                        {isInDetention ? "Detention" : "Free Time"}
                    </div>

                    {expanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                </button>

                {/* Expanded details */}
                {expanded && (
                    <div className="px-4 pb-3 border-t border-slate-800/50 pt-2 space-y-1.5">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Arrived</span>
                            <span className="text-slate-300">
                                {new Date(session.checked_in_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Free Time</span>
                            <span className="text-slate-300">{formatDuration(session.free_time_minutes)}</span>
                        </div>
                        {isInDetention && (
                            <div className="flex justify-between text-xs">
                                <span className="text-red-400 font-medium">Detention Time</span>
                                <span className="text-red-400 font-bold font-mono">
                                    {formatTimer(detentionSeconds)}
                                </span>
                            </div>
                        )}

                        {/* Progress bar */}
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-1000",
                                    isInDetention ? "bg-red-500" : isApproaching ? "bg-yellow-400" : "bg-emerald-400"
                                )}
                                style={{
                                    width: `${Math.min(100, (elapsedSeconds / freeTimeSeconds) * 100)}%`
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
