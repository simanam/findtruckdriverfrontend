"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Truck, Clock, ParkingSquare, Activity } from 'lucide-react';

interface NetworkStats {
    total_drivers: number;
    rolling: number;
    waiting: number;
    parked: number;
    recently_active: number;
    activity_percentage: number;
    timestamp: string;
}

export function StatsBar() {
    const [stats, setStats] = useState<NetworkStats | null>(null);
    const [loading, setLoading] = useState(true);

    const loadStats = async () => {
        try {
            const data = await api.map.getGlobalStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
        // Refresh every 30 seconds as per guide
        const interval = setInterval(loadStats, 30000);
        return () => clearInterval(interval);
    }, []);

    // Helper to format numbers (1.2k, etc)
    const formatNumber = (num: number): string => {
        if (num < 1000) return num.toString();
        if (num < 10000) return `${(num / 1000).toFixed(1)}k`;
        return `${Math.round(num / 1000)}k`;
    };

    if (loading) return null;

    if (!stats || stats.total_drivers === 0) {
        return (
            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10 animate-in fade-in slide-in-from-top-4">
                <div className="bg-slate-900/80 backdrop-blur-md px-6 py-2 rounded-full border border-slate-700/50 shadow-lg text-slate-300 text-sm font-medium flex items-center gap-2">
                    <span className="text-xl">🚀</span>
                    <span>Be the first driver on the network!</span>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 pointer-events-none">
            {/* Main Stats Container */}
            <div className="flex bg-slate-900/80 backdrop-blur-md p-1 rounded-2xl border border-slate-700/50 shadow-xl pointer-events-auto">
                <div className="flex items-center">
                    {stats.rolling > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 mr-1 last:mr-0">
                            <Truck className="w-4 h-4 text-emerald-400" />
                            <div className="flex flex-col leading-none">
                                <span className="text-sm font-bold text-emerald-400">{formatNumber(stats.rolling)}</span>
                                <span className="text-[10px] font-medium text-emerald-500/70 uppercase">Rolling</span>
                            </div>
                        </div>
                    )}

                    {stats.waiting > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 rounded-xl border border-rose-500/20 mr-1 last:mr-0">
                            <Activity className="w-4 h-4 text-rose-400" />
                            <div className="flex flex-col leading-none">
                                <span className="text-sm font-bold text-rose-400">{formatNumber(stats.waiting)}</span>
                                <span className="text-[10px] font-medium text-rose-500/70 uppercase">Waiting</span>
                            </div>
                        </div>
                    )}

                    {stats.parked > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-sky-500/10 rounded-xl border border-sky-500/20 mr-1 last:mr-0">
                            <ParkingSquare className="w-4 h-4 text-sky-400" />
                            <div className="flex flex-col leading-none">
                                <span className="text-sm font-bold text-sky-400">{formatNumber(stats.parked)}</span>
                                <span className="text-[10px] font-medium text-sky-500/70 uppercase">Parked</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
