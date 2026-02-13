"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { FacilityCard } from "@/components/reviews/FacilityCard";
import { FacilitySearch } from "@/components/reviews/FacilitySearch";
import { Star, Loader2, MapPin, Trophy, Plus, X, Map as MapIcon, List, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AddressAutocomplete, type AddressResult } from "@/components/ui/AddressAutocomplete";

const ReviewsMap = dynamic(
    () => import("@/components/reviews/ReviewsMap").then((m) => m.ReviewsMap),
    { ssr: false, loading: () => <div className="h-[60vh] bg-slate-900/50 rounded-xl flex items-center justify-center"><Loader2 className="w-6 h-6 text-sky-400 animate-spin" /></div> }
);

const FACILITY_TYPE_TABS = [
    { key: "", label: "All" },
    { key: "shipper", label: "Shippers" },
    { key: "warehouse", label: "Warehouses" },
    { key: "mechanic", label: "Mechanics" },
    { key: "truck_stop", label: "Truck Stops" },
    { key: "broker", label: "Brokers" },
    { key: "rest_area", label: "Rest Areas" },
];

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export default function ReviewsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
            </div>
        }>
            <ReviewsContent />
        </Suspense>
    );
}

function ReviewsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [facilities, setFacilities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeType, setActiveType] = useState(searchParams.get("type") || "");
    const [mode, setMode] = useState<"nearby" | "top">(
        searchParams.get("mode") === "top" ? "top" : "nearby"
    );
    const [viewMode, setViewMode] = useState<"list" | "map">("list");
    const [hasSearched, setHasSearched] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [addForm, setAddForm] = useState({
        name: "", facility_type: "shipper", address: "", city: "", state: "", zip_code: ""
    });
    const [addLoading, setAddLoading] = useState(false);
    const [addGps, setAddGps] = useState<{ lat: number; lng: number } | null>(null);
    const [gpsLocationLabel, setGpsLocationLabel] = useState("");
    const [duplicateConflict, setDuplicateConflict] = useState<any>(null);
    const [locationMode, setLocationMode] = useState<"gps" | "address">("gps");
    const [geocodedCoords, setGeocodedCoords] = useState<{ lat: number; lng: number } | null>(null);

    const fetchFacilities = useCallback(async () => {
        setLoading(true);
        try {
            if (mode === "top") {
                const params: any = { limit: 30 };
                if (activeType) params.type = activeType;
                const data = await api.reviews.getTopRated(params);
                setFacilities(data.facilities || []);
            } else {
                // Try nearby with geolocation
                let lat: number | undefined;
                let lng: number | undefined;
                try {
                    const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
                    );
                    lat = pos.coords.latitude;
                    lng = pos.coords.longitude;
                } catch {
                    // No location, fall back to search
                }

                if (lat && lng) {
                    const params: any = { lat, lng, radius: 50, limit: 30 };
                    if (activeType) params.type = activeType;
                    const data = await api.reviews.getNearby(params);
                    setFacilities(data.facilities || []);
                } else {
                    // No location available, show top rated instead
                    const params: any = { limit: 30 };
                    if (activeType) params.type = activeType;
                    const data = await api.reviews.getTopRated(params);
                    setFacilities(data.facilities || []);
                }
            }
        } catch (err) {
            console.error("Failed to load facilities:", err);
        } finally {
            setLoading(false);
        }
    }, [activeType, mode]);

    useEffect(() => {
        fetchFacilities();
    }, [fetchFacilities]);

    // Sync to URL
    useEffect(() => {
        const params = new URLSearchParams();
        if (activeType) params.set("type", activeType);
        if (mode !== "nearby") params.set("mode", mode);
        const qs = params.toString();
        router.replace(`/reviews${qs ? `?${qs}` : ""}`, { scroll: false });
    }, [activeType, mode, router]);

    const handleSearchSelect = (facility: any) => {
        setHasSearched(true);
        router.push(`/reviews/${facility.id}`);
    };

    // Auto-populate GPS when add form opens
    const handleOpenAddForm = () => {
        setShowAddForm(true);
        setDuplicateConflict(null);
        setLocationMode("gps");
        setGeocodedCoords(null);

        // Get GPS and reverse geocode
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setAddGps({ lat, lng });

                // Reverse geocode via Mapbox
                if (MAPBOX_TOKEN) {
                    try {
                        const resp = await fetch(
                            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=place,region,address&limit=1`
                        );
                        const data = await resp.json();
                        const feature = data.features?.[0];
                        if (feature) {
                            const context = feature.context || [];
                            const city = context.find((c: any) => c.id.startsWith("place"))?.text
                                || feature.text || "";
                            const state = context.find((c: any) => c.id.startsWith("region"))?.short_code?.replace("US-", "")
                                || context.find((c: any) => c.id.startsWith("region"))?.text || "";
                            const address = feature.place_name?.split(",")[0] || "";

                            setAddForm((prev) => ({
                                ...prev,
                                city: prev.city || city,
                                state: prev.state || state,
                                address: prev.address || address,
                            }));
                            setGpsLocationLabel(`${city}${state ? `, ${state}` : ""}`);
                        }
                    } catch {
                        // Reverse geocode failed silently
                    }
                }
            },
            () => {
                // GPS unavailable
                setAddGps(null);
                setGpsLocationLabel("");
            },
            { timeout: 5000 }
        );
    };

    const handleAddFacility = async () => {
        if (!addForm.name.trim()) return;
        setAddLoading(true);
        setDuplicateConflict(null);
        try {
            // Determine coordinates based on location mode
            let facilityLat: number | undefined;
            let facilityLng: number | undefined;
            let reviewerLat: number | undefined;
            let reviewerLng: number | undefined;

            if (locationMode === "gps" && addGps) {
                // Driver is at the facility — GPS = facility location
                facilityLat = addGps.lat;
                facilityLng = addGps.lng;
                reviewerLat = addGps.lat;
                reviewerLng = addGps.lng;
            } else if (locationMode === "address" && geocodedCoords) {
                // Driver is NOT at the facility — use coords from address autocomplete
                facilityLat = geocodedCoords.lat;
                facilityLng = geocodedCoords.lng;
                // Still send driver GPS as reviewer location (separate from facility)
                if (addGps) {
                    reviewerLat = addGps.lat;
                    reviewerLng = addGps.lng;
                }
            }

            const result = await api.reviews.addFacility({
                name: addForm.name,
                facility_type: addForm.facility_type,
                address: addForm.address || undefined,
                city: addForm.city || undefined,
                state: addForm.state || undefined,
                zip_code: addForm.zip_code || undefined,
                latitude: facilityLat,
                longitude: facilityLng,
                reviewer_latitude: reviewerLat,
                reviewer_longitude: reviewerLng,
            });
            setShowAddForm(false);
            setAddForm({ name: "", facility_type: "shipper", address: "", city: "", state: "", zip_code: "" });
            setAddGps(null);
            setGpsLocationLabel("");
            setGeocodedCoords(null);
            setLocationMode("gps");
            router.push(`/reviews/${result.id}`);
        } catch (err: any) {
            // Handle duplicate conflict
            if (err?.status === 409 && err?.data?.detail?.existing_facility) {
                setDuplicateConflict(err.data.detail.existing_facility);
            } else {
                alert(err?.message || err?.data?.detail?.message || "Failed to add facility");
            }
        } finally {
            setAddLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Star className="w-6 h-6 text-amber-400" />
                            Facility Reviews
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            Rate and review places you've been to
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {api.isLoggedIn && (
                            <Link
                                href="/reviews/mine"
                                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm text-slate-300 hover:text-white bg-slate-800/50 border border-slate-700/50 rounded-lg transition-colors"
                            >
                                My Reviews
                            </Link>
                        )}
                    </div>
                </div>

                {/* Search */}
                <FacilitySearch
                    onSelect={handleSearchSelect}
                    onSearch={() => setHasSearched(true)}
                    facilityType={activeType || undefined}
                    className="mb-4"
                />

                {/* Add facility button — only show after user has searched */}
                {hasSearched && (
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={handleOpenAddForm}
                            className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Not found? Add it manually
                        </button>
                    </div>
                )}

                {/* Add Facility Form */}
                {showAddForm && (
                    <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-white">Add a Facility</h3>
                            <button onClick={() => { setShowAddForm(false); setDuplicateConflict(null); }} className="text-slate-400 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Location mode toggle */}
                        <div className="flex items-center gap-2 mb-3">
                            <button
                                onClick={() => { setLocationMode("gps"); setGeocodedCoords(null); }}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors",
                                    locationMode === "gps"
                                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                        : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white"
                                )}
                            >
                                <Navigation className="w-3 h-3" />
                                I'm here now
                            </button>
                            <button
                                onClick={() => setLocationMode("address")}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors",
                                    locationMode === "address"
                                        ? "bg-sky-500/10 border-sky-500/30 text-sky-400"
                                        : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white"
                                )}
                            >
                                <MapPin className="w-3 h-3" />
                                Enter address
                            </button>
                        </div>

                        {/* GPS status */}
                        {locationMode === "gps" && (
                            addGps ? (
                                <div className="flex items-center gap-1.5 text-xs text-emerald-400 mb-3">
                                    <Navigation className="w-3 h-3" />
                                    Using your location{gpsLocationLabel ? `: ${gpsLocationLabel}` : ""}
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 text-xs text-amber-400 mb-3">
                                    <MapPin className="w-3 h-3" />
                                    Enable GPS for accurate map placement
                                </div>
                            )
                        )}

                        {/* Facility name + type (always shown) */}
                        <div className="grid gap-3 sm:grid-cols-2 mb-3">
                            <input
                                type="text"
                                placeholder="Facility name *"
                                value={addForm.name}
                                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                                className="col-span-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                            />
                            <select
                                value={addForm.facility_type}
                                onChange={(e) => setAddForm({ ...addForm, facility_type: e.target.value })}
                                className="col-span-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500/50"
                            >
                                <option value="shipper">Shipper</option>
                                <option value="receiver">Receiver</option>
                                <option value="warehouse">Warehouse</option>
                                <option value="mechanic">Mechanic</option>
                                <option value="truck_stop">Truck Stop</option>
                                <option value="rest_area">Rest Area</option>
                                <option value="broker">Broker</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Address mode: autocomplete search */}
                        {locationMode === "address" && (
                            <div className="mb-3">
                                <AddressAutocomplete
                                    placeholder="Search for an address..."
                                    proximity={addGps || undefined}
                                    onSelect={(result: AddressResult) => {
                                        setAddForm((prev) => ({
                                            ...prev,
                                            address: result.address,
                                            city: result.city,
                                            state: result.state,
                                            zip_code: result.zip_code,
                                        }));
                                        setGeocodedCoords({ lat: result.latitude, lng: result.longitude });
                                    }}
                                />

                                {/* Show parsed address fields after selection */}
                                {geocodedCoords && (
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <div className="text-xs text-slate-400">
                                            <span className="text-slate-600">Address:</span> <span className="text-slate-300">{addForm.address || "—"}</span>
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            <span className="text-slate-600">City:</span> <span className="text-slate-300">{addForm.city || "—"}</span>
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            <span className="text-slate-600">State:</span> <span className="text-slate-300">{addForm.state || "—"}</span>
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            <span className="text-slate-600">Zip:</span> <span className="text-slate-300">{addForm.zip_code || "—"}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* GPS mode: show editable address fields */}
                        {locationMode === "gps" && (
                            <div className="grid gap-3 sm:grid-cols-2">
                                <input
                                    type="text"
                                    placeholder="Address"
                                    value={addForm.address}
                                    onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                                    className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                                />
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={addForm.city}
                                    onChange={(e) => setAddForm({ ...addForm, city: e.target.value })}
                                    className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                                />
                                <input
                                    type="text"
                                    placeholder="State"
                                    value={addForm.state}
                                    onChange={(e) => setAddForm({ ...addForm, state: e.target.value })}
                                    className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                                />
                                <input
                                    type="text"
                                    placeholder="Zip Code"
                                    value={addForm.zip_code}
                                    onChange={(e) => setAddForm({ ...addForm, zip_code: e.target.value })}
                                    className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                                />
                            </div>
                        )}

                        {/* Duplicate conflict */}
                        {duplicateConflict && (
                            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                <p className="text-xs text-amber-400 font-medium mb-2">A similar facility exists nearby:</p>
                                <button
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setDuplicateConflict(null);
                                        router.push(`/reviews/${duplicateConflict.id}`);
                                    }}
                                    className="w-full text-left p-2 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
                                >
                                    <p className="text-sm text-white font-medium">{duplicateConflict.name}</p>
                                    <p className="text-xs text-slate-400">
                                        {[duplicateConflict.address, duplicateConflict.city, duplicateConflict.state].filter(Boolean).join(", ")}
                                    </p>
                                    {duplicateConflict.total_reviews > 0 && (
                                        <p className="text-xs text-amber-400 mt-0.5">
                                            {duplicateConflict.avg_overall_rating} stars · {duplicateConflict.total_reviews} reviews
                                        </p>
                                    )}
                                </button>
                                <p className="text-[10px] text-slate-500 mt-2">Tap to view this facility, or change the name to add a different one.</p>
                            </div>
                        )}

                        <button
                            onClick={handleAddFacility}
                            disabled={
                                !addForm.name.trim() || addLoading ||
                                (locationMode === "gps" && !addGps) ||
                                (locationMode === "address" && !geocodedCoords)
                            }
                            className="mt-3 w-full py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Add Facility
                        </button>
                    </div>
                )}

                {/* Type filter tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                    {FACILITY_TYPE_TABS.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setActiveType(key)}
                            className={cn(
                                "px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all",
                                activeType === key
                                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                                    : "bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white hover:border-slate-600"
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Mode toggle + View toggle */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMode("nearby")}
                            className={cn(
                                "flex items-center gap-1.5 text-sm transition-colors",
                                mode === "nearby" ? "text-white font-medium" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <MapPin className="w-4 h-4" />
                            Near You
                        </button>
                        <span className="text-slate-700">·</span>
                        <button
                            onClick={() => setMode("top")}
                            className={cn(
                                "flex items-center gap-1.5 text-sm transition-colors",
                                mode === "top" ? "text-white font-medium" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <Trophy className="w-4 h-4" />
                            Top Rated
                        </button>
                    </div>

                    {/* Map / List toggle */}
                    <div className="flex items-center bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn(
                                "flex items-center gap-1 px-2.5 py-1.5 text-xs transition-colors",
                                viewMode === "list" ? "bg-sky-500/20 text-sky-400" : "text-slate-400 hover:text-white"
                            )}
                        >
                            <List className="w-3.5 h-3.5" />
                            List
                        </button>
                        <button
                            onClick={() => setViewMode("map")}
                            className={cn(
                                "flex items-center gap-1 px-2.5 py-1.5 text-xs transition-colors",
                                viewMode === "map" ? "bg-sky-500/20 text-sky-400" : "text-slate-400 hover:text-white"
                            )}
                        >
                            <MapIcon className="w-3.5 h-3.5" />
                            Map
                        </button>
                    </div>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 animate-pulse">
                                <div className="h-4 bg-slate-800 rounded w-2/3 mb-2" />
                                <div className="h-3 bg-slate-800 rounded w-1/3 mb-2" />
                                <div className="h-3 bg-slate-800 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : facilities.length === 0 ? (
                    <div className="text-center py-16">
                        <Star className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 text-lg">No facilities found</p>
                        <p className="text-slate-500 text-sm mt-1">
                            Try searching by name or adjusting your filters
                        </p>
                    </div>
                ) : viewMode === "map" ? (
                    <ReviewsMap
                        facilities={facilities}
                        onSelect={(facility) => router.push(`/reviews/${facility.id}`)}
                    />
                ) : (
                    <div className="space-y-3">
                        {facilities.map((facility) => (
                            <FacilityCard key={facility.id} facility={facility} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
