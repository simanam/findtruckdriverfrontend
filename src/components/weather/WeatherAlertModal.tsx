"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { WeatherBackground, getWeatherColors, WeatherAnimationType } from "./WeatherBackground";
import { X, AlertTriangle, CloudRain, Snowflake, Zap, Wind, CloudFog, ThermometerSun, AlertCircle } from "lucide-react";

// Types matching the backend/guide
export interface WeatherFollowUpQuestion {
    question_type: string; // e.g. 'weather_alert', 'weather_snow'
    text: string;
    subtext?: string;
    options: {
        emoji: string;
        label: string;
        value: string;
    }[];
    skippable: boolean;
    auto_dismiss_seconds?: number;
    weather_event?: string; // e.g., "Winter Storm Warning"
    weather_emoji?: string; // e.g., "❄️"
}

interface WeatherAlertModalProps {
    visible: boolean;
    question: WeatherFollowUpQuestion;
    onRespond: (value: string) => void;
    onDismiss: () => void;
}

export function getWeatherAnimation(event: string = '', type: string = ''): WeatherAnimationType {
    const text = (event + ' ' + type).toLowerCase();

    if (text.includes('tornado')) return 'tornado';
    if (text.includes('thunder') || text.includes('lightning')) return 'thunder';
    if (text.includes('snow') || text.includes('blizzard') || text.includes('winter')) return 'snow';
    if (text.includes('ice') || text.includes('freezing')) return 'ice';
    if (text.includes('flood')) return 'flood';
    if (text.includes('wind')) return 'wind';
    if (text.includes('fog')) return 'fog';
    if (text.includes('heat')) return 'heat';
    if (text.includes('rain')) return 'rain';

    return 'rain'; // default fallback
}

export function WeatherAlertModal({ visible, question, onRespond, onDismiss }: WeatherAlertModalProps) {
    const [dismissCountdown, setDismissCountdown] = useState<number | null>(null);

    useEffect(() => {
        if (visible && question.auto_dismiss_seconds) {
            setDismissCountdown(question.auto_dismiss_seconds);
            const timer = setInterval(() => {
                setDismissCountdown(prev => {
                    if (prev === null || prev <= 1) {
                        clearInterval(timer);
                        onDismiss(); // Auto dismiss
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [visible, question, onDismiss]);

    if (!visible) return null;

    const animationType = getWeatherAnimation(question.weather_event, question.question_type);
    const isCritical = question.question_type === 'weather_alert' || question.text.toLowerCase().includes('warning');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            {/* Backdrop with Blur */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={question.skippable ? onDismiss : undefined} />

            {/* Modal Card */}
            <div className={cn(
                "relative w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 slide-in-from-bottom-10",
                "bg-slate-900 border border-slate-700/50"
            )}>
                {/* Animated Weather Background */}
                <WeatherBackground animationType={animationType} intensity={isCritical ? 'high' : 'medium'} />

                {/* Content Wrapper */}
                <div className="relative px-6 py-8 flex flex-col items-center text-center z-10">

                    {/* Critical Badge */}
                    {isCritical && (
                        <div className="absolute top-4 bg-red-500/90 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            SEVERE WEATHER
                        </div>
                    )}

                    {/* Weather Icon/Emoji */}
                    <div className="mb-4 mt-6 text-6xl drop-shadow-lg filter">
                        {question.weather_emoji || getWeatherEmoji(animationType)}
                    </div>

                    {/* Headline */}
                    <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md">
                        {question.text}
                    </h3>

                    {/* Subtext */}
                    {question.subtext && (
                        <p className="text-slate-200 text-sm mb-8 font-medium leading-relaxed drop-shadow-sm opacity-90">
                            {question.subtext}
                        </p>
                    )}

                    {/* Options */}
                    <div className="w-full space-y-3">
                        {question.options.map((option) => {
                            const isSafe = option.value === 'safe' || option.value === 'acknowledged';
                            const isDanger = option.value === 'stopping' || option.value === 'dangerous';

                            return (
                                <button
                                    key={option.value}
                                    onClick={() => onRespond(option.value)}
                                    className={cn(
                                        "w-full flex items-center justify-center gap-3 py-4 rounded-xl transition-all active:scale-95 shadow-lg backdrop-blur-md",
                                        isSafe ? "bg-emerald-500 hover:bg-emerald-400 text-white font-bold border-t border-emerald-400/50" :
                                            isDanger ? "bg-red-500 hover:bg-red-400 text-white font-bold border-t border-red-400/50" :
                                                "bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/10"
                                    )}
                                >
                                    <span className="text-xl">{option.emoji}</span>
                                    <span>{option.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer / Skip */}
                    {question.skippable && (
                        <button onClick={onDismiss} className="mt-6 text-slate-400 text-xs hover:text-white transition-colors">
                            Dismiss
                        </button>
                    )}

                    {/* Countdown */}
                    {typeof dismissCountdown === 'number' && dismissCountdown > 0 && (
                        <p className="mt-4 text-[10px] text-slate-400 font-mono">
                            Auto-closing in {dismissCountdown}s...
                        </p>
                    )}

                </div>
            </div>
        </div>
    );
}

function getWeatherEmoji(type: WeatherAnimationType) {
    switch (type) {
        case 'rain': return '🌧️';
        case 'snow': return '❄️';
        case 'thunder': return '⛈️';
        case 'tornado': return '🌪️';
        case 'wind': return '💨';
        case 'fog': return '🌫️';
        case 'heat': return '🔥';
        case 'flood': return '🌊';
        case 'ice': return '🧊';
        default: return '☁️';
    }
}
