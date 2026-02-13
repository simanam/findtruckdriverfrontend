"use client";

import { useOnboardingStore } from "@/stores/onboardingStore";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowLeft, AtSign, Loader2 } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";

export function HandleInput() {
    const { handle, setHandle, setStep, status, avatarId, role, cbHandle } = useOnboardingStore();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const validate = (value: string) => {
        if (value.length < 3) return "Too short (min 3 chars)";
        if (value.length > 20) return "Too long (max 20 chars)";
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Only letters, numbers, and underscores";
        return null;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toLowerCase().trim();
        setHandle(val);
        if (val) setError(validate(val));
        else setError(null);
    };

    const onNext = async () => {
        const err = validate(handle);
        if (err) {
            setError(err);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Create driver profile with all onboarding data
            await api.drivers.create({
                handle,
                avatar_id: avatarId || 'avatar_1',
                status: status || 'parked',
                role: role || undefined,
                cb_handle: cbHandle || undefined,
            });

            // Success! Redirect to map
            window.location.href = '/map';
        } catch (err: any) {
            setError(err.message || "Failed to create profile");
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 ml-1">Choose your handle</label>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        <AtSign className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        value={handle}
                        onChange={handleChange}
                        placeholder="steel_hawk"
                        className={cn(
                            "w-full bg-slate-900 border text-white pl-10 pr-4 py-3 rounded-xl outline-none transition-all placeholder:text-slate-600",
                            error
                                ? "border-rose-500/50 focus:border-rose-500"
                                : "border-slate-700/50 focus:border-sky-500"
                        )}
                        onKeyDown={(e) => e.key === 'Enter' && !error && handle && onNext()}
                    />
                </div>
                {error && <p className="text-rose-400 text-xs ml-1">{error}</p>}
                <p className="text-xs text-slate-500 ml-1">
                    Anonymous. No real names or truck numbers.
                </p>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => setStep(4)}
                    disabled={loading}
                    className="flex-1 py-3 rounded-xl font-semibold bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                    <ArrowLeft className="w-5 h-5 mx-auto" />
                </button>

                <button
                    onClick={onNext}
                    disabled={!handle || !!error || loading}
                    className={cn(
                        "flex-[3] flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all",
                        handle && !error && !loading
                            ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25"
                            : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    )}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Creating Profile...</span>
                        </>
                    ) : (
                        <>
                            <span>Join the Map</span>
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
