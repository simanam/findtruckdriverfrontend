"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useDetentionStore } from "@/stores/detentionStore";

interface DetentionSearchBarProps {
    onFacilitySelect?: (facility: any) => void;
}

export function DetentionSearchBar({ onFacilitySelect }: DetentionSearchBarProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const { activeSession } = useDetentionStore();
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (!query.trim() || query.length < 2) {
            setResults([]);
            setShowResults(false);
            return;
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await api.reviews.searchFacilities({ q: query, limit: 8 });
                setResults(res.facilities || []);
                setShowResults(true);
            } catch (e) {
                console.error("Search failed", e);
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 400);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query]);

    const handleSelect = (facility: any) => {
        setQuery("");
        setShowResults(false);
        setResults([]);
        onFacilitySelect?.(facility);
    };

    const handleClear = () => {
        setQuery("");
        setResults([]);
        setShowResults(false);
        inputRef.current?.focus();
    };

    return (
        <div className="relative w-full max-w-md">
            {/* Search Input */}
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2.5">
                    <Search className="w-4 h-4 text-slate-500 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={activeSession ? `At ${activeSession.facility_name}` : "Search facilities..."}
                        className="flex-1 bg-transparent text-white text-sm placeholder-slate-500 outline-none"
                    />
                    {isSearching && <Loader2 className="w-4 h-4 text-slate-500 animate-spin shrink-0" />}
                    {query && !isSearching && (
                        <button onClick={handleClear} className="text-slate-500 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Results Dropdown */}
            {showResults && results.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden z-50 max-h-64 overflow-y-auto">
                    {results.map((fac) => (
                        <button
                            key={fac.id}
                            onClick={() => handleSelect(fac)}
                            className="w-full text-left px-3 py-2.5 hover:bg-slate-800/50 transition-colors border-b border-slate-800/50 last:border-0"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-white truncate">{fac.name}</span>
                                {fac.avg_overall_rating > 0 && (
                                    <span className="text-[10px] text-yellow-400 shrink-0">
                                        ★ {parseFloat(fac.avg_overall_rating).toFixed(1)}
                                    </span>
                                )}
                            </div>
                            {/* Address */}
                            {(fac.address || (fac.city && fac.state)) && (
                                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                    {fac.address || `${fac.city}, ${fac.state}`}
                                </p>
                            )}
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-slate-500 capitalize">{(fac.facility_type || "").replace("_", " ")}</span>
                                {fac.source === "google" && (
                                    <span className="text-[9px] text-blue-400 bg-blue-400/10 px-1 rounded">via Google</span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* No Results */}
            {showResults && query.length >= 2 && results.length === 0 && !isSearching && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl p-3 z-50">
                    <p className="text-xs text-slate-500 text-center">No facilities found</p>
                </div>
            )}
        </div>
    );
}
