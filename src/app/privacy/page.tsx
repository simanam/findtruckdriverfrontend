"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, Shield, MapPin, Eye, Trash2, Lock } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-200 selection:bg-sky-500/30 pointer-events-auto">
            <Navbar />

            <div className="pt-24 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
                {/* Back Link */}
                <Link href="/" className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors mb-8 font-medium">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Map
                </Link>

                {/* Header */}
                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-slate-400">
                        Last updated: January 10, 2025
                    </p>
                </header>

                <div className="prose prose-invert prose-slate max-w-none space-y-8">

                    {/* TL;DR */}
                    <section className="bg-emerald-900/20 p-6 md:p-8 rounded-2xl border border-emerald-500/20">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-emerald-400" />
                            The Short Version
                        </h2>
                        <ul className="space-y-3 text-slate-300">
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-400 mt-1">•</span>
                                <span>No live GPS tracking. We capture a single point when you check in—not continuous tracking.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-400 mt-1">•</span>
                                <span>No background tracking. Location is only collected when you actively update your status.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-400 mt-1">•</span>
                                <span>Locations are always "fuzzed" (offset 0.5-2 miles) before storage—your exact spot is never stored.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-400 mt-1">•</span>
                                <span>Your real name is never shown. You pick a handle and avatar.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-400 mt-1">•</span>
                                <span>We don't sell your data. Period.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-400 mt-1">•</span>
                                <span>Delete your account = ALL your data is permanently deleted.</span>
                            </li>
                        </ul>
                    </section>

                    {/* Operator Info */}
                    <section className="bg-sky-900/20 p-6 md:p-8 rounded-2xl border border-sky-500/20">
                        <h2 className="text-xl font-bold text-white mb-4">Data Controller</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Findtruckdriver is owned and operated by <strong className="text-white">Logixtecs Solutions LLC</strong>,
                            which serves as the data controller for all personal information collected through the Service.
                        </p>
                        <div className="mt-4 p-4 bg-slate-900/50 rounded-xl">
                            <p className="text-slate-400 text-sm">For privacy inquiries:</p>
                            <p className="text-white font-medium">support@logixtecs.com</p>
                            <a href="https://www.logixtecs.com" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 text-sm">
                                www.logixtecs.com
                            </a>
                        </div>
                    </section>

                    {/* What We Collect */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <Eye className="w-6 h-6 text-sky-400" />
                            1. Information We Collect
                        </h2>

                        <div className="space-y-6">
                            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                                <h3 className="font-bold text-white mb-3">Account Information</h3>
                                <ul className="space-y-2 text-slate-300">
                                    <li>• Email address (for authentication)</li>
                                    <li>• Handle/username (you choose this)</li>
                                    <li>• Avatar selection</li>
                                </ul>
                            </div>

                            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                                <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-sky-400" />
                                    Location Data
                                </h3>

                                <p className="text-slate-300 mb-4">When you check in (update your status), we capture:</p>
                                <ul className="space-y-2 text-slate-300">
                                    <li>• A single GPS coordinate (not continuous tracking)</li>
                                    <li>• The timestamp of your check-in</li>
                                    <li>• Your status (rolling, waiting, parked)</li>
                                    <li>• Your previous check-in location and time (to calculate driving context)</li>
                                    <li>• Facility association when at known locations</li>
                                </ul>

                                <p className="text-slate-300 mt-4 mb-2 font-medium">How we store it:</p>
                                <ul className="space-y-2 text-slate-300">
                                    <li>• Your <strong className="text-white">current location</strong> is stored and updated each check-in</li>
                                    <li>• Your <strong className="text-white">check-in history</strong> is stored (status + fuzzed location + timestamp)</li>
                                    <li>• All locations are "fuzzed" by 0.5-2 miles before storage for privacy</li>
                                </ul>

                                <div className="mt-4 p-3 bg-emerald-900/20 rounded-lg border border-emerald-500/20">
                                    <p className="text-emerald-300 text-sm font-medium">
                                        We do NOT track your live location continuously. Your location is captured as a single point
                                        only when you actively check in. No background tracking. No continuous GPS monitoring.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                                <h3 className="font-bold text-white mb-3">Usage Data</h3>
                                <ul className="space-y-2 text-slate-300">
                                    <li>• Ratings and feedback you provide about facilities</li>
                                    <li>• Feature requests and bug reports</li>
                                    <li>• Basic analytics (page views, feature usage)</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* How We Use It */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
                        <div className="space-y-4 text-slate-300">
                            <ul className="list-disc pl-6 space-y-3">
                                <li><strong className="text-white">Provide the Service:</strong> Show your status on the map to other drivers</li>
                                <li><strong className="text-white">Improve the App:</strong> Understand how features are used and fix bugs</li>
                                <li><strong className="text-white">Communicate:</strong> Send important updates about the Service</li>
                                <li><strong className="text-white">Safety:</strong> Detect and prevent abuse or fraudulent activity</li>
                            </ul>
                        </div>
                    </section>

                    {/* Location Privacy */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <Lock className="w-6 h-6 text-sky-400" />
                            3. Location Privacy Details
                        </h2>
                        <div className="space-y-4 text-slate-300">
                            <p>We take location privacy seriously. Here's exactly how it works:</p>

                            <div className="grid gap-4 mt-6">
                                <div className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                    <div>
                                        <p className="font-bold text-white">Rolling</p>
                                        <p className="text-slate-400 text-sm">Location visible to other drivers. You're on the road—this helps everyone.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                                    <div className="w-3 h-3 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                                    <div>
                                        <p className="font-bold text-white">Parked</p>
                                        <p className="text-slate-400 text-sm">Location is slightly fuzzed for your safety. Others see the general area, not your exact spot.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                                    <div className="w-3 h-3 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                                    <div>
                                        <p className="font-bold text-white">Waiting</p>
                                        <p className="text-slate-400 text-sm">Location at facilities helps others know wait times. Your exact dock position isn't shown.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                                <p className="text-white font-bold mb-2">What We Do NOT Do</p>
                                <ul className="space-y-2 text-slate-300 text-sm">
                                    <li>• No background location tracking</li>
                                    <li>• No continuous GPS monitoring</li>
                                    <li>• No tracking when app is closed</li>
                                    <li>• No sharing of your exact location (always fuzzed 0.5-2 miles)</li>
                                </ul>
                            </div>

                            <div className="mt-4 p-4 bg-sky-900/20 rounded-xl border border-sky-500/20">
                                <p className="text-white font-bold mb-2">Why We Store Check-in History</p>
                                <ul className="space-y-2 text-slate-300 text-sm">
                                    <li>• Calculate detention time at facilities</li>
                                    <li>• Track average wait times for community stats</li>
                                    <li>• Enable follow-up questions about your experience</li>
                                    <li>• Generate anonymous aggregate data for parking/facility ratings</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Data Sharing */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Information Sharing</h2>
                        <div className="space-y-4 text-slate-300">
                            <p className="font-bold text-emerald-400">We do not sell your personal data.</p>

                            <p>We may share information with:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong className="text-white">Other Users:</strong> Your handle, avatar, status, and location (as described above)</li>
                                <li><strong className="text-white">Service Providers:</strong> Companies that help us run the service (hosting, analytics) under strict data protection agreements</li>
                                <li><strong className="text-white">Legal Requirements:</strong> When required by law or to protect rights and safety</li>
                            </ul>
                        </div>
                    </section>

                    {/* Data Retention */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Data Retention</h2>
                        <div className="space-y-4 text-slate-300">
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong className="text-white">Current location:</strong> Visible on map for up to 8 hours, then automatically cleared from public view</li>
                                <li><strong className="text-white">Check-in history:</strong> Stored to calculate wait times and enable community features</li>
                                <li><strong className="text-white">Account data:</strong> Kept while your account is active</li>
                            </ul>

                            <div className="mt-4 p-4 bg-rose-900/20 rounded-xl border border-rose-500/20">
                                <p className="text-white font-bold mb-2">Data Deletion</p>
                                <p className="text-slate-300 text-sm">
                                    When you delete your account, <strong className="text-white">ALL</strong> your data is permanently deleted.
                                    This includes: your driver profile, all status updates, all check-in history, and all location data.
                                    Nothing is retained.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Your Rights */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <Trash2 className="w-6 h-6 text-sky-400" />
                            6. Your Rights
                        </h2>
                        <div className="space-y-4 text-slate-300">
                            <p>You have the right to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong className="text-white">Access:</strong> Request a copy of your data</li>
                                <li><strong className="text-white">Correct:</strong> Update your account information</li>
                                <li><strong className="text-white">Delete:</strong> Delete your account and all associated data</li>
                                <li><strong className="text-white">Withdraw consent:</strong> Stop sharing your location at any time</li>
                            </ul>
                            <p className="mt-4">
                                To exercise these rights, go to your Profile settings or contact us at{" "}
                                <a href="mailto:support@logixtecs.com" className="text-sky-400 hover:text-sky-300">
                                    support@logixtecs.com
                                </a>
                            </p>
                        </div>
                    </section>

                    {/* Security */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">7. Security</h2>
                        <div className="space-y-4 text-slate-300">
                            <p>
                                We implement industry-standard security measures to protect your data, including:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Encrypted data transmission (HTTPS)</li>
                                <li>Secure authentication</li>
                                <li>Regular security audits</li>
                                <li>Limited employee access to personal data</li>
                            </ul>
                        </div>
                    </section>

                    {/* Children */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">8. Children's Privacy</h2>
                        <div className="space-y-4 text-slate-300">
                            <p>
                                The Service is not intended for individuals under 18 years of age. We do not knowingly
                                collect personal information from children.
                            </p>
                        </div>
                    </section>

                    {/* Changes */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">9. Changes to This Policy</h2>
                        <div className="space-y-4 text-slate-300">
                            <p>
                                We may update this Privacy Policy from time to time. We will notify you of any material
                                changes by posting a notice on the Service or sending an email.
                            </p>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="bg-slate-900/50 p-6 md:p-8 rounded-2xl border border-slate-800">
                        <h2 className="text-xl font-bold text-white mb-4">Contact Us</h2>
                        <p className="text-slate-300 leading-relaxed mb-4">
                            If you have questions about this Privacy Policy or how we handle your data:
                        </p>
                        <div className="space-y-2">
                            <p className="text-slate-300">
                                <span className="text-slate-500">Email:</span>{" "}
                                <a href="mailto:support@logixtecs.com" className="text-sky-400 hover:text-sky-300">
                                    support@logixtecs.com
                                </a>
                            </p>
                            <p className="text-slate-300">
                                <span className="text-slate-500">Website:</span>{" "}
                                <a href="https://www.logixtecs.com" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300">
                                    www.logixtecs.com
                                </a>
                            </p>
                        </div>
                    </section>

                </div>
            </div>

            <Footer />
        </main>
    );
}
