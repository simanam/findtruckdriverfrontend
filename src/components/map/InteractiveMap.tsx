"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { cn } from "@/lib/utils";

// Make sure to add your token to .env.local
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface InteractiveMapProps {
    className?: string;
}

export function InteractiveMap({ className }: InteractiveMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [lng, setLng] = useState(-98.5795); // Center of US
    const [lat, setLat] = useState(39.8283);
    const [zoom, setZoom] = useState(3.5);

    useEffect(() => {
        if (map.current) return; // initialize map only once
        if (!mapContainer.current) return;

        if (!mapboxgl.accessToken) {
            console.error("Mapbox token not found");
            return;
        }

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/dark-v11", // Dark mode for premium feel
            center: [-100, 50], // Centered on North America (US + Canada)
            zoom: 3, // Zoomed out to see both
            minZoom: 2.5, // Prevent zooming out too far
            maxBounds: [
                [-180, 10], // Southwest coordinates (Pacific/Mexico border)
                [-40, 85]   // Northeast coordinates (Atlantic/Arctic)
            ],
            attributionControl: false,
            projection: { name: 'globe' } as any, // Type cast for older types
        });

        // Add atmosphere and stars
        map.current.on('style.load', () => {
            map.current?.setFog({
                'color': 'rgb(8, 10, 15)', // Lower atmosphere (dark)
                'high-color': 'rgb(14, 25, 45)', // Upper atmosphere (blueish)
                'horizon-blend': 0.05,
                'space-color': 'rgb(2, 4, 15)', // Deep space
                'star-intensity': 0.5 // Stars
            });
        });

        // Try to fly to user location on load
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                map.current?.flyTo({
                    center: [position.coords.longitude, position.coords.latitude],
                    zoom: 9, // Street level view
                    essential: true,
                    duration: 3000 // Smooth flight
                });

                // Add a marker for the user
                new mapboxgl.Marker({ color: "#22d3ee" }) // Cyan marker
                    .setLngLat([position.coords.longitude, position.coords.latitude])
                    .addTo(map.current!);
            }, (error) => {
                console.log("Location access denied or error:", error);
            });
        }

        map.current.addControl(new mapboxgl.AttributionControl(), "bottom-right");

        map.current.on("move", () => {
            if (!map.current) return;
            setLng(parseFloat(map.current.getCenter().lng.toFixed(4)));
            setLat(parseFloat(map.current.getCenter().lat.toFixed(4)));
            setZoom(parseFloat(map.current.getZoom().toFixed(2)));
        });

        // Cleanup
        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []); // Initialize only once

    return (
        <div className={cn("relative w-full h-full", className)}>
            <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
            {/* Overlay gradient for UI visibility if needed */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 to-transparent h-32" />
        </div>
    );
}
