"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useDetentionMapData } from '@/hooks/useDetentionMapData';
import { DetentionHeatmapLayer } from './layers/DetentionHeatmapLayer';
import { DetentionFacilityLayer } from './layers/DetentionFacilityLayer';
import { CurrentUserMarker } from './markers/CurrentUserMarker';
import { FacilityDetailPopup } from './FacilityDetailPopup';
import { DetentionSearchBar } from './DetentionSearchBar';
import { cn } from '@/lib/utils';
import { Crosshair } from 'lucide-react';
import { MapProvider } from './MapContext';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useDetentionStore } from '@/stores/detentionStore';

// Token setup
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface AdaptiveMapProps {
    className?: string;
}

// Haversine distance calculation (client-side)
function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // Earth radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function AdaptiveMap({ className }: AdaptiveMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
    const { status, avatarId, handle } = useOnboardingStore();
    const { activeSession, setFacilityPopupOpen } = useDetentionStore();

    // Selected facility for detail popup
    const [selectedFacility, setSelectedFacility] = useState<any>(null);

    // Viewport state to drive logic
    const [viewport, setViewport] = useState({
        latitude: 36.7,
        longitude: -119.7,
        zoom: 4
    });

    // Fetch detention-specific map data
    const { data, isLoading } = useDetentionMapData(viewport);

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
            const targetZoom = zoomLevel || 14;
            mapInstance.flyTo({
                center: data.current_user.location,
                zoom: targetZoom,
                duration: 2000,
                essential: true
            });
        }
    }, [data?.current_user, mapInstance]);

    // Fly to a specific location
    const flyToLocation = useCallback((lng: number, lat: number, zoom?: number) => {
        if (mapInstance) {
            mapInstance.flyTo({
                center: [lng, lat],
                zoom: zoom || 13,
                duration: 1500,
                essential: true
            });
        }
    }, [mapInstance]);

    // Initial Fly-To (User or Geolocation)
    const hasFlown = useRef(false);
    useEffect(() => {
        if (data?.current_user?.location && mapInstance && !hasFlown.current) {
            flyToUser(10);
            hasFlown.current = true;
            return;
        }

        if (!data?.current_user && mapInstance && !hasFlown.current) {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        mapInstance.flyTo({
                            center: [longitude, latitude],
                            zoom: 10,
                            duration: 2000,
                            essential: true
                        });
                        hasFlown.current = true;
                    },
                    () => {
                        // Stay at default center
                    }
                );
            }
        }
    }, [data?.current_user, mapInstance, flyToUser]);

    // Handle facility selection from map marker
    const handleFacilitySelect = useCallback((facility: any) => {
        setSelectedFacility(facility);
        setFacilityPopupOpen(true);
        if (facility.location) {
            flyToLocation(facility.location[0], facility.location[1], 14);
        }
    }, [flyToLocation, setFacilityPopupOpen]);

    // Handle search result selection (fly to facility)
    const handleSearchSelect = useCallback((facility: any) => {
        if (facility.latitude && facility.longitude) {
            flyToLocation(facility.longitude, facility.latitude, 14);
            // Also open the detail popup
            setSelectedFacility({
                ...facility,
                location: [facility.longitude, facility.latitude]
            });
            setFacilityPopupOpen(true);
        }
    }, [flyToLocation, setFacilityPopupOpen]);

    // Calculate user distance to selected facility
    const userDistanceToSelected = selectedFacility && data?.current_user?.location
        ? calcDistance(
            data.current_user.location[1], data.current_user.location[0],
            selectedFacility.location?.[1] || selectedFacility.latitude,
            selectedFacility.location?.[0] || selectedFacility.longitude
        )
        : undefined;

    return (
        <div className={cn("relative w-full h-full bg-slate-950", className)}>
            <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

            <MapProvider value={{ map: mapInstance }}>
                {/* Detention Heatmap Layer (rendered via Mapbox native layer) */}
                <DetentionHeatmapLayer map={mapInstance} data={data?.heatmapData} />

                {/* Facility markers with detention data */}
                <DetentionFacilityLayer
                    facilities={data?.facilities}
                    onFacilitySelect={handleFacilitySelect}
                />

                {/* Current user marker (always shown) */}
                {data?.current_user?.location && (
                    <CurrentUserMarker
                        user={{
                            ...data.current_user,
                            avatar_id: avatarId || data.current_user.avatar_id,
                            handle: handle || data.current_user.handle,
                            status: status || data.current_user.status
                        }}
                        onClick={() => flyToUser(14)}
                    />
                )}
            </MapProvider>

            {/* --- HUD CONTROLS --- */}

            {/* Top: Title + Search Bar */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4">
                {!activeSession && !selectedFacility && (
                    <p className="text-center text-white/60 text-[11px] font-medium tracking-wide uppercase mb-2">
                        Track &amp; Calculate Your Detention
                    </p>
                )}
                <DetentionSearchBar onFacilitySelect={handleSearchSelect} />
            </div>

            {/* Find Me Button */}
            <button
                onClick={() => flyToUser(14)}
                className="absolute bottom-48 right-3 bg-yellow-400 text-black p-3 rounded-full shadow-lg hover:scale-110 transition-transform z-10 font-bold flex items-center gap-2 group"
                aria-label="Find Me"
            >
                <Crosshair className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">Find Me</span>
            </button>

            {/* Facility Detail Popup */}
            {selectedFacility && (
                <FacilityDetailPopup
                    facility={selectedFacility}
                    userDistance={userDistanceToSelected}
                    onClose={() => {
                        setSelectedFacility(null);
                        setFacilityPopupOpen(false);
                    }}
                />
            )}
        </div>
    );
}
