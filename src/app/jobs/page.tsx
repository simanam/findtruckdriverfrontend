"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { JobCard } from "@/components/jobs/JobCard";
import { FilterSidebar, JobFilters } from "@/components/jobs/FilterSidebar";
import { Briefcase, Plus, Filter, Users, ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
import Link from "next/link";

const POSTER_ROLES = ["recruiter", "fleet_manager", "dispatcher", "owner_operator", "freight_broker"];
const PAGE_SIZE = 20;

export default function JobBoardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
            </div>
        }>
            <JobBoardContent />
        </Suspense>
    );
}

function JobBoardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [jobs, setJobs] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [driver, setDriver] = useState<any>(null);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const [filters, setFilters] = useState<JobFilters>({
        haul_type: searchParams.get("haul_type") || null,
        equipment: searchParams.get("equipment") || null,
        region: searchParams.get("region") || null,
        fmcsa_verified: searchParams.get("fmcsa_verified") === "true",
        search: searchParams.get("search") || "",
    });

    // Load driver info for role check
    useEffect(() => {
        if (api.isLoggedIn) {
            api.drivers.getMe().then(setDriver).catch(() => {});
        }
    }, []);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = {
                limit: PAGE_SIZE,
                offset: page * PAGE_SIZE,
            };
            if (filters.haul_type) params.haul_type = filters.haul_type;
            if (filters.equipment) params.equipment = filters.equipment;
            if (filters.region) params.region = filters.region;
            if (filters.fmcsa_verified) params.fmcsa_verified = true;
            if (filters.search) params.search = filters.search;

            const result = await api.jobs.list(params);
            setJobs(result.jobs);
            setTotal(result.total);
        } catch (err) {
            console.error("Failed to load jobs:", err);
        } finally {
            setLoading(false);
        }
    }, [filters, page]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    // Sync filters to URL
    useEffect(() => {
        const params = new URLSearchParams();
        if (filters.haul_type) params.set("haul_type", filters.haul_type);
        if (filters.equipment) params.set("equipment", filters.equipment);
        if (filters.region) params.set("region", filters.region);
        if (filters.fmcsa_verified) params.set("fmcsa_verified", "true");
        if (filters.search) params.set("search", filters.search);
        const qs = params.toString();
        router.replace(`/jobs${qs ? `?${qs}` : ""}`, { scroll: false });
    }, [filters, router]);

    const handleFilterChange = (newFilters: JobFilters) => {
        setFilters(newFilters);
        setPage(0);
    };

    const clearFilters = () => {
        setFilters({
            haul_type: null,
            equipment: null,
            region: null,
            fmcsa_verified: false,
            search: "",
        });
        setPage(0);
    };

    const totalPages = Math.ceil(total / PAGE_SIZE);
    const isPoster = driver && POSTER_ROLES.includes(driver.role);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Briefcase className="w-6 h-6 text-sky-400" />
                            Job Board
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            {total} active {total === 1 ? "job" : "jobs"}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {api.isLoggedIn && (
                            <Link
                                href="/jobs/matches"
                                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm text-slate-300 hover:text-white bg-slate-800/50 border border-slate-700/50 rounded-lg transition-colors"
                            >
                                View Matches
                            </Link>
                        )}
                        <Link
                            href="/jobs/seekers"
                            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm text-slate-300 hover:text-white bg-slate-800/50 border border-slate-700/50 rounded-lg transition-colors"
                        >
                            <Users className="w-4 h-4" />
                            Drivers
                        </Link>
                        {isPoster && (
                            <Link
                                href="/jobs/new"
                                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-400 rounded-lg shadow-lg shadow-sky-500/20 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                Post Job
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Filter Toggle */}
                <button
                    onClick={() => setShowMobileFilters(true)}
                    className="md:hidden flex items-center gap-2 px-4 py-2 mb-4 text-sm text-slate-300 bg-slate-800/50 border border-slate-700/50 rounded-lg w-full justify-center"
                >
                    <Filter className="w-4 h-4" />
                    Filters
                </button>

                <div className="flex gap-6">
                    {/* Desktop Filter Sidebar */}
                    <div className="hidden md:block w-56 shrink-0">
                        <div className="sticky top-24 bg-slate-900/50 border border-slate-800/50 rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-white mb-4">Filters</h3>
                            <FilterSidebar
                                filters={filters}
                                onChange={handleFilterChange}
                                onClear={clearFilters}
                            />
                        </div>
                    </div>

                    {/* Job List */}
                    <div className="flex-1 min-w-0">
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 animate-pulse">
                                        <div className="h-5 bg-slate-800 rounded w-2/3 mb-3" />
                                        <div className="h-4 bg-slate-800 rounded w-1/3 mb-3" />
                                        <div className="h-3 bg-slate-800 rounded w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="text-center py-16">
                                <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400 text-lg">No jobs found</p>
                                <p className="text-slate-500 text-sm mt-1">Try adjusting your filters</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    {jobs.map((job) => (
                                        <JobCard key={job.id} job={job} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-6">
                                        <button
                                            onClick={() => setPage(Math.max(0, page - 1))}
                                            disabled={page === 0}
                                            className="p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <span className="text-sm text-slate-400">
                                            Page {page + 1} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                                            disabled={page >= totalPages - 1}
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
            </div>

            {/* Mobile Filter Modal */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setShowMobileFilters(false)} />
                    <div className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700/50 rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Filters</h3>
                            <button onClick={() => setShowMobileFilters(false)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <FilterSidebar
                            filters={filters}
                            onChange={handleFilterChange}
                            onClear={clearFilters}
                        />
                        <button
                            onClick={() => setShowMobileFilters(false)}
                            className="w-full mt-4 py-3 bg-sky-500 text-white font-medium rounded-lg"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
