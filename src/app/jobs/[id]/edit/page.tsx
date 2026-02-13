"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { CompanySearch } from "@/components/profile/CompanySearch";
import { FMCSACarrier } from "@/types/profile";

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

export default function EditJobPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fmcsaStatus, setFmcsaStatus] = useState<"idle" | "verified">("idle");

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

    useEffect(() => {
        async function load() {
            try {
                // Verify user is the poster
                const [job, driver] = await Promise.all([
                    api.jobs.get(jobId),
                    api.drivers.getMe(),
                ]);
                if (job.posted_by !== driver.id) {
                    router.push(`/jobs/${jobId}`);
                    return;
                }
                setForm({
                    title: job.title || "",
                    company_name: job.company_name || "",
                    description: job.description || "",
                    how_to_apply: job.how_to_apply || "",
                    mc_number: job.mc_number || "",
                    dot_number: job.dot_number || "",
                    haul_type: job.haul_type || "otr",
                    equipment: job.equipment || "dry_van",
                    pay_info: job.pay_info || "",
                    requirements: job.requirements || [],
                    regions: job.regions || [],
                });
            } catch {
                router.push("/jobs");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [jobId, router]);

    const handleFMCSASelect = (carrier: FMCSACarrier) => {
        setForm((prev) => ({
            ...prev,
            company_name: carrier.dba_name || carrier.legal_name || prev.company_name,
            mc_number: carrier.mc_number || prev.mc_number,
            dot_number: carrier.dot_number || prev.dot_number,
        }));
        setFmcsaStatus("verified");
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

    const handleSubmit = async () => {
        setError(null);
        setSubmitting(true);
        try {
            await api.jobs.update(jobId, form);
            router.push(`/jobs/${jobId}`);
        } catch (err: any) {
            setError(err.message || "Failed to update job");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-slate-800 rounded w-1/3" />
                        <div className="h-64 bg-slate-900/50 border border-slate-800/50 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    const inputClass = "w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50";

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-8">
                <Link href={`/jobs/${jobId}`} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Job
                </Link>

                <h1 className="text-2xl font-bold text-white mb-6">Edit Job Posting</h1>

                {error && (
                    <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Company Info */}
                    <section className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Company Info</h2>
                        <CompanySearch onSelect={handleFMCSASelect} />
                        <div>
                            <label className="block text-sm text-slate-300 mb-1">Company Name *</label>
                            <input className={inputClass} value={form.company_name} onChange={(e) => { setForm({ ...form, company_name: e.target.value }); setFmcsaStatus("idle"); }} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">MC Number</label>
                                <input className={inputClass} value={form.mc_number} onChange={(e) => { setForm({ ...form, mc_number: e.target.value }); setFmcsaStatus("idle"); }} placeholder="e.g. 123456" />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">DOT Number</label>
                                <input className={inputClass} value={form.dot_number} onChange={(e) => { setForm({ ...form, dot_number: e.target.value }); setFmcsaStatus("idle"); }} placeholder="e.g. 789012" />
                            </div>
                        </div>
                        {fmcsaStatus === "verified" && (
                            <span className="flex items-center gap-1 text-emerald-400 text-sm">
                                <CheckCircle className="w-4 h-4" /> FMCSA Verified
                            </span>
                        )}
                    </section>

                    {/* Job Details */}
                    <section className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Job Details</h2>
                        <div>
                            <label className="block text-sm text-slate-300 mb-1">Job Title *</label>
                            <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300 mb-1">Description</label>
                            <textarea className={`${inputClass} min-h-[100px] resize-y`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">Haul Type *</label>
                                <select className={inputClass} value={form.haul_type} onChange={(e) => setForm({ ...form, haul_type: e.target.value })}>
                                    {HAUL_TYPES.map((ht) => <option key={ht.value} value={ht.value}>{ht.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">Equipment *</label>
                                <select className={inputClass} value={form.equipment} onChange={(e) => setForm({ ...form, equipment: e.target.value })}>
                                    {EQUIPMENT_TYPES.map((eq) => <option key={eq.value} value={eq.value}>{eq.label}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300 mb-1">Pay Info</label>
                            <input className={inputClass} value={form.pay_info} onChange={(e) => setForm({ ...form, pay_info: e.target.value })} placeholder='e.g. $0.65/mi + $50 stop pay' />
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
                        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Regions</h2>
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
                    </section>

                    {/* How to Apply */}
                    <section className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">How to Apply</h2>
                        <div>
                            <textarea
                                className={`${inputClass} min-h-[80px] resize-y`}
                                value={form.how_to_apply}
                                onChange={(e) => setForm({ ...form, how_to_apply: e.target.value })}
                                placeholder="Phone number, email, or link"
                            />
                        </div>
                    </section>

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full py-3 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-lg shadow-sky-500/20 transition-all"
                    >
                        {submitting ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
