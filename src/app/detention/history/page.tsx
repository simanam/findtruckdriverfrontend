"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Clock, ArrowLeft, Loader2, MapPin, Download, ChevronDown, FileText } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DetentionProofGenerator } from "@/components/detention/DetentionProofGenerator";

interface DetentionSession {
    id: string;
    reviewed_facility_id: string;
    facility_name: string;
    facility_type: string;
    facility_address?: string;
    checked_in_at: string;
    checked_out_at: string | null;
    free_time_minutes: number;
    total_time_minutes: number | null;
    detention_time_minutes: number | null;
    checkout_type: string | null;
    load_type: string | null;
    status: string;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

function formatDuration(minutes: number | null): string {
    if (!minutes || minutes <= 0) return "—";
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const CHECKOUT_LABELS: Record<string, string> = {
    manual: "Manual",
    auto_detected: "Auto-detected",
    manual_entry: "Manual entry",
    expired: "Expired",
};

const LOAD_TYPE_LABELS: Record<string, string> = {
    pickup: "Pickup",
    dropoff: "Dropoff",
    both: "Pickup & Dropoff",
    none: "N/A",
};

const FACILITY_TYPE_LABELS: Record<string, string> = {
    shipper: "Shipper",
    receiver: "Receiver",
    warehouse: "Warehouse",
    mechanic: "Mechanic",
    truck_stop: "Truck Stop",
    rest_area: "Rest Area",
    broker: "Broker",
    weigh_station: "Weigh Station",
    service_plaza: "Service Plaza",
    other: "Other",
};

export default function DetentionHistoryPage() {
    const router = useRouter();
    const [sessions, setSessions] = useState<DetentionSession[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [proofSessionId, setProofSessionId] = useState<string | null>(null);
    const limit = 20;

    const fetchSessions = useCallback(async (loadOffset: number, append: boolean) => {
        try {
            const data = await api.detention.getHistory({ limit, offset: loadOffset });
            if (append) {
                setSessions((prev) => [...prev, ...data.sessions]);
            } else {
                setSessions(data.sessions);
            }
            setTotal(data.total);
        } catch (err) {
            console.error("Failed to load detention history:", err);
        }
    }, []);

    useEffect(() => {
        if (!api.isLoggedIn) {
            router.push("/login");
            return;
        }

        const load = async () => {
            setLoading(true);
            await fetchSessions(0, false);
            setLoading(false);
        };
        load();
    }, [router, fetchSessions]);

    const handleLoadMore = async () => {
        const newOffset = offset + limit;
        setLoadingMore(true);
        await fetchSessions(newOffset, true);
        setOffset(newOffset);
        setLoadingMore(false);
    };

    const hasMore = sessions.length < total;

    // Aggregate stats
    const totalDetentionMinutes = sessions.reduce((sum, s) => sum + (s.detention_time_minutes || 0), 0);
    const sessionsWithDetention = sessions.filter((s) => (s.detention_time_minutes || 0) > 0).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-8">
                {/* Back */}
                <Link
                    href="/map"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Map
                </Link>

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Clock className="w-6 h-6 text-red-400" />
                        Detention History
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {total} {total === 1 ? "session" : "sessions"} recorded
                    </p>
                </div>

                {/* Summary Stats */}
                {sessions.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-3 text-center">
                            <p className="text-lg font-bold text-white">{total}</p>
                            <p className="text-[10px] text-slate-500 uppercase">Total Visits</p>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-3 text-center">
                            <p className="text-lg font-bold text-red-400">{sessionsWithDetention}</p>
                            <p className="text-[10px] text-slate-500 uppercase">With Detention</p>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-3 text-center">
                            <p className="text-lg font-bold text-red-400">{formatDuration(totalDetentionMinutes)}</p>
                            <p className="text-[10px] text-slate-500 uppercase">Total Detention</p>
                        </div>
                    </div>
                )}

                {/* Sessions List */}
                {sessions.length === 0 ? (
                    <div className="text-center py-16">
                        <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 text-lg">No detention sessions yet</p>
                        <p className="text-slate-500 text-sm mt-1">
                            Check in at a facility on the map to start tracking
                        </p>
                        <Link
                            href="/map"
                            className="inline-flex mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition-colors"
                        >
                            Open Map
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4"
                            >
                                {/* Top row: facility + date */}
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white text-sm truncate">
                                            {session.facility_name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400 uppercase font-medium">
                                                {FACILITY_TYPE_LABELS[session.facility_type] || session.facility_type}
                                            </span>
                                            {session.load_type && session.load_type !== "none" && (
                                                <span className={cn(
                                                    "text-[10px] px-1.5 py-0.5 rounded font-medium",
                                                    session.load_type === "pickup" ? "text-blue-400 bg-blue-400/10" :
                                                    session.load_type === "dropoff" ? "text-orange-400 bg-orange-400/10" :
                                                    "text-purple-400 bg-purple-400/10"
                                                )}>
                                                    {LOAD_TYPE_LABELS[session.load_type] || session.load_type}
                                                </span>
                                            )}
                                            {session.checkout_type && (
                                                <span className="text-[10px] text-slate-500">
                                                    {CHECKOUT_LABELS[session.checkout_type] || session.checkout_type}
                                                </span>
                                            )}
                                        </div>
                                        {session.facility_address && (
                                            <p className="text-[10px] text-slate-500 mt-1 truncate">
                                                <MapPin className="w-3 h-3 inline mr-0.5 -mt-0.5" />
                                                {session.facility_address}
                                            </p>
                                        )}
                                    </div>
                                    <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                                        {formatDate(session.checked_in_at)}
                                    </span>
                                </div>

                                {/* Time row */}
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase">Arrived</p>
                                        <p className="text-xs font-medium text-slate-300">
                                            {formatTime(session.checked_in_at)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase">Departed</p>
                                        <p className="text-xs font-medium text-slate-300">
                                            {session.checked_out_at ? formatTime(session.checked_out_at) : "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase">Total</p>
                                        <p className="text-xs font-medium text-slate-300">
                                            {formatDuration(session.total_time_minutes)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase">Detention</p>
                                        <p className={cn(
                                            "text-xs font-bold",
                                            (session.detention_time_minutes || 0) > 0
                                                ? "text-red-400"
                                                : "text-slate-500"
                                        )}>
                                            {formatDuration(session.detention_time_minutes)}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setProofSessionId(session.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-xs font-medium transition-colors"
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                        Download Proof
                                    </button>
                                    <Link
                                        href={`/reviews/${session.reviewed_facility_id}`}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/30 hover:bg-slate-700/50 text-slate-400 rounded-lg text-xs font-medium transition-colors"
                                    >
                                        Add Review
                                    </Link>
                                </div>
                            </div>
                        ))}

                        {/* Load More */}
                        {hasMore && (
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/30 rounded-xl text-sm text-slate-400 hover:text-white font-medium transition-colors"
                            >
                                {loadingMore ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <ChevronDown className="w-4 h-4" />
                                )}
                                {loadingMore ? "Loading..." : `Load More (${total - sessions.length} remaining)`}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Proof Generator Modal */}
            {proofSessionId && (
                <DetentionProofGenerator
                    sessionId={proofSessionId}
                    onClose={() => setProofSessionId(null)}
                />
            )}
        </div>
    );
}
