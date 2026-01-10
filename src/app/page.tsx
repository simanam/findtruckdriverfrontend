"use client";

import { LiveStatsBar } from "@/components/stats/LiveStatsBar";
import { NearbyAlert } from "@/components/stats/NearbyAlert";
import { Navbar } from "@/components/layout/Navbar";
import { StatusSelector } from "@/components/onboarding/StatusSelector";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useEffect, useState } from "react";
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

      {/* 2.5 Hero Layer */}
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 text-center w-full max-w-3xl px-4 pointer-events-none select-none">
        <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-2xl mb-8 tracking-tighter">
          Truckers helping <span className="text-sky-400">truckers</span>.
        </h1>

        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-lg md:text-2xl font-bold text-slate-100 drop-shadow-xl opacity-90 my-6 leading-snug">
          <p className="animate-in slide-in-from-bottom-4 fade-in duration-700 delay-100 whitespace-nowrap">Check in.</p>
          <span className="hidden md:inline text-sky-400">•</span>
          <p className="animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200 whitespace-nowrap">Share what you see.</p>
          <span className="hidden md:inline text-sky-400">•</span>
          <p className="animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300 whitespace-nowrap">See what others share.</p>
        </div>

        {/* Small single line subtext */}
        <p className="text-sm md:text-lg font-medium text-slate-300 drop-shadow-md opacity-80 whitespace-nowrap animate-in slide-in-from-bottom-2 fade-in duration-700 delay-500">
          Parking full? &bull; Wait too long? &bull; Spot sketchy?
        </p>
      </div>

      {/* 3. Status Selector (Bottom Center - Primary Action) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 w-full flex justify-center pointer-events-auto" onClickCapture={handleStatusSelect}>
        <StatusSelector />
      </div>

      {/* 4. Map Layer (Now handled Globally) */}
    </main>
  );
}
