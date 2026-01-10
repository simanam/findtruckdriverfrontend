"use client";

import { useEffect, useState } from "react";
import { useFollowUpStore } from "@/stores/followUpStore";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { X, Timer } from "lucide-react";
import { ConfirmationToast, ToastData } from "@/components/ui/ConfirmationToast";
import { useOnboardingStore, DriverStatus } from "@/stores/onboardingStore";
import { WeatherAlertModal, WeatherFollowUpQuestion } from "@/components/weather/WeatherAlertModal";

export function FollowUpModal() {
    const { isOpen, question, statusUpdateId, close } = useFollowUpStore();
    const { setStatus } = useOnboardingStore();
    const [dismissTimer, setDismissTimer] = useState<number | null>(null);
    const [toast, setToast] = useState<ToastData | null>(null);

    // Weather Check
    const isWeather = question?.question_type?.startsWith('weather');

    // Handle Auto-Dismiss (Native/Standard only)
    useEffect(() => {
        // If weather, let WeatherAlertModal handle it
        if (isWeather) return;

        console.log("🖼️ [FollowUpModal] Render state:", { isOpen, hasQuestion: !!question, statusUpdateId });

        if (isOpen && question?.auto_dismiss_seconds) {
            const timer = setTimeout(() => {
                close();
            }, question.auto_dismiss_seconds * 1000);

            // For visual countdown
            setDismissTimer(question.auto_dismiss_seconds);

            return () => clearTimeout(timer);
        }
        setDismissTimer(null);
    }, [isOpen, question, close, isWeather]);

    if (!isOpen || !question || !statusUpdateId) return null;

    const handleRespond = async (value: string) => {
        try {
            const res = await api.followUps.respond({
                status_update_id: statusUpdateId,
                response_value: value
            });

            // Handle Status Correction
            if (res.status_corrected && res.new_status) {
                setStatus(res.new_status as DriverStatus);
                setToast({
                    type: "success",
                    title: "Status Corrected",
                    message: `Switched back to ${res.new_status.toUpperCase()}`,
                    subtext: "Based on your response"
                });

                // Delay close to show toast if standard modal (though we are about to close)
                setTimeout(() => close(), 2000);
                return;
            }

        } catch (error) {
            console.error("Failed to respond to follow-up", error);
        } finally {
            close();
        }
    };

    // 🌪️ Weather Alert Interception
    if (isWeather) {
        return (
            <>
                <WeatherAlertModal
                    visible={isOpen}
                    question={question as WeatherFollowUpQuestion}
                    onRespond={handleRespond}
                    onDismiss={close}
                />
                {/* Render Toast if present (weather modal might trigger it too) */}
                {toast && <ConfirmationToast toast={toast} onClose={() => setToast(null)} />}
            </>
        );
    }

    // Standard Modal
    return (
        <div className="fixed bottom-32 left-0 right-0 z-[100] flex flex-col items-center justify-end gap-3 p-4 pointer-events-none animate-in slide-in-from-bottom-10 fade-in duration-500">

            {isOpen && question && (
                <>
                    {/* Question Badge */}
                    <div className="relative pointer-events-auto bg-slate-900/95 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-700 shadow-2xl flex flex-col items-center gap-1 max-w-sm text-center">
                        <h3 className="text-white font-bold text-sm md:text-base leading-tight">
                            {question.text}
                        </h3>
                        {question.subtext && (
                            <p className="text-slate-400 text-xs">
                                {question.subtext}
                            </p>
                        )}

                        {/* Skip / Close (if skippable) */}
                        {question.skippable && (
                            <button
                                onClick={close}
                                className="absolute -top-3 -right-3 bg-slate-800 text-slate-400 hover:text-white p-1.5 rounded-full border border-slate-600 shadow-lg transition-colors hover:scale-110"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    {/* Options Row */}
                    {question.options?.length > 0 && (
                        <div className="pointer-events-auto flex flex-wrap justify-center gap-2 w-full max-w-md">
                            {question.options.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={async () => {
                                        // Custom logic to handle response + toast for standard modal buttons
                                        try {
                                            const res = await api.followUps.respond({
                                                status_update_id: statusUpdateId!,
                                                response_value: option.value
                                            });

                                            if (res.status_corrected && res.new_status) {
                                                setStatus(res.new_status as DriverStatus);
                                                setToast({
                                                    type: "success",
                                                    title: "Status Corrected",
                                                    message: `Switched to ${res.new_status.toUpperCase()}`,
                                                    subtext: "Based on your response"
                                                });
                                            }
                                        } catch (e) {
                                            console.error(e);
                                        } finally {
                                            close();
                                        }
                                    }}
                                    className="flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 hover:bg-slate-800 hover:border-sky-500/50 hover:-translate-y-1 transition-all shadow-xl min-w-[80px] group"
                                >
                                    <span className="text-2xl group-hover:scale-110 transition-transform">
                                        {option.emoji}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-300 group-hover:text-white uppercase tracking-wide">
                                        {option.label}
                                    </span>
                                    {option.description && (
                                        <span className="text-[9px] text-slate-500 mt-1 max-w-[100px] leading-tight group-hover:text-slate-400">
                                            {option.description}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Timer visual */}
                    {dismissTimer && (
                        <div className="pointer-events-auto bg-slate-900/50 backdrop-blur px-3 py-1 rounded-full flex items-center gap-2 border border-slate-800">
                            <Timer className="w-3 h-3 text-sky-400" />
                            <span className="text-[10px] text-sky-400 font-medium">Auto-closing</span>
                        </div>
                    )}
                </>
            )}

            {/* Render Toast if present */}
            {toast && <ConfirmationToast toast={toast} onClose={() => setToast(null)} />}
        </div>
    );
}
