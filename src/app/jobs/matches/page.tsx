"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { JobCard } from "@/components/jobs/JobCard";
import { Star, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const PAGE_SIZE = 20;

export default function JobMatchesPage() {
    const router = useRouter();
    const [matches, setMatches] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasProfile, setHasProfile] = useState(true);

    useEffect(() => {
        if (!api.isLoggedIn) {
            router.push("/login");
            return;
        }

        // Check if user has a professional profile
        api.profile.getMe().then(() => setHasProfile(true)).catch(() => setHasProfile(false));
    }, [router]);

    useEffect(() => {
        if (!api.isLoggedIn) return;

        setLoading(true);
        api.jobs.getMatches({ limit: PAGE_SIZE, offset: page * PAGE_SIZE })
            .then((result) => {
                setMatches(result.matches);
                setTotal(result.total);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [page]);

    const totalPages = Math.ceil(total / PAGE_SIZE);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Browse All Jobs
                </Link>

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                            Jobs Matching Your Profile
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            Based on your CDL, equipment, and preferred regions
                        </p>
                    </div>
                </div>

                {/* No profile prompt */}
                {!hasProfile && (
                    <div className="bg-slate-900/50 border border-amber-500/20 rounded-xl p-5 mb-6">
                        <h3 className="text-white font-semibold mb-1">Complete your profile for better matches!</h3>
                        <p className="text-slate-400 text-sm mb-3">
                            Add your CDL class, endorsements, and equipment experience to get personalized job matches.
                        </p>
                        <Link
                            href="/profile/edit"
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-400 rounded-lg transition-colors"
                        >
                            Complete Profile
                        </Link>
                    </div>
                )}

                {/* Results */}
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
                ) : matches.length === 0 ? (
                    <div className="text-center py-16">
                        <Star className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 text-lg">No matching jobs found</p>
                        <p className="text-slate-500 text-sm mt-1">
                            {hasProfile ? "Check back soon for new postings!" : "Complete your profile to get matches."}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {matches.map((match) => (
                                <JobCard
                                    key={match.job.id}
                                    job={match.job}
                                    matchScore={match.match_score}
                                    matchReasons={match.match_reasons}
                                />
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
                                <span className="text-sm text-slate-400">Page {page + 1} of {totalPages}</span>
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
    );
}
