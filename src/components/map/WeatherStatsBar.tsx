"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils'; // Assuming cn exists or similar utility

interface WeatherData {
    available: boolean;
    temperature_f?: number;
    condition?: string;
    emoji?: string;
    location?: string;
}

interface WeatherStatsBarProps {
    latitude: number;
    longitude: number;
}

export function WeatherStatsBar({ latitude, longitude }: WeatherStatsBarProps) {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchWeather = async () => {
        setLoading(true);
        try {
            const data = await api.map.getWeather({ latitude, longitude });
            setWeather(data);
        } catch (error) {
            console.error("Failed to fetch weather", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeather();
        // Refresh every 30 minutes
        const interval = setInterval(fetchWeather, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, [latitude, longitude]); // Re-fetch if location changes significanly (controlled by parent passing new props)

    if (!weather || !weather.available) return null;

    return (
        <div className="animate-in fade-in slide-in-from-top-4 pointer-events-none mt-2">
            <div className="bg-slate-900/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-700/50 shadow-lg flex items-center justify-center gap-2 pointer-events-auto mx-auto w-fit">
                <span className="text-lg">{weather.emoji}</span>
                <div className="flex flex-col leading-none text-left">
                    <span className="text-xs font-bold text-white">
                        {weather.temperature_f}°F <span className="text-slate-400 font-normal">{weather.condition}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                        {weather.location}
                    </span>
                </div>
            </div>
        </div>
    );
}
