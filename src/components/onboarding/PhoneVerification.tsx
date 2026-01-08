"use client";

import { useOnboardingStore } from "@/stores/onboardingStore";
import { cn } from "@/lib/utils";
import { ArrowLeft, Loader2, Send, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { supabase, isConfigured } from "@/lib/supabase";

// Removed local initialization

export function PhoneVerification() {
    const { phone, setPhone, setStep } = useOnboardingStore();

    const [loading, setLoading] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSendCode = async () => {
        setError(null);
        if (phone.length < 10) {
            setError("Please enter a valid phone number");
            return;
        }

        setLoading(true);
        try {
            // Prepend +1 for US/Canada numbers to match E.164 format
            // This ensures it matches the Supabase Test Phone Number (e.g. +15551234567)
            const formattedPhone = phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`;

            const { error: supabaseError } = await supabase.auth.signInWithOtp({
                phone: formattedPhone,
            });

            if (supabaseError) throw supabaseError;
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
            const formattedPhone = phone.startsWith('+') ? phone : `+1${phone.replace(/\D/g, '')}`;

            const { data, error: supabaseError } = await supabase.auth.verifyOtp({
                phone: formattedPhone,
                token: otp,
                type: 'sms',
            });

            if (supabaseError) throw supabaseError;

            // Create driver profile
            if (data.session?.user) {
                const { error: profileError } = await supabase
                    .from('drivers')
                    .insert({
                        user_id: data.session.user.id,
                        handle: useOnboardingStore.getState().handle,
                        avatar_id: useOnboardingStore.getState().avatarId,
                        status: useOnboardingStore.getState().status,
                    });

                if (profileError) {
                    console.error("Profile creation failed:", profileError);
                    // Ignore unique constraint (23505) for idempotent re-runs
                    if (profileError.code !== '23505') {
                        throw new Error("Failed to create driver profile");
                    }
                }
            }

            // Success! Redirect to map
            window.location.href = '/map';
        } catch (err: any) {
            setError(err.message || "Invalid code");
        } finally {
            setLoading(false);
        }
    };

    // const isConfigured = !supabase.supabaseUrl.includes('placeholder'); // REPLACED by import
    // Actually, since I am importing isConfigured now, I don't need to define it here.
    // However, I need to make sure the import is correct at the top of the file.
    // Let me check imports first.


    return (
        <div className="space-y-6">
            {!isConfigured && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200 text-sm animate-in fade-in">
                    <h3 className="font-bold flex items-center gap-2">
                        ⚠️ Setup Required
                    </h3>
                    <p className="mt-1 opacity-80">
                        The app is using a placeholder URL.
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-amber-200/70">
                        <li>Check <code>.env.local</code> has your Supabase URL.</li>
                        <li>Restart the terminal with <code>npm run dev</code>.</li>
                    </ul>
                </div>
            )}

            {!showOtp ? (
                // Phone Input State
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Mobile Number</label>
                        <div className="flex gap-3">
                            <div className="flex items-center justify-center px-4 bg-slate-900 border border-slate-700/50 rounded-xl text-slate-400 font-medium">
                                +1
                            </div>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="(555) 123-4567"
                                className="flex-1 bg-slate-900 border border-slate-700/50 text-white px-4 py-3 rounded-xl outline-none focus:border-sky-500 transition-colors placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSendCode}
                        disabled={loading || !isConfigured}
                        className="w-full bg-sky-500 hover:bg-sky-400 text-white py-3 rounded-xl font-semibold shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span>Send Code</span>
                    </button>
                </div>
            ) : (
                // OTP Input State
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="text-center mb-4">
                        <p className="text-slate-400 text-sm">Code sent to <span className="text-white font-medium">{phone}</span></p>
                        <button onClick={() => setShowOtp(false)} className="text-xs text-sky-400 hover:underline mt-1">Change number</button>
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
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        <span>Verify & Join</span>
                    </button>
                </div>
            )}

            {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm text-center">
                    {error}
                </div>
            )}

            {!showOtp && (
                <button
                    onClick={() => setStep(3)}
                    className="w-full py-2 text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                </button>
            )}
        </div>
    );
}
