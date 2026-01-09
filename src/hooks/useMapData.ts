import { useState, useEffect } from 'react';
import { DriverStatus } from '@/components/ui/StatusDot';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { api } from '@/lib/api';

// Types matching the backend/docs
export type ViewType = 'national' | 'state' | 'metro' | 'local';

export interface MapData {
    current_user: {
        driver_id: string;
        handle: string;
        avatar_id: string;
        status: DriverStatus;
        location: [number, number];
        updated_at: string;
    } | null;
    regions?: any[];
    corridors?: any[];
    clusters?: any[];
    facilities?: any[];
}

export function useMapData(viewport: { zoom: number; latitude: number; longitude: number }, viewType: ViewType) {
    const [data, setData] = useState<MapData>({ current_user: null });
    const [isLoading, setIsLoading] = useState(false);
    const { avatarId, status, handle } = useOnboardingStore();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // 1. Get Current User (to show "You" and check inclusions)
                let currentUser = null;
                try {
                    const { driver } = await api.drivers.getMe();
                    currentUser = driver; // driver object should match shape or need mapping
                } catch (e) {
                    // Not logged in or error
                    // Fallback to local store for optimistic UI if verified logic fails? 
                    // For now, if getMe fails, we assume no user.
                }

                // 2. Fetch View Data
                let regions: any[] = [];
                let clusters: any[] = [];
                let facilities: any[] = [];

                const { latitude, longitude, zoom } = viewport;
                // Basic radius logic based on zoom (approximate)
                const radiusCoords = 300 / Math.pow(2, zoom - 4); // rough heuristic

                if (viewType === 'national') {
                    // Fetch stats for regions
                    // API doesn't strictly have a "getRegions" endpoint, so we might stick to mock 
                    // OR use getClusters with huge radius?
                    // Let's stick to mock for national stats for MVP as backend doesn't list /map/regions
                    regions = [
                        { geohash: "9q", center: [-119.4, 36.7], counts: { rolling: 800, waiting: 400, parked: 600 }, total: 1800 },
                        { geohash: "dr", center: [-74.0, 40.7], counts: { rolling: 1200, waiting: 200, parked: 900 }, total: 2300 },
                        { geohash: "9v", center: [-96.8, 32.7], counts: { rolling: 500, waiting: 100, parked: 300 }, total: 900 },
                    ];
                }
                else if (viewType === 'state') {
                    const { clusters: apiClusters } = await api.map.getClusters({
                        latitude, longitude, radius_miles: 200 // broad search
                    });

                    // Map API clusters to UI format
                    clusters = apiClusters.map((c: any) => ({
                        geohash: c.geohash,
                        center: [c.longitude, c.latitude],
                        name: c.location_name || "Cluster",
                        includes_current_user: c.driver_ids?.includes(currentUser?.driver_id),
                        hero: c.hero_driver ? { ...c.hero_driver, status: c.hero_driver.status || 'rolling' } : null,
                        counts: c.status_counts,
                        total: c.total_drivers,
                        display_text: `+${c.total_drivers}`,
                        is_hotspot: c.total_drivers > 50
                    }));
                }
                else if (viewType === 'metro' || viewType === 'local') {
                    // Fetch Hotspots (Facilities)
                    const { hotspots } = await api.map.getHotspots({
                        latitude, longitude, radius_miles: 50
                    });

                    // Fetch Individual Drivers? 
                    // For facility view, we usually show the "Avatar Ring" which implies knowing WHO is there.
                    // The getHotspots API might need to return `drivers` inside it. 
                    // If not, we might need to getDrivers and group them manually.
                    // Assuming getHotspots returns rich data for MVP.

                    facilities = hotspots.map((h: any) => ({
                        id: h.id,
                        name: h.name,
                        type: h.type,
                        location: [h.longitude, h.latitude],
                        includes_current_user: false, // need backend check
                        avatar_ring: h.drivers || [], // Assuming backend returns some drivers
                        counts: { rolling: 0, waiting: h.drivers_waiting, parked: 0 },
                        total: h.drivers_waiting,
                        display_text: `+${h.drivers_waiting}`,
                        is_hotspot: true
                    }));
                }

                setData({
                    current_user: currentUser,
                    regions,
                    clusters,
                    facilities
                });

            } catch (err) {
                console.error("Map fetch failed", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [viewType, viewport.latitude, viewport.longitude, viewport.zoom]);

    return { data, isLoading };
}
