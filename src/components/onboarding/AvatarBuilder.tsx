"use client";

import { useOnboardingStore } from "@/stores/onboardingStore";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowLeft, RefreshCw, Sparkles } from "lucide-react";
import { useState, useMemo } from "react";

// --- Options Data ---
// derived from https://api.dicebear.com/9.x/avataaars/schema.json
const OPTIONS = {
    top: [
        "shortWaved", "shaggyMullet", "shortCurly", "shortFlat", "shortRound", "sides",
        "theCaesar", "theCaesarAndSidePart", "bigHair", "bob", "bun", "curly", "curvy",
        "dreads", "frida", "fro", "froBand", "longButNotTooLong", "miaWallace",
        "shavedSides", "straight02", "straight01", "straightAndStrand",
        "dreads01", "dreads02", "frizzle", "shaggy", "winterHat1", "winterHat02",
        "winterHat03", "winterHat04", "hat", "hijab", "turban"
    ],
    accessories: [
        "none", "prescription01", "prescription02", "round", "sunglasses", "wayfarers", "kurt", "eyepatch"
    ],
    hairColor: [
        "a55728", "2c1b18", "b58143", "d6b370", "724133", "4a312c", "f59797", "ecdcbf", "c93305", "e8e1e1"
    ],
    facialHair: [
        "none", "beardLight", "beardMajestic", "beardMedium", "moustacheFancy", "moustacheMagnum"
    ],
    facialHairColor: [
        "a55728", "2c1b18", "b58143", "d6b370", "724133", "4a312c", "f59797", "ecdcbf", "c93305", "e8e1e1"
    ],
    clothing: [
        "hoodie", "blazerAndShirt", "blazerAndSweater", "collarAndSweater", "graphicShirt",
        "overall", "shirtCrewNeck", "shirtScoopNeck", "shirtVNeck"
    ],
    clothingColor: [
        "262e33", "65c9ff", "5199e4", "25557c", "e6e6e6", "929598", "3c4f5c", "b1e2ff",
        "a7ffc4", "ffafb9", "ffffb1", "ff488e", "ff5c5c", "ffffff"
    ],
    eyes: [
        "default", "closed", "cry", "eyeRoll", "happy", "hearts", "side", "squint",
        "surprised", "wink", "winkWacky", "xDizzy"
    ],
    eyebrows: [
        "default", "angry", "angryNatural", "defaultNatural", "flatNatural", "frownNatural",
        "raisedExcited", "raisedExcitedNatural", "sadConcerned", "sadConcernedNatural",
        "unibrowNatural", "upDown", "upDownNatural"
    ],
    mouth: [
        "smile", "concerned", "default", "disbelief", "eating", "grimace", "sad",
        "screamOpen", "serious", "tongue", "twinkle", "vomit"
    ],
    skinColor: [
        "edb98a", "ffdbb4", "dab865", "fd9841", "f8d25c", "e5a07e", "d08b5b", "ae5d29", "614335"
    ]
};

// Helper for color names mapping (approximate)
const getColorName = (hex: string) => {
    const map: Record<string, string> = {
        "a55728": "Auburn", "2c1b18": "Black", "b58143": "Blonde", "d6b370": "Golden",
        "724133": "Brown", "4a312c": "Dark Brown", "f59797": "Pastel Pink", "ecdcbf": "Platinum",
        "c93305": "Red", "e8e1e1": "Silver", "262e33": "Black", "65c9ff": "Blue",
        "5199e4": "Dark Blue", "25557c": "Navy", "e6e6e6": "Gray", "929598": "Dark Gray",
        "3c4f5c": "Heather", "b1e2ff": "Pastel Blue", "a7ffc4": "Pastel Green",
        "ffafb9": "Pastel Red", "ffffb1": "Pastel Yellow", "ff488e": "Pink", "ff5c5c": "Red",
        "ffffff": "White", "edb98a": "Light", "ffdbb4": "Pale", "dab865": "Tanned",
        "fd9841": "Yellow", "f8d25c": "Gold", "e5a07e": "Orange", "d08b5b": "Brown",
        "ae5d29": "Dark Brown", "614335": "Black"
    };
    return map[hex] || hex;
};

export function AvatarBuilder() {
    const { setAvatarId, setStep, status } = useOnboardingStore();

    // --- State ---
    const [config, setConfig] = useState({
        top: "shortWaved",
        accessories: "none",
        hairColor: "4a312c",
        facialHair: "none",
        facialHairColor: "4a312c",
        clothing: "hoodie",
        clothingColor: "25557c",
        eyes: "default",
        eyebrows: "default",
        mouth: "smile",
        skinColor: "edb98a"
    });

    const [seed, setSeed] = useState("Driver");
    const [showControls, setShowControls] = useState(false);

    // --- Dynamic Status Colors ---
    const getStatusColor = () => {
        switch (status) {
            case 'rolling': return 'border-emerald-500 shadow-emerald-500/30';
            case 'waiting': return 'border-rose-500 shadow-rose-500/30';
            case 'parked': return 'border-sky-500 shadow-sky-500/30';
            default: return 'border-sky-500 shadow-sky-500/30';
        }
    };

    // --- Computed URL ---
    const avatarUrl = useMemo(() => {
        const params = new URLSearchParams();

        // Add random seed
        params.set('seed', seed);

        // Add standard properties
        params.set('top', config.top);
        params.set('hairColor', config.hairColor);
        params.set('clothing', config.clothing);
        params.set('clothingColor', config.clothingColor);
        params.set('eyes', config.eyes);
        params.set('eyebrows', config.eyebrows);
        params.set('mouth', config.mouth);
        params.set('skinColor', config.skinColor);

        // Handle "none" logic by Probability
        if (config.accessories === 'none') {
            params.set('accessoriesProbability', '0');
        } else {
            params.set('accessoriesProbability', '100');
            params.set('accessories', config.accessories);
        }

        if (config.facialHair === 'none') {
            params.set('facialHairProbability', '0');
        } else {
            params.set('facialHairProbability', '100');
            params.set('facialHair', config.facialHair);
        }

        // Use a dark slate background to match app theme
        return `https://api.dicebear.com/9.x/avataaars/svg?${params.toString()}&backgroundColor=1e293b`;
    }, [config, seed]);

    // --- Actions ---
    const updateConfig = (key: keyof typeof config, value: string) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const randomize = () => {
        setSeed(Math.random().toString(36).substring(7));
        const newConfig: any = {};
        for (const [key, values] of Object.entries(OPTIONS)) {
            newConfig[key] = values[Math.floor(Math.random() * values.length)];
        }
        setConfig(newConfig);
    };

    const saveAndContinue = () => {
        setAvatarId(avatarUrl);
        setStep(3);
    };

    // --- Render Helpers ---
    const OptionSection = ({
        label,
        optionKey,
        items
    }: {
        label: string,
        optionKey: keyof typeof config,
        items: string[]
    }) => {
        const isColor = optionKey.toLowerCase().includes('color');

        return (
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">{label}</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
                    {items.map(item => (
                        <button
                            key={item}
                            onClick={() => updateConfig(optionKey, item)}
                            className={cn(
                                "flex-shrink-0 rounded-lg transition-all snap-start border hover:scale-105 active:scale-95",
                                isColor ? "w-7 h-7 rounded-full shadow-sm" : "px-3 py-1.5 text-xs whitespace-nowrap bg-slate-800",
                                config[optionKey] === item
                                    ? "border-sky-500 text-sky-400 ring-1 ring-sky-500/50 bg-sky-500/10"
                                    : "border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200",
                                isColor && "overflow-hidden border-slate-600"
                            )}
                            style={isColor ? { backgroundColor: `#${item}` } : {}}
                            title={isColor ? getColorName(item) : item}
                        >
                            {!isColor && item.replace(/([A-Z])/g, ' $1').replace(/[0-9]/g, '').trim()}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* Main Preview & Primary Actions */}
            <div className="flex flex-col items-center gap-4 py-1">

                {/* Avatar Circle with Dynamic Status Ring */}
                <div className="relative group">
                    <div className={cn(
                        "w-32 h-32 sm:w-48 sm:h-48 bg-slate-800 rounded-full border-2 sm:border-[3px] overflow-hidden transition-all duration-500 flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.3)]",
                        getStatusColor()
                    )}>
                        <img
                            src={avatarUrl}
                            alt="Your Driver Avatar"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // Fallback UI in case of API error
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.parentElement) {
                                    e.currentTarget.parentElement.classList.add('bg-slate-800');
                                    e.currentTarget.parentElement.innerHTML = '<div class="flex flex-col items-center justify-center h-full text-slate-500 p-4 text-center"><span class="text-2xl mb-2">🚛</span><span class="text-xs font-bold">Preview Loading...</span></div>';
                                }
                            }}
                        />
                    </div>
                    {/* Status badge indicator */}
                    <div className={cn(
                        "absolute bottom-2 right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-slate-900 shadow-lg",
                        status === 'rolling' ? "bg-emerald-500" :
                            status === 'waiting' ? "bg-rose-500" :
                                status === 'parked' ? "bg-sky-500" : "bg-sky-500"
                    )} />
                </div>

                {/* Primary Actions Grid - More Compact */}
                <div className="grid grid-cols-2 gap-2 w-full max-w-[260px]">
                    <button
                        onClick={randomize}
                        className="py-2.5 sm:py-3 rounded-lg font-bold bg-slate-800 text-sky-400 border border-slate-700/50 hover:bg-slate-700 hover:border-sky-500/50 transition-all shadow-md flex flex-row items-center justify-center gap-1.5 group"
                    >
                        <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-180 transition-transform duration-500" />
                        <span className="text-xs sm:text-sm">Randomize</span>
                    </button>

                    <button
                        onClick={() => setShowControls(!showControls)}
                        className={cn(
                            "py-2.5 sm:py-3 rounded-lg font-bold border transition-all shadow-md flex flex-row items-center justify-center gap-1.5",
                            showControls
                                ? "bg-sky-500 text-white border-sky-400 shadow-sky-500/20"
                                : "bg-slate-800 text-slate-400 border-slate-700/50 hover:text-white hover:bg-slate-700"
                        )}
                    >
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm">Customize</span>
                    </button>
                </div>
            </div>

            {/* Expandable Controls - Compact Design */}
            <div className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                showControls ? "max-h-[220px] sm:max-h-[300px] opacity-100" : "max-h-0 opacity-0"
            )}>
                <div className="bg-slate-900/60 rounded-xl border border-slate-800/50 backdrop-blur-md max-h-[210px] sm:max-h-[300px] overflow-y-auto p-2 sm:p-3 custom-scrollbar space-y-3 sm:space-y-4">
                    {/* Groups for better organization */}
                    <div className="space-y-4">
                        <OptionSection label="Hairstyle" optionKey="top" items={OPTIONS.top} />
                        <div className="flex gap-4">
                            <div className="flex-1"><OptionSection label="Hair Color" optionKey="hairColor" items={OPTIONS.hairColor} /></div>
                            <div className="flex-1"><OptionSection label="Skin Tone" optionKey="skinColor" items={OPTIONS.skinColor} /></div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-800/50" />

                    <div className="space-y-4">
                        <OptionSection label="Eyewear" optionKey="accessories" items={OPTIONS.accessories} />
                        <OptionSection label="Clothing" optionKey="clothing" items={OPTIONS.clothing} />
                        <OptionSection label="Cloth Color" optionKey="clothingColor" items={OPTIONS.clothingColor} />
                    </div>

                    <div className="h-px bg-slate-800/50" />

                    <div className="space-y-4">
                        <OptionSection label="Facial Hair" optionKey="facialHair" items={OPTIONS.facialHair} />
                        <OptionSection label="Beard Color" optionKey="facialHairColor" items={OPTIONS.facialHairColor} />
                    </div>

                    <div className="h-px bg-slate-800/50" />

                    <div className="space-y-4">
                        <OptionSection label="Eyes" optionKey="eyes" items={OPTIONS.eyes} />
                        <OptionSection label="Eyebrows" optionKey="eyebrows" items={OPTIONS.eyebrows} />
                        <OptionSection label="Mouth" optionKey="mouth" items={OPTIONS.mouth} />
                    </div>
                </div>
            </div>

            {/* Footer Navigation */}
            <div className="flex gap-3 pt-1">
                <button
                    onClick={() => setStep(1)}
                    className="w-12 h-12 rounded-xl font-semibold bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center border border-slate-800 hover:border-slate-600"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <button
                    onClick={saveAndContinue}
                    className="flex-1 h-12 rounded-xl font-bold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-500/25 transition-all text-base flex items-center justify-center gap-2 group"
                >
                    <span>Looks Good</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(30, 41, 59, 0.3);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(71, 85, 105, 0.6);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(100, 116, 139, 0.8);
                }
            `}</style>
        </div>
    );
}
