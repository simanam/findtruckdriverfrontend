"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { RoleDetails, FMCSACarrier } from "@/types/profile";
import { CompanySearch } from "@/components/profile/CompanySearch";
import { cn } from "@/lib/utils";
import {
    Shield,
    CheckCircle2,
    Truck,
    Loader2,
    Building2,
    MapPin,
    Users,
} from "lucide-react";

const TRAILER_TYPES = [
    { value: 'dry_van', label: 'Dry Van' },
    { value: 'flatbed', label: 'Flatbed' },
    { value: 'reefer', label: 'Reefer' },
    { value: 'tanker', label: 'Tanker' },
    { value: 'lowboy', label: 'Lowboy' },
    { value: 'step_deck', label: 'Step Deck' },
    { value: 'car_hauler', label: 'Car Hauler' },
    { value: 'dump', label: 'Dump Trailer' },
    { value: 'other', label: 'Other' },
];

interface OwnerOperatorFieldsProps {
    roleDetails: RoleDetails;
    onUpdate: (updates: Partial<RoleDetails>) => void;
}

export function OwnerOperatorFields({ roleDetails, onUpdate }: OwnerOperatorFieldsProps) {
    const [verifying, setVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState("");

    const handleFMCSASelect = async (carrier: FMCSACarrier) => {
        setVerifying(true);
        setVerifyError("");
        try {
            await api.integrations.confirmFMCSA(carrier as any);
            onUpdate({
                fmcsa_verified: true,
                fmcsa_data: carrier,
                fmcsa_verified_at: new Date().toISOString(),
            });
        } catch (e: any) {
            setVerifyError(e.message || "Verification failed");
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="space-y-5">
            {/* FMCSA Verification */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 space-y-4">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Authority Verification
                </h3>
                <p className="text-xs text-slate-500">
                    Verify your MC/DOT number through FMCSA to earn the "FMCSA Verified" badge.
                </p>

                {roleDetails.fmcsa_verified && roleDetails.fmcsa_data ? (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-bold text-emerald-400">FMCSA Verified</span>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-sm text-white font-medium">
                                {roleDetails.fmcsa_data.legal_name}
                            </p>
                            {roleDetails.fmcsa_data.dba_name && (
                                <p className="text-xs text-slate-400">DBA: {roleDetails.fmcsa_data.dba_name}</p>
                            )}
                            <div className="flex flex-wrap gap-3 mt-2">
                                {roleDetails.fmcsa_data.dot_number && (
                                    <span className="text-xs text-slate-400">DOT: {roleDetails.fmcsa_data.dot_number}</span>
                                )}
                                {roleDetails.fmcsa_data.mc_number && (
                                    <span className="text-xs text-slate-400">{roleDetails.fmcsa_data.mc_number}</span>
                                )}
                                {roleDetails.fmcsa_data.city && roleDetails.fmcsa_data.state && (
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {roleDetails.fmcsa_data.city}, {roleDetails.fmcsa_data.state}
                                    </span>
                                )}
                                {roleDetails.fmcsa_data.power_units && (
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                        <Truck className="w-3 h-3" />
                                        {roleDetails.fmcsa_data.power_units} units
                                    </span>
                                )}
                                {roleDetails.fmcsa_data.drivers && (
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        {roleDetails.fmcsa_data.drivers} drivers
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => onUpdate({ fmcsa_verified: false, fmcsa_data: undefined, fmcsa_verified_at: undefined })}
                            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            Verify different authority
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <CompanySearch onSelect={handleFMCSASelect} />
                        {verifying && (
                            <div className="flex items-center gap-2 text-xs text-sky-400">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Verifying with FMCSA...
                            </div>
                        )}
                        {verifyError && (
                            <p className="text-xs text-rose-400">{verifyError}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Truck Info */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 space-y-4">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Truck Information
                </h3>

                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Year</label>
                        <input
                            type="text"
                            value={roleDetails.truck_year || ''}
                            onChange={(e) => onUpdate({ truck_year: e.target.value })}
                            placeholder="2024"
                            maxLength={4}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Make</label>
                        <input
                            type="text"
                            value={roleDetails.truck_make || ''}
                            onChange={(e) => onUpdate({ truck_make: e.target.value })}
                            placeholder="Peterbilt"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Model</label>
                        <input
                            type="text"
                            value={roleDetails.truck_model || ''}
                            onChange={(e) => onUpdate({ truck_model: e.target.value })}
                            placeholder="579"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Trailer Type</label>
                    <select
                        value={roleDetails.trailer_type || ''}
                        onChange={(e) => onUpdate({ trailer_type: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all appearance-none"
                    >
                        <option value="">Select trailer type</option>
                        {TRAILER_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
