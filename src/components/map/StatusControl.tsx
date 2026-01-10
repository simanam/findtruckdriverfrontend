"use client";

import { useState } from "react";
import { useOnboardingStore, DriverStatus } from "@/stores/onboardingStore";
import { api } from "@/lib/api";
import { ConfirmationToast, ToastData } from "@/components/ui/ConfirmationToast";
import { MapPin, Truck, Activity, ParkingSquare, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatusControl() {
    const { status, setStatus } = useOnboardingStore();
    const [isUpdating, setIsUpdating] = useState(false);
    const [toast, setToast] = useState<ToastData | null>(null);

    const statusConfig = {
        rolling: { label: "Rolling", icon: Truck, emoji: "🟢", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
        waiting: { label: "Waiting", icon: Activity, emoji: "🔴", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
        parked: { label: "Parked", icon: ParkingSquare, emoji: "🔵", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" }
    };

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

    const handleCheckIn = async () => {
        if (isUpdating) return;
        setIsUpdating(true);
        try {
            const position = await getCurrentLocation();
            const { latitude, longitude, heading, speed } = position.coords;

            // Using check-in endpoint
            await api.drivers.updateLocation({
                latitude, longitude, heading: heading || 0, speed: speed || 0
            });

            setToast({
                type: "success",
                title: "Checked In!",
                message: `You're visible on the map as ${statusConfig[status || 'parked'].label}`,
                subtext: "Location updated just now"
            });
        } catch (e) {
            console.error("Check-in failed", e);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleStatusChange = async (newStatus: DriverStatus) => {
        if (newStatus === status) {
            handleCheckIn();
            return;
        }

        setIsUpdating(true);
        try {
            // Update status (backend usually updates location too if we send it, but the simple endpoint might just take status)
            // Let's assume updateStatus handles it or we need to check specs. 
            // src/lib/api.ts impl: updateStatus only sends { status }. 
            // Ideally we should send location too. 
            // For now, let's call updateStatus then checkIn to fail-safe, or just updateStatus if backend handles it.

            await api.drivers.updateStatus(newStatus);
            setStatus(newStatus);

            setToast({
                type: "success",
                title: "Status Updated",
                message: `${statusConfig[newStatus].emoji} Now ${statusConfig[newStatus].label}`,
                subtext: "Broadcasting to other drivers..."
            });

            // Trigger location update too to ensure map placement is fresh
            handleCheckIn();

        } catch (e) {
            console.error("Status update failed", e);
        } finally {
            setIsUpdating(false);
        }
    };

    if (!status) return null;

    return (
        <>
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-4 pointer-events-none">
                <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-4 shadow-2xl pointer-events-auto space-y-4">

                    {/* Status Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                        {(['rolling', 'waiting', 'parked'] as const).map((s) => {
                            const isActive = status === s;
                            const config = statusConfig[s];
                            const Icon = config.icon;

                            return (
                                <button
                                    key={s}
                                    onClick={() => handleStatusChange(s)}
                                    disabled={isUpdating}
                                    className={cn(
                                        "relative flex flex-col items-center justify-center gap-1 py-3 rounded-2xl transition-all duration-200 border",
                                        isActive
                                            ? cn(config.bg, config.border, config.color, "shadow-lg scale-105 z-10")
                                            : "bg-slate-800/50 border-transparent text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                                    )}
                                >
                                    <Icon className={cn("w-5 h-5", isActive && "animate-pulse")} />
                                    <span className="text-[10px] uppercase font-bold tracking-wider">{config.label}</span>
                                    {isActive && (
                                        <div className="absolute top-1 right-1">
                                            <span className="relative flex h-2 w-2">
                                                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", config.bg.replace('/10', ''))}></span>
                                                <span className={cn("relative inline-flex rounded-full h-2 w-2", config.color.replace('text-', 'bg-'))}></span>
                                            </span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Check In Button */}
                    <button
                        onClick={handleCheckIn}
                        disabled={isUpdating}
                        className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition-colors border border-slate-700 active:scale-95"
                    >
                        {isUpdating ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : <MapPin className="w-5 h-5 text-sky-400" />}
                        <span>{isUpdating ? "Updating..." : "Check In"}</span>
                    </button>

                </div>
            </div>

            {toast && <ConfirmationToast toast={toast} onClose={() => setToast(null)} />}
        </>
    );
}
