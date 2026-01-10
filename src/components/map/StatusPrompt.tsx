"use client";

import { useState } from "react";
import { DriverStatus } from "@/stores/onboardingStore";
import { api } from "@/lib/api";
import { Loader2, Truck, Activity, ParkingSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDriverAction } from "@/hooks/useDriverAction";

interface StatusPromptProps {
    message: string;
    suggestedStatus?: string;
    onClose: () => void;
    onUpdate: (status: DriverStatus) => void;
}

export function StatusPrompt({ message, suggestedStatus, onClose, onUpdate }: StatusPromptProps) {
    const { updateStatus } = useDriverAction();
    const [loading, setLoading] = useState<DriverStatus | null>(null);

    const handleStatusSelect = async (status: DriverStatus) => {
        setLoading(status);
        try {
            await updateStatus(status);
            onUpdate(status);
            onClose();
        } catch (e) {
            console.error("Failed to update status", e);
            setLoading(null);
        }
    };

    const options: {
        id: DriverStatus;
        icon: any;
        label: string;
        theme: string;
        gradient: string;
        glow: string;
    }[] = [
            {
                id: 'rolling',
                icon: Truck,
                label: 'Rolling',
                theme: 'text-emerald-400',
                gradient: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/50',
                glow: 'shadow-emerald-500/20'
            },
            {
                id: 'waiting',
                icon: Activity,
                label: 'Waiting',
                theme: 'text-rose-400',
                gradient: 'from-rose-500/20 to-orange-500/20 border-rose-500/50',
                glow: 'shadow-rose-500/20'
            },
            {
                id: 'parked',
                icon: ParkingSquare,
                label: 'Parked',
                theme: 'text-sky-400',
                gradient: 'from-sky-500/20 to-indigo-500/20 border-sky-500/50',
                glow: 'shadow-sky-500/20'
            },
        ];

    return (
        <div className="fixed bottom-8 left-0 right-0 z-[100] flex flex-col items-center justify-end gap-4 p-4 pointer-events-none animate-in slide-in-from-bottom-10 fade-in duration-500">

            {/* Message Badge */}
            <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-6 py-3 rounded-full border border-slate-700 shadow-2xl flex items-center gap-3">
                <div className="flex flex-col items-center">
                    <span className="text-white font-semibold text-sm">Update Status</span>
                    <span className="text-slate-400 text-xs max-w-[200px] truncate text-center">{message}</span>
                </div>
                <button
                    onClick={onClose}
                    className="ml-2 text-slate-500 hover:text-white transition-colors"
                >
                    <span className="sr-only">Dismiss</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            {/* Floating Options Bar */}
            <div className="pointer-events-auto flex gap-3">
                {options.map((option) => {
                    const Icon = option.icon;
                    const isSuggested = suggestedStatus === option.id;
                    const isLoading = loading === option.id;

                    return (
                        <button
                            key={option.id}
                            onClick={() => handleStatusSelect(option.id)}
                            disabled={!!loading}
                            className={cn(
                                "relative flex flex-col items-center justify-center gap-1 px-5 py-3 rounded-xl transition-all duration-300 min-w-[90px] group shadow-xl",
                                isSuggested
                                    ? cn("bg-gradient-to-br border z-10 scale-105", option.gradient, option.glow)
                                    : "bg-slate-900/95 backdrop-blur-md border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white hover:-translate-y-1",
                                loading && "opacity-50 cursor-wait"
                            )}
                        >
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin text-white mb-1" />
                            ) : (
                                <Icon className={cn(
                                    "w-6 h-6 mb-1 transition-all duration-300",
                                    isSuggested || "group-hover:text-white",
                                    isSuggested ? option.theme : "text-slate-500"
                                )} />
                            )}

                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider",
                                isSuggested ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                            )}>
                                {option.label}
                            </span>

                            {/* Suggested Badge */}
                            {isSuggested && (
                                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-sky-500 text-white text-[9px] font-bold uppercase rounded-full shadow-lg border border-sky-400 whitespace-nowrap">
                                    Suggested
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
