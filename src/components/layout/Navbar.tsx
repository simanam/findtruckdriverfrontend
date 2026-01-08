"use client";

import { Map as MapIcon, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
    className?: string;
}

export function Navbar({ className }: NavbarProps) {
    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-50 pointer-events-none",
            "p-4 md:p-6",
            className
        )}>
            <div className="flex items-center justify-between">
                {/* Logo */}
                <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/50 shadow-lg text-slate-100">
                    <MapIcon className="w-5 h-5 text-sky-400" />
                    <span className="font-bold tracking-tight">Find a Truck Driver</span>
                </div>

                {/* Right Actions */}
                <div className="pointer-events-auto flex items-center gap-3">
                    <a href="/join" className="hidden md:block bg-sky-500 hover:bg-sky-400 text-white font-semibold px-5 py-2 rounded-full shadow-lg shadow-sky-500/20 transition-all">
                        Join the Map
                    </a>

                    <button className="md:hidden p-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/50 text-slate-200">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </header>
    );
}
