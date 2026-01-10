"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Map as MapIcon, X } from "lucide-react";

interface OnboardingLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
    step: number;
    totalSteps: number;
    onClose?: () => void;
    centeredMode?: boolean; // New prop for Login page
}

export function OnboardingLayout({
    children,
    title,
    subtitle,
    step,
    totalSteps,
    onClose,
    centeredMode = false
}: OnboardingLayoutProps) {
    // Step 1 (Status) uses floating mode, UNLESS we are in centeredMode (Login)
    const isFloatingMode = step === 1 && !centeredMode;

    return (
        <div className="relative w-full h-full min-h-screen flex items-center justify-center pointer-events-none">
            {/* 
                Background Blur Overlay
                Only applied when NOT in floating mode (i.e. for avatars, login, etc)
                We don't render the map here anymore, it's global.
            */}
            <div className={cn(
                "absolute inset-0 z-0 transition-all duration-700 pointer-events-none",
                isFloatingMode ? "backdrop-blur-none" : "backdrop-blur-sm bg-slate-950/40"
            )} />

            {/* Close Button Removed (Moved to Card) */}

            {/* Layout Wrapper */}
            <div className={cn(
                "relative z-[60] w-full transition-all duration-500",
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
                    "w-full transition-all duration-500 relative",
                    isFloatingMode
                        ? "max-w-2xl mx-auto pointer-events-auto" // Width for floating bar
                        : "max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 pointer-events-auto"
                )}>
                    {/* Close Button (On Card) */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className={cn(
                                "absolute top-4 right-4 z-50 p-2 rounded-full text-slate-400 hover:text-white transition-all",
                                isFloatingMode
                                    ? "bg-slate-900/80 border border-slate-700 hover:border-slate-500 shadow-lg" // Floating needs its own bg
                                    : "hover:bg-slate-800/50" // Modal blends in
                            )}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}

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
        </div >
    );
}
