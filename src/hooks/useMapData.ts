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
    drivers?: any[]; // Drivers for local view
}

export function useMapData(viewport: { zoom: number; latitude: number; longitude: number }, viewType: ViewType) {
    const [data, setData] = useState<MapData>({ current_user: null });
    const [isLoading, setIsLoading] = useState(false);
    const { avatarId, status, handle, lastLocationUpdate } = useOnboardingStore();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // 1. Get Current User (Always visible)
                let currentUser = null;
                try {
                    // Use the enhanced locations/me endpoint as requested
                    const res = await api.locations.getMe();
                    if (res && res.latitude && res.longitude) {
                        currentUser = {
                            ...res,
                            location: [res.longitude, res.latitude]
                        };
                    }
                } catch (e) {
                    // Fallback to drivers/me if locations/me fails
                    try {
                        const driver = await api.drivers.getMe();
                        // The drivers/me endpoint might return nested driver object or direct
                        const d = driver.driver || driver;
                        if (d && d.latitude && d.longitude) {
                            currentUser = {
                                ...d,
                                location: [d.longitude, d.latitude]
                            };
                        } else if (d && d.location && Array.isArray(d.location)) {
                            // Already in array format?
                            currentUser = d;
                        }
                    } catch (err) {
                        console.warn("Could not fetch current user location", err);
                    }
                }

                // 2. Fetch View Data
                let regions: any[] = [];
                let clusters: any[] = [];
                let facilities: any[] = [];
                let drivers: any[] = [];

                const { latitude, longitude, zoom } = viewport;

                // Calculate rough bounding box
                const earthRadius = 3960; // miles
                const radius_miles = 300 / Math.pow(2, zoom - 4); // Scale radius with zoom
                const latDelta = (radius_miles / earthRadius) * (180 / Math.PI);
                const lngDelta = (radius_miles / earthRadius) * (180 / Math.PI) / Math.cos(latitude * Math.PI / 180);

                const bounds = {
                    min_lat: latitude - latDelta,
                    max_lat: latitude + latDelta,
                    min_lng: longitude - lngDelta,
                    max_lng: longitude + lngDelta,
                };

                if (viewType === 'national') {
                    // Keep national view empty for now or specific stats logic
                    regions = [];
                } else {
                    // New logic for non-national views:
                    // 1. Get all drivers in bounds
                    const driversRes = await api.map.getDrivers(bounds);
                    let allDrivers = driversRes.drivers || [];

                    // 2. Filter out self
                    if (currentUser && currentUser.driver_id) {
                        allDrivers = allDrivers.filter((d: any) => d.driver_id !== currentUser.driver_id);
                    }

                    // 3. Decide: Drivers or Clusters?
                    // If drivers count < 10 or if zoomed in enough (e.g., zoom > 10), show individual drivers.
                    // Otherwise, show clusters.
                    const showIndividualDriversThreshold = 10;
                    const zoomLevelForIndividualDrivers = 10; // Example threshold

                    if (allDrivers.length < showIndividualDriversThreshold || zoom > zoomLevelForIndividualDrivers) {
                        // Option 1: Show individual drivers
                        drivers = allDrivers.map((d: any) => ({
                            ...d,
                            location: d.location || { latitude: d.latitude, longitude: d.longitude }
                        }));
                    } else {
                        // Option 2: Too many drivers, fetch clusters
                        // Note: getClusters uses radius, not bounds. We'll estimate radius.
                        const { clusters: apiClusters } = await api.map.getClusters({
                            latitude,
                            longitude,
                            radius_miles: radius_miles || 50,
                            min_drivers: 2
                        });

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

                    // Also fetch hotspots if we are in metro/local view for facilities
                    if (viewType === 'metro' || viewType === 'local') {
                        const { hotspots } = await api.map.getHotspots({
                            latitude, longitude, radius_miles: 50
                        });

                        facilities = hotspots.map((h: any) => ({
                            id: h.id,
                            name: h.name,
                            type: h.type,
                            location: [h.longitude, h.latitude],
                            includes_current_user: false,
                            avatar_ring: h.drivers || [],
                            counts: { rolling: 0, waiting: h.drivers_waiting, parked: 0 },
                            total: h.drivers_waiting,
                            display_text: `+${h.drivers_waiting}`,
                            is_hotspot: true
                        }));
                    }
                }

                setData({
                    current_user: currentUser,
                    regions,
                    clusters,
                    facilities,
                    // Add raw drivers to the data object
                    // Note: We need to update the interface to support 'drivers'
                    drivers: drivers as any
                });

            } catch (err) {
                console.error("Map fetch failed", err);
            } finally {
                setIsLoading(false);
            }
        };

        // Debounce the fetch to prevent spamming the backend
        const timer = setTimeout(() => {
            fetchData();
        }, 500);

        return () => clearTimeout(timer);
    }, [viewType, viewport.latitude, viewport.longitude, viewport.zoom, status, lastLocationUpdate]);

    return { data, isLoading };
}
