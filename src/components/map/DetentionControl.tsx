"use client";

import { useState, useEffect, useCallback } from "react";
import { LogIn, LogOut, Loader2, Settings, History } from "lucide-react";
import { api } from "@/lib/api";
import { useDetentionStore } from "@/stores/detentionStore";
import { CheckInSheet } from "./CheckInSheet";
import { DetentionTimerBar } from "./DetentionTimerBar";
import { CheckOutSummary } from "./CheckOutSummary";
import { cn } from "@/lib/utils";

interface DetentionControlProps {
    onGenerateProof?: (sessionId: string) => void;
}

export function DetentionControl({ onGenerateProof }: DetentionControlProps) {
    const {
        activeSession,
        setActiveSession,
        completedSession,
        setCompletedSession,
        showCheckInFlow,
        setShowCheckInFlow,
        showCheckOutSummary,
        setShowCheckOutSummary,
        isLoading,
        setLoading,
        setSelectedFacilityId,
        setFreeTimeMinutes,
        facilityPopupOpen,
    } = useDetentionStore();

    const [isCheckingOut, setIsCheckingOut] = useState(false);

    // Load active session and settings on mount
    useEffect(() => {
        const init = async () => {
            try {
                // Get detention settings
                const settings = await api.detention.getSettings();
                setFreeTimeMinutes(settings.free_time_minutes);

                // Check for active session
                const res = await api.detention.getActive();
                if (res.active && res.session) {
                    setActiveSession(res.session);
                }
            } catch (e) {
                // Not logged in or other error - that's fine
                console.warn("Could not load detention state", e);
            }
        };
        init();
    }, []);

    // Handle check-out
    const handleCheckOut = useCallback(async () => {
        if (!activeSession) return;

        setIsCheckingOut(true);
        try {
            // Get current location for checkout
            let lat: number | undefined;
            let lng: number | undefined;
            try {
                const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0,
                    });
                });
                lat = pos.coords.latitude;
                lng = pos.coords.longitude;
            } catch {
                // Location not available - proceed without it
            }

            const session = await api.detention.checkOut({
                session_id: activeSession.id,
                latitude: lat,
                longitude: lng,
            });

            setActiveSession(null);
            setCompletedSession(session);
            setShowCheckOutSummary(true);
        } catch (e: any) {
            console.error("Checkout failed", e);
            alert("Failed to check out. Please try again.");
        } finally {
            setIsCheckingOut(false);
        }
    }, [activeSession]);

    const handleOpenCheckIn = () => {
        setSelectedFacilityId(null);
        setShowCheckInFlow(true);
    };

    const handleCloseCheckOutSummary = () => {
        setShowCheckOutSummary(false);
        setCompletedSession(null);
    };

    return (
        <>
            {/* Active session timer */}
            {activeSession && (
                <DetentionTimerBar session={activeSession} />
            )}

            {/* Bottom control bar — hidden when facility popup is open */}
            {!facilityPopupOpen && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-4 pointer-events-none">
                    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-4 shadow-2xl pointer-events-auto">
                        {!activeSession ? (
                            /* No active session: Show "Arrived at Facility" */
                            <button
                                onClick={handleOpenCheckIn}
                                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-2xl font-bold text-sm transition-colors active:scale-95"
                            >
                                <LogIn className="w-5 h-5" />
                                Arrived at Facility
                            </button>
                        ) : (
                            /* Active session: Show "Check Out" */
                            <button
                                onClick={handleCheckOut}
                                disabled={isCheckingOut}
                                className={cn(
                                    "w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-colors",
                                    isCheckingOut
                                        ? "bg-red-800/50 text-red-400/50 cursor-not-allowed"
                                        : "bg-red-600 hover:bg-red-500 text-white active:scale-95"
                                )}
                            >
                                {isCheckingOut ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Checking out...
                                    </>
                                ) : (
                                    <>
                                        <LogOut className="w-5 h-5" />
                                        Check Out — Leaving
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Check-in sheet */}
            {showCheckInFlow && (
                <CheckInSheet onClose={() => setShowCheckInFlow(false)} />
            )}

            {/* Checkout summary */}
            {showCheckOutSummary && completedSession && (
                <CheckOutSummary
                    session={completedSession}
                    onClose={handleCloseCheckOutSummary}
                    onGenerateProof={() => {
                        if (onGenerateProof && completedSession) {
                            onGenerateProof(completedSession.id);
                        }
                    }}
                />
            )}
        </>
    );
}
