"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, Lightbulb, Bug, MessageSquare, Send, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type FeedbackType = "feature" | "bug" | "other";

export default function FeedbackPage() {
    const [feedbackType, setFeedbackType] = useState<FeedbackType>("feature");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Create mailto link with pre-filled content
        const subject = encodeURIComponent(`[${feedbackType.toUpperCase()}] ${title}`);
        const body = encodeURIComponent(
            `Type: ${feedbackType}\n\nTitle: ${title}\n\nDescription:\n${description}\n\n---\nFrom: ${email || "Not provided"}\nApp: Findtruckdriver`
        );

        window.location.href = `mailto:support@logixtecs.com?subject=${subject}&body=${body}`;
        setSubmitted(true);
    };

    const feedbackTypes = [
        {
            id: "feature" as const,
            label: "Feature Request",
            icon: Lightbulb,
            color: "text-amber-400",
            bgColor: "bg-amber-500/10",
            borderColor: "border-amber-500/30",
            description: "Suggest a new feature or improvement"
        },
        {
            id: "bug" as const,
            label: "Bug Report",
            icon: Bug,
            color: "text-rose-400",
            bgColor: "bg-rose-500/10",
            borderColor: "border-rose-500/30",
            description: "Report something that's not working"
        },
        {
            id: "other" as const,
            label: "General Feedback",
            icon: MessageSquare,
            color: "text-sky-400",
            bgColor: "bg-sky-500/10",
            borderColor: "border-sky-500/30",
            description: "Share thoughts, questions, or ideas"
        }
    ];

    return (
        <main className="min-h-screen bg-slate-950 text-slate-200 selection:bg-sky-500/30 pointer-events-auto">
            <Navbar />

            <div className="pt-24 pb-20 px-4 md:px-8 max-w-3xl mx-auto">
                {/* Back Link */}
                <Link href="/" className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors mb-8 font-medium">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Map
                </Link>

                {/* Header */}
                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                        Feedback & Requests
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Help us make Findtruckdriver better. Every idea counts.
                    </p>
                </header>

                {submitted ? (
                    /* Success State */
                    <div className="bg-emerald-900/20 p-8 md:p-12 rounded-3xl border border-emerald-500/20 text-center">
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Send className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Thanks for your feedback!</h2>
                        <p className="text-slate-300 mb-6">
                            Your email client should have opened with your feedback pre-filled.
                            Just hit send and we'll take it from there.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => {
                                    setSubmitted(false);
                                    setTitle("");
                                    setDescription("");
                                }}
                                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
                            >
                                Submit Another
                            </button>
                            <Link
                                href="/map"
                                className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white font-medium rounded-xl transition-colors"
                            >
                                Back to Map
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Feedback Type Selector */}
                        <div>
                            <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                                What type of feedback?
                            </label>
                            <div className="grid sm:grid-cols-3 gap-4">
                                {feedbackTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setFeedbackType(type.id)}
                                        className={`p-4 rounded-xl border-2 transition-all text-left ${feedbackType === type.id
                                                ? `${type.bgColor} ${type.borderColor}`
                                                : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                                            }`}
                                    >
                                        <type.icon className={`w-6 h-6 ${type.color} mb-2`} />
                                        <p className="font-bold text-white">{type.label}</p>
                                        <p className="text-xs text-slate-400 mt-1">{type.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    {feedbackType === "feature" ? "Feature Title" : feedbackType === "bug" ? "Bug Summary" : "Subject"}
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder={
                                        feedbackType === "feature"
                                            ? "e.g., Add weather alerts to the map"
                                            : feedbackType === "bug"
                                                ? "e.g., Map doesn't load on iPhone"
                                                : "What's on your mind?"
                                    }
                                    required
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Details
                                </label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={
                                        feedbackType === "feature"
                                            ? "Describe the feature you'd like to see. How would it help you?"
                                            : feedbackType === "bug"
                                                ? "What happened? What did you expect to happen? Steps to reproduce?"
                                                : "Tell us more..."
                                    }
                                    required
                                    rows={6}
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 resize-none"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Your Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="driver@example.com"
                                    required
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500"
                                />
                                <p className="text-xs text-slate-500 mt-2">
                                    So we can follow up on your feedback
                                </p>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="w-full py-4 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <Send className="w-5 h-5" />
                                Send Feedback
                            </button>
                        </form>

                        {/* Direct Contact */}
                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 text-center">
                            <p className="text-slate-400 mb-4">
                                Prefer to email directly?
                            </p>
                            <a
                                href="mailto:support@logixtecs.com"
                                className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 font-medium"
                            >
                                support@logixtecs.com
                                <ExternalLink className="w-4 h-4" />
                            </a>
                            <p className="text-slate-500 text-sm mt-4">
                                All feedback is handled by our parent company,{" "}
                                <a href="https://www.logixtecs.com" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300">
                                    Logixtecs Solutions LLC
                                </a>
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
