"use client";

import { AdaptiveMap } from "@/components/map/AdaptiveMap";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePathname } from "next/navigation";

export function GlobalMapLayer() {
    const { avatarId, status, setAvatarId, setStatus, setHandle } = useOnboardingStore();
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Optional: Hydrate on mount globally? 
        // For now, we rely on map/page.tsx to hydrate, but we could do it here to show avatar everywhere.
        // Let's keep hydration in map page for now to avoid premature auth checks on public pages.
    }, []);

    if (!isMounted) return null;

    // Determine if we should show the 'blur' effect based on route/state
    // Actually, blurring is better handled by the page layouts overlaying the map.
    // This component just renders the crisp map.

    return (
        <div className="fixed inset-0 z-0 pointer-events-auto">
            <AdaptiveMap className="w-full h-full" />
        </div>
    );
}
