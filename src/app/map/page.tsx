"use client";

import { LocationManager } from "@/components/map/LocationManager";
import { FollowUpModal } from "@/components/map/FollowUpModal";
import { GlobalMapLayer } from "@/components/map/GlobalMapLayer";
import { DetentionControl } from "@/components/map/DetentionControl";
import { ManualCheckoutModal } from "@/components/map/ManualCheckoutModal";
import { DetentionProofGenerator } from "@/components/detention/DetentionProofGenerator";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useDetentionStore } from "@/stores/detentionStore";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function MapPage() {
    const { avatarId, status, setAvatarId, setStatus, setHandle } = useOnboardingStore();
    const { autoCheckoutAlert, setAutoCheckoutAlert } = useDetentionStore();
    const [proofSessionId, setProofSessionId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            try {
                // 1. Verify Session
                await api.auth.getMe();

                // 2. Hydrate Profile if missing in store
                if (!avatarId) {
                    try {
                        const driver = await api.drivers.getMe();
                        if (driver && driver.handle) {
                            setAvatarId(driver.avatar_id);
                            setStatus(driver.status);
                            setHandle(driver.handle);
                        }
                    } catch (e) {
                        // No profile? Maybe redirect to onboarding or let them chill
                        console.warn("User logged in but no profile found");
                    }
                }
            } catch (error) {
                // Not logged in -> Redirect to join
                router.push('/join');
            }
        };

        checkUser();
    }, [avatarId, router, setAvatarId, setStatus, setHandle]);

    return (
        <main className="relative w-full h-screen overflow-hidden">
            <GlobalMapLayer />
            <LocationManager />
            <FollowUpModal />
            <DetentionControl onGenerateProof={(id) => setProofSessionId(id)} />
            {autoCheckoutAlert && (
                <ManualCheckoutModal
                    alert={autoCheckoutAlert}
                    onClose={() => setAutoCheckoutAlert(null)}
                />
            )}
            {proofSessionId && (
                <DetentionProofGenerator
                    sessionId={proofSessionId}
                    onClose={() => setProofSessionId(null)}
                />
            )}
        </main>
    );
}
