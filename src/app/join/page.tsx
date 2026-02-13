"use client";

import { useOnboardingStore } from "@/stores/onboardingStore";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { RoleSelector } from "@/components/onboarding/RoleSelector";
import { StatusSelector } from "@/components/onboarding/StatusSelector";
import { AvatarBuilder } from "@/components/onboarding/AvatarBuilder";
import { CBHandleInput } from "@/components/onboarding/CBHandleInput";
import { HandleInput } from "@/components/onboarding/HandleInput";
import { GlobalMapLayer } from "@/components/map/GlobalMapLayer";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function JoinPage() {
    const router = useRouter();
    const { step, status, role, cbHandle, setStep, setRole, setCbHandle } = useOnboardingStore();

    // Auth state: 0 = auth screen, 1+ = onboarding steps
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    // Auth form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check if user is already authenticated on mount
    useEffect(() => {
        const checkAuth = async () => {
            if (api.isLoggedIn) {
                // Already logged in, check if they have a profile
                try {
                    const driver = await api.drivers.getMe();
                    if (driver && driver.handle) {
                        // Already has profile, go to map
                        router.push('/map');
                        return;
                    }
                } catch {
                    // No profile yet, proceed with onboarding
                }
                setIsAuthenticated(true);
                // Start onboarding at step 1 (Role)
                if (step < 1) setStep(1);
            }
            setAuthLoading(false);
        };
        checkAuth();
    }, [router, setStep, step]);

    // Skip status step if status is already selected (from landing page)
    useEffect(() => {
        if (isAuthenticated && step === 2 && status) {
            setStep(3);
        }
    }, [step, status, setStep, isAuthenticated]);

    const handleGoogleSignIn = async () => {
        setError(null);
        try {
            const { error: googleError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=join`,
                },
            });
            if (googleError) {
                setError(googleError.message);
            }
        } catch (err: any) {
            setError(err.message || "Failed to sign in with Google");
        }
    };

    const handleEmailSignup = async () => {
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
            const response = await api.auth.signup(email, password);

            // Store tokens
            api.setTokens(response.tokens.access_token, response.tokens.refresh_token);

            // If user already has a driver profile, go to map
            if (response.driver) {
                router.push('/map');
                return;
            }

            // Proceed to onboarding
            setIsAuthenticated(true);
            setStep(1);
        } catch (err: any) {
            setError(err.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <main className="relative w-full h-screen overflow-hidden">
                <GlobalMapLayer />
                <div className="relative z-50 w-full h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
                </div>
            </main>
        );
    }

    // Auth screen (before onboarding)
    if (!isAuthenticated) {
        return (
            <main className="relative w-full h-screen overflow-hidden">
                <GlobalMapLayer />
                <OnboardingLayout
                    title="Join the Map"
                    subtitle="Create your account to get started"
                    step={0}
                    totalSteps={5}
                    onClose={() => (window.location.href = '/')}
                    centeredMode={true}
                >
                    <div className="space-y-5">
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
                                        placeholder="Create a password (min 6 chars)"
                                        className="w-full bg-slate-900 border border-slate-700/50 text-white px-4 py-3 pr-10 rounded-xl outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600"
                                        onKeyDown={(e) => e.key === 'Enter' && handleEmailSignup()}
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

                        {/* Sign Up Button */}
                        <button
                            onClick={handleEmailSignup}
                            disabled={loading}
                            className="w-full bg-sky-500 hover:bg-sky-400 text-white py-3 rounded-xl font-semibold shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                            <span>Create Account</span>
                        </button>

                        {/* Login Link */}
                        <p className="text-center text-sm text-slate-500">
                            Already have an account?{" "}
                            <button
                                onClick={() => router.push('/login')}
                                className="text-sky-400 hover:text-sky-300 font-medium transition-colors"
                            >
                                Log in
                            </button>
                        </p>

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

    // Onboarding flow (after auth)
    // Steps: 1=Role, 2=Status, 3=Avatar, 4=CB Handle, 5=Handle
    const getStepData = () => {
        switch (step) {
            case 1:
                return {
                    title: "What's your role?",
                    subtitle: "Tell us what you do in the industry.",
                    component: (
                        <RoleSelector
                            onSelect={(selectedRole) => {
                                setRole(selectedRole);
                                setStep(2);
                            }}
                            selectedRole={role}
                        />
                    ),
                };
            case 2:
                return {
                    title: "What's your status?",
                    subtitle: "Let others know so they can plan.",
                    component: <StatusSelector />,
                };
            case 3:
                return {
                    title: "Style your Driver",
                    subtitle: "Customize your look on the map.",
                    component: <AvatarBuilder />,
                };
            case 4:
                return {
                    title: "Pick your CB Handle",
                    subtitle: "Your trucker identity on the radio waves.",
                    component: (
                        <div className="space-y-5">
                            <CBHandleInput
                                onSelect={(selectedCbHandle) => {
                                    setCbHandle(selectedCbHandle);
                                }}
                                selectedHandle={cbHandle}
                            />
                            <button
                                onClick={() => setStep(5)}
                                disabled={!cbHandle}
                                className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white py-3 rounded-xl font-semibold shadow-lg shadow-sky-500/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <span>Next</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    ),
                };
            case 5:
                return {
                    title: "Choose a handle",
                    subtitle: "Keep it anonymous, driver.",
                    component: <HandleInput />,
                };
            default:
                return { title: "", subtitle: "", component: null };
        }
    };

    const { title, subtitle, component } = getStepData();

    return (
        <main className="relative w-full h-screen overflow-hidden">
            <GlobalMapLayer />
            <OnboardingLayout
                title={title}
                subtitle={subtitle}
                step={step}
                totalSteps={5}
                onClose={() => (window.location.href = '/')}
            >
                {component}
            </OnboardingLayout>
        </main>
    );
}
