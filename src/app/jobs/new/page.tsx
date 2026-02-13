"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ArrowLeft, Eye, EyeOff, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { JobCard } from "@/components/jobs/JobCard";

const POSTER_ROLES = ["recruiter", "fleet_manager", "dispatcher", "owner_operator", "freight_broker"];

const HAUL_TYPES = [
    { value: "otr", label: "OTR" },
    { value: "regional", label: "Regional" },
    { value: "local", label: "Local" },
    { value: "dedicated", label: "Dedicated" },
    { value: "team", label: "Team" },
];

const EQUIPMENT_TYPES = [
    { value: "dry_van", label: "Dry Van" },
    { value: "reefer", label: "Reefer" },
    { value: "flatbed", label: "Flatbed" },
    { value: "tanker", label: "Tanker" },
    { value: "car_hauler", label: "Car Hauler" },
    { value: "intermodal", label: "Intermodal" },
    { value: "hazmat", label: "Hazmat" },
    { value: "oversized", label: "Oversized" },
    { value: "ltl", label: "LTL" },
    { value: "other", label: "Other" },
];

const REQUIREMENTS = [
    { value: "cdl_a", label: "CDL Class A" },
    { value: "cdl_b", label: "CDL Class B" },
    { value: "hazmat", label: "Hazmat" },
    { value: "tanker", label: "Tanker" },
    { value: "doubles_triples", label: "Doubles/Triples" },
    { value: "twic", label: "TWIC Card" },
    { value: "1yr_exp", label: "1+ Year Exp" },
    { value: "2yr_exp", label: "2+ Years Exp" },
    { value: "5yr_exp", label: "5+ Years Exp" },
    { value: "clean_record", label: "Clean Record" },
    { value: "no_sap", label: "No SAP" },
    { value: "team_willing", label: "Team Willing" },
];

const REGIONS = [
    { value: "northeast", label: "Northeast" },
    { value: "southeast", label: "Southeast" },
    { value: "midwest", label: "Midwest" },
    { value: "southwest", label: "Southwest" },
    { value: "west", label: "West" },
    { value: "northwest", label: "Northwest" },
    { value: "national", label: "National" },
];

export default function NewJobPage() {
    const router = useRouter();
    const [isPreview, setIsPreview] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [authorized, setAuthorized] = useState<boolean | null>(null);
    const [fmcsaStatus, setFmcsaStatus] = useState<"idle" | "loading" | "verified" | "failed">("idle");

    const [form, setForm] = useState({
        title: "",
        company_name: "",
        description: "",
        how_to_apply: "",
        mc_number: "",
        dot_number: "",
        haul_type: "otr",
        equipment: "dry_van",
        pay_info: "",
        requirements: [] as string[],
        regions: [] as string[],
    });

    // Auth + role check
    useEffect(() => {
        if (!api.isLoggedIn) {
            router.push("/login");
            return;
        }
        api.drivers.getMe().then((driver) => {
            if (!POSTER_ROLES.includes(driver.role)) {
                setAuthorized(false);
            } else {
                setAuthorized(true);
            }
        }).catch(() => {
            router.push("/login");
        });
    }, [router]);

    const handleVerifyFMCSA = async () => {
        if (!form.dot_number && !form.mc_number) return;
        setFmcsaStatus("loading");
        try {
            const query = form.dot_number || form.mc_number;
            const type = form.dot_number ? "dot" : "name";
            const result = await api.profile.searchFMCSA(query, type);
            setFmcsaStatus(result.results && result.results.length > 0 ? "verified" : "failed");
        } catch {
            setFmcsaStatus("failed");
        }
    };

    const toggleRequirement = (req: string) => {
        setForm((prev) => ({
            ...prev,
            requirements: prev.requirements.includes(req)
                ? prev.requirements.filter((r) => r !== req)
                : [...prev.requirements, req],
        }));
    };

    const toggleRegion = (region: string) => {
        setForm((prev) => ({
            ...prev,
            regions: prev.regions.includes(region)
                ? prev.regions.filter((r) => r !== region)
                : [...prev.regions, region],
        }));
    };

    const validate = (): boolean => {
        const errors: Record<string, string> = {};
        if (form.title.length < 5) errors.title = "Title must be at least 5 characters";
        if (form.company_name.length < 2) errors.company_name = "Company name is required";
        if (form.how_to_apply.length < 5) errors.how_to_apply = "Please provide contact info (at least 5 characters)";
        if (form.regions.length === 0) errors.regions = "Select at least one region";
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setError(null);
        setIsSubmitting(true);
        try {
            const payload: any = { ...form };
            // Remove empty optional fields
            if (!payload.mc_number) delete payload.mc_number;
            if (!payload.dot_number) delete payload.dot_number;
            if (!payload.description) delete payload.description;
            if (!payload.pay_info) delete payload.pay_info;

            const result = await api.jobs.create(payload);
            router.push(`/jobs/${result.id}`);
        } catch (err: any) {
            setError(err.message || "Failed to post job");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authorized === null) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
            </div>
        );
    }

    if (authorized === false) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
                <div className="max-w-md mx-auto px-4 py-16 text-center">
                    <h1 className="text-xl font-bold text-white mb-2">Cannot Post Jobs</h1>
                    <p className="text-slate-400 text-sm mb-4">
                        Only recruiters, fleet managers, dispatchers, owner-operators, and freight brokers can post jobs.
                        Update your role in your profile settings.
                    </p>
                    <Link href="/profile/edit" className="text-sky-400 hover:underline text-sm">
                        Edit Profile
                    </Link>
                </div>
            </div>
        );
    }

    const inputClass = "w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50";

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-2 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Jobs
                        </Link>
                        <h1 className="text-2xl font-bold text-white">Post a Job</h1>
                    </div>
                    <button
                        onClick={() => setIsPreview(!isPreview)}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-300 hover:text-white bg-slate-800/50 border border-slate-700/50 rounded-lg transition-colors"
                    >
                        {isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {isPreview ? "Edit" : "Preview"}
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Preview Mode */}
                {isPreview ? (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-400 mb-2">Preview of your job posting:</p>
                        <JobCard
                            job={{
                                id: "preview",
                                title: form.title || "Job Title",
                                company_name: form.company_name || "Company Name",
                                haul_type: form.haul_type,
                                equipment: form.equipment,
                                pay_info: form.pay_info || undefined,
                                requirements: form.requirements,
                                regions: form.regions,
                                fmcsa_verified: fmcsaStatus === "verified",
                                created_at: new Date().toISOString(),
                            }}
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full py-3 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-lg shadow-sky-500/20 transition-all"
                        >
                            {isSubmitting ? "Posting..." : "Post Job"}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Company Info */}
                        <section className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 space-y-4">
                            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Company Info</h2>
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">Company Name *</label>
                                <input
                                    className={inputClass}
                                    value={form.company_name}
                                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                                    placeholder="e.g. Swift Transport"
                                />
                                {fieldErrors.company_name && <p className="text-rose-400 text-xs mt-1">{fieldErrors.company_name}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-300 mb-1">MC Number</label>
                                    <input className={inputClass} value={form.mc_number} onChange={(e) => setForm({ ...form, mc_number: e.target.value })} placeholder="e.g. 123456" />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-300 mb-1">DOT Number</label>
                                    <input className={inputClass} value={form.dot_number} onChange={(e) => setForm({ ...form, dot_number: e.target.value })} placeholder="e.g. 789012" />
                                </div>
                            </div>
                            {(form.mc_number || form.dot_number) && (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleVerifyFMCSA}
                                        disabled={fmcsaStatus === "loading"}
                                        className="text-sm text-sky-400 hover:text-sky-300 transition-colors disabled:opacity-50"
                                    >
                                        {fmcsaStatus === "loading" ? "Verifying..." : "Verify with FMCSA"}
                                    </button>
                                    {fmcsaStatus === "verified" && (
                                        <span className="flex items-center gap-1 text-emerald-400 text-sm">
                                            <CheckCircle className="w-4 h-4" /> Verified
                                        </span>
                                    )}
                                    {fmcsaStatus === "failed" && (
                                        <span className="text-rose-400 text-sm">Not found</span>
                                    )}
                                </div>
                            )}
                        </section>

                        {/* Job Details */}
                        <section className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 space-y-4">
                            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Job Details</h2>
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">Job Title *</label>
                                <input
                                    className={inputClass}
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="e.g. OTR Driver Needed"
                                />
                                {fieldErrors.title && <p className="text-rose-400 text-xs mt-1">{fieldErrors.title}</p>}
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">Description</label>
                                <textarea
                                    className={`${inputClass} min-h-[100px] resize-y`}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Describe the job, benefits, schedule..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-2">Haul Type *</label>
                                <div className="flex flex-wrap gap-2">
                                    {HAUL_TYPES.map((ht) => (
                                        <button
                                            key={ht.value}
                                            type="button"
                                            onClick={() => setForm({ ...form, haul_type: ht.value })}
                                            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                                                form.haul_type === ht.value
                                                    ? "bg-sky-500/10 border-sky-500/30 text-sky-400"
                                                    : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600"
                                            }`}
                                        >
                                            {ht.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">Equipment *</label>
                                <select className={inputClass} value={form.equipment} onChange={(e) => setForm({ ...form, equipment: e.target.value })}>
                                    {EQUIPMENT_TYPES.map((eq) => <option key={eq.value} value={eq.value}>{eq.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">Pay Info</label>
                                <input
                                    className={inputClass}
                                    value={form.pay_info}
                                    onChange={(e) => setForm({ ...form, pay_info: e.target.value })}
                                    placeholder='e.g. $0.65/mi + $50 stop pay'
                                />
                            </div>
                        </section>

                        {/* Requirements */}
                        <section className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 space-y-4">
                            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Requirements</h2>
                            <div className="flex flex-wrap gap-2">
                                {REQUIREMENTS.map((req) => (
                                    <button
                                        key={req.value}
                                        type="button"
                                        onClick={() => toggleRequirement(req.value)}
                                        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                                            form.requirements.includes(req.value)
                                                ? "bg-sky-500/10 border-sky-500/30 text-sky-400"
                                                : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600"
                                        }`}
                                    >
                                        {req.label}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Regions */}
                        <section className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 space-y-4">
                            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Regions *</h2>
                            <div className="flex flex-wrap gap-2">
                                {REGIONS.map((r) => (
                                    <button
                                        key={r.value}
                                        type="button"
                                        onClick={() => toggleRegion(r.value)}
                                        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                                            form.regions.includes(r.value)
                                                ? "bg-sky-500/10 border-sky-500/30 text-sky-400"
                                                : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600"
                                        }`}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                            {fieldErrors.regions && <p className="text-rose-400 text-xs">{fieldErrors.regions}</p>}
                        </section>

                        {/* How to Apply */}
                        <section className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 space-y-4">
                            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">How to Apply *</h2>
                            <div>
                                <textarea
                                    className={`${inputClass} min-h-[80px] resize-y`}
                                    value={form.how_to_apply}
                                    onChange={(e) => setForm({ ...form, how_to_apply: e.target.value })}
                                    placeholder="Phone number, email, or application link"
                                />
                                {fieldErrors.how_to_apply && <p className="text-rose-400 text-xs mt-1">{fieldErrors.how_to_apply}</p>}
                            </div>
                        </section>

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full py-3 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-lg shadow-sky-500/20 transition-all"
                        >
                            {isSubmitting ? "Posting..." : "Post Job"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
