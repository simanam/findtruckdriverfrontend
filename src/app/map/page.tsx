"use client";


import { LiveStatsBar } from "@/components/stats/LiveStatsBar";
import { LocationManager } from "@/components/map/LocationManager";
import { FollowUpModal } from "@/components/map/FollowUpModal";
import { Menu } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useEffect } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function MapPage() {
    const { avatarId, status, setAvatarId, setStatus, setHandle } = useOnboardingStore();
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
                // Not logged in -> Redirect home
                router.push('/');
            }
        };

        checkUser();
    }, [avatarId, router, setAvatarId, setStatus, setHandle]);

    return (
        <main className="relative w-full h-screen overflow-hidden">


            <LocationManager />
            <FollowUpModal />

            {/* Map Layer - Handled Globally */}
        </main>
    );
}
