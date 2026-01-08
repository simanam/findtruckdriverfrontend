"use client";

import { useOnboardingStore } from "@/stores/onboardingStore";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowLeft } from "lucide-react";

export function AvatarPicker() {
    const { avatarId, setAvatarId, setStep } = useOnboardingStore();

    // Using DiceBear for high-quality, consistent, anonymous avatars
    // Styles: 'bottts' (robots/tech) and 'adventurer' (human/driver)
    const avatars = [
        { id: 'bot1', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Felix&backgroundColor=b6e3f4' },
        { id: 'bot2', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aneka&backgroundColor=c0aede' },
        { id: 'bot3', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Zoe&backgroundColor=ffdfbf' },
        { id: 'adv1', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Trouble&backgroundColor=b6e3f4' },
        { id: 'adv2', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Lucky&backgroundColor=ffdfbf' },
        { id: 'adv3', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Cookie&backgroundColor=ffdfbf' },
        { id: 'fun1', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Sassy' },
        { id: 'fun2', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Misty' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
                {avatars.map((av) => (
                    <button
                        key={av.id}
                        onClick={() => setAvatarId(av.url)} // Saving URL as ID for simple rendering later
                        className={cn(
                            "relative aspect-square rounded-2xl overflow-hidden transition-all duration-300",
                            "border-2 hover:scale-105",
                            avatarId === av.url
                                ? "border-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.3)] scale-110 z-10"
                                : "border-slate-800 opacity-70 hover:opacity-100 hover:border-slate-600"
                        )}
                    >
                        <img
                            src={av.url}
                            alt="Avatar"
                            className="w-full h-full object-cover bg-slate-800/50"
                        />

                        {avatarId === av.url && (
                            <div className="absolute inset-0 bg-sky-500/10 mix-blend-overlay" />
                        )}
                    </button>
                ))}
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-xl font-semibold bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mx-auto" />
                </button>

                <button
                    onClick={() => avatarId && setStep(3)}
                    disabled={!avatarId}
                    className={cn(
                        "flex-[3] flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all",
                        avatarId
                            ? "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-500/25 scale-[1.02]"
                            : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    )}
                >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
