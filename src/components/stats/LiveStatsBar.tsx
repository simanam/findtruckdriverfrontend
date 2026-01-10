"use client";
import { useState, useEffect } from "react";
import { Activity, Truck, ParkingSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface LiveStatsBarProps {
    className?: string;
}

// Helper to format numbers like 1.2k, 1.5m
const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'm';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
};

// Component to animate number changes
const AnimatedNumber = ({ value }: { value: number }) => {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        let start = displayValue;
        const end = value;
        const duration = 1000;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out quart
            const ease = 1 - Math.pow(1 - progress, 4);

            const current = Math.floor(start + (end - start) * ease);
            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [value]);

    return <span>{formatNumber(displayValue)}</span>;
};

export function LiveStatsBar({ className }: LiveStatsBarProps) {
    // Current index for mobile animation
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    // Live Stats State
    const [stats, setStats] = useState([
        {
            icon: Truck,
            label: "Rolling",
            value: 0,
            color: "text-emerald-400",
            iconColor: "text-emerald-400"
        },
        {
            icon: Activity,
            label: "Waiting",
            value: 0,
            color: "text-rose-500",
            iconColor: "text-rose-500"
        },
        {
            icon: ParkingSquare,
            label: "Parked",
            value: 0,
            color: "text-blue-400",
            iconColor: "text-blue-400"
        }
    ]);

    const loadStats = async () => {
        // Skip if not logged in (to prevent 401s or unnecessary network traffic)
        if (!api.isLoggedIn) {
            setLoading(false);
            return;
        }

        try {
            const data = await api.map.getGlobalStats();
            if (data) {
                setStats([
                    {
                        icon: Truck,
                        label: "Rolling",
                        value: data.rolling || 0,
                        color: "text-emerald-400",
                        iconColor: "text-emerald-400"
                    },
                    {
                        icon: Activity,
                        label: "Waiting",
                        value: data.waiting || 0,
                        color: "text-rose-500",
                        iconColor: "text-rose-500"
                    },
                    {
                        icon: ParkingSquare,
                        label: "Parked",
                        value: data.parked || 0,
                        color: "text-blue-400",
                        iconColor: "text-blue-400"
                    }
                ]);
            }
        } catch (error) {
            // Silent fail for stats
        } finally {
            setLoading(false);
        }
    };

    // Initial load + interval
    useEffect(() => {
        loadStats();
        const interval = setInterval(loadStats, 30000);
        return () => clearInterval(interval);
    }, []);

    // Cycle stats on mobile
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % stats.length);
        }, 3000); // 3 seconds per stat
        return () => clearInterval(interval);
    }, [stats.length]);

    const currentStat = stats[currentIndex];

    // Check if total drivers is 0 (or all values 0)
    const totalDrivers = stats.reduce((acc, curr) => acc + curr.value, 0);

    if (loading) {
        return (
            <div className={cn("flex items-center justify-center px-6 py-3 rounded-full bg-slate-900/60 backdrop-blur-md border border-slate-700/50 min-w-[160px]", className)}>
                <span className="text-slate-400 text-sm animate-pulse">Loading stats...</span>
            </div>
        );
    }

    if (totalDrivers === 0) {
        return (
            <div className={cn("flex items-center justify-center px-6 py-3 rounded-full bg-slate-900/60 backdrop-blur-md border border-slate-700/50 min-w-[160px] animate-in fade-in slide-in-from-top-4", className)}>
                <span className="text-slate-300 text-sm font-medium">🚀 Be the first driver!</span>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex items-center gap-6 px-6 py-3 rounded-full",
                "bg-slate-900/60 backdrop-blur-md border border-slate-700/50",
                "shadow-lg shadow-black/20",
                "text-sm md:text-base font-semibold text-slate-100",
                // Mobile: Only show current stat with transition
                // Desktop: Show all
                "min-w-[160px] md:min-w-fit justify-center",
                className
            )}
        >
            {/* Desktop View (All Stats) - Hidden on Mobile */}
            <div className="hidden md:flex items-center gap-6">
                {stats.map((stat, i) => (
                    <div key={stat.label} className="flex items-center gap-4">
                        <div className={cn("flex items-center gap-2", stat.color)}>
                            <stat.icon className="w-5 h-5" />
                            <span><AnimatedNumber value={stat.value} /> {stat.label}</span>
                        </div>
                        {/* Divider except for last item */}
                        {i < stats.length - 1 && <div className="w-px h-5 bg-slate-700/50" />}
                    </div>
                ))}
            </div>

            {/* Mobile View (Animated Single Stat) - Hidden on Desktop */}
            <div className="md:hidden flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500" key={currentIndex}>
                <currentStat.icon className={cn("w-5 h-5", currentStat.iconColor)} />
                <span className={cn(currentStat.color)}>
                    <AnimatedNumber value={currentStat.value} /> {currentStat.label}
                </span>
            </div>
        </div>
    );
}
