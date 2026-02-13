"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { FMCSACarrier } from "@/types/profile";
import { cn } from "@/lib/utils";
import { Search, Loader2, Building2, MapPin, Truck, Users, ChevronDown, ChevronUp } from "lucide-react";

interface CompanySearchProps {
    onSelect: (carrier: FMCSACarrier) => void;
    compact?: boolean;
}

export function CompanySearch({ onSelect, compact = false }: CompanySearchProps) {
    const [searchType, setSearchType] = useState<"name" | "dot">("name");
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<FMCSACarrier[]>([]);
    const [searching, setSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [error, setError] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Debounced search
    useEffect(() => {
        if (!query || query.length < 2) {
            setResults([]);
            setShowDropdown(false);
            return;
        }

        const timer = setTimeout(async () => {
            setSearching(true);
            setError("");
            try {
                const response = await api.profile.searchFMCSA(query, searchType);
                setResults(response.results || []);
                setShowDropdown(true);
            } catch (e: any) {
                if (e.status === 503) {
                    setError("FMCSA API key not configured");
                } else {
                    setError("Search failed. Try again.");
                }
                setResults([]);
            } finally {
                setSearching(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query, searchType]);

    const handleSelect = (carrier: FMCSACarrier) => {
        onSelect(carrier);
        setQuery("");
        setResults([]);
        setShowDropdown(false);
        setExpanded(false);
    };

    return (
        <div ref={containerRef} className="space-y-2">
            {/* Toggle button */}
            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                    expanded
                        ? "bg-sky-500/10 border-sky-500/30 text-sky-400"
                        : "bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500"
                )}
            >
                <Search className="w-3.5 h-3.5" />
                <span>Lookup via FMCSA</span>
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {expanded && (
                <div className="space-y-2 pl-0">
                    {/* Search Type Toggle */}
                    <div className="flex gap-1 bg-slate-800/50 rounded-lg p-0.5 w-fit">
                        <button
                            type="button"
                            onClick={() => { setSearchType("name"); setQuery(""); setResults([]); }}
                            className={cn(
                                "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                searchType === "name"
                                    ? "bg-slate-700 text-white"
                                    : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            By Name
                        </button>
                        <button
                            type="button"
                            onClick={() => { setSearchType("dot"); setQuery(""); setResults([]); }}
                            className={cn(
                                "px-3 py-1 rounded-md text-xs font-medium transition-all",
                                searchType === "dot"
                                    ? "bg-slate-700 text-white"
                                    : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            By DOT #
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={searchType === "name" ? "Search company name..." : "Enter DOT number..."}
                            className={cn(
                                "w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-10 text-white placeholder-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all",
                                compact ? "py-2 text-xs" : "py-2.5 text-sm"
                            )}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                        {searching && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sky-400 animate-spin" />
                        )}
                    </div>

                    {error && (
                        <p className="text-xs text-amber-400">{error}</p>
                    )}

                    {/* Results Dropdown */}
                    {showDropdown && results.length > 0 && (
                        <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-xl max-h-60 overflow-y-auto">
                            {results.map((carrier, idx) => (
                                <button
                                    key={`${carrier.dot_number}-${idx}`}
                                    type="button"
                                    onClick={() => handleSelect(carrier)}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-b-0"
                                >
                                    <div className="flex items-start gap-3">
                                        <Building2 className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-white truncate">
                                                {carrier.legal_name}
                                            </p>
                                            {carrier.dba_name && (
                                                <p className="text-xs text-slate-500 truncate">
                                                    DBA: {carrier.dba_name}
                                                </p>
                                            )}
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                                {carrier.dot_number && (
                                                    <span className="text-xs text-slate-400">
                                                        DOT: {carrier.dot_number}
                                                    </span>
                                                )}
                                                {carrier.mc_number && (
                                                    <span className="text-xs text-slate-400">
                                                        {carrier.mc_number}
                                                    </span>
                                                )}
                                                {carrier.city && carrier.state && (
                                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {carrier.city}, {carrier.state}
                                                    </span>
                                                )}
                                                {carrier.power_units && (
                                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Truck className="w-3 h-3" />
                                                        {carrier.power_units} units
                                                    </span>
                                                )}
                                                {carrier.drivers && (
                                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        {carrier.drivers} drivers
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {showDropdown && results.length === 0 && !searching && query.length >= 2 && (
                        <p className="text-xs text-slate-500 py-1">No carriers found.</p>
                    )}
                </div>
            )}
        </div>
    );
}
