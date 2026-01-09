"use client";

import { LiveStatsBar } from "@/components/stats/LiveStatsBar";
import { NearbyAlert } from "@/components/stats/NearbyAlert";
import { Navbar } from "@/components/layout/Navbar";
import { StatusSelector } from "@/components/onboarding/StatusSelector";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useEffect } from "react";
import { api } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const { setStep } = useOnboardingStore();

  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      try {
        await api.auth.getMe();
        // If no error, we are logged in
        router.push('/map');
      } catch (e) {
        // Not logged in, stay here
      }
    };
    checkSession();
  }, [router]);

  // Intercept the status selection
  const handleStatusSelect = async () => {
    // Double check session before starting onboarding
    try {
      await api.auth.getMe();
      router.push('/map');
      return;
    } catch (e) {
      // Not logged in, proceed
    }

    // The store is updated by the component, we just need to navigate
    // Wait a tick for store update or rely on the store state in /join
    setStep(2); // Skip step 1 since they just did it
    router.push('/join');
  };

  return (
    <main className="relative w-full h-screen overflow-hidden">
      {/* 1. Header Layer */}
      <Navbar />

      {/* 2. Floating Stats Layer (Top Center) */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 w-max pointer-events-none">
        <div className="pointer-events-auto">
          <LiveStatsBar />
        </div>
      </div>

      {/* 3. Status Selector (Bottom Center - Primary Action) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 w-full flex justify-center" onClickCapture={handleStatusSelect}>
        <StatusSelector />
      </div>

      {/* 4. Map Layer (Now handled Globally) */}
    </main>
  );
}
