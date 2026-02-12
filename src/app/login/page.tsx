"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Loader2, Send, ArrowRight, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { GlobalMapLayer } from "@/components/map/GlobalMapLayer";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSendCode = async () => {
        setError(null);
        if (!email || !email.includes('@')) {
            setError("Please enter a valid email address");
            return;
        }

        setLoading(true);
        try {
            await api.auth.requestEmailOTP(email);
            setShowOtp(true);
        } catch (err: any) {
            setError(err.message || "Failed to send code");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        setError(null);
        setLoading(true);
        try {
            const response = await api.auth.verifyEmailOTP(email, otp);

            // Store tokens
            api.setTokens(response.tokens.access_token, response.tokens.refresh_token);

            // Authentication successful
            // Redirect to map - map page will handle profile fetching
            router.push('/map');

        } catch (err: any) {
            setError(err.message || "Invalid code");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative w-full h-screen overflow-hidden">
            <GlobalMapLayer />
            <OnboardingLayout
                step={1}
                totalSteps={1}
                title="Welcome Back"
                subtitle="Log in to get back on the road"
                onClose={() => router.push('/')}
                centeredMode={true}
            >
                <div className="space-y-6">
                {!showOtp ? (
                    // Email Input
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Email Address</label>
                            <div className="flex gap-3">
                                <div className="flex items-center justify-center px-4 bg-slate-900 border border-slate-700/50 rounded-xl text-slate-400 font-medium">
                                    <Mail className="w-5 h-5 text-slate-500" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="driver@example.com"
                                    className="flex-1 bg-slate-900 border border-slate-700/50 text-white px-4 py-3 rounded-xl outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSendCode}
                            disabled={loading}
                            className="w-full bg-sky-500 hover:bg-sky-400 text-white py-3 rounded-xl font-semibold shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            <span>Send Code</span>
                        </button>
                    </div>
                ) : (
                    // OTP Input
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center mb-4">
                            <p className="text-slate-400 text-sm">Code sent to <span className="text-white font-medium">{email}</span></p>
                            <button onClick={() => setShowOtp(false)} className="text-xs text-sky-400 hover:underline mt-1">Change email</button>
                        </div>

                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="123456"
                            className="w-full bg-slate-900 border border-slate-700/50 text-white text-center text-2xl tracking-widest px-4 py-3 rounded-xl outline-none focus:border-sky-500 transition-colors uppercase"
                            maxLength={6}
                        />

                        <button
                            onClick={handleVerify}
                            disabled={loading || otp.length < 6}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-3 rounded-xl font-semibold shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                            <span>Login to Map</span>
                        </button>
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm text-center">
                        {error}
                    </div>
                )}
                </div>
            </OnboardingLayout>
        </main>
    );
}
