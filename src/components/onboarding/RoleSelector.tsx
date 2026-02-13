"use client";

import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface RoleSelectorProps {
    onSelect: (role: string) => void;
    selectedRole: string | null;
}

const DRIVER_ROLES = [
    { id: "company_driver", label: "Company Driver", emoji: "🚛" },
    { id: "owner_operator", label: "Owner Operator", emoji: "👑" },
    { id: "team_driver", label: "Team Driver", emoji: "👥" },
    { id: "lease_operator", label: "Lease Operator", emoji: "📋" },
    { id: "student_driver", label: "Student Driver", emoji: "🎓" },
];

const INDUSTRY_ROLES = [
    { id: "dispatcher", label: "Dispatcher", emoji: "📡" },
    { id: "freight_broker", label: "Freight Broker", emoji: "🤝" },
    { id: "mechanic", label: "Mechanic", emoji: "🔧" },
    { id: "fleet_manager", label: "Fleet Manager", emoji: "📊" },
    { id: "lumper", label: "Lumper", emoji: "📦" },
    { id: "warehouse", label: "Warehouse", emoji: "🏭" },
    { id: "shipper", label: "Shipper", emoji: "🚢" },
    { id: "other", label: "Other", emoji: "💼" },
];

export function RoleSelector({ onSelect, selectedRole }: RoleSelectorProps) {
    return (
        <div className="space-y-6">
            {/* Drivers Section */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                    Drivers
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {DRIVER_ROLES.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => onSelect(role.id)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left",
                                selectedRole === role.id
                                    ? "bg-sky-500/10 border-sky-500/50 text-white shadow-lg shadow-sky-500/10"
                                    : "bg-slate-900 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-600"
                            )}
                        >
                            <span className="text-xl flex-shrink-0">{role.emoji}</span>
                            <span className="text-sm font-medium leading-tight">{role.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Industry Section */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                    Industry
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {INDUSTRY_ROLES.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => onSelect(role.id)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left",
                                selectedRole === role.id
                                    ? "bg-sky-500/10 border-sky-500/50 text-white shadow-lg shadow-sky-500/10"
                                    : "bg-slate-900 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-600"
                            )}
                        >
                            <span className="text-xl flex-shrink-0">{role.emoji}</span>
                            <span className="text-sm font-medium leading-tight">{role.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Continue Button */}
            <div className={cn(
                "overflow-hidden transition-all duration-500 ease-in-out",
                selectedRole ? "max-h-20 opacity-100 translate-y-0" : "max-h-0 opacity-0 translate-y-4"
            )}>
                <button
                    onClick={() => {/* Navigation handled by parent via onSelect */}}
                    className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white py-3 rounded-xl font-semibold shadow-lg shadow-sky-500/25 transition-all"
                    style={{ display: 'none' }}
                >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
