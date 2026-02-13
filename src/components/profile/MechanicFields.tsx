"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { RoleDetails, GooglePlaceData } from "@/types/profile";
import { cn } from "@/lib/utils";
import {
    Wrench,
    Search,
    CheckCircle2,
    Loader2,
    MapPin,
    Star,
    Globe,
    Phone,
    Zap,
    Truck,
} from "lucide-react";

const MECHANIC_SPECIALTIES = [
    { value: 'engine', label: 'Engine' },
    { value: 'transmission', label: 'Transmission' },
    { value: 'brakes', label: 'Brakes' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'tires', label: 'Tires' },
    { value: 'reefer', label: 'Reefer Units' },
    { value: 'suspension', label: 'Suspension' },
    { value: 'exhaust', label: 'Exhaust/DPF' },
    { value: 'hvac', label: 'HVAC' },
    { value: 'hydraulics', label: 'Hydraulics' },
];

const CERTIFICATIONS = [
    { value: 'ase', label: 'ASE Certified' },
    { value: 'cummins', label: 'Cummins' },
    { value: 'detroit_diesel', label: 'Detroit Diesel' },
    { value: 'caterpillar', label: 'Caterpillar' },
    { value: 'paccar', label: 'PACCAR' },
    { value: 'allison', label: 'Allison' },
    { value: 'freightliner', label: 'Freightliner' },
    { value: 'volvo', label: 'Volvo' },
];

const SERVICE_AREAS = [
    { value: 25, label: '25 miles' },
    { value: 50, label: '50 miles' },
    { value: 100, label: '100 miles' },
    { value: 150, label: '150 miles' },
];

const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

interface MechanicFieldsProps {
    roleDetails: RoleDetails;
    onUpdate: (updates: Partial<RoleDetails>) => void;
}

export function MechanicFields({ roleDetails, onUpdate }: MechanicFieldsProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<GooglePlaceData[]>([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const toggleArrayItem = (arr: string[] | undefined, item: string): string[] => {
        const current = arr || [];
        return current.includes(item)
            ? current.filter(i => i !== item)
            : [...current, item];
    };

    const handleSearch = async () => {
        if (!searchQuery || searchQuery.length < 2) return;
        setSearching(true);
        setSearchError("");
        try {
            const location = [roleDetails.shop_city, roleDetails.shop_state].filter(Boolean).join(', ');
            const response = await api.integrations.searchGooglePlaces(searchQuery, location || undefined);
            setSearchResults(response.results || []);
        } catch (e: any) {
            if (e.status === 503) {
                setSearchError("Google Places API not configured");
            } else {
                setSearchError(e.message || "Search failed");
            }
        } finally {
            setSearching(false);
        }
    };

    const handlePlaceSelect = async (place: GooglePlaceData) => {
        setVerifying(true);
        try {
            await api.integrations.confirmGooglePlace(place as any);
            onUpdate({
                google_verified: true,
                google_data: place,
                google_verified_at: new Date().toISOString(),
                shop_name: place.name || roleDetails.shop_name,
                shop_city: place.city || roleDetails.shop_city,
                shop_state: place.state || roleDetails.shop_state,
            });
            setShowSearch(false);
            setSearchResults([]);
            setSearchQuery("");
        } catch (e: any) {
            setSearchError(e.message || "Verification failed");
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="space-y-5">
            {/* Shop Info + Google Verification */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 space-y-4">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Wrench className="w-4 h-4" />
                    Shop Information
                </h3>

                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Shop Name</label>
                        <input
                            type="text"
                            value={roleDetails.shop_name || ''}
                            onChange={(e) => onUpdate({ shop_name: e.target.value })}
                            placeholder="Your shop name"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">City</label>
                            <input
                                type="text"
                                value={roleDetails.shop_city || ''}
                                onChange={(e) => onUpdate({ shop_city: e.target.value })}
                                placeholder="City"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">State</label>
                            <select
                                value={roleDetails.shop_state || ''}
                                onChange={(e) => onUpdate({ shop_state: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all appearance-none"
                            >
                                <option value="">Select</option>
                                {US_STATES.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Google Verification */}
                {roleDetails.google_verified && roleDetails.google_data ? (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-bold text-emerald-400">Google Verified</span>
                        </div>
                        <p className="text-sm text-white font-medium">{roleDetails.google_data.name}</p>
                        {roleDetails.google_data.address && (
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {roleDetails.google_data.address}
                            </p>
                        )}
                        <div className="flex flex-wrap gap-3">
                            {roleDetails.google_data.rating && (
                                <span className="text-xs text-amber-400 flex items-center gap-1">
                                    <Star className="w-3 h-3" /> {roleDetails.google_data.rating} ({roleDetails.google_data.review_count} reviews)
                                </span>
                            )}
                            {roleDetails.google_data.phone && (
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> {roleDetails.google_data.phone}
                                </span>
                            )}
                            {roleDetails.google_data.website && (
                                <span className="text-xs text-sky-400 flex items-center gap-1">
                                    <Globe className="w-3 h-3" /> Website
                                </span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => onUpdate({ google_verified: false, google_data: undefined, google_verified_at: undefined })}
                            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            Verify different business
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <button
                            type="button"
                            onClick={() => setShowSearch(!showSearch)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                                showSearch
                                    ? "bg-sky-500/10 border-sky-500/30 text-sky-400"
                                    : "bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500"
                            )}
                        >
                            <Search className="w-3.5 h-3.5" />
                            Find on Google Places
                        </button>

                        {showSearch && (
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        placeholder="Search shop name..."
                                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSearch}
                                        disabled={searching || searchQuery.length < 2}
                                        className="px-3 py-2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg text-sm font-medium text-white transition-all"
                                    >
                                        {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                    </button>
                                </div>

                                {searchError && <p className="text-xs text-amber-400">{searchError}</p>}

                                {searchResults.length > 0 && (
                                    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                                        {searchResults.map((place, idx) => (
                                            <button
                                                key={place.place_id || idx}
                                                type="button"
                                                onClick={() => handlePlaceSelect(place)}
                                                disabled={verifying}
                                                className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-b-0"
                                            >
                                                <p className="text-sm font-medium text-white">{place.name}</p>
                                                {place.address && (
                                                    <p className="text-xs text-slate-400 mt-0.5">{place.address}</p>
                                                )}
                                                <div className="flex gap-3 mt-1">
                                                    {place.rating && (
                                                        <span className="text-xs text-amber-400 flex items-center gap-1">
                                                            <Star className="w-3 h-3" /> {place.rating}
                                                        </span>
                                                    )}
                                                    {place.phone && (
                                                        <span className="text-xs text-slate-500">{place.phone}</span>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Service Options */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 space-y-4">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Service Options
                </h3>

                {/* Mobile Service Toggle */}
                <div className="flex items-center justify-between py-2">
                    <div>
                        <p className="text-sm font-medium text-slate-200">Mobile Service</p>
                        <p className="text-xs text-slate-500">I offer on-site / roadside service</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => onUpdate({ mobile_service: !roleDetails.mobile_service })}
                        className={cn(
                            "relative w-11 h-6 rounded-full transition-colors",
                            roleDetails.mobile_service ? "bg-sky-500" : "bg-slate-700"
                        )}
                    >
                        <span className={cn(
                            "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                            roleDetails.mobile_service && "translate-x-5"
                        )} />
                    </button>
                </div>

                {/* Emergency / Roadside Toggle */}
                <div className="flex items-center justify-between py-2">
                    <div>
                        <p className="text-sm font-medium text-slate-200 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            Emergency / Roadside Available
                        </p>
                        <p className="text-xs text-slate-500">Available for emergency calls</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => onUpdate({ emergency_available: !roleDetails.emergency_available })}
                        className={cn(
                            "relative w-11 h-6 rounded-full transition-colors",
                            roleDetails.emergency_available ? "bg-amber-500" : "bg-slate-700"
                        )}
                    >
                        <span className={cn(
                            "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                            roleDetails.emergency_available && "translate-x-5"
                        )} />
                    </button>
                </div>

                {/* Service Area */}
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Service Area Radius</label>
                    <select
                        value={roleDetails.service_area_miles || ''}
                        onChange={(e) => onUpdate({ service_area_miles: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all appearance-none"
                    >
                        <option value="">Select radius</option>
                        {SERVICE_AREAS.map((a) => (
                            <option key={a.value} value={a.value}>{a.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Specialties */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 space-y-4">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                    Specialties
                </h3>
                <div className="flex flex-wrap gap-2">
                    {MECHANIC_SPECIALTIES.map((s) => {
                        const isSelected = (roleDetails.mechanic_specialties || []).includes(s.value);
                        return (
                            <button
                                key={s.value}
                                type="button"
                                onClick={() => onUpdate({ mechanic_specialties: toggleArrayItem(roleDetails.mechanic_specialties, s.value) })}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                                    isSelected
                                        ? "bg-sky-500/20 border-sky-500/30 text-sky-400"
                                        : "bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-300 hover:border-slate-600"
                                )}
                            >
                                {s.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Certifications */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 space-y-4">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                    Certifications
                </h3>
                <div className="flex flex-wrap gap-2">
                    {CERTIFICATIONS.map((c) => {
                        const isSelected = (roleDetails.certifications || []).includes(c.value);
                        return (
                            <button
                                key={c.value}
                                type="button"
                                onClick={() => onUpdate({ certifications: toggleArrayItem(roleDetails.certifications, c.value) })}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                                    isSelected
                                        ? "bg-amber-500/20 border-amber-500/30 text-amber-400"
                                        : "bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-300 hover:border-slate-600"
                                )}
                            >
                                {c.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
