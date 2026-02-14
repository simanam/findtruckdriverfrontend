import { useState, useEffect } from 'react';
import { DriverStatus } from '@/components/ui/StatusDot';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useDetentionStore } from '@/stores/detentionStore';
import { api } from '@/lib/api';

export interface DetentionMapData {
    current_user: {
        driver_id: string;
        handle: string;
        avatar_id: string;
        status: DriverStatus;
        location: [number, number];
        updated_at: string;
    } | null;
    facilities: any[];
    heatmapData: { latitude: number; longitude: number; weight: number }[];
}

export function useDetentionMapData(viewport: { zoom: number; latitude: number; longitude: number }) {
    const [data, setData] = useState<DetentionMapData>({ current_user: null, facilities: [], heatmapData: [] });
    const [isLoading, setIsLoading] = useState(false);
    const { status, lastLocationUpdate } = useOnboardingStore();
    const { activeSession } = useDetentionStore();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // 1. Get current user location
                let currentUser = null;
                try {
                    const res = await api.locations.getMe();
                    if (res && res.latitude && res.longitude) {
                        currentUser = {
                            ...res,
                            location: [res.longitude, res.latitude] as [number, number]
                        };
                    }
                } catch (e) {
                    try {
                        const driver = await api.drivers.getMe();
                        const d = driver.driver || driver;
                        if (d && d.latitude && d.longitude) {
                            currentUser = {
                                ...d,
                                location: [d.longitude, d.latitude] as [number, number]
                            };
                        }
                    } catch (err) {
                        console.warn("Could not fetch current user location", err);
                    }
                }

                // 2. Fetch nearby reviewed facilities with detention data
                let facilities: any[] = [];
                const { latitude, longitude, zoom } = viewport;

                // Only fetch nearby facilities at street-level zoom (clean map otherwise)
                if (zoom >= 14) {
                    try {
                        const facilityRes = await api.reviews.getNearby({
                            lat: latitude,
                            lng: longitude,
                            radius: 5,
                            limit: 15,
                        });
                        facilities = (facilityRes.facilities || []).map((f: any) => ({
                            ...f,
                            location: f.latitude && f.longitude ? [f.longitude, f.latitude] : null
                        })).filter((f: any) => f.location);
                    } catch (e) {
                        console.warn("Could not fetch nearby facilities", e);
                    }
                }

                // 3. Fetch heatmap data
                let heatmapData: any[] = [];
                try {
                    const heatmapRes = await api.detention.getHeatmap({
                        latitude,
                        longitude,
                        radius_miles: 500
                    });
                    heatmapData = heatmapRes.facilities || [];
                } catch (e) {
                    console.warn("Could not fetch heatmap data", e);
                }

                setData({
                    current_user: currentUser,
                    facilities,
                    heatmapData
                });
            } catch (err) {
                console.error("Detention map fetch failed", err);
            } finally {
                setIsLoading(false);
            }
        };

        // Debounce
        const timer = setTimeout(fetchData, 500);
        return () => clearTimeout(timer);
    }, [viewport.latitude, viewport.longitude, viewport.zoom, status, lastLocationUpdate, activeSession?.id]);

    return { data, isLoading };
}
