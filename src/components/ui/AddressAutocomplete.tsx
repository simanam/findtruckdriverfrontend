"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export interface AddressResult {
    address: string;
    city: string;
    state: string;
    zip_code: string;
    latitude: number;
    longitude: number;
    full_address: string;
}

interface AddressAutocompleteProps {
    onSelect: (result: AddressResult) => void;
    placeholder?: string;
    className?: string;
    /** Bias results near this location */
    proximity?: { lat: number; lng: number };
}

export function AddressAutocomplete({
    onSelect,
    placeholder = "Start typing an address...",
    className,
    proximity,
}: AddressAutocompleteProps) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const fetchSuggestions = useCallback(async (text: string) => {
        if (!MAPBOX_TOKEN || text.length < 3) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        try {
            let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?access_token=${MAPBOX_TOKEN}&country=US&types=address,poi&limit=5&autocomplete=true`;

            if (proximity) {
                url += `&proximity=${proximity.lng},${proximity.lat}`;
            }

            const resp = await fetch(url);
            const data = await resp.json();
            setSuggestions(data.features || []);
            setIsOpen((data.features || []).length > 0);
        } catch {
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    }, [proximity]);

    const handleInputChange = (value: string) => {
        setQuery(value);
        setSelectedLabel("");

        if (timerRef.current) clearTimeout(timerRef.current);

        if (value.length < 3) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        timerRef.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 300);
    };

    const handleSelect = (feature: any) => {
        const context = feature.context || [];

        const city = context.find((c: any) => c.id.startsWith("place"))?.text || "";
        const state = context.find((c: any) => c.id.startsWith("region"))?.short_code?.replace("US-", "")
            || context.find((c: any) => c.id.startsWith("region"))?.text || "";
        const zip = context.find((c: any) => c.id.startsWith("postcode"))?.text || "";
        const streetAddress = feature.place_name?.split(",")[0] || feature.text || "";

        const result: AddressResult = {
            address: streetAddress,
            city,
            state,
            zip_code: zip,
            latitude: feature.center[1],
            longitude: feature.center[0],
            full_address: feature.place_name || "",
        };

        setSelectedLabel(feature.place_name || streetAddress);
        setQuery(feature.place_name || streetAddress);
        setSuggestions([]);
        setIsOpen(false);
        onSelect(result);
    };

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
                    placeholder={placeholder}
                    className="w-full pl-9 pr-8 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                />
                {loading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 animate-spin" />
                )}
            </div>

            {isOpen && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                    {suggestions.map((feature) => (
                        <button
                            key={feature.id}
                            onClick={() => handleSelect(feature)}
                            className="w-full text-left px-3 py-2.5 hover:bg-slate-800/50 transition-colors border-b border-slate-800/30 last:border-0"
                        >
                            <p className="text-sm text-white truncate">
                                {feature.place_name?.split(",")[0] || feature.text}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                                {feature.place_name?.split(",").slice(1).join(",").trim() || ""}
                            </p>
                        </button>
                    ))}
                </div>
            )}

            {selectedLabel && (
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-400">
                    <MapPin className="w-3 h-3" />
                    Address verified
                </div>
            )}
        </div>
    );
}
