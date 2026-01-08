"use client";

import { InteractiveMap } from "@/components/map/InteractiveMap";
import { LiveStatsBar } from "@/components/stats/LiveStatsBar";
import { NearbyAlert } from "@/components/stats/NearbyAlert";
import { Navbar } from "@/components/layout/Navbar";
import { StatusSelector } from "@/components/onboarding/StatusSelector";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/stores/onboardingStore";

export default function Home() {
  const router = useRouter();
  const { setStep } = useOnboardingStore();

  // Intercept the status selection to redirect to /join
  const handleStatusSelect = () => {
    // The store is updated by the component, we just need to navigate
    // Wait a tick for store update or rely on the store state in /join
    setStep(2); // Skip step 1 since they just did it
    router.push('/join');
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-slate-950">
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

      {/* 4. Map Layer (Background) */}
      <div className="absolute inset-0 z-0">
        <InteractiveMap />
      </div>
    </main>
  );
}
