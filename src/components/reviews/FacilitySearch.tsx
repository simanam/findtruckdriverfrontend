"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Loader2, MapPin, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface FacilitySearchProps {
    onSelect: (facility: any) => void;
    onSearch?: () => void;
    facilityType?: string;
    className?: string;
    placeholder?: string;
}

export function FacilitySearch({ onSelect, onSearch, facilityType, className, placeholder = "Search facilities by name or address..." }: FacilitySearchProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const doSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        setLoading(true);
        try {
            const params: any = { q: searchQuery, limit: 10 };
            if (facilityType) params.type = facilityType;

            // Try to get user location for better results
            if (navigator.geolocation) {
                try {
                    const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 })
                    );
                    params.lat = pos.coords.latitude;
                    params.lng = pos.coords.longitude;
                } catch {
                    // Location unavailable, proceed without
                }
            }

            const data = await api.reviews.searchFacilities(params);
            setResults(data.facilities || []);
            setIsOpen(true);
            onSearch?.();
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            setLoading(false);
        }
    }, [facilityType]);

    const handleInputChange = (value: string) => {
        setQuery(value);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => doSearch(value), 500);
    };

    const handleSelect = (facility: any) => {
        setIsOpen(false);
        setQuery(facility.name);
        onSelect(facility);
    };

    return (
        <div ref={dropdownRef} className={cn("relative", className)}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => results.length > 0 && setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 transition-all"
                />
                {loading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400 animate-spin" />
                )}
            </div>

            {/* Results Dropdown */}
            {isOpen && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
                    {results.map((facility) => (
                        <button
                            key={facility.id}
                            onClick={() => handleSelect(facility)}
                            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors text-left border-b border-slate-800/30 last:border-b-0"
                        >
                            <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                            <div className="min-w-0">
                                <p className="text-sm text-white font-medium truncate">
                                    {facility.name}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                    {[facility.city, facility.state].filter(Boolean).join(", ")}
                                    {facility.source === "google" && (
                                        <span className="ml-1 text-slate-600">· via Google</span>
                                    )}
                                </p>
                            </div>
                            {facility.total_reviews > 0 && (
                                <span className="text-xs text-amber-400 shrink-0 mt-0.5">
                                    {facility.avg_overall_rating} ({facility.total_reviews})
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {isOpen && query.trim() && results.length === 0 && !loading && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl p-4 z-50">
                    <p className="text-sm text-slate-500 text-center">No facilities found</p>
                </div>
            )}
        </div>
    );
}
