"use client";

import { Map as MapIcon, User, LogOut, Check, Menu, Info, Search, ChevronDown, Home, Briefcase, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useDriverAction } from "@/hooks/useDriverAction";

interface NavbarProps {
    className?: string;
    onJoinClick?: () => void;
}

export function Navbar({ className, onJoinClick }: NavbarProps) {
    const { avatarId, handle, status, cbHandle, reset, setAvatarId, setStatus, setHandle } = useOnboardingStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(api.isLoggedIn);
    const categoryRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();
    const { updateStatus } = useDriverAction();

    // Hide navbar on studio pages
    if (pathname?.startsWith('/studio')) return null;

    // Listen for Supabase auth state changes to sync login status
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                setIsLoggedIn(true);
            } else if (event === 'SIGNED_OUT') {
                setIsLoggedIn(false);
            }
        });

        // Also check API token on mount
        setIsLoggedIn(api.isLoggedIn);

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Hydrate store on mount if logged in but store is empty
    useEffect(() => {
        const hydrate = async () => {
            if (!avatarId && (api.isLoggedIn || isLoggedIn)) {
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
    }, [avatarId, isLoggedIn, setAvatarId, setStatus, setHandle]);

    // Close category dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
                setIsCategoryOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        api.auth.logout();
        await supabase.auth.signOut();
        setIsLoggedIn(false);
        reset();
        router.push('/');
        setIsMenuOpen(false);
    };

    const isMapPage = pathname === '/map';

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-50",
            isMapPage ? "pointer-events-none p-4 md:p-6" : "bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50 px-4 md:px-8 py-3",
            className
        )}>
            <div className={cn("flex items-center justify-between", !isMapPage && "max-w-6xl mx-auto")}>
                {/* Logo */}
                <Link href="/" className={cn("hover:scale-105 transition-transform", isMapPage && "pointer-events-auto")}>
                    <img
                        src="/icons/FTD_LOGO.png"
                        alt="FindTruckDriver"
                        className="w-10 h-10"
                    />
                </Link>

                {/* Center Nav Links (desktop, non-map pages) */}
                {!isMapPage && (
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            href="/"
                            className={cn(
                                "text-sm font-medium transition-colors",
                                pathname === '/' ? "text-white" : "text-slate-400 hover:text-white"
                            )}
                        >
                            Home
                        </Link>

                        {/* Categories Dropdown */}
                        <div ref={categoryRef} className="relative">
                            <button
                                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                className={cn(
                                    "flex items-center gap-1 text-sm font-medium transition-colors",
                                    pathname?.startsWith('/category') ? "text-white" : "text-slate-400 hover:text-white"
                                )}
                            >
                                Categories
                                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isCategoryOpen && "rotate-180")} />
                            </button>
                            {isCategoryOpen && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden z-50">
                                    <div className="p-1">
                                        <Link href="/category/industry-news" onClick={() => setIsCategoryOpen(false)} className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Industry News</Link>
                                        <Link href="/category/driver-lifestyle" onClick={() => setIsCategoryOpen(false)} className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Driver Lifestyle</Link>
                                        <Link href="/category/regulations" onClick={() => setIsCategoryOpen(false)} className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Regulations</Link>
                                        <Link href="/category/product-reviews" onClick={() => setIsCategoryOpen(false)} className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Product Reviews</Link>
                                        <Link href="/category/trucking-tips" onClick={() => setIsCategoryOpen(false)} className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">Trucking Tips</Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link
                            href="/about"
                            className={cn(
                                "text-sm font-medium transition-colors",
                                pathname === '/about' ? "text-white" : "text-slate-400 hover:text-white"
                            )}
                        >
                            About
                        </Link>

                        <Link
                            href="/map"
                            className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                        >
                            <MapIcon className="w-3.5 h-3.5" />
                            Driver Map
                        </Link>

                        <Link
                            href="/jobs"
                            className={cn(
                                "flex items-center gap-1.5 text-sm font-medium transition-colors",
                                pathname?.startsWith('/jobs') ? "text-white" : "text-slate-400 hover:text-white"
                            )}
                        >
                            <Briefcase className="w-3.5 h-3.5" />
                            Jobs
                        </Link>

                        <Link
                            href="/reviews"
                            className={cn(
                                "flex items-center gap-1.5 text-sm font-medium transition-colors",
                                pathname?.startsWith('/reviews') ? "text-white" : "text-slate-400 hover:text-white"
                            )}
                        >
                            <Star className="w-3.5 h-3.5" />
                            Reviews
                        </Link>
                    </nav>
                )}

                {/* Right Actions */}
                <div className={cn("flex items-center gap-3", isMapPage && "pointer-events-auto")}>
                    {/* Search icon (non-map, desktop) */}
                    {!isMapPage && (
                        <Link
                            href="/search"
                            className="hidden md:flex p-2 text-slate-400 hover:text-white transition-colors"
                            aria-label="Search articles"
                        >
                            <Search className="w-4 h-4" />
                        </Link>
                    )}

                    {avatarId ? (
                        <div className="relative">
                            {/* Profile Trigger */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center gap-2 pl-2 pr-1 py-1 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-full hover:bg-slate-800 transition-all shadow-lg text-left"
                            >
                                <div className="hidden sm:block pl-2">
                                    <span className="block text-sm font-medium text-slate-300">
                                        {cbHandle || handle || 'Driver'}
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
                                            src={avatarId?.startsWith('http') ? avatarId : `https://api.dicebear.com/9.x/avataaars/svg?seed=${avatarId}`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
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

                            {/* Dropdown Menu (Logged In) */}
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
                                        <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                                            <Home className="w-4 h-4" />
                                            <span>Blog Home</span>
                                        </Link>
                                        <Link href="/map" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                                            <MapIcon className="w-4 h-4" />
                                            <span>Driver Map</span>
                                        </Link>
                                        <Link href="/jobs" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                                            <Briefcase className="w-4 h-4" />
                                            <span>Jobs</span>
                                        </Link>
                                        <Link href="/reviews" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                                            <Star className="w-4 h-4" />
                                            <span>Reviews</span>
                                        </Link>
                                        <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                                            <User className="w-4 h-4" />
                                            <span>Profile</span>
                                        </Link>
                                        <Link href="/about" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                                            <Info className="w-4 h-4" />
                                            <span>About</span>
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
                            {/* Desktop Links */}
                            {!isMapPage && (
                                <div className="hidden md:flex items-center gap-4">
                                    <Link href="/login" className="text-slate-300 hover:text-white font-medium text-sm transition-colors">
                                        Login
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Actions */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => {
                                        if (onJoinClick) {
                                            e.preventDefault();
                                            onJoinClick();
                                        } else {
                                            router.push('/join');
                                        }
                                    }}
                                    className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-4 py-2 text-sm md:px-5 md:py-2 rounded-full shadow-lg shadow-sky-500/20 transition-all active:scale-95"
                                >
                                    Join <span className="hidden sm:inline">the Map</span>
                                </button>

                                {/* Mobile Menu Toggle */}
                                <div className="md:hidden relative">
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className="p-2 bg-slate-900/80 backdrop-blur-md rounded-full border border-slate-700/50 text-slate-300"
                                    >
                                        <Menu className="w-5 h-5" />
                                    </button>

                                    {/* Mobile Dropdown */}
                                    {isMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 origin-top-right z-50">
                                            <div className="p-1">
                                                <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                                                    <Home className="w-4 h-4" /><span>Home</span>
                                                </Link>
                                                <Link href="/search" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                                                    <Search className="w-4 h-4" /><span>Search</span>
                                                </Link>
                                                <Link href="/map" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                                                    <MapIcon className="w-4 h-4" /><span>Driver Map</span>
                                                </Link>
                                                <Link href="/jobs" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                                                    <Briefcase className="w-4 h-4" /><span>Jobs</span>
                                                </Link>
                                                <Link href="/reviews" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                                                    <Star className="w-4 h-4" /><span>Reviews</span>
                                                </Link>
                                                <Link href="/about" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                                                    <Info className="w-4 h-4" /><span>About</span>
                                                </Link>
                                                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                                                    <User className="w-4 h-4" /><span>Login</span>
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
