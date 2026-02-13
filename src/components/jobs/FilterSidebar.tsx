"use client";

import { cn } from "@/lib/utils";
import { X, Search } from "lucide-react";

const HAUL_TYPES = [
    { value: "otr", label: "OTR" },
    { value: "regional", label: "Regional" },
    { value: "local", label: "Local" },
    { value: "dedicated", label: "Dedicated" },
    { value: "team", label: "Team" },
];

const EQUIPMENT_TYPES = [
    { value: "dry_van", label: "Dry Van" },
    { value: "reefer", label: "Reefer" },
    { value: "flatbed", label: "Flatbed" },
    { value: "tanker", label: "Tanker" },
    { value: "car_hauler", label: "Car Hauler" },
    { value: "intermodal", label: "Intermodal" },
    { value: "hazmat", label: "Hazmat" },
    { value: "oversized", label: "Oversized" },
    { value: "ltl", label: "LTL" },
    { value: "other", label: "Other" },
];

const REGIONS = [
    { value: "northeast", label: "NE" },
    { value: "southeast", label: "SE" },
    { value: "midwest", label: "MW" },
    { value: "southwest", label: "SW" },
    { value: "west", label: "West" },
    { value: "northwest", label: "NW" },
    { value: "national", label: "National" },
];

export interface JobFilters {
    haul_type: string | null;
    equipment: string | null;
    region: string | null;
    fmcsa_verified: boolean;
    search: string;
}

interface FilterSidebarProps {
    filters: JobFilters;
    onChange: (filters: JobFilters) => void;
    onClear: () => void;
    className?: string;
}

export function FilterSidebar({ filters, onChange, onClear, className }: FilterSidebarProps) {
    const hasFilters = filters.haul_type || filters.equipment || filters.region || filters.fmcsa_verified || filters.search;

    return (
        <div className={cn("space-y-5", className)}>
            {/* Search */}
            <div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        value={filters.search}
                        onChange={(e) => onChange({ ...filters, search: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                    />
                </div>
            </div>

            {/* Haul Type */}
            <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Haul Type</h4>
                <div className="space-y-1">
                    <button
                        onClick={() => onChange({ ...filters, haul_type: null })}
                        className={cn(
                            "block w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors",
                            !filters.haul_type ? "bg-sky-500/10 text-sky-400" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                        )}
                    >
                        All
                    </button>
                    {HAUL_TYPES.map((ht) => (
                        <button
                            key={ht.value}
                            onClick={() => onChange({ ...filters, haul_type: filters.haul_type === ht.value ? null : ht.value })}
                            className={cn(
                                "block w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors",
                                filters.haul_type === ht.value
                                    ? "bg-sky-500/10 text-sky-400"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                            )}
                        >
                            {ht.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Equipment */}
            <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Equipment</h4>
                <select
                    value={filters.equipment || ""}
                    onChange={(e) => onChange({ ...filters, equipment: e.target.value || null })}
                    className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-sky-500/50"
                >
                    <option value="">All</option>
                    {EQUIPMENT_TYPES.map((eq) => (
                        <option key={eq.value} value={eq.value}>{eq.label}</option>
                    ))}
                </select>
            </div>

            {/* Regions */}
            <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Region</h4>
                <div className="flex flex-wrap gap-1.5">
                    {REGIONS.map((r) => (
                        <button
                            key={r.value}
                            onClick={() => onChange({ ...filters, region: filters.region === r.value ? null : r.value })}
                            className={cn(
                                "px-2.5 py-1 text-xs font-medium rounded-full border transition-colors",
                                filters.region === r.value
                                    ? "bg-sky-500/10 border-sky-500/30 text-sky-400"
                                    : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600"
                            )}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* FMCSA Verified */}
            <div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={filters.fmcsa_verified}
                        onChange={(e) => onChange({ ...filters, fmcsa_verified: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-sky-500 focus:ring-sky-500/30"
                    />
                    <span className="text-sm text-slate-300">FMCSA Verified only</span>
                </label>
            </div>

            {/* Clear All */}
            {hasFilters && (
                <button
                    onClick={onClear}
                    className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
                >
                    <X className="w-3.5 h-3.5" />
                    Clear All Filters
                </button>
            )}
        </div>
    );
}
