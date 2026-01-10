"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type WeatherAnimationType =
    | 'rain'
    | 'snow'
    | 'thunder'
    | 'wind'
    | 'tornado'
    | 'ice'
    | 'fog'
    | 'heat'
    | 'flood';

export function getWeatherColors(animationType: WeatherAnimationType) {
    switch (animationType) {
        case 'tornado':
            return 'from-slate-800 via-slate-700 to-slate-900';
        case 'thunder':
            return 'from-indigo-900 via-blue-900 to-slate-900';
        case 'snow':
            return 'from-blue-50 via-slate-100 to-blue-100';
        case 'ice':
            return 'from-cyan-100 via-blue-100 to-cyan-200';
        case 'flood':
            return 'from-blue-800 via-blue-700 to-blue-900';
        case 'wind':
            return 'from-slate-200 via-slate-300 to-slate-400';
        case 'fog':
            return 'from-slate-300 via-slate-200 to-slate-400';
        case 'heat':
            return 'from-orange-500 via-amber-500 to-red-600';
        case 'rain':
            return 'from-slate-700 via-slate-600 to-slate-800';
        default:
            return 'from-slate-700 via-slate-600 to-slate-800';
    }
}

interface WeatherBackgroundProps {
    animationType: WeatherAnimationType;
    intensity?: 'low' | 'medium' | 'high';
}

export function WeatherBackground({ animationType, intensity = 'medium' }: WeatherBackgroundProps) {
    return (
        <div className={cn("absolute inset-0 overflow-hidden pointer-events-none z-0")}>
            {/* Gradient Background */}
            <div className={cn("absolute inset-0 bg-gradient-to-b opacity-80 transition-colors duration-1000", getWeatherColors(animationType))} />

            {/* CSS Animations */}
            {animationType === 'rain' && <RainEffect />}
            {animationType === 'snow' && <SnowEffect />}
            {animationType === 'thunder' && <ThunderEffect />}
            {(animationType === 'tornado' || animationType === 'wind') && <WindEffect />}

            {/* Overlay for intensity */}
            <div className={cn("absolute inset-0 bg-black/10", intensity === 'high' && "bg-black/30")} />
        </div>
    );
}

function RainEffect() {
    return (
        <div className="absolute inset-0 rain-container">
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    className="absolute bg-blue-200/40 w-0.5 h-10 rounded-full animate-rain"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `-${Math.random() * 20}%`,
                        animationDuration: `${0.5 + Math.random() * 0.5}s`,
                        animationDelay: `${Math.random() * 2}s`
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes rain {
                    0% { transform: translateY(-10vh); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(110vh); opacity: 0; }
                }
                .animate-rain {
                    animation-name: rain;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                }
            `}</style>
        </div>
    );
}

function SnowEffect() {
    return (
        <div className="absolute inset-0 snow-container">
            {[...Array(30)].map((_, i) => (
                <div
                    key={i}
                    className="absolute bg-white rounded-full animate-snow opacity-80"
                    style={{
                        width: `${Math.random() * 4 + 2}px`,
                        height: `${Math.random() * 4 + 2}px`,
                        left: `${Math.random() * 100}%`,
                        top: `-${Math.random() * 20}%`,
                        animationDuration: `${2 + Math.random() * 3}s`,
                        animationDelay: `${Math.random() * 2}s`
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes snow {
                    0% { transform: translateY(-10vh) translateX(0); opacity: 0; }
                    10% { opacity: 1; }
                    100% { transform: translateY(110vh) translateX(20px); opacity: 0; }
                }
                .animate-snow {
                    animation-name: snow;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                }
            `}</style>
        </div>
    );
}

function ThunderEffect() {
    // Flash effect
    return (
        <div className="absolute inset-0 bg-white animate-flash opacity-0 pointer-events-none mix-blend-overlay">
            <style jsx>{`
                @keyframes flash {
                    0%, 100% { opacity: 0; }
                    50% { opacity: 0.8; }
                    60% { opacity: 0; }
                    70% { opacity: 0.4; }
                }
                .animate-flash {
                    animation: flash 4s infinite ease-out;
                }
            `}</style>
        </div>
    );
}

function WindEffect() {
    return (
        <div className="absolute inset-0">
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className="absolute bg-white/10 h-32 w-1 rounded-full blur-xl animate-wind"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDuration: `${1 + Math.random()}s`,
                        animationDelay: `${Math.random()}s`,
                        transform: 'rotate(45deg)'
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes wind {
                    0% { transform: translateX(-100%) rotate(45deg); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateX(200%) rotate(45deg); opacity: 0; }
                }
                .animate-wind {
                    animation-name: wind;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                }
            `}</style>
        </div>
    );
}
