"use client";

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
    <main className="relative w-full min-h-dvh flex flex-col">
      {/* 1. Header Layer */}
      <Navbar />

      {/* 2. Hero Layer - Flex grow to push status selector down */}
      {/* Stats bar is provided by GlobalMapLayer -> AdaptiveMap */}
      <div className="flex-1 flex items-center justify-center pt-32 pb-4 px-4">
        <div className="text-center w-full max-w-3xl pointer-events-none select-none">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white drop-shadow-2xl mb-6 md:mb-8 tracking-tighter">
            Truckers helping <span className="text-sky-400">truckers</span>.
          </h1>

          <div className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-4 text-base sm:text-lg md:text-2xl font-bold text-slate-100 drop-shadow-xl opacity-90 my-4 md:my-6 leading-snug">
            <p className="animate-in slide-in-from-bottom-4 fade-in duration-700 delay-100 whitespace-nowrap">Check in.</p>
            <span className="hidden md:inline text-sky-400">•</span>
            <p className="animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200 whitespace-nowrap">Share what you see.</p>
            <span className="hidden md:inline text-sky-400">•</span>
            <p className="animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300 whitespace-nowrap">See what others share.</p>
          </div>

          {/* Small single line subtext */}
          <p className="text-xs sm:text-sm md:text-lg font-medium text-slate-300 drop-shadow-md opacity-80 animate-in slide-in-from-bottom-2 fade-in duration-700 delay-500">
            Parking full? • Wait too long? • Spot sketchy?
          </p>
        </div>
      </div>

      {/* 3. Status Selector (Bottom - Primary Action with safe area) */}
      <div className="w-full flex justify-center pointer-events-auto z-50 pb-6 mb-[env(safe-area-inset-bottom)]" onClickCapture={handleStatusSelect}>
        <StatusSelector />
      </div>

      {/* 4. Map Layer (Now handled Globally via layout) */}
    </main>
  );
}
