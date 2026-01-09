"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { cn } from "@/lib/utils";

// Make sure to add your token to .env.local
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface InteractiveMapProps {
    className?: string;
    userAvatar?: string;
    userStatus?: 'rolling' | 'waiting' | 'parked';
}

export function InteractiveMap({ className, userAvatar, userStatus }: InteractiveMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const userMarker = useRef<mapboxgl.Marker | null>(null);
    const [lng, setLng] = useState(-98.5795);
    const [lat, setLat] = useState(39.8283);
    const [zoom, setZoom] = useState(3.5);

    // Track user's actual geolocation
    const [userLocation, setUserLocation] = useState<{ lng: number, lat: number } | null>(null);

    // Track session start for "Time Online"
    const [startTime] = useState(new Date());

    // Dynamic marker element creator
    const createMarkerElement = (avatar: string, status: string, isUser: boolean = false) => {
        const container = document.createElement('div');
        container.className = 'relative flex items-center justify-center'; // Center container

        // Pulsing Ring for User
        if (isUser) {
            const ring = document.createElement('div');
            ring.className = 'absolute w-full h-full rounded-full animate-ping opacity-75';
            // Status Colors matching the app theme
            const ringColor = status === 'rolling' ? 'bg-emerald-500' :
                status === 'waiting' ? 'bg-rose-500' :
                    status === 'parked' ? 'bg-sky-500' : 'bg-slate-500';
            ring.classList.add(ringColor);
            // Make ring larger than marker
            ring.style.width = '150%';
            ring.style.height = '150%';
            container.appendChild(ring);
        }

        const el = document.createElement('div');
        el.className = 'relative w-12 h-12 rounded-full border-4 shadow-xl overflow-hidden cursor-pointer hover:scale-110 transition-transform duration-200 z-10';

        // Status Colors matching the app theme
        const borderColor = status === 'rolling' ? 'border-emerald-500' :
            status === 'waiting' ? 'border-rose-500' :
                status === 'parked' ? 'border-sky-500' : 'border-slate-500';

        el.classList.add(borderColor.split(' ')[0]); // Add specific color class
        el.style.borderColor = status === 'rolling' ? '#10b981' :
            status === 'waiting' ? '#f43f5e' :
                status === 'parked' ? '#0ea5e9' : '#ffffff';

        // User specific glow
        if (isUser) {
            el.className += ' shadow-[0_0_15px_rgba(255,255,255,0.5)]';
        }

        const img = document.createElement('img');
        img.src = avatar;
        img.className = 'w-full h-full object-cover bg-slate-800';
        el.appendChild(img);

        container.appendChild(el);
        return container;
    };

    useEffect(() => {
        if (map.current) return;
        if (!mapContainer.current) return;

        if (!mapboxgl.accessToken) {
            console.error("Mapbox token not found");
            return;
        }

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/dark-v11",
            center: [-100, 50],
            zoom: 3,
            minZoom: 2.5,
            maxBounds: [[-180, 10], [-40, 85]],
            attributionControl: false,
            projection: { name: 'globe' } as any,
        });

        map.current.on('style.load', () => {
            map.current?.setFog({
                'color': 'rgb(8, 10, 15)',
                'high-color': 'rgb(14, 25, 45)',
                'horizon-blend': 0.05,
                'space-color': 'rgb(2, 4, 15)',
                'star-intensity': 0.5
            });
        });

        // Geolocation & Marker Logic
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { longitude, latitude } = position.coords;

                // Store actual user location
                setUserLocation({ lng: longitude, lat: latitude });

                map.current?.flyTo({
                    center: [longitude, latitude],
                    zoom: 4, // Regional/Multi-state level view
                    essential: true,
                    duration: 3000
                });

                // Remove existing marker if any
                if (userMarker.current) userMarker.current.remove();

                if (userAvatar && userStatus) {
                    // Custom Avatar Marker with User Effects
                    const el = createMarkerElement(userAvatar, userStatus, true); // isUser = true

                    // Create Popup
                    const popup = new mapboxgl.Popup({
                        offset: 25,
                        closeButton: false,
                        closeOnClick: false,
                        className: 'user-popup'
                    }).setHTML(`
                        <div class="px-3 py-2 text-slate-900">
                            <h3 class="font-bold text-sm">You are here</h3>
                            <p class="text-xs opacity-75">Active just now</p>
                        </div>
                    `);

                    // Add hover listeners
                    el.addEventListener('mouseenter', () => userMarker.current?.getPopup()?.addTo(map.current!));
                    el.addEventListener('mouseleave', () => userMarker.current?.getPopup()?.remove());

                    userMarker.current = new mapboxgl.Marker({ element: el })
                        .setLngLat([longitude, latitude])
                        .setPopup(popup)
                        .addTo(map.current!);
                } else {
                    // Default Dot Marker
                    userMarker.current = new mapboxgl.Marker({ color: "#22d3ee", scale: 0.8 })
                        .setLngLat([longitude, latitude])
                        .addTo(map.current!);
                }

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

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []); // Init

    // Fake User Data
    const fakeDrivers = [
        { id: 1, lat: 34.0522, lng: -118.2437, status: 'rolling', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix', detail: 'Rolling Southbound on I-5' }, // LA
        { id: 2, lat: 40.7128, lng: -74.0060, status: 'parked', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka', detail: 'On 34-hour reset. Do not disturb.' }, // NYC
        { id: 3, lat: 41.8781, lng: -87.6298, status: 'waiting', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Bob', detail: 'Waiting at Walmart DC for 6 hours' }, // Chicago
        { id: 4, lat: 29.7604, lng: -95.3698, status: 'rolling', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Jack', detail: 'Rolling West on I-10' }, // Houston
        { id: 5, lat: 33.4484, lng: -112.0740, status: 'rolling', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Milo', detail: 'En route to Phoenix Sky Harbor' }, // Phoenix
        { id: 6, lat: 39.9526, lng: -75.1652, status: 'waiting', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Liliane', detail: 'Loading at Sysco Facility' }, // Philly
        { id: 7, lat: 29.4241, lng: -98.4936, status: 'parked', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sasha', detail: 'Sleeper berth time. Zzz...' }, // San Antonio
        { id: 8, lat: 32.7157, lng: -117.1611, status: 'rolling', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Oliver', detail: 'Heading North on I-15' }, // San Diego
        { id: 9, lat: 32.7767, lng: -96.7970, status: 'waiting', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Leo', detail: 'Waiting for dock door #42' }, // Dallas
        { id: 10, lat: 37.3382, lng: -121.8863, status: 'rolling', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Bella', detail: 'Cruising Hwy 101' }, // San Jose
        { id: 11, lat: 47.6062, lng: -122.3321, status: 'parked', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Max', detail: 'Rest break at Pilot Flying J' }, // Seattle
        { id: 12, lat: 39.7392, lng: -104.9903, status: 'rolling', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Luna', detail: 'Crossing the Rockies on I-70' }, // Denver
        { id: 13, lat: 38.9072, lng: -77.0369, status: 'rolling', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Zoe', detail: 'Capital Beltway Traffic...' }, // DC
        // Canadian Drivers
        { id: 14, lat: 43.6532, lng: -79.3832, status: 'waiting', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Liam', detail: 'Waiting at Amazon YYZ Facility' }, // Toronto
        { id: 15, lat: 49.2827, lng: -123.1207, status: 'rolling', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sophie', detail: 'Hauling timber on Hwy 1' }, // Vancouver
        { id: 16, lat: 45.5017, lng: -73.5673, status: 'parked', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Noah', detail: 'Taking a poutine break' }, // Montreal
        { id: 17, lat: 51.0447, lng: -114.0719, status: 'rolling', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ava', detail: 'Rolling through the prairies' }, // Calgary
    ];


    // React to prop changes (Avatar/Status update)
    useEffect(() => {
        if (!map.current || !userAvatar || !userStatus) return;

        // If we don't have a user location yet, don't try to place a marker at map center
        if (!userLocation && !userMarker.current) return;

        // Determine location: use stored userLocation if available, otherwise fallback to map center (risky but better than crash)
        // Ideally we only render if we have userLocation.
        const targetLngLat = userLocation
            ? [userLocation.lng, userLocation.lat] as [number, number]
            : (userMarker.current ? userMarker.current.getLngLat().toArray() : map.current.getCenter().toArray());

        // If marker exists, remove it and re-create to ensure structure (ring + glow) is correct
        if (userMarker.current) {
            userMarker.current.remove();
        }

        // Re-create user marker
        const el = createMarkerElement(userAvatar, userStatus, true);

        // Create User Popup
        const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: false,
            closeOnClick: false,
            className: 'user-popup'
        }).setHTML(`
            <div class="px-3 py-2 text-slate-900 bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-slate-200">
                <h3 class="font-bold text-sm">You are here</h3>
                <div class="flex items-center gap-1 mt-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <p class="text-[10px] uppercase font-bold text-slate-500">Active Now</p>
                </div>
            </div>
        `);

        // Add hover listeners
        el.addEventListener('mouseenter', () => marker.togglePopup());
        el.addEventListener('mouseleave', () => marker.togglePopup());

        const marker = new mapboxgl.Marker({ element: el })
            .setLngLat(targetLngLat as [number, number])
            .setPopup(popup)
            .addTo(map.current!);

        userMarker.current = marker;

    }, [userStatus, userAvatar, userLocation]);

    // Render Fake Drivers
    useEffect(() => {
        if (!map.current) return;

        // Add fake markers
        fakeDrivers.forEach(driver => {
            const el = createMarkerElement(driver.avatar, driver.status);

            // Generate Popup Logic based on Status
            const statusColor = driver.status === 'rolling' ? 'emerald' :
                driver.status === 'waiting' ? 'rose' : 'sky';

            // Tailwind doesn't support dynamic string interpolation for classNames well in runtime JIT 
            // without config, but standard colors (emerald-500) are usually safe.
            // Using inline styles for border/text to be safe, or explicit classes.

            const headerColor = driver.status === 'rolling' ? '#10b981' :
                driver.status === 'waiting' ? '#f43f5e' : '#0ea5e9';

            const bgClass = driver.status === 'rolling' ? 'bg-emerald-500' :
                driver.status === 'waiting' ? 'bg-rose-500' : 'bg-sky-500';

            const popup = new mapboxgl.Popup({
                offset: 25,
                closeButton: false,
                className: 'driver-popup'
            }).setHTML(`
                <div style="border-color: ${headerColor}" class="w-64 overflow-hidden rounded-xl border-2 bg-slate-900 shadow-2xl font-sans">
                    <div style="background-color: ${headerColor}20; border-color: ${headerColor}30" class="px-4 py-2 flex items-center gap-2 border-b">
                        <span class="w-2 h-2 rounded-full ${bgClass} animate-pulse"></span>
                        <span style="color: ${headerColor}" class="font-bold text-xs uppercase tracking-wider">${driver.status}</span>
                    </div>
                    <div class="p-4">
                        <p class="text-sm font-medium text-slate-200 leading-relaxed">${driver.detail}</p>
                    </div>
                </div>
            `);

            const marker = new mapboxgl.Marker({ element: el })
                .setLngLat([driver.lng, driver.lat])
                .setPopup(popup)
                .addTo(map.current!);

            // Add hover listeners
            el.addEventListener('mouseenter', () => marker.togglePopup());
            el.addEventListener('mouseleave', () => marker.togglePopup());
        });
    }, [map.current]); // Run once when map loads

    return (
        <div className={cn("relative w-full h-full", className)}>
            <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
            {/* Overlay gradient for UI visibility if needed */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 to-transparent h-32" />
        </div>
    );
}
