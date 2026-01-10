"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
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
                        Terms of Service
                    </h1>
                    <p className="text-slate-400">
                        Last updated: January 10, 2025
                    </p>
                </header>

                <div className="prose prose-invert prose-slate max-w-none space-y-8">

                    {/* Introduction */}
                    <section className="bg-slate-900/50 p-6 md:p-8 rounded-2xl border border-slate-800">
                        <h2 className="text-xl font-bold text-white mb-4">Welcome to Findtruckdriver</h2>
                        <p className="text-slate-300 leading-relaxed">
                            These Terms of Service ("Terms") govern your use of the Findtruckdriver application and website
                            (collectively, the "Service") operated by Logixtecs Solutions LLC ("Company", "we", "us", or "our").
                        </p>
                        <p className="text-slate-300 leading-relaxed mt-4">
                            By accessing or using the Service, you agree to be bound by these Terms. If you disagree with
                            any part of these terms, you may not access the Service.
                        </p>
                    </section>

                    {/* Operator Info */}
                    <section className="bg-sky-900/20 p-6 md:p-8 rounded-2xl border border-sky-500/20">
                        <h2 className="text-xl font-bold text-white mb-4">Service Operator</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Findtruckdriver is owned and operated by <strong className="text-white">Logixtecs Solutions LLC</strong>.
                            All matters relating to the Service, including technical support, maintenance, legal inquiries,
                            and general correspondence, are handled by Logixtecs.
                        </p>
                        <div className="mt-4 p-4 bg-slate-900/50 rounded-xl">
                            <p className="text-slate-400 text-sm">Contact:</p>
                            <p className="text-white font-medium">support@logixtecs.com</p>
                            <a href="https://www.logixtecs.com" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 text-sm">
                                www.logixtecs.com
                            </a>
                        </div>
                    </section>

                    {/* Use of Service */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Use of the Service</h2>
                        <div className="space-y-4 text-slate-300">
                            <p>
                                Findtruckdriver provides a real-time visibility network for truck drivers to share their
                                status (rolling, waiting, parked) and location-based information with other drivers.
                            </p>
                            <p>You agree to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Use the Service only for lawful purposes</li>
                                <li>Provide accurate information when creating your account</li>
                                <li>Not impersonate other drivers or entities</li>
                                <li>Not use the Service while operating a vehicle in an unsafe manner</li>
                                <li>Not attempt to disrupt or interfere with the Service</li>
                                <li>Not use automated systems to access the Service without permission</li>
                            </ul>
                        </div>
                    </section>

                    {/* Accounts */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Accounts</h2>
                        <div className="space-y-4 text-slate-300">
                            <p>
                                To use certain features of the Service, you must create an account. You are responsible
                                for maintaining the security of your account and all activities under your account.
                            </p>
                            <p>
                                You must notify us immediately of any unauthorized use of your account. We are not liable
                                for any loss arising from unauthorized use of your account.
                            </p>
                        </div>
                    </section>

                    {/* User Content */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. User Content</h2>
                        <div className="space-y-4 text-slate-300">
                            <p>
                                By submitting content (status updates, location data, ratings, feedback) to the Service, you grant
                                us a non-exclusive, worldwide, royalty-free license to use, display, and distribute that content
                                in connection with operating the Service.
                            </p>
                            <p>
                                You represent that you own or have the necessary rights to the content you submit and that
                                your content does not violate any third-party rights.
                            </p>
                        </div>
                    </section>

                    {/* Location Data */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Location Data</h2>
                        <div className="space-y-4 text-slate-300">
                            <p>
                                The Service relies on location data to function. By using the Service, you consent to the
                                collection and sharing of your location with other users according to your status:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong className="text-emerald-400">Rolling:</strong> Your location is visible to other drivers</li>
                                <li><strong className="text-sky-400">Parked:</strong> Your location is slightly obscured for privacy</li>
                                <li><strong className="text-rose-400">Waiting:</strong> Your location at facilities is visible to help other drivers</li>
                            </ul>
                            <p>
                                See our <Link href="/privacy" className="text-sky-400 hover:text-sky-300">Privacy Policy</Link> for
                                more details on how we handle location data.
                            </p>
                        </div>
                    </section>

                    {/* Disclaimer */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Disclaimer of Warranties</h2>
                        <div className="space-y-4 text-slate-300">
                            <p className="uppercase text-sm font-medium text-slate-400">
                                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
                                EITHER EXPRESS OR IMPLIED.
                            </p>
                            <p>
                                We do not guarantee the accuracy, reliability, or completeness of any information provided
                                by other users. User-submitted status updates and ratings reflect individual experiences
                                and may not be accurate.
                            </p>
                            <p>
                                The Service is not a substitute for professional judgment. Always verify conditions yourself
                                and drive safely.
                            </p>
                        </div>
                    </section>

                    {/* Limitation of Liability */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">6. Limitation of Liability</h2>
                        <div className="space-y-4 text-slate-300">
                            <p>
                                To the maximum extent permitted by law, Logixtecs Solutions LLC and its officers, directors, employees,
                                and agents shall not be liable for any indirect, incidental, special, consequential, or punitive
                                damages arising from your use of the Service.
                            </p>
                            <p>
                                Our total liability for any claims under these Terms shall not exceed the amount you paid us
                                (if any) in the 12 months preceding the claim.
                            </p>
                        </div>
                    </section>

                    {/* Termination */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">7. Termination</h2>
                        <div className="space-y-4 text-slate-300">
                            <p>
                                We may terminate or suspend your account and access to the Service at our sole discretion,
                                without prior notice, for conduct that we believe violates these Terms or is harmful to
                                other users, us, or third parties.
                            </p>
                            <p>
                                You may delete your account at any time through your profile settings. Upon deletion,
                                your data will be removed as described in our Privacy Policy.
                            </p>
                        </div>
                    </section>

                    {/* Changes */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">8. Changes to Terms</h2>
                        <div className="space-y-4 text-slate-300">
                            <p>
                                We reserve the right to modify these Terms at any time. We will notify users of significant
                                changes by posting a notice on the Service or sending an email.
                            </p>
                            <p>
                                Continued use of the Service after changes constitutes acceptance of the new Terms.
                            </p>
                        </div>
                    </section>

                    {/* Governing Law */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">9. Governing Law</h2>
                        <div className="space-y-4 text-slate-300">
                            <p>
                                These Terms shall be governed by and construed in accordance with the laws of the United States,
                                without regard to conflict of law principles.
                            </p>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="bg-slate-900/50 p-6 md:p-8 rounded-2xl border border-slate-800">
                        <h2 className="text-xl font-bold text-white mb-4">Contact Us</h2>
                        <p className="text-slate-300 leading-relaxed mb-4">
                            If you have any questions about these Terms, please contact us:
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
