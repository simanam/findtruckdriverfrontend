"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { useMap } from "./MapContext";
import { createPortal } from "react-dom";

interface MapMarkerProps {
    longitude: number;
    latitude: number;
    children: React.ReactNode;
    onClick?: (e?: any) => void;
    anchor?: string; // dummy for compatibility with react-map-gl prop
}

export function MapMarker({ longitude, latitude, children, onClick }: MapMarkerProps) {
    const { map } = useMap();
    const markerRef = useRef<mapboxgl.Marker | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Create container element once
    if (!containerRef.current) {
        if (typeof document !== 'undefined') {
            containerRef.current = document.createElement('div');
            // Ensure interactions work
            containerRef.current.style.pointerEvents = 'auto';
            if (onClick) {
                containerRef.current.addEventListener('click', (e) => {
                    onClick(e);
                });
            }
        }
    }

    useEffect(() => {
        if (!map || !containerRef.current) return;

        const marker = new mapboxgl.Marker({
            element: containerRef.current
        })
            .setLngLat([longitude, latitude])
            .addTo(map);

        markerRef.current = marker;

        return () => {
            marker.remove();
        };
    }, [map]); // Re-create if map changes (should be stable)

    // Update position if props change
    useEffect(() => {
        markerRef.current?.setLngLat([longitude, latitude]);
    }, [longitude, latitude]);

    if (!containerRef.current) return null;

    return createPortal(children, containerRef.current);
}
