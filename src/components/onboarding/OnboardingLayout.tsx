"use client";

import { ReactNode } from "react";
import { InteractiveMap } from "@/components/map/InteractiveMap";
import { cn } from "@/lib/utils";
import { Map as MapIcon, X } from "lucide-react";

interface OnboardingLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
    step: number;
    totalSteps: number;
    onClose?: () => void;
}

export function OnboardingLayout({
    children,
    title,
    subtitle,
    step,
    totalSteps,
    onClose
}: OnboardingLayoutProps) {
    // Step 1 (Status) uses a floating/minimal layout to see the map
    const isFloatingMode = step === 1;

    return (
        <div className="relative w-full h-screen overflow-hidden bg-slate-950 flex items-center justify-center">
            {/* Background Map - visible and interactive in step 1, blurred in others */}
            <div className={cn(
                "absolute inset-0 z-0 transition-all duration-700",
                isFloatingMode ? "opacity-100 scale-100" : "opacity-30 blur-md scale-105 pointer-events-none"
            )}>
                <InteractiveMap />
            </div>

            {/* Close Button (Top Right) */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-slate-900/80 backdrop-blur-md rounded-full text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 transition-all shadow-lg"
                >
                    <X className="w-6 h-6" />
                </button>
            )}

            {/* Layout Wrapper */}
            <div className={cn(
                "relative z-10 w-full transition-all duration-500",
                isFloatingMode
                    ? "h-full flex flex-col justify-end pb-8 px-4 pointer-events-none" // Floating Mode: Bottom alignment, pass clicks through empty space
                    : "flex items-center justify-center p-4" // Standard Modal Mode
            )}>

                {/* 
                    Floating Bar Container for Step 1 
                    vs 
                    Standard Card for Steps 2+ 
                */}
                <div className={cn(
                    "w-full transition-all duration-500",
                    isFloatingMode
                        ? "max-w-2xl mx-auto pointer-events-auto" // Width for floating bar
                        : "max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95"
                )}>

                    {/* Progress Bar (Only show in modal mode for now? Or keep minimal?) */}
                    {!isFloatingMode && (
                        <div className="h-1 w-full bg-slate-800">
                            <div
                                className="h-full bg-sky-500 transition-all duration-500 ease-out"
                                style={{ width: `${(step / totalSteps) * 100}%` }}
                            />
                        </div>
                    )}

                    {/* Content Area */}
                    <div className={cn(
                        isFloatingMode ? "" : "p-8"
                    )}>
                        {/* Header (Hidden in Floating Mode, shown in Modal) */}
                        {!isFloatingMode && (
                            <>
                                <div className="flex justify-center mb-6">
                                    <div className="bg-slate-800/50 p-3 rounded-full border border-slate-700">
                                        <MapIcon className="w-8 h-8 text-sky-400" />
                                    </div>
                                </div>
                                <div className="text-center mb-8">
                                    <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
                                    {subtitle && <p className="text-slate-400">{subtitle}</p>}
                                </div>
                            </>
                        )}

                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
