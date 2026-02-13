"use client";

import { Factory, Package, Wrench, Fuel, ParkingCircle, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

interface FacilityTypeSelectorProps {
    value: string | null;
    onChange: (type: string) => void;
    autoDetected?: string | null;
    className?: string;
}

const FACILITY_TYPES = [
    { key: "shipper", label: "Shipper", icon: Factory },
    { key: "warehouse", label: "Warehouse", icon: Package },
    { key: "mechanic", label: "Mechanic", icon: Wrench },
    { key: "truck_stop", label: "Truck Stop", icon: Fuel },
    { key: "rest_area", label: "Rest Area", icon: ParkingCircle },
    { key: "broker", label: "Broker", icon: ClipboardList },
];

export function FacilityTypeSelector({ value, onChange, autoDetected, className }: FacilityTypeSelectorProps) {
    return (
        <div className={className}>
            <p className="text-sm font-medium text-slate-300 mb-2">What is this place?</p>
            <div className="grid grid-cols-3 gap-2">
                {FACILITY_TYPES.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => onChange(key)}
                        className={cn(
                            "flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all min-h-[56px]",
                            value === key
                                ? "bg-sky-500/20 border-sky-500/50 text-sky-400"
                                : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                        )}
                    >
                        <Icon className="w-5 h-5" />
                        <span>{label}</span>
                        {autoDetected === key && value !== key && (
                            <span className="text-[9px] text-slate-500">auto-detected</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

export { FACILITY_TYPES };
