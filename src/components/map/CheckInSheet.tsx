"use client";

import { useState, useEffect } from "react";
import { X, Search, MapPin, Plus, Loader2, AlertTriangle, ArrowDown, ArrowUp, ArrowUpDown, Minus } from "lucide-react";
import { api } from "@/lib/api";
import { useDetentionStore } from "@/stores/detentionStore";
import { cn } from "@/lib/utils";

const LOAD_TYPE_OPTIONS = [
    { value: "pickup", label: "Picking Up", icon: ArrowUp, color: "text-blue-400 bg-blue-400/10 border-blue-400/30" },
    { value: "dropoff", label: "Dropping Off", icon: ArrowDown, color: "text-orange-400 bg-orange-400/10 border-orange-400/30" },
    { value: "both", label: "Both", icon: ArrowUpDown, color: "text-purple-400 bg-purple-400/10 border-purple-400/30" },
    { value: "none", label: "N/A", icon: Minus, color: "text-slate-400 bg-slate-400/10 border-slate-400/30" },
] as const;

interface CheckInSheetProps {
    onClose: () => void;
}

export function CheckInSheet({ onClose }: CheckInSheetProps) {
    const { selectedFacilityId, setActiveSession, setShowCheckInFlow } = useDetentionStore();
    const [step, setStep] = useState<"search" | "confirm">(selectedFacilityId ? "confirm" : "search");
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState<any>(null);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [loadType, setLoadType] = useState<string | null>(null);

    // Get user's current location
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => setError("Location access needed to check in. Please enable location.")
            );
        }
    }, []);

    // If facility was pre-selected (from map tap), load it
    useEffect(() => {
        if (selectedFacilityId) {
            const loadFacility = async () => {
                try {
                    const res = await api.reviews.getFacility(selectedFacilityId);
                    if (res.facility) {
                        setSelectedFacility(res.facility);
                        setStep("confirm");
                    }
                } catch (e) {
                    console.error("Failed to load facility", e);
                }
            };
            loadFacility();
        }
    }, [selectedFacilityId]);

    // Search facilities
    useEffect(() => {
        if (!query.trim() || query.length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const params: any = { q: query, limit: 10 };
                if (userLocation) {
                    params.lat = userLocation.lat;
                    params.lng = userLocation.lng;
                }
                const res = await api.reviews.searchFacilities(params);
                setResults(res.facilities || []);
            } catch (e) {
                console.error("Search failed", e);
            } finally {
                setIsSearching(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [query, userLocation]);

    const handleSelectFacility = (facility: any) => {
        setSelectedFacility(facility);
        setStep("confirm");
        setError(null);
    };

    const handleCheckIn = async () => {
        if (!selectedFacility || !userLocation) return;

        setIsCheckingIn(true);
        setError(null);

        try {
            const session = await api.detention.checkIn({
                reviewed_facility_id: selectedFacility.id,
                latitude: userLocation.lat,
                longitude: userLocation.lng,
                load_type: loadType || undefined,
            });

            setActiveSession(session);
            setShowCheckInFlow(false);
            onClose();
        } catch (e: any) {
            const msg = e?.message || e?.data?.detail || "Check-in failed";
            setError(msg);
        } finally {
            setIsCheckingIn(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Sheet */}
            <div className="relative w-full max-w-md bg-slate-900 border-t border-slate-700/50 rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col">
                {/* Handle */}
                <div className="flex justify-center pt-2 pb-1">
                    <div className="w-10 h-1 bg-slate-700 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 pb-3">
                    <h2 className="text-lg font-bold text-white">
                        {step === "search" ? "Select Facility" : "Confirm Check-In"}
                    </h2>
                    <button onClick={onClose} className="p-1 text-slate-500 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mx-4 mb-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-red-400">{error}</span>
                    </div>
                )}

                {/* Step 1: Search */}
                {step === "search" && (
                    <div className="flex-1 overflow-y-auto px-4 pb-4">
                        {/* Search Input */}
                        <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-2.5 mb-3 border border-slate-700/50">
                            <Search className="w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by facility name..."
                                className="flex-1 bg-transparent text-white text-sm outline-none placeholder-slate-500"
                                autoFocus
                            />
                            {isSearching && <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />}
                        </div>

                        {/* Results */}
                        <div className="space-y-1">
                            {results.map((fac) => (
                                <button
                                    key={fac.id}
                                    onClick={() => handleSelectFacility(fac)}
                                    className="w-full text-left px-3 py-2.5 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-white truncate">{fac.name}</span>
                                        {fac.avg_overall_rating > 0 && (
                                            <span className="text-[10px] text-yellow-400 shrink-0">
                                                ★ {parseFloat(fac.avg_overall_rating).toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] text-slate-500 capitalize">
                                            {(fac.facility_type || "").replace("_", " ")}
                                        </span>
                                        {fac.city && fac.state && (
                                            <span className="text-[10px] text-slate-600">
                                                {fac.city}, {fac.state}
                                            </span>
                                        )}
                                        {fac.source === "google" && (
                                            <span className="text-[9px] text-blue-400 bg-blue-400/10 px-1 rounded">Google</span>
                                        )}
                                    </div>
                                </button>
                            ))}

                            {query.length >= 2 && results.length === 0 && !isSearching && (
                                <div className="text-center py-6">
                                    <p className="text-sm text-slate-500 mb-2">No facilities found</p>
                                    <p className="text-xs text-slate-600">
                                        Try a different search or add a new facility from the Reviews page
                                    </p>
                                </div>
                            )}

                            {query.length < 2 && (
                                <div className="text-center py-6">
                                    <MapPin className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                                    <p className="text-sm text-slate-500">
                                        Search for the facility you're at
                                    </p>
                                    <p className="text-xs text-slate-600 mt-1">
                                        Shippers, warehouses, truck stops, and more
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: Confirm */}
                {step === "confirm" && selectedFacility && (
                    <div className="px-4 pb-6">
                        {/* Facility Card */}
                        <div className="bg-slate-800/50 rounded-xl p-4 mb-4 border border-slate-700/30">
                            <h3 className="font-bold text-white text-base">{selectedFacility.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-400 capitalize">
                                    {(selectedFacility.facility_type || "").replace("_", " ")}
                                </span>
                                {selectedFacility.city && selectedFacility.state && (
                                    <span className="text-xs text-slate-500">
                                        {selectedFacility.city}, {selectedFacility.state}
                                    </span>
                                )}
                            </div>
                            {selectedFacility.avg_overall_rating > 0 && (
                                <div className="flex items-center gap-1 mt-2">
                                    <span className="text-yellow-400 text-sm">★</span>
                                    <span className="text-sm text-yellow-400 font-medium">
                                        {parseFloat(selectedFacility.avg_overall_rating).toFixed(1)}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        ({selectedFacility.total_reviews || 0} reviews)
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Load Type Selector */}
                        <div className="mb-4">
                            <p className="text-xs font-medium text-slate-400 mb-2">What are you here for?</p>
                            <div className="grid grid-cols-4 gap-2">
                                {LOAD_TYPE_OPTIONS.map((opt) => {
                                    const Icon = opt.icon;
                                    const isSelected = loadType === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            onClick={() => setLoadType(isSelected ? null : opt.value)}
                                            className={cn(
                                                "flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition-all",
                                                isSelected
                                                    ? opt.color + " border-current"
                                                    : "bg-slate-800/50 border-slate-700/30 text-slate-500 hover:text-slate-300"
                                            )}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span>{opt.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Location Status */}
                        <div className="flex items-center gap-2 mb-4 text-xs">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-slate-400">
                                {userLocation ? "Location detected" : "Getting your location..."}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setStep("search");
                                    setSelectedFacility(null);
                                }}
                                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-colors"
                            >
                                Change
                            </button>
                            <button
                                onClick={handleCheckIn}
                                disabled={isCheckingIn || !userLocation}
                                className={cn(
                                    "flex-[2] py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2",
                                    isCheckingIn || !userLocation
                                        ? "bg-emerald-800/50 text-emerald-400/50 cursor-not-allowed"
                                        : "bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95"
                                )}
                            >
                                {isCheckingIn ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Checking in...
                                    </>
                                ) : (
                                    "Arrived — Start Timer"
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
