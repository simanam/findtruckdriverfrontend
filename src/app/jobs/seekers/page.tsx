"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { SeekerCard } from "@/components/jobs/SeekerCard";
import { Users, ArrowLeft, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const PAGE_SIZE = 20;

const CDL_OPTIONS = [
    { value: "", label: "All CDL Classes" },
    { value: "A", label: "CDL-A" },
    { value: "B", label: "CDL-B" },
    { value: "C", label: "CDL-C" },
];

const EQUIPMENT_OPTIONS = [
    { value: "", label: "All Equipment" },
    { value: "dry_van", label: "Dry Van" },
    { value: "reefer", label: "Reefer" },
    { value: "flatbed", label: "Flatbed" },
    { value: "tanker", label: "Tanker" },
    { value: "car_hauler", label: "Car Hauler" },
    { value: "intermodal", label: "Intermodal" },
    { value: "hazmat", label: "Hazmat" },
    { value: "oversized", label: "Oversized" },
    { value: "ltl", label: "LTL" },
];

const REGION_OPTIONS = [
    { value: "", label: "All Regions" },
    { value: "northeast", label: "Northeast" },
    { value: "southeast", label: "Southeast" },
    { value: "midwest", label: "Midwest" },
    { value: "southwest", label: "Southwest" },
    { value: "west", label: "West" },
    { value: "northwest", label: "Northwest" },
    { value: "national", label: "National" },
];

export default function JobSeekersPage() {
    const [seekers, setSeekers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [cdlClass, setCdlClass] = useState("");
    const [equipment, setEquipment] = useState("");
    const [region, setRegion] = useState("");

    useEffect(() => {
        setLoading(true);
        const params: any = {
            limit: PAGE_SIZE,
            offset: page * PAGE_SIZE,
        };
        if (cdlClass) params.cdl_class = cdlClass;
        if (equipment) params.equipment = equipment;
        if (region) params.region = region;

        api.jobs.getSeekers(params)
            .then(setSeekers)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [page, cdlClass, equipment, region]);

    const selectClass = "px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-sky-500/50";

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Jobs
                </Link>

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-emerald-400" />
                        Drivers Open to Work
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Browse drivers looking for new opportunities
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <select
                        value={cdlClass}
                        onChange={(e) => { setCdlClass(e.target.value); setPage(0); }}
                        className={selectClass}
                    >
                        {CDL_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <select
                        value={equipment}
                        onChange={(e) => { setEquipment(e.target.value); setPage(0); }}
                        className={selectClass}
                    >
                        {EQUIPMENT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <select
                        value={region}
                        onChange={(e) => { setRegion(e.target.value); setPage(0); }}
                        className={selectClass}
                    >
                        {REGION_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 animate-pulse">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-full bg-slate-800" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-5 bg-slate-800 rounded w-1/3" />
                                        <div className="h-4 bg-slate-800 rounded w-2/3" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : seekers.length === 0 ? (
                    <div className="text-center py-16">
                        <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 text-lg">No drivers found</p>
                        <p className="text-slate-500 text-sm mt-1">Try adjusting your filters</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {seekers.map((seeker) => (
                                <SeekerCard key={seeker.driver_id} seeker={seeker} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {seekers.length >= PAGE_SIZE && (
                            <div className="flex items-center justify-center gap-2 mt-6">
                                <button
                                    onClick={() => setPage(Math.max(0, page - 1))}
                                    disabled={page === 0}
                                    className="p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="text-sm text-slate-400">Page {page + 1}</span>
                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={seekers.length < PAGE_SIZE}
                                    className="p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
