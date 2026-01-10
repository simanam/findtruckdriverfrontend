"use client";

import { Navbar } from "@/components/layout/Navbar";
import { ArrowLeft, Mail, Map, Truck } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-200 selection:bg-sky-500/30 pointer-events-auto">
            <Navbar />

            <div className="pt-24 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
                {/* Back Link */}
                <Link href="/" className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors mb-8 font-medium">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Map
                </Link>

                {/* Hero */}
                <header className="mb-16">
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
                        Built by a driver. <br />
                        <span className="text-sky-400">Powered by drivers.</span>
                    </h1>
                </header>

                <div className="space-y-16">

                    {/* The Story */}
                    <section className="prose prose-invert prose-lg max-w-none">
                        <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                <Truck className="w-6 h-6 text-sky-400" />
                                The Story
                            </h2>
                            <p className="text-slate-300 leading-relaxed">
                                I drove trucks during my college summers.
                            </p>
                            <p className="text-slate-300 leading-relaxed mt-4">
                                I know what it's like to circle a lot at 10pm looking for parking. I know what it's like to sit at a dock for 4 hours and not get paid. I know what it's like to pull into a spot and wonder if it's safe to sleep.
                            </p>
                            <p className="text-slate-300 leading-relaxed mt-4">
                                Every trucker knows these problems. And every trucker knows the only people who really know what's happening out there are the drivers who are out there.
                            </p>
                            <p className="text-slate-300 leading-relaxed mt-4">
                                So I built a map where we tell each other.
                            </p>
                            <div className="my-8 pl-4 border-l-4 border-sky-500 italic text-white font-medium text-xl">
                                Parking full? Say so.<br />
                                Wait too long? Say so.<br />
                                Spot sketchy? Say so.<br />
                                <span className="text-sky-400 mt-2 block not-italic">The next driver needs to know.</span>
                            </div>
                            <p className="text-slate-300 font-medium">
                                That's FindTruckDriver.
                            </p>
                        </div>
                    </section>

                    {/* How It Works */}
                    <section>
                        <h2 className="text-3xl font-bold text-white mb-8">How It Works</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                {
                                    title: "1. Check in",
                                    desc: "Rolling. Parked. Waiting. One tap. Takes two seconds.",
                                    icon: "📍"
                                },
                                {
                                    title: "2. Answer one question",
                                    desc: "\"How's the spot?\" or \"How's the wait?\" Helps the next driver know what to expect.",
                                    icon: "💬"
                                },
                                {
                                    title: "3. See everything",
                                    desc: "Real drivers. Real status. Real-time. No guessing. Just what's happening now.",
                                    icon: "👀"
                                }
                            ].map((item, i) => (
                                <div key={i} className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
                                    <div className="text-4xl mb-4">{item.icon}</div>
                                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                    <p className="text-slate-400">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* What We're Building */}
                    <section className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6">Live Now</h2>
                            <ul className="space-y-4">
                                {[
                                    "Driver map — see who's out there",
                                    "Parking status — how full is the lot",
                                    "Spot ratings — safe or sketch",
                                    "Detention tracking — how long is the wait"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-slate-300">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6">Coming Soon</h2>
                            <ul className="space-y-4">
                                {[
                                    "Facility ratings and reviews",
                                    "Spot sharing between drivers",
                                    "Detention reports by shipper",
                                    "Wait time predictions"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-slate-300">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-6 text-sm text-slate-500 italic">
                                Everything powered by drivers. The more we check in, the better it gets for everyone.
                            </p>
                        </div>
                    </section>

                    {/* Business Model */}
                    <section className="bg-slate-900/30 p-8 rounded-3xl border border-slate-800/50">
                        <h2 className="text-2xl font-bold text-white mb-4">How We Keep This Running</h2>
                        <div className="prose prose-invert prose-slate">
                            <p className="text-lg font-medium text-white">Free app. No subscription. No premium tier.</p>
                            <p className="text-slate-400">Servers cost money. Ads will pay the bills.</p>
                            <p className="text-slate-400 mt-4">But we're doing it right:</p>
                            <ul className="text-slate-300 list-disc pl-5 space-y-2 mt-2">
                                <li>Trucker-relevant (fuel, gear, services you actually use)</li>
                                <li>Out of your way (no pop-ups, no autoplay videos)</li>
                                <li>Your data stays yours (we don't sell it)</li>
                            </ul>
                            <p className="text-slate-400 mt-4 font-medium">We're truckers too. We know what's annoying. This won't be that.</p>
                            <p className="text-sky-400 font-bold mt-2">That's the deal.</p>
                        </div>
                    </section>

                    {/* FAQ */}
                    <section>
                        <h2 className="text-3xl font-bold text-white mb-8">FAQ</h2>
                        <div className="grid gap-6">
                            {[
                                { q: "Is this really free?", a: "Yes. Ads keep the lights on. You keep your wallet closed." },
                                { q: "Do I need an account?", a: "Yes. So your status stays yours and your check-ins count." },
                                { q: "Can people see my real name?", a: "No. Just your handle and avatar. You pick both." },
                                { q: "Can people see my exact location?", a: "When you're rolling, yes—you're on the road. When you're parked, we fuzz your location slightly. Your safety matters." },
                                { q: "How do I delete my account?", a: "Settings → Delete Account. Your data goes with it." },
                                { q: "Who built this?", a: "One guy who used to drive and got tired of the same problems everyone complains about." }
                            ].map((item, i) => (
                                <div key={i} className="border-l-2 border-slate-800 pl-6 py-2">
                                    <h3 className="font-bold text-white text-lg mb-1">{item.q}</h3>
                                    <p className="text-slate-400">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="bg-gradient-to-br from-sky-900/20 to-slate-900/50 p-8 rounded-3xl border border-sky-500/20 text-center">
                        <Mail className="w-10 h-10 text-sky-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Get In Touch</h2>
                        <p className="text-slate-400 mb-6 max-w-lg mx-auto">
                            Got feedback? Found a bug? Have an idea? This thing only gets better if you tell me what sucks.
                        </p>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-slate-300">
                            {/* Placeholder for email/handle logic if needed dynamic */}
                            <span className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-700">
                                Email: support@findtruckdriver.com
                            </span>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-800/50">
                            <p className="text-lg font-medium text-white">Founder</p>
                            <p className="text-slate-500 text-sm">Former driver. Still one of you.</p>
                        </div>
                    </section>

                    {/* Footer CTA */}
                    <section className="text-center py-12">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-6">One Last Thing</h2>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
                            This map is empty without you. Every check-in helps another driver.
                            You're not just using this app. <span className="text-sky-400 font-bold">You're building it.</span>
                        </p>
                        <Link href="/join" className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-bold px-8 py-4 rounded-full text-lg shadow-lg shadow-sky-500/20 transition-transform hover:scale-105 active:scale-95">
                            <Map className="w-5 h-5" />
                            Join the Map
                        </Link>
                    </section>

                </div>
            </div>
        </main>
    );
}
