"use client";

import Link from "next/link";
import { EQUIPMENT_LABELS, REGION_LABELS } from "./JobCard";

const CDL_LABELS: Record<string, string> = {
    A: "CDL-A",
    B: "CDL-B",
    C: "CDL-C",
};

const ROLE_LABELS: Record<string, string> = {
    company_driver: "Company Driver",
    owner_operator: "Owner Operator",
    team_driver: "Team Driver",
    lease_operator: "Lease Operator",
    student_driver: "Student Driver",
    dispatcher: "Dispatcher",
    freight_broker: "Freight Broker",
    mechanic: "Mechanic",
    fleet_manager: "Fleet Manager",
    lumper: "Lumper",
    warehouse: "Warehouse",
    shipper: "Shipper",
    other: "Other",
};

interface SeekerCardProps {
    seeker: {
        driver_id: string;
        handle: string;
        cb_handle?: string;
        role?: string;
        avatar_id?: string;
        cdl_class?: string;
        endorsements?: string[];
        equipment_type?: string;
        years_experience?: number;
        preferred_haul?: string[];
        haul_type?: string;
    };
}

export function SeekerCard({ seeker }: SeekerCardProps) {
    const avatarUrl = seeker.avatar_id
        ? `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${seeker.avatar_id}`
        : `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${seeker.handle}`;

    return (
        <Link href={`/trucker/${seeker.driver_id}`}>
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 hover:border-slate-700 transition-all duration-300 hover:shadow-lg cursor-pointer">
                <div className="flex items-start gap-4">
                    {/* Avatar with green ring */}
                    <div className="shrink-0">
                        <div className="w-14 h-14 rounded-full ring-[3px] ring-emerald-500 p-[2px]">
                            <img
                                src={avatarUrl}
                                alt={seeker.handle}
                                className="w-full h-full rounded-full bg-slate-800"
                            />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-base truncate">
                            {seeker.cb_handle || seeker.handle}
                        </h3>
                        <p className="text-slate-400 text-sm">
                            {ROLE_LABELS[seeker.role || ""] || seeker.role || "Driver"}
                            {seeker.cdl_class && ` | ${CDL_LABELS[seeker.cdl_class] || `CDL-${seeker.cdl_class}`}`}
                            {seeker.years_experience !== undefined && seeker.years_experience > 0 && (
                                <> | {seeker.years_experience} {seeker.years_experience === 1 ? "year" : "years"} exp</>
                            )}
                        </p>

                        {/* Equipment & Regions */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 flex-wrap">
                            {seeker.equipment_type && (
                                <span>{EQUIPMENT_LABELS[seeker.equipment_type] || seeker.equipment_type}</span>
                            )}
                            {seeker.haul_type && (
                                <>
                                    {seeker.equipment_type && <span>|</span>}
                                    <span className="capitalize">{seeker.haul_type.replace("_", " ")}</span>
                                </>
                            )}
                            {seeker.preferred_haul && seeker.preferred_haul.length > 0 && (
                                <>
                                    <span>|</span>
                                    <span>
                                        {seeker.preferred_haul.map(r => REGION_LABELS[r] || r).join(", ")}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Endorsements */}
                        {seeker.endorsements && seeker.endorsements.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {seeker.endorsements.map((end) => (
                                    <span
                                        key={end}
                                        className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    >
                                        {end}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
