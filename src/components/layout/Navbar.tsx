"use client";

import { Map as MapIcon, User, Settings, LogOut, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { api } from "@/lib/api";
import { useEffect } from "react";
import { useDriverAction } from "@/hooks/useDriverAction";

interface NavbarProps {
    className?: string;
}

export function Navbar({ className }: NavbarProps) {
    const { avatarId, handle, reset, setAvatarId, setStatus, setHandle, facilityName } = useOnboardingStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();
    const { updateStatus } = useDriverAction();

    // Hydrate store on mount if logged in but store is empty
    useEffect(() => {
        const hydrate = async () => {
            // If we have no avatarId but we have a token (checked implicitly by api call success)
            // we should try to fetch the profile.
            if (!avatarId && api.isLoggedIn) {
                try {
                    const driver = await api.drivers.getMe();
                    if (driver && driver.handle) {
                        setAvatarId(driver.avatar_id);
                        setStatus(driver.status);
                        setHandle(driver.handle);
                    }
                } catch {
                    // Not logged in or no profile, ignore
                }
            }
        };
        hydrate();
    }, [avatarId, setAvatarId, setStatus, setHandle]);

    const handleLogout = async () => {
        api.auth.logout();
        reset();
        router.push('/');
        setIsMenuOpen(false);
    };

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-50 pointer-events-none",
            "p-4 md:p-6",
            className
        )}>
            <div className="flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="pointer-events-auto flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/50 shadow-lg text-slate-100 hover:scale-105 transition-transform">
                    <MapIcon className="w-5 h-5 text-sky-400" />
                </Link>

                {/* Right Actions */}
                <div className="pointer-events-auto flex items-center gap-3">
                    {avatarId ? (
                        <div className="relative">
                            {/* Profile Trigger */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center gap-2 pl-2 pr-1 py-1 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-full hover:bg-slate-800 transition-all shadow-lg text-left"
                            >
                                <div className="hidden sm:block pl-2">
                                    <span className="block text-sm font-medium text-slate-300">
                                        {handle || 'Driver'}
                                    </span>
                                    {status && (
                                        <span className={cn("block text-[10px] uppercase font-bold tracking-wider",
                                            status === 'rolling' ? "text-emerald-400" :
                                                status === 'waiting' ? "text-rose-400" : "text-sky-400"
                                        )}>
                                            {status}
                                        </span>
                                    )}
                                </div>
                                <div className="relative w-8 h-8">
                                    <div className="w-full h-full rounded-full bg-slate-800 overflow-hidden ring-2 ring-sky-500/50">
                                        <img
                                            src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${avatarId}`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {/* Status Dot */}
                                    {status && (
                                        <span className={cn("absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900",
                                            status === 'rolling' ? "bg-emerald-500" :
                                                status === 'waiting' ? "bg-rose-500" : "bg-sky-500"
                                        )}>
                                            {status === 'rolling' && <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"></span>}
                                        </span>
                                    )}
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 origin-top-right">

                                    {/* Status Switcher Section */}
                                    <div className="p-2 border-b border-slate-700/50">
                                        <p className="text-xs font-bold text-slate-500 uppercase px-2 mb-2">Update Status</p>
                                        <div className="grid gap-1">
                                            {(['rolling', 'waiting', 'parked'] as const).map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={async () => {
                                                        try {
                                                            await updateStatus(s);
                                                            setIsMenuOpen(false);
                                                        } catch (e) {
                                                            console.error(e);
                                                        }
                                                    }}
                                                    className={cn(
                                                        "flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-medium transition-all",
                                                        status === s
                                                            ? "bg-slate-800 text-white"
                                                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                                                    )}
                                                >
                                                    <span className={cn("w-2 h-2 rounded-full",
                                                        s === 'rolling' ? "bg-emerald-500" : s === 'waiting' ? "bg-rose-500" : "bg-sky-500"
                                                    )} />
                                                    <span className="capitalize">{s}</span>
                                                    {status === s && <Check className="w-3 h-3 ml-auto text-sky-400" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-1">
                                        <Link
                                            href="/map"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                        >
                                            <User className="w-4 h-4" />
                                            <span>Profile</span>
                                        </Link>
                                        <Link
                                            href="/settings"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                        >
                                            <Settings className="w-4 h-4" />
                                            <span>Settings</span>
                                        </Link>
                                        <div className="h-px bg-slate-700/50 my-1" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link href="/login" className="text-slate-300 hover:text-white font-medium px-4 py-2 transition-colors hidden sm:block">
                                Login
                            </Link>
                            <Link href="/join" className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-5 py-2 rounded-full shadow-lg shadow-sky-500/20 transition-all active:scale-95">
                                Join the Map
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
