"use client";

import { Clock, MapPin, FileText, Star, X, AlertTriangle } from "lucide-react";
import { DetentionSession, useDetentionStore } from "@/stores/detentionStore";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CheckOutSummaryProps {
    session: DetentionSession;
    onClose: () => void;
    onGenerateProof: () => void;
}

function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatTime(isoString: string): string {
    return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

export function CheckOutSummary({ session, onClose, onGenerateProof }: CheckOutSummaryProps) {
    const hasDetention = (session.detention_time_minutes || 0) > 0;
    const isManualEntry = session.checkout_type === "manual_entry";

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Summary Card */}
            <div className="relative w-full max-w-md bg-slate-900 border-t border-slate-700/50 rounded-t-3xl shadow-2xl pb-6">
                {/* Handle */}
                <div className="flex justify-center pt-2 pb-1">
                    <div className="w-10 h-1 bg-slate-700 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 pb-3">
                    <h2 className="text-lg font-bold text-white">Session Complete</h2>
                    <button onClick={onClose} className="p-1 text-slate-500 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Manual checkout badge */}
                {isManualEntry && (
                    <div className="mx-4 mb-3 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-[10px] text-yellow-400">Manually entered departure time</span>
                    </div>
                )}

                {/* Facility */}
                <div className="px-4 mb-4">
                    <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="w-4 h-4" />
                        <div>
                            <span className="text-sm font-semibold text-white">{session.facility_name}</span>
                            {session.facility_address && (
                                <span className="text-xs text-slate-500 block">{session.facility_address}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Time Details */}
                <div className="mx-4 bg-slate-800/50 rounded-xl p-4 mb-4 space-y-2.5">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Date</span>
                        <span className="text-white font-medium">{formatDate(session.checked_in_at)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Arrived</span>
                        <span className="text-white font-medium">{formatTime(session.checked_in_at)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Departed</span>
                        <span className="text-white font-medium">
                            {session.checked_out_at ? formatTime(session.checked_out_at) : "—"}
                        </span>
                    </div>

                    <div className="border-t border-slate-700/50 pt-2.5">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Total Time</span>
                            <span className="text-white font-bold">
                                {session.total_time_minutes ? formatDuration(session.total_time_minutes) : "—"}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Free Time</span>
                        <span className="text-slate-300">{formatDuration(session.free_time_minutes)}</span>
                    </div>

                    {/* Detention highlight */}
                    <div className={cn(
                        "flex justify-between text-sm pt-2 border-t border-slate-700/50",
                        hasDetention ? "text-red-400" : "text-emerald-400"
                    )}>
                        <span className="font-bold">
                            {hasDetention ? "DETENTION TIME" : "No Detention"}
                        </span>
                        <span className="font-bold text-lg">
                            {hasDetention ? formatDuration(session.detention_time_minutes!) : "—"}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="px-4 space-y-2">
                    {hasDetention && (
                        <button
                            onClick={onGenerateProof}
                            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-bold text-sm transition-colors active:scale-95"
                        >
                            <FileText className="w-4 h-4" />
                            Generate Detention Proof
                        </button>
                    )}
                    <Link
                        href={`/reviews/${session.reviewed_facility_id}`}
                        className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-medium text-sm transition-colors block text-center"
                    >
                        <Star className="w-4 h-4" />
                        Rate This Facility
                    </Link>
                    <button
                        onClick={onClose}
                        className="w-full py-3 text-slate-500 hover:text-white text-sm transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
