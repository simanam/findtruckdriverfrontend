"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { CheckCircle, Star } from "lucide-react";

const HAUL_LABELS: Record<string, string> = {
    otr: "OTR",
    regional: "Regional",
    local: "Local",
    dedicated: "Dedicated",
    team: "Team",
};

const EQUIPMENT_LABELS: Record<string, string> = {
    dry_van: "Dry Van",
    reefer: "Reefer",
    flatbed: "Flatbed",
    tanker: "Tanker",
    car_hauler: "Car Hauler",
    intermodal: "Intermodal",
    hazmat: "Hazmat",
    oversized: "Oversized",
    ltl: "LTL",
    other: "Other",
};

const REQUIREMENT_LABELS: Record<string, string> = {
    cdl_a: "CDL-A",
    cdl_b: "CDL-B",
    hazmat: "Hazmat",
    tanker: "Tanker",
    doubles_triples: "Doubles/Triples",
    twic: "TWIC",
    "1yr_exp": "1yr Exp",
    "2yr_exp": "2yr Exp",
    "5yr_exp": "5yr Exp",
    clean_record: "Clean Record",
    no_sap: "No SAP",
    team_willing: "Team Willing",
};

const REGION_LABELS: Record<string, string> = {
    northeast: "Northeast",
    southeast: "Southeast",
    midwest: "Midwest",
    southwest: "Southwest",
    west: "West",
    northwest: "Northwest",
    national: "National",
};

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

interface JobCardProps {
    job: {
        id: string;
        title: string;
        company_name: string;
        haul_type: string;
        equipment: string;
        pay_info?: string;
        requirements: string[];
        regions: string[];
        fmcsa_verified: boolean;
        created_at: string;
    };
    matchScore?: number;
    matchReasons?: string[];
}

export function JobCard({ job, matchScore, matchReasons }: JobCardProps) {
    return (
        <Link href={`/jobs/${job.id}`}>
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 hover:border-slate-700 transition-all duration-300 hover:shadow-lg cursor-pointer">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-white font-semibold text-base leading-tight">
                        {job.title}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                        {matchScore !== undefined && matchScore > 0 && (
                            <div className="flex items-center gap-1 text-amber-400">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                <span className="text-xs font-medium">{matchScore}</span>
                            </div>
                        )}
                        {job.fmcsa_verified && (
                            <div className="flex items-center gap-1 text-emerald-400">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-[10px] font-medium hidden sm:inline">FMCSA</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Company */}
                <p className="text-slate-400 text-sm mb-3">{job.company_name}</p>

                {/* Classification */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2 flex-wrap">
                    <span>{EQUIPMENT_LABELS[job.equipment] || job.equipment}</span>
                    <span>|</span>
                    <span>{HAUL_LABELS[job.haul_type] || job.haul_type}</span>
                    {job.regions.length > 0 && (
                        <>
                            <span>|</span>
                            <span>
                                {job.regions.map(r => REGION_LABELS[r] || r).join(", ")}
                            </span>
                        </>
                    )}
                </div>

                {/* Pay */}
                {job.pay_info && (
                    <p className="text-sky-400 text-sm mb-3">{job.pay_info}</p>
                )}

                {/* Requirements badges */}
                {job.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {job.requirements.map((req) => (
                            <span
                                key={req}
                                className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20"
                            >
                                {REQUIREMENT_LABELS[req] || req}
                            </span>
                        ))}
                    </div>
                )}

                {/* Match reasons */}
                {matchReasons && matchReasons.length > 0 && (
                    <p className="text-emerald-400/70 text-xs mb-2">
                        Why: {matchReasons.join(", ")}
                    </p>
                )}

                {/* Timestamp */}
                <p className="text-slate-600 text-xs">
                    Posted {timeAgo(job.created_at)}
                </p>
            </div>
        </Link>
    );
}

export { HAUL_LABELS, EQUIPMENT_LABELS, REQUIREMENT_LABELS, REGION_LABELS };
