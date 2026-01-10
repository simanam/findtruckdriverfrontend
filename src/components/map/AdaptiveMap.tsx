"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMapData, ViewType } from '@/hooks/useMapData';
import { NationalLayer } from './layers/NationalLayer';
import { ClusterLayer } from './layers/ClusterLayer';
import { FacilityLayer } from './layers/FacilityLayer';
import { FacilityCardLayer } from './layers/FacilityCardLayer';
import { DriverLayer } from './layers/DriverLayer';
import { CurrentUserMarker } from './markers/CurrentUserMarker';
import { cn } from '@/lib/utils';
import { Crosshair, Loader2 } from 'lucide-react';
import { WeatherStatsBar } from './WeatherStatsBar';
import { LiveStatsBar } from '@/components/stats/LiveStatsBar';
import { MapProvider } from './MapContext';
import { useOnboardingStore, DriverStatus } from '@/stores/onboardingStore';
import { api } from '@/lib/api';
import { useDriverAction } from '@/hooks/useDriverAction';

// Token setup
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface AdaptiveMapProps {
    className?: string;
}

export function AdaptiveMap({ className }: AdaptiveMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
    const { status, avatarId, handle } = useOnboardingStore();
    const { updateStatus } = useDriverAction();

    // Viewport state to drive logic
    const [viewport, setViewport] = useState({
        latitude: 36.7,
        longitude: -119.7,
        zoom: 4
    });

    const [viewType, setViewType] = useState<ViewType>('national');

    // Determine view type based on zoom
    useEffect(() => {
        if (viewport.zoom <= 4.5) setViewType('national');
        else if (viewport.zoom <= 8.5) setViewType('state');
        else if (viewport.zoom <= 12.5) setViewType('metro');
        else setViewType('local');
    }, [viewport.zoom]);

    // Fetch appropriate data for current view
    const { data, isLoading } = useMapData(viewport, viewType);

    // Initialize Map
    useEffect(() => {
        if (mapInstance || !mapContainer.current) return;

        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/dark-v11",
            center: [viewport.longitude, viewport.latitude],
            zoom: viewport.zoom,
            maxPitch: 60,
            projection: { name: 'globe' } as any
        });

        // Add controls
        map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

        // Update viewport only when movement ends to reduce re-renders and API calls
        map.on('moveend', () => {
            setViewport({
                longitude: map.getCenter().lng,
                latitude: map.getCenter().lat,
                zoom: map.getZoom()
            });
        });

        // Fog
        map.on('style.load', () => {
            map.setFog({
                'color': 'rgb(8, 10, 15)',
                'high-color': 'rgb(14, 25, 45)',
                'horizon-blend': 0.05,
                'space-color': 'rgb(2, 4, 15)',
                'star-intensity': 0.5
            });
        });

        setMapInstance(map);

        return () => {
            map.remove();
        };
    }, []);


    // Fly to user's location
    const flyToUser = useCallback((zoomLevel?: number) => {
        if (data?.current_user?.location && mapInstance) {
            // Default to street level (14) if no zoom provided (standard "Find Me" behavior)
            const targetZoom = zoomLevel || 14;

            mapInstance.flyTo({
                center: data.current_user.location,
                zoom: targetZoom,
                duration: 2000,
                essential: true
            });
        }
    }, [data?.current_user, mapInstance]);

    // Initial Fly-To (User or Geolocation)
    const hasFlown = useRef(false);
    useEffect(() => {
        // 1. If we have a logged-in user with location, fly there
        if (data?.current_user?.location && mapInstance && !hasFlown.current) {
            flyToUser(7);
            hasFlown.current = true;
            return;
        }

        // 2. If NO logged-in user, try to get geolocation to center map relevantly
        // This ensures "ghost" reuse of previous sessions or just better UX
        if (!data?.current_user && mapInstance && !hasFlown.current) {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;

                        mapInstance.flyTo({
                            center: [longitude, latitude],
                            zoom: 7, // State level view
                            duration: 2000,
                            essential: true
                        });
                        hasFlown.current = true;
                    },
                    (error) => {
                        console.log("Geolocation denied or error, staying at default center", error);
                        // Optional: we could fly to a default useful spot here if needed
                    }
                );
            }
        }
    }, [data?.current_user, mapInstance, flyToUser]);

    // Handle User Click - Toggle Status
    const handleUserClick = useCallback(async () => {
        flyToUser(14);

        // Cycle status: rolling -> waiting -> parked -> rolling
        const nextStatus: DriverStatus =
            status === 'rolling' ? 'waiting' :
                status === 'waiting' ? 'parked' : 'rolling';

        // API update with follow-up support
        try {
            await updateStatus(nextStatus);
        } catch (e) {
            console.error("Failed to update status", e);
        }
    }, [status, updateStatus, flyToUser]);

    // Check if user is visible in current aggregates
    const userInCluster = data?.clusters?.some(c => c.includes_current_user);
    const userInFacility = data?.facilities?.some(f => f.includes_current_user);

    // Should we show floating "You are here" marker?
    const showFloatingUser = data?.current_user && !userInCluster && !userInFacility;

    return (
        <div className={cn("relative w-full h-full bg-slate-950", className)}>
            <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

            <MapProvider value={{ map: mapInstance }}>
                {/* --- LAYERS --- */}
                {viewType === 'national' && (
                    <NationalLayer regions={data?.regions} />
                )}

                {viewType === 'state' && (
                    <>
                        <ClusterLayer clusters={data?.clusters} />
                        <DriverLayer drivers={data?.drivers} />
                    </>
                )}

                {viewType === 'metro' && (
                    <>
                        <FacilityLayer facilities={data?.facilities} />
                        <DriverLayer drivers={data?.drivers} />
                    </>
                )}

                {viewType === 'local' && (
                    <>
                        <FacilityCardLayer facilities={data?.facilities} />
                        <DriverLayer drivers={data?.drivers} />
                    </>
                )}

                {/* --- USER MARKER --- */}
                {showFloatingUser && data.current_user && data.current_user.location && (
                    <CurrentUserMarker
                        user={{
                            ...data.current_user,
                            // Override with local state if available for instant feedback
                            avatar_id: avatarId || data.current_user.avatar_id,
                            handle: handle || data.current_user.handle,
                            status: status || data.current_user.status
                        }}
                        onClick={handleUserClick}
                    />
                )}
            </MapProvider>

            {/* --- HUD CONTROLS --- */}

            {/* View Indicator */}


            {/* Find Me Button */}
            <button
                onClick={() => flyToUser(14)}
                className="absolute bottom-28 right-3 bg-yellow-400 text-black p-3 rounded-full shadow-lg hover:scale-110 transition-transform z-10 font-bold flex items-center gap-2 group"
                aria-label="Find Me"
            >
                <Crosshair className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">Find Me</span>
            </button>

            {/* Top Center Stats Stack */}
            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 w-full max-w-fit px-4 flex flex-col items-center">
                <LiveStatsBar />
                <WeatherStatsBar latitude={viewport.latitude} longitude={viewport.longitude} />
            </div>
        </div>
    );
}
