"use client";

import { useEffect, useState } from "react";
import { useFollowUpStore } from "@/stores/followUpStore";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { X, Timer } from "lucide-react";

export function FollowUpModal() {
    const { isOpen, question, statusUpdateId, close } = useFollowUpStore();
    const [dismissTimer, setDismissTimer] = useState<number | null>(null);

    // Handle Auto-Dismiss
    useEffect(() => {
        console.log("🖼️ [FollowUpModal] Render state:", { isOpen, hasQuestion: !!question, statusUpdateId });

        if (isOpen && question?.auto_dismiss_seconds) {
            const timer = setTimeout(() => {
                close();
            }, question.auto_dismiss_seconds * 1000);

            // For visual countdown (optional, keep simple for now)
            setDismissTimer(question.auto_dismiss_seconds);

            return () => clearTimeout(timer);
        }
        setDismissTimer(null);
    }, [isOpen, question, close]);

    if (!isOpen || !question || !statusUpdateId) return null;

    const handleRespond = async (value: string) => {
        try {
            await api.followUps.respond({
                status_update_id: statusUpdateId,
                response_value: value
            });
        } catch (error) {
            console.error("Failed to respond to follow-up", error);
        } finally {
            close();
        }
    };

    return (
        <div className="fixed bottom-32 left-0 right-0 z-[100] flex flex-col items-center justify-end gap-3 p-4 pointer-events-none animate-in slide-in-from-bottom-10 fade-in duration-500">

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
                            onClick={() => handleRespond(option.value)}
                            className="flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 hover:bg-slate-800 hover:border-sky-500/50 hover:-translate-y-1 transition-all shadow-xl min-w-[80px] group"
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform">
                                {option.emoji}
                            </span>
                            <span className="text-[10px] font-bold text-slate-300 group-hover:text-white uppercase tracking-wide">
                                {option.label}
                            </span>
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
        </div>
    );
}
