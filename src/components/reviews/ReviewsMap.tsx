"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Star } from "lucide-react";
import { TYPE_CONFIG } from "./FacilityCard";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface ReviewsMapProps {
    facilities: any[];
    onSelect: (facility: any) => void;
}

export function ReviewsMap({ facilities, onSelect }: ReviewsMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = new mapboxgl.Map({
            container: containerRef.current,
            style: "mapbox://styles/mapbox/dark-v11",
            center: [-98.5, 39.8], // Center of US
            zoom: 3.5,
            maxPitch: 0,
        });

        map.addControl(new mapboxgl.NavigationControl(), "bottom-right");
        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Update markers when facilities change
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Remove old markers
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        // Filter facilities with coordinates
        const withCoords = facilities.filter((f) => f.latitude && f.longitude);

        if (withCoords.length === 0) return;

        // Add markers
        withCoords.forEach((facility) => {
            const el = document.createElement("div");
            el.className = "reviews-map-marker";
            el.style.cursor = "pointer";

            const typeInfo = TYPE_CONFIG[facility.facility_type] || TYPE_CONFIG.other;
            const hasReviews = facility.total_reviews > 0;
            const rating = hasReviews ? facility.avg_overall_rating : null;

            // Build marker HTML
            el.innerHTML = `
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    background: rgba(15, 23, 42, 0.9);
                    border: 1px solid rgba(51, 65, 85, 0.5);
                    border-radius: 8px;
                    padding: 4px 8px;
                    white-space: nowrap;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                    transform: translate(-50%, -100%);
                ">
                    <span style="font-size: 10px; font-weight: 600; color: ${hasReviews ? '#fbbf24' : '#94a3b8'};">
                        ${hasReviews ? `★ ${rating}` : '●'}
                    </span>
                    <span style="font-size: 10px; color: #e2e8f0; max-width: 100px; overflow: hidden; text-overflow: ellipsis;">
                        ${facility.name}
                    </span>
                    ${facility.total_reviews > 0 ? `<span style="font-size: 9px; color: #64748b;">(${facility.total_reviews})</span>` : ''}
                </div>
            `;

            el.addEventListener("click", () => onSelect(facility));

            const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
                .setLngLat([facility.longitude, facility.latitude])
                .addTo(map);

            markersRef.current.push(marker);
        });

        // Fit bounds to show all markers
        if (withCoords.length === 1) {
            map.flyTo({
                center: [withCoords[0].longitude, withCoords[0].latitude],
                zoom: 13,
                duration: 800,
            });
        } else if (withCoords.length > 1) {
            const bounds = new mapboxgl.LngLatBounds();
            withCoords.forEach((f) => bounds.extend([f.longitude, f.latitude]));
            map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 800 });
        }
    }, [facilities, onSelect]);

    return (
        <div
            ref={containerRef}
            className="h-[60vh] rounded-xl overflow-hidden border border-slate-800/50"
        />
    );
}
