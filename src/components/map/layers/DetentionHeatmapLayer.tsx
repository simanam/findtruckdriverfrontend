"use client";

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface DetentionHeatmapLayerProps {
    map: mapboxgl.Map | null;
    data?: { latitude: number; longitude: number; weight: number }[];
}

const SOURCE_ID = 'detention-heatmap-source';
const LAYER_ID = 'detention-heatmap-layer';

export function DetentionHeatmapLayer({ map, data }: DetentionHeatmapLayerProps) {
    const initialized = useRef(false);

    useEffect(() => {
        if (!map || !data || data.length === 0) return;

        // Wait for map style to load
        const setup = () => {
            const geojson: GeoJSON.FeatureCollection = {
                type: 'FeatureCollection',
                features: data.map(d => ({
                    type: 'Feature' as const,
                    geometry: {
                        type: 'Point' as const,
                        coordinates: [d.longitude, d.latitude]
                    },
                    properties: {
                        weight: d.weight
                    }
                }))
            };

            // Update existing source or create new one
            const existingSource = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource;
            if (existingSource) {
                existingSource.setData(geojson);
            } else {
                map.addSource(SOURCE_ID, {
                    type: 'geojson',
                    data: geojson
                });

                map.addLayer({
                    id: LAYER_ID,
                    type: 'heatmap',
                    source: SOURCE_ID,
                    paint: {
                        // Weight based on detention severity
                        'heatmap-weight': [
                            'interpolate', ['linear'],
                            ['get', 'weight'],
                            0, 0,
                            1, 1
                        ],
                        // Increase intensity as zoom increases
                        'heatmap-intensity': [
                            'interpolate', ['linear'],
                            ['zoom'],
                            0, 0.5,
                            9, 2
                        ],
                        // Color ramp: transparent -> green -> yellow -> orange -> red
                        'heatmap-color': [
                            'interpolate', ['linear'],
                            ['heatmap-density'],
                            0, 'rgba(0,0,0,0)',
                            0.1, 'rgba(34,197,94,0.3)',   // green-500
                            0.3, 'rgba(250,204,21,0.5)',   // yellow-400
                            0.5, 'rgba(251,146,60,0.6)',   // orange-400
                            0.7, 'rgba(239,68,68,0.7)',    // red-500
                            1.0, 'rgba(220,38,38,0.9)'     // red-600
                        ],
                        // Radius increases with zoom
                        'heatmap-radius': [
                            'interpolate', ['linear'],
                            ['zoom'],
                            0, 15,
                            6, 30,
                            12, 50
                        ],
                        // Fade out at high zoom (let markers take over)
                        'heatmap-opacity': [
                            'interpolate', ['linear'],
                            ['zoom'],
                            7, 0.7,
                            14, 0.3
                        ]
                    }
                });

                initialized.current = true;
            }
        };

        if (map.isStyleLoaded()) {
            setup();
        } else {
            map.on('style.load', setup);
        }

        return () => {
            // Cleanup only on unmount
        };
    }, [map, data]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (map && initialized.current) {
                try {
                    if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
                    if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
                } catch (e) {
                    // Map may already be destroyed
                }
                initialized.current = false;
            }
        };
    }, [map]);

    return null; // Renders via Mapbox, not React DOM
}
