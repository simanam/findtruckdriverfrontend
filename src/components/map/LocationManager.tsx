"use client";

import { useEffect, useCallback, useState } from "react";
import { api } from "@/lib/api";
import { useOnboardingStore, DriverStatus } from "@/stores/onboardingStore";
import { StatusPrompt } from "./StatusPrompt";

export function LocationManager() {
    const { status, setStatus, setLastLocationUpdate } = useOnboardingStore();
    const [promptData, setPromptData] = useState<{ message: string; suggestedStatus?: string } | null>(null);

    // Helper to get location
    const getCurrentLocation = (): Promise<GeolocationPosition> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation not supported"));
                return;
            }
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        });
    };

    // Handle App Open / Focus Check
    const handleAppOpen = useCallback(async () => {
        if (!status) return;
        try {
            const position = await getCurrentLocation();
            const { latitude, longitude, accuracy, heading, speed } = position.coords;

            const res = await api.drivers.appOpen({
                latitude,
                longitude,
                heading: heading || 0,
                speed: speed || 0,
                accuracy
            });

            if (res.action === 'prompt_status') {
                setPromptData({
                    message: res.message,
                    suggestedStatus: res.suggested_status
                });
            } else {
                console.log("✅ App Open: Silent Update", res.current_status);
                // Trigger map refresh
                setLastLocationUpdate(Date.now());
            }
        } catch (err) {
            console.error("Failed to process app open:", err);
        }
    }, [status]);

    // Handle Background Interval Check-in
    const handleBackgroundCheckIn = useCallback(async () => {
        if (!status) return;
        try {
            const position = await getCurrentLocation();
            const { latitude, longitude, accuracy, heading, speed } = position.coords;

            await api.drivers.updateLocation({
                latitude,
                longitude,
                heading: heading || 0,
                speed: speed || 0,
                accuracy
            });

            console.log("📍 Background location updated:", latitude, longitude);
            setLastLocationUpdate(Date.now());
        } catch (err) {
            console.error("Failed to update background location:", err);
        }
    }, [status]);

    // 1. Initial Load
    useEffect(() => {
        if (status) {
            handleAppOpen();
        }
    }, [status, handleAppOpen]);

    // 2. Set up interval (every 5 minutes)
    useEffect(() => {
        if (!status) return;
        const intervalId = setInterval(handleBackgroundCheckIn, 5 * 60 * 1000);
        return () => clearInterval(intervalId);
    }, [status, handleBackgroundCheckIn]);

    // 3. Handle Visibility Change (App Focus)
    useEffect(() => {
        if (!status) return;

        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                console.log("👀 App in focus - checking status...");
                handleAppOpen();
            }
        };

        document.addEventListener('visibilitychange', onVisibilityChange);
        return () => document.removeEventListener('visibilitychange', onVisibilityChange);
    }, [status, handleAppOpen]);

    if (!promptData) return null;

    return (
        <StatusPrompt
            message={promptData.message}
            suggestedStatus={promptData.suggestedStatus}
            onClose={() => setPromptData(null)}
            onUpdate={(newStatus) => {
                setStatus(newStatus);
                setPromptData(null);
            }}
        />
    );
}
