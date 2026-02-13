"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { Loader2, CheckCircle2, XCircle, Radio } from "lucide-react";

interface CBHandleInputProps {
    onSelect: (cbHandle: string) => void;
    selectedHandle: string | null;
}

export function CBHandleInput({ onSelect, selectedHandle }: CBHandleInputProps) {
    const [value, setValue] = useState(selectedHandle || "");
    const [loading, setLoading] = useState(true);
    const [available, setAvailable] = useState<boolean | null>(
        selectedHandle ? true : null
    );
    const [checking, setChecking] = useState(false);
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const initialLoaded = useRef(false);
    const generatedName = useRef<string | null>(null);

    const stableOnSelect = useCallback(onSelect, []);

    // Load one suggestion on mount and pre-fill
    useEffect(() => {
        if (initialLoaded.current) return;
        initialLoaded.current = true;

        if (selectedHandle) {
            setValue(selectedHandle);
            setAvailable(true);
            setLoading(false);
            return;
        }

        (async () => {
            try {
                const response = await api.drivers.getCBHandleSuggestions();
                const names = response.suggestions || [];
                if (names.length > 0) {
                    const name = names[0];
                    generatedName.current = name;
                    setValue(name);
                    setAvailable(true);
                    stableOnSelect(name);
                }
            } catch {
                // Silently fail - user can type their own
            } finally {
                setLoading(false);
            }
        })();
    }, [selectedHandle, stableOnSelect]);

    // Debounced availability check when user edits
    useEffect(() => {
        if (!value || value.length < 3) {
            setAvailable(null);
            stableOnSelect("");
            return;
        }

        // Skip re-checking if this is the name we just generated or already confirmed
        if (value === generatedName.current && available === true) return;
        if (value === selectedHandle && available === true) return;

        const timer = setTimeout(async () => {
            setChecking(true);
            try {
                const response = await api.drivers.checkCBHandle(value);
                setAvailable(response.available);
                if (response.available) {
                    stableOnSelect(value);
                } else {
                    stableOnSelect("");
                    fetchNewSuggestion();
                }
            } catch {
                // On error, assume available to not block the user
                setAvailable(true);
                stableOnSelect(value);
            } finally {
                setChecking(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [value, available, selectedHandle, stableOnSelect]);

    const fetchNewSuggestion = async () => {
        try {
            const response = await api.drivers.getCBHandleSuggestions();
            const names = response.suggestions || [];
            if (names.length > 0) {
                setSuggestion(names[0]);
            }
        } catch {
            // ignore
        }
    };

    const useSuggestion = () => {
        if (suggestion) {
            generatedName.current = suggestion;
            setValue(suggestion);
            setAvailable(true);
            stableOnSelect(suggestion);
            setSuggestion(null);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^a-zA-Z0-9_\-]/g, "");
        setValue(val);
        setAvailable(null);
        setSuggestion(null);
        generatedName.current = null;
        stableOnSelect("");
    };

    return (
        <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                Your CB Handle
            </label>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
                    <span className="ml-2 text-slate-400 text-sm">Generating your handle...</span>
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <Radio className={cn(
                                "w-4 h-4",
                                available === true ? "text-sky-400" : "text-slate-600"
                            )} />
                        </div>
                        <input
                            type="text"
                            value={value}
                            onChange={handleChange}
                            placeholder="Enter your CB handle"
                            maxLength={50}
                            className={cn(
                                "w-full bg-slate-900 border text-white pl-10 pr-10 py-3 rounded-xl outline-none transition-all placeholder:text-slate-600 font-medium",
                                available === true
                                    ? "border-emerald-500/50 focus:border-emerald-500"
                                    : available === false
                                        ? "border-rose-500/50 focus:border-rose-500"
                                        : "border-slate-700/50 focus:border-sky-500"
                            )}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {checking ? (
                                <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                            ) : available === true ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : available === false ? (
                                <XCircle className="w-4 h-4 text-rose-400" />
                            ) : null}
                        </div>
                    </div>

                    {/* Taken message + suggestion */}
                    {available === false && (
                        <div className="space-y-2">
                            <p className="text-rose-400 text-xs ml-1">This CB handle is already taken</p>
                            {suggestion && (
                                <button
                                    onClick={useSuggestion}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 hover:text-sky-300 transition-all text-sm font-medium"
                                >
                                    <span>Try &quot;<span className="font-semibold text-white">{suggestion}</span>&quot; instead?</span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Available confirmation */}
                    {available === true && value && (
                        <p className="text-emerald-400 text-xs ml-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Available!
                        </p>
                    )}

                    <p className="text-slate-600 text-xs ml-1">
                        Letters, numbers, underscores, and hyphens only
                    </p>
                </div>
            )}
        </div>
    );
}
