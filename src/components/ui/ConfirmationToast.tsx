"use client";

import { useEffect } from "react";
import { CheckCircle2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastData {
    type: "success";
    title: string;
    message: string;
    subtext?: string;
}

interface ConfirmationToastProps {
    toast: ToastData;
    onClose: () => void;
}

export function ConfirmationToast({ toast, onClose }: ConfirmationToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="bg-slate-900/90 backdrop-blur-md border border-emerald-500/30 rounded-2xl shadow-2xl p-4 flex items-start gap-4 max-w-sm w-full">
                <div className="bg-emerald-500/10 p-2 rounded-full shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm">{toast.title}</h3>
                    <p className="text-slate-300 text-sm mt-0.5">{toast.message}</p>
                    {toast.subtext && (
                        <p className="text-slate-500 text-xs mt-1 font-medium">{toast.subtext}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
