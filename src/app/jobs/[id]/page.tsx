"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import {
    ArrowLeft, CheckCircle, Share2, Flag, Pencil, Trash2,
    ExternalLink, Phone, Mail
} from "lucide-react";
import {
    HAUL_LABELS, EQUIPMENT_LABELS, REQUIREMENT_LABELS, REGION_LABELS
} from "@/components/jobs/JobCard";

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 1) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays} days ago`;
    return date.toLocaleDateString();
}

function daysUntil(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Expired";
    if (diffDays === 1) return "1 day";
    return `${diffDays} days`;
}

function parseHowToApply(text: string) {
    const parts: React.ReactNode[] = [];
    // Match phone numbers
    const phoneRegex = /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g;
    // Match emails
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    // Match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    let lastIdx = 0;
    const allMatches: { idx: number; len: number; type: string; val: string }[] = [];

    let m;
    while ((m = phoneRegex.exec(text)) !== null) allMatches.push({ idx: m.index, len: m[0].length, type: "phone", val: m[0] });
    while ((m = emailRegex.exec(text)) !== null) allMatches.push({ idx: m.index, len: m[0].length, type: "email", val: m[0] });
    while ((m = urlRegex.exec(text)) !== null) allMatches.push({ idx: m.index, len: m[0].length, type: "url", val: m[0] });

    allMatches.sort((a, b) => a.idx - b.idx);

    allMatches.forEach((match, i) => {
        if (match.idx > lastIdx) {
            parts.push(<span key={`t${i}`}>{text.slice(lastIdx, match.idx)}</span>);
        }
        if (match.type === "phone") {
            parts.push(
                <a key={`m${i}`} href={`tel:${match.val.replace(/\D/g, "")}`} className="text-sky-400 hover:underline inline-flex items-center gap-1">
                    <Phone className="w-3 h-3" />{match.val}
                </a>
            );
        } else if (match.type === "email") {
            parts.push(
                <a key={`m${i}`} href={`mailto:${match.val}`} className="text-sky-400 hover:underline inline-flex items-center gap-1">
                    <Mail className="w-3 h-3" />{match.val}
                </a>
            );
        } else {
            parts.push(
                <a key={`m${i}`} href={match.val} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline inline-flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />{match.val}
                </a>
            );
        }
        lastIdx = match.idx + match.len;
    });

    if (lastIdx < text.length) {
        parts.push(<span key="end">{text.slice(lastIdx)}</span>);
    }

    return parts.length > 0 ? parts : text;
}

export default function JobDetailPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.id as string;

    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [driver, setDriver] = useState<any>(null);
    const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        api.jobs.get(jobId).then(setJob).catch(() => router.push("/jobs")).finally(() => setLoading(false));
        if (api.isLoggedIn) {
            api.drivers.getMe().then(setDriver).catch(() => {});
        }
    }, [jobId, router]);

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            await navigator.share({ title: job?.title, url });
        } else {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDeactivate = async () => {
        try {
            await api.jobs.deactivate(jobId);
            router.push("/jobs");
        } catch (err) {
            console.error("Failed to deactivate:", err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-slate-800 rounded w-1/4" />
                        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-8">
                            <div className="h-8 bg-slate-800 rounded w-2/3 mb-4" />
                            <div className="h-5 bg-slate-800 rounded w-1/3 mb-6" />
                            <div className="space-y-3">
                                <div className="h-4 bg-slate-800 rounded w-full" />
                                <div className="h-4 bg-slate-800 rounded w-3/4" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!job) return null;

    const isOwner = driver && job.posted_by === driver.id;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-8">
                {/* Back */}
                <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Jobs
                </Link>

                {/* Job Card */}
                <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 sm:p-8">
                    {/* Title & FMCSA */}
                    <div className="flex items-start justify-between gap-4 mb-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-white">{job.title}</h1>
                        {job.fmcsa_verified && (
                            <div className="flex items-center gap-1.5 text-emerald-400 shrink-0">
                                <CheckCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">FMCSA Verified</span>
                            </div>
                        )}
                    </div>

                    {/* Company & MC/DOT */}
                    <p className="text-slate-300 text-lg mb-1">{job.company_name}</p>
                    {(job.mc_number || job.dot_number) && (
                        <p className="text-slate-500 text-sm mb-4">
                            {job.mc_number && `MC# ${job.mc_number}`}
                            {job.mc_number && job.dot_number && " | "}
                            {job.dot_number && `DOT# ${job.dot_number}`}
                        </p>
                    )}

                    {/* Divider */}
                    <div className="border-t border-slate-800/50 my-5" />

                    {/* Job Details */}
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Job Details</h2>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-5">
                        <div>
                            <span className="text-slate-500">Haul Type:</span>
                            <span className="ml-2 text-white">{HAUL_LABELS[job.haul_type] || job.haul_type}</span>
                        </div>
                        <div>
                            <span className="text-slate-500">Equipment:</span>
                            <span className="ml-2 text-white">{EQUIPMENT_LABELS[job.equipment] || job.equipment}</span>
                        </div>
                        {job.pay_info && (
                            <div className="col-span-2">
                                <span className="text-slate-500">Pay:</span>
                                <span className="ml-2 text-sky-400">{job.pay_info}</span>
                            </div>
                        )}
                        {job.regions.length > 0 && (
                            <div className="col-span-2">
                                <span className="text-slate-500">Regions:</span>
                                <span className="ml-2 text-white">
                                    {job.regions.map((r: string) => REGION_LABELS[r] || r).join(", ")}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Requirements */}
                    {job.requirements.length > 0 && (
                        <>
                            <div className="border-t border-slate-800/50 my-5" />
                            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Requirements</h2>
                            <div className="flex flex-wrap gap-2 mb-5">
                                {job.requirements.map((req: string) => (
                                    <span
                                        key={req}
                                        className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20"
                                    >
                                        {REQUIREMENT_LABELS[req] || req}
                                    </span>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Description */}
                    {job.description && (
                        <>
                            <div className="border-t border-slate-800/50 my-5" />
                            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Description</h2>
                            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{job.description}</p>
                        </>
                    )}

                    {/* How to Apply */}
                    <div className="border-t border-slate-800/50 my-5" />
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">How to Apply</h2>
                    <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {parseHowToApply(job.how_to_apply)}
                    </div>

                    {/* Actions */}
                    <div className="border-t border-slate-800/50 my-5" />
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm text-slate-300 hover:text-white bg-slate-800/50 border border-slate-700/50 rounded-lg transition-colors"
                        >
                            <Share2 className="w-4 h-4" />
                            {copied ? "Copied!" : "Share Job"}
                        </button>
                    </div>

                    {/* Metadata */}
                    <p className="text-slate-600 text-xs mt-4">
                        Posted {timeAgo(job.created_at)}
                        {job.expires_at && ` | Expires in ${daysUntil(job.expires_at)}`}
                    </p>
                </div>

                {/* Owner Actions */}
                {isOwner && (
                    <div className="mt-4 flex items-center gap-3">
                        <Link
                            href={`/jobs/${jobId}/edit`}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-400 rounded-lg transition-colors"
                        >
                            <Pencil className="w-4 h-4" />
                            Edit Job
                        </Link>
                        <button
                            onClick={() => setShowDeactivateConfirm(true)}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Deactivate
                        </button>
                    </div>
                )}

                {/* Deactivation Confirm Modal */}
                {showDeactivateConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/60" onClick={() => setShowDeactivateConfirm(false)} />
                        <div className="relative bg-slate-900 border border-slate-700/50 rounded-xl p-6 max-w-sm mx-4">
                            <h3 className="text-lg font-semibold text-white mb-2">Deactivate Job?</h3>
                            <p className="text-slate-400 text-sm mb-4">
                                This will remove the job from public listings. You can still see it in your posted jobs.
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleDeactivate}
                                    className="flex-1 py-2 text-sm font-medium text-white bg-rose-500 hover:bg-rose-400 rounded-lg transition-colors"
                                >
                                    Deactivate
                                </button>
                                <button
                                    onClick={() => setShowDeactivateConfirm(false)}
                                    className="flex-1 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
