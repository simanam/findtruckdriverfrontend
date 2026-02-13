"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Loader2, ArrowRight, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { GlobalMapLayer } from "@/components/map/GlobalMapLayer";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Forgot password state
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetSent, setResetSent] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [resetError, setResetError] = useState<string | null>(null);

    const handleGoogleSignIn = async () => {
        setError(null);
        try {
            const { error: googleError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (googleError) {
                setError(googleError.message);
            }
        } catch (err: any) {
            setError(err.message || "Failed to sign in with Google");
        }
    };

    const handleEmailLogin = async () => {
        setError(null);
        if (!email || !email.includes('@')) {
            setError("Please enter a valid email address");
            return;
        }
        if (!password || password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            const response = await api.auth.login(email, password);

            // Store tokens
            api.setTokens(response.tokens.access_token, response.tokens.refresh_token);

            // Check if driver profile exists
            if (response.driver) {
                router.push('/map');
            } else {
                // No driver profile, need onboarding
                router.push('/join');
            }
        } catch (err: any) {
            setError(err.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        setResetError(null);
        if (!resetEmail || !resetEmail.includes('@')) {
            setResetError("Please enter a valid email address");
            return;
        }

        setResetLoading(true);
        try {
            await api.auth.resetPassword(resetEmail);
            setResetSent(true);
        } catch (err: any) {
            setResetError(err.message || "Failed to send reset email");
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <main className="relative w-full h-screen overflow-hidden">
            <GlobalMapLayer />
            <OnboardingLayout
                step={1}
                totalSteps={1}
                title={showForgotPassword ? "Reset Password" : "Welcome Back"}
                subtitle={showForgotPassword ? "Enter your email to receive a reset link" : "Log in to get back on the road"}
                onClose={() => router.push('/')}
                centeredMode={true}
            >
                <div className="space-y-6">
                    {showForgotPassword ? (
                        // Forgot Password Form
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            {resetSent ? (
                                <div className="text-center space-y-4 py-4">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                                    <div>
                                        <p className="text-white font-medium">Check your email</p>
                                        <p className="text-slate-400 text-sm mt-1">
                                            We sent a password reset link to <span className="text-white">{resetEmail}</span>
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowForgotPassword(false);
                                            setResetSent(false);
                                            setResetEmail("");
                                        }}
                                        className="text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors"
                                    >
                                        Back to login
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400">Email Address</label>
                                        <div className="flex gap-3">
                                            <div className="flex items-center justify-center px-4 bg-slate-900 border border-slate-700/50 rounded-xl text-slate-400 font-medium">
                                                <Mail className="w-5 h-5 text-slate-500" />
                                            </div>
                                            <input
                                                type="email"
                                                value={resetEmail}
                                                onChange={(e) => setResetEmail(e.target.value)}
                                                placeholder="driver@example.com"
                                                className="flex-1 bg-slate-900 border border-slate-700/50 text-white px-4 py-3 rounded-xl outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600"
                                                onKeyDown={(e) => e.key === 'Enter' && handleForgotPassword()}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleForgotPassword}
                                        disabled={resetLoading}
                                        className="w-full bg-sky-500 hover:bg-sky-400 text-white py-3 rounded-xl font-semibold shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {resetLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                                        <span>Send Reset Link</span>
                                    </button>

                                    {resetError && (
                                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm text-center">
                                            {resetError}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => {
                                            setShowForgotPassword(false);
                                            setResetError(null);
                                        }}
                                        className="w-full py-2 text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-2 text-sm"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        <span>Back to login</span>
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        // Main Login Form
                        <div className="space-y-4">
                            {/* Google Sign-In */}
                            <button
                                onClick={handleGoogleSignIn}
                                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 py-3 rounded-xl font-semibold shadow-lg transition-all"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span>Continue with Google</span>
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-px bg-slate-700/50" />
                                <span className="text-xs text-slate-500 font-medium uppercase">or</span>
                                <div className="flex-1 h-px bg-slate-700/50" />
                            </div>

                            {/* Email Input */}
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

                            {/* Password Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Password</label>
                                <div className="flex gap-3">
                                    <div className="flex items-center justify-center px-4 bg-slate-900 border border-slate-700/50 rounded-xl text-slate-400 font-medium">
                                        <Lock className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <div className="flex-1 relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            className="w-full bg-slate-900 border border-slate-700/50 text-white px-4 py-3 pr-10 rounded-xl outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600"
                                            onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin()}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Forgot Password Link */}
                            <div className="text-right">
                                <button
                                    onClick={() => {
                                        setShowForgotPassword(true);
                                        setResetEmail(email);
                                        setError(null);
                                    }}
                                    className="text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            {/* Login Button */}
                            <button
                                onClick={handleEmailLogin}
                                disabled={loading}
                                className="w-full bg-sky-500 hover:bg-sky-400 text-white py-3 rounded-xl font-semibold shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                                <span>Log In</span>
                            </button>

                            {/* Sign Up Link */}
                            <p className="text-center text-sm text-slate-500">
                                Don't have an account?{" "}
                                <button
                                    onClick={() => router.push('/join')}
                                    className="text-sky-400 hover:text-sky-300 font-medium transition-colors"
                                >
                                    Join the Map
                                </button>
                            </p>
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
