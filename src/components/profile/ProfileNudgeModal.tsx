"use client";

import { X, ChevronRight, Target } from "lucide-react";
import Link from "next/link";
import { ProfileCompletionBar } from "./ProfileCompletionBar";

interface ProfileNudgeModalProps {
    isOpen: boolean;
    onClose: () => void;
    completionPercentage: number;
    nextSteps: string[];
}

export function ProfileNudgeModal({ isOpen, onClose, completionPercentage, nextSteps }: ProfileNudgeModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-10"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Header */}
                <div className="px-6 pt-6 pb-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                            <Target className="w-5 h-5 text-sky-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Complete Your Profile</h2>
                            <p className="text-xs text-slate-500">Stand out to other drivers and companies</p>
                        </div>
                    </div>

                    <ProfileCompletionBar percentage={completionPercentage} />
                </div>

                {/* Next Steps */}
                {nextSteps.length > 0 && (
                    <div className="px-6 pb-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                            Next Steps
                        </h3>
                        <ul className="space-y-2">
                            {nextSteps.map((step, i) => (
                                <li
                                    key={i}
                                    className="flex items-center gap-3 text-sm text-slate-300 bg-slate-800/50 border border-slate-800 rounded-lg px-3 py-2.5"
                                >
                                    <div className="w-5 h-5 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center flex-shrink-0">
                                        <span className="text-[10px] font-bold text-slate-400">{i + 1}</span>
                                    </div>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* CTA */}
                <div className="px-6 pb-6">
                    <Link
                        href="/profile/edit"
                        onClick={onClose}
                        className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-sky-500/20"
                    >
                        <span>Complete Profile</span>
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={onClose}
                        className="w-full mt-2 py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
}
