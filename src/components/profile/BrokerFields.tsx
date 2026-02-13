"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { RoleDetails, FMCSACarrier } from "@/types/profile";
import { CompanySearch } from "@/components/profile/CompanySearch";
import { cn } from "@/lib/utils";
import {
    Handshake,
    Shield,
    CheckCircle2,
    Loader2,
    MapPin,
    Truck,
    Users,
    Package,
    BarChart3,
} from "lucide-react";

const FREIGHT_SPECIALTIES = [
    { value: 'dry', label: 'Dry' },
    { value: 'reefer', label: 'Reefer' },
    { value: 'flatbed', label: 'Flatbed' },
    { value: 'hazmat', label: 'Hazmat' },
    { value: 'oversize', label: 'Oversize' },
    { value: 'intermodal', label: 'Intermodal' },
    { value: 'ltl', label: 'LTL' },
    { value: 'expedited', label: 'Expedited' },
];

const VOLUMES = [
    { value: '1-10_week', label: '1-10 loads/week' },
    { value: '11-50_week', label: '11-50 loads/week' },
    { value: '51-100_week', label: '51-100 loads/week' },
    { value: '100+_week', label: '100+ loads/week' },
];

interface BrokerFieldsProps {
    roleDetails: RoleDetails;
    onUpdate: (updates: Partial<RoleDetails>) => void;
}

export function BrokerFields({ roleDetails, onUpdate }: BrokerFieldsProps) {
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

    const toggleFreight = (value: string) => {
        const current = roleDetails.freight_specialties || [];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        onUpdate({ freight_specialties: updated });
    };

    return (
        <div className="space-y-5">
            {/* FMCSA Verification */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 space-y-4">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Broker Authority Verification
                </h3>
                <p className="text-xs text-slate-500">
                    Verify your MC number through FMCSA to earn the "FMCSA Verified" badge.
                </p>

                {roleDetails.fmcsa_verified && roleDetails.fmcsa_data ? (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-bold text-emerald-400">FMCSA Verified</span>
                        </div>
                        <p className="text-sm text-white font-medium">{roleDetails.fmcsa_data.legal_name}</p>
                        {roleDetails.fmcsa_data.dba_name && (
                            <p className="text-xs text-slate-400">DBA: {roleDetails.fmcsa_data.dba_name}</p>
                        )}
                        <div className="flex flex-wrap gap-3">
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
                        {verifyError && <p className="text-xs text-rose-400">{verifyError}</p>}
                    </div>
                )}
            </div>

            {/* Company Info */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 space-y-4">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Handshake className="w-4 h-4" />
                    Brokerage Details
                </h3>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Company Name</label>
                    <input
                        type="text"
                        value={roleDetails.broker_company || ''}
                        onChange={(e) => onUpdate({ broker_company: e.target.value })}
                        placeholder="Your brokerage name"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5" />
                        Weekly Volume
                    </label>
                    <select
                        value={roleDetails.volume || ''}
                        onChange={(e) => onUpdate({ volume: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all appearance-none"
                    >
                        <option value="">Select volume</option>
                        {VOLUMES.map((v) => (
                            <option key={v.value} value={v.value}>{v.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Freight Specialties */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 space-y-4">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Freight Specialties
                </h3>
                <div className="flex flex-wrap gap-2">
                    {FREIGHT_SPECIALTIES.map((s) => {
                        const isSelected = (roleDetails.freight_specialties || []).includes(s.value);
                        return (
                            <button
                                key={s.value}
                                type="button"
                                onClick={() => toggleFreight(s.value)}
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
        </div>
    );
}
