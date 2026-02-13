"use client";

import { cn } from "@/lib/utils";
import { Briefcase } from "lucide-react";

interface OpenToWorkBadgeProps {
    size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
    sm: {
        ring: "w-6 h-6",
        icon: "w-3 h-3",
        text: "text-[9px]",
        wrapper: "gap-1 px-1.5 py-0.5",
    },
    md: {
        ring: "w-8 h-8",
        icon: "w-4 h-4",
        text: "text-[10px]",
        wrapper: "gap-1.5 px-2 py-1",
    },
    lg: {
        ring: "w-10 h-10",
        icon: "w-5 h-5",
        text: "text-xs",
        wrapper: "gap-2 px-3 py-1.5",
    },
};

export function OpenToWorkBadge({ size = 'md' }: OpenToWorkBadgeProps) {
    const config = sizeConfig[size];

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold uppercase tracking-wider",
                config.wrapper
            )}
        >
            <div className={cn(
                "flex items-center justify-center rounded-full bg-emerald-500/20 ring-2 ring-emerald-500/50",
                config.ring
            )}>
                <Briefcase className={config.icon} />
            </div>
            <span className={config.text}>Open to Work</span>
        </div>
    );
}

/**
 * A ring overlay for profile photos indicating "Open to Work" status.
 * Wrap this around an avatar image.
 */
export function OpenToWorkRing({ size = 'md', children }: OpenToWorkBadgeProps & { children: React.ReactNode }) {
    const ringSize = {
        sm: "ring-2",
        md: "ring-[3px]",
        lg: "ring-4",
    };

    return (
        <div className={cn(
            "relative rounded-full",
            ringSize[size],
            "ring-emerald-500"
        )}>
            {children}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full whitespace-nowrap leading-none">
                Open to Work
            </div>
        </div>
    );
}
