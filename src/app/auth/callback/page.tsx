"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Supabase extracts the session from the URL hash automatically
                const { data, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    setError(sessionError.message);
                    return;
                }

                if (!data.session) {
                    setError("No session found. Please try signing in again.");
                    return;
                }

                // Save tokens to API client
                api.setTokens(
                    data.session.access_token,
                    data.session.refresh_token
                );

                // Check if the user has a driver profile
                try {
                    const driver = await api.drivers.getMe();
                    if (driver && driver.handle) {
                        // Has profile, go to map
                        router.replace('/map');
                        return;
                    }
                } catch {
                    // No profile, needs onboarding
                }

                // Check if the caller wants to redirect somewhere specific
                const next = searchParams.get('next');
                if (next === 'join') {
                    router.replace('/join');
                } else {
                    // Default: no profile means onboarding
                    router.replace('/join');
                }
            } catch (err: any) {
                setError(err.message || "Authentication failed");
            }
        };

        handleCallback();
    }, [router, searchParams]);

    return (
        <main className="w-full h-screen bg-slate-950 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                {error ? (
                    <div className="max-w-sm text-center space-y-4">
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
                            {error}
                        </div>
                        <button
                            onClick={() => router.push('/login')}
                            className="text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors"
                        >
                            Back to Login
                        </button>
                    </div>
                ) : (
                    <>
                        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
                        <p className="text-slate-400 text-sm">Completing sign in...</p>
                    </>
                )}
            </div>
        </main>
    );
}
