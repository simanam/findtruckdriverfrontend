"use client";

import { useOnboardingStore, type DriverStatus } from "@/stores/onboardingStore";
import { Truck, Activity, ParkingSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusSelectorProps {
    triggerAnimation?: boolean;
}

export function StatusSelector({ triggerAnimation }: StatusSelectorProps) {
    const { status, setStatus, setStep } = useOnboardingStore();

    // Auto-advance after a short delay for smoother UX? 
    // Or keep manual continue? User asked for "floating bar". 
    // Let's make selecting a status the primary action, then show a small "Confirm" arrow.

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
        <div className="flex flex-col items-center gap-4 animate-in slide-in-from-bottom-10 fade-in duration-500">

            {/* Floating Label Badge */}
            <div className={cn(
                "bg-slate-900/90 backdrop-blur-md px-6 py-2 rounded-full border shadow-xl mb-2 transition-all duration-300",
                triggerAnimation
                    ? "border-sky-400 shadow-[0_0_30px_-5px_rgba(56,189,248,0.6)] ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-900 scale-110 text-white"
                    : "border-slate-700 text-slate-200"
            )}>
                <span className="font-medium">What's your status?</span>
            </div>

            {/* Horizontal Floating Bar */}
            <div className="flex gap-2">
                {options.map((option) => {
                    const Icon = option.icon;
                    const isSelected = status === option.id;

                    return (
                        <button
                            key={option.id}
                            onClick={() => setStatus(option.id)}
                            className={cn(
                                "relative flex flex-col items-center justify-center gap-1 px-6 py-3 rounded-xl transition-all duration-300 min-w-[100px] pointer-events-auto cursor-pointer z-50",
                                isSelected
                                    ? cn("bg-gradient-to-br border shadow-lg scale-105 z-10", option.gradient, option.glow)
                                    : "bg-slate-900/90 backdrop-blur-md border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white"
                            )}
                        >
                            <Icon className={cn(
                                "w-6 h-6 mb-1 transition-all",
                                isSelected ? cn("scale-110", option.theme) : "text-slate-400"
                            )} />

                            <span className={cn(
                                "text-xs font-bold uppercase tracking-wider",
                                isSelected ? "text-white" : "text-slate-500"
                            )}>
                                {option.label}
                            </span>

                            {isSelected && (
                                <div className={cn("absolute inset-0 rounded-xl bg-white/5 animate-pulse pointer-events-none")} />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Continue / Confirm Button (Appears below) */}
            <div className={cn(
                "overflow-hidden transition-all duration-500 ease-in-out",
                status ? "max-h-20 opacity-100 translate-y-0" : "max-h-0 opacity-0 translate-y-4"
            )}>
                <button
                    onClick={() => setStep(3)}
                    className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-sky-500/25 transition-all hover:scale-105 active:scale-95 pointer-events-auto cursor-pointer z-50"
                >
                    <span>Confirm Status</span>
                    <Truck className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
