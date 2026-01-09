"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMapData, ViewType } from '@/hooks/useMapData';
import { NationalLayer } from './layers/NationalLayer';
import { ClusterLayer } from './layers/ClusterLayer';
import { FacilityLayer } from './layers/FacilityLayer';
import { FacilityCardLayer } from './layers/FacilityCardLayer';
import { CurrentUserMarker } from './markers/CurrentUserMarker';
import { cn } from '@/lib/utils';
import { Loader2, Crosshair } from 'lucide-react';
import { MapProvider } from './MapContext';
import { useOnboardingStore, DriverStatus } from '@/stores/onboardingStore';
import { api } from '@/lib/api';

// Token setup
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface AdaptiveMapProps {
    className?: string;
}

export function AdaptiveMap({ className }: AdaptiveMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
    const { status, setStatus } = useOnboardingStore();

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

        map.on('move', () => {
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
    const flyToUser = useCallback(() => {
        if (data?.current_user?.location && mapInstance) {
            // Different zoom targets based on current state
            const targetZoom = viewType === 'local' ? 14 : 12;

            mapInstance.flyTo({
                center: data.current_user.location,
                zoom: targetZoom,
                duration: 2000,
                essential: true
            });
        }
    }, [data?.current_user, viewType, mapInstance]);

    // Handle User Click - Toggle Status
    const handleUserClick = useCallback(async () => {
        flyToUser();

        // Cycle status: rolling -> waiting -> parked -> rolling
        const nextStatus: DriverStatus =
            status === 'rolling' ? 'waiting' :
                status === 'waiting' ? 'parked' : 'rolling';

        // Optimistic update
        setStatus(nextStatus);

        // API update
        try {
            await api.drivers.updateStatus(nextStatus);
        } catch (e) {
            console.error("Failed to update status", e);
            // Revert? setStatus(prevStatus) - skipping for MVP
        }
    }, [status, setStatus, flyToUser]);

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
                    <ClusterLayer clusters={data?.clusters} />
                )}

                {viewType === 'metro' && (
                    <FacilityLayer facilities={data?.facilities} />
                )}

                {viewType === 'local' && (
                    <FacilityCardLayer facilities={data?.facilities} />
                )}

                {/* --- USER MARKER --- */}
                {showFloatingUser && data.current_user && (
                    <CurrentUserMarker
                        user={data?.current_user}
                        onClick={handleUserClick}
                    />
                )}
            </MapProvider>

            {/* --- HUD CONTROLS --- */}

            {/* View Indicator */}
            <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur border border-slate-700 text-slate-400 text-xs px-3 py-1.5 rounded-full uppercase tracking-widest font-bold shadow-lg z-10 flex items-center gap-2 pointer-events-none">
                <span className={cn("w-2 h-2 rounded-full", isLoading ? "bg-yellow-400 animate-pulse" : "bg-emerald-500")} />
                {viewType} VIEW
            </div>

            {/* Find Me Button */}
            <button
                onClick={flyToUser}
                className="absolute bottom-28 right-3 bg-yellow-400 text-black p-3 rounded-full shadow-lg hover:scale-110 transition-transform z-10 font-bold flex items-center gap-2 group"
                aria-label="Find Me"
            >
                <Crosshair className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">Find Me</span>
            </button>
        </div>
    );
}
