"use client";

import { RoleDetails } from "@/types/profile";
import { cn } from "@/lib/utils";
import { Radio, Users, MapPin } from "lucide-react";

const FLEET_SIZES = [
    { value: '1-5', label: '1-5 trucks' },
    { value: '6-20', label: '6-20 trucks' },
    { value: '21-50', label: '21-50 trucks' },
    { value: '51-100', label: '51-100 trucks' },
    { value: '100+', label: '100+ trucks' },
];

const LANES = [
    { value: 'northeast', label: 'Northeast' },
    { value: 'southeast', label: 'Southeast' },
    { value: 'midwest', label: 'Midwest' },
    { value: 'southwest', label: 'Southwest' },
    { value: 'west_coast', label: 'West Coast' },
    { value: 'northwest', label: 'Northwest' },
    { value: 'otr_national', label: 'OTR / National' },
];

interface DispatcherFieldsProps {
    roleDetails: RoleDetails;
    onUpdate: (updates: Partial<RoleDetails>) => void;
}

export function DispatcherFields({ roleDetails, onUpdate }: DispatcherFieldsProps) {
    const toggleLane = (lane: string) => {
        const current = roleDetails.lanes_served || [];
        const updated = current.includes(lane)
            ? current.filter(l => l !== lane)
            : [...current, lane];
        onUpdate({ lanes_served: updated });
    };

    return (
        <div className="space-y-5">
            {/* Company Info */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 space-y-4">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Radio className="w-4 h-4" />
                    Dispatch Company
                </h3>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Company Name</label>
                    <input
                        type="text"
                        value={roleDetails.dispatcher_company || ''}
                        onChange={(e) => onUpdate({ dispatcher_company: e.target.value })}
                        placeholder="Your dispatch company"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        Fleet Size
                    </label>
                    <select
                        value={roleDetails.fleet_size || ''}
                        onChange={(e) => onUpdate({ fleet_size: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all appearance-none"
                    >
                        <option value="">Select fleet size</option>
                        {FLEET_SIZES.map((f) => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                    </select>
                </div>

                {/* Hiring Drivers Toggle */}
                <div className="flex items-center justify-between py-2">
                    <div>
                        <p className="text-sm font-medium text-slate-200">Hiring Drivers</p>
                        <p className="text-xs text-slate-500">Currently looking for drivers to dispatch</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => onUpdate({ hiring_drivers: !roleDetails.hiring_drivers })}
                        className={cn(
                            "relative w-11 h-6 rounded-full transition-colors",
                            roleDetails.hiring_drivers ? "bg-emerald-500" : "bg-slate-700"
                        )}
                    >
                        <span className={cn(
                            "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                            roleDetails.hiring_drivers && "translate-x-5"
                        )} />
                    </button>
                </div>
            </div>

            {/* Lanes Served */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 space-y-4">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Lanes Served
                </h3>
                <div className="flex flex-wrap gap-2">
                    {LANES.map((lane) => {
                        const isSelected = (roleDetails.lanes_served || []).includes(lane.value);
                        return (
                            <button
                                key={lane.value}
                                type="button"
                                onClick={() => toggleLane(lane.value)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                                    isSelected
                                        ? "bg-sky-500/20 border-sky-500/30 text-sky-400"
                                        : "bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-300 hover:border-slate-600"
                                )}
                            >
                                {lane.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
