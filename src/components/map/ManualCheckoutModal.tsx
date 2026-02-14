"use client";

import { useState } from "react";
import { AlertTriangle, Clock, X, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { AutoCheckoutAlert, useDetentionStore } from "@/stores/detentionStore";
import { cn } from "@/lib/utils";

interface ManualCheckoutModalProps {
    alert: AutoCheckoutAlert;
    onClose: () => void;
}

export function ManualCheckoutModal({ alert, onClose }: ManualCheckoutModalProps) {
    const { setActiveSession, setCompletedSession, setShowCheckOutSummary, setAutoCheckoutAlert } = useDetentionStore();
    const [checkoutTime, setCheckoutTime] = useState("");
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Calculate a default checkout time (suggest the time they likely left)
    const checkedInAt = new Date(alert.checked_in_at);
    const suggestedTime = new Date(); // Now is a reasonable guess

    const handleStillHere = () => {
        setAutoCheckoutAlert(null);
        onClose();
    };

    const handleManualCheckout = async () => {
        if (!checkoutTime) {
            setError("Please enter when you left the facility");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Construct full datetime from the time input
            const [hours, minutes] = checkoutTime.split(":").map(Number);
            const checkoutDate = new Date(checkedInAt);

            // If the entered time is earlier than check-in time, assume it's the next day
            checkoutDate.setHours(hours, minutes, 0, 0);
            if (checkoutDate <= checkedInAt) {
                checkoutDate.setDate(checkoutDate.getDate() + 1);
            }

            const session = await api.detention.manualCheckout({
                session_id: alert.session_id,
                actual_checkout_time: checkoutDate.toISOString(),
                notes: notes || undefined,
            });

            setActiveSession(null);
            setCompletedSession(session);
            setShowCheckOutSummary(true);
            setAutoCheckoutAlert(null);
            onClose();
        } catch (e: any) {
            setError(e?.message || "Failed to check out");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl p-5">
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-yellow-500/10 rounded-xl">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-white text-sm">Did you leave?</h3>
                        <p className="text-xs text-slate-400 mt-1">
                            You're {alert.distance_from_facility_miles} miles from{" "}
                            <span className="text-white font-medium">{alert.facility_name}</span>.
                            Did you forget to check out?
                        </p>
                    </div>
                    <button onClick={handleStillHere} className="p-1 text-slate-500 hover:text-white">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Time Input */}
                <div className="mb-4">
                    <label className="text-xs text-slate-400 block mb-1.5">When did you leave?</label>
                    <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-2.5 border border-slate-700/50">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <input
                            type="time"
                            value={checkoutTime}
                            onChange={(e) => setCheckoutTime(e.target.value)}
                            className="flex-1 bg-transparent text-white text-sm outline-none [color-scheme:dark]"
                        />
                    </div>
                    <p className="text-[10px] text-slate-600 mt-1">
                        Checked in at {checkedInAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                </div>

                {/* Notes */}
                <div className="mb-4">
                    <label className="text-xs text-slate-400 block mb-1.5">Notes (optional)</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g., Left without unloading, returned tomorrow"
                        className="w-full bg-slate-800 rounded-xl px-3 py-2.5 border border-slate-700/50 text-white text-sm outline-none placeholder-slate-600 resize-none h-16"
                    />
                </div>

                {/* Error */}
                {error && (
                    <p className="text-xs text-red-400 mb-3">{error}</p>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={handleStillHere}
                        className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-colors"
                    >
                        I'm Still Here
                    </button>
                    <button
                        onClick={handleManualCheckout}
                        disabled={isSubmitting}
                        className={cn(
                            "flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2",
                            isSubmitting
                                ? "bg-yellow-800/50 text-yellow-400/50 cursor-not-allowed"
                                : "bg-yellow-600 hover:bg-yellow-500 text-white active:scale-95"
                        )}
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Check Out
                    </button>
                </div>
            </div>
        </div>
    );
}
