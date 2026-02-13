"use client";

import { Badge } from "@/types/profile";
import {
    Shield,
    MapPin,
    Star,
    Trophy,
    Award,
    CheckCircle,
    Briefcase,
    Zap,
    Medal,
    Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BADGE_CONFIG: Record<string, { icon: React.ReactNode; color: string; description: string }> = {
    fmcsa_verified: {
        icon: <Shield className="w-3 h-3" />,
        color: "bg-blue-500/15 border-blue-500/30 text-blue-400",
        description: "FMCSA carrier data verified",
    },
    google_verified: {
        icon: <MapPin className="w-3 h-3" />,
        color: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
        description: "Business verified via Google Places",
    },
    profile_complete: {
        icon: <CheckCircle className="w-3 h-3" />,
        color: "bg-purple-500/15 border-purple-500/30 text-purple-400",
        description: "Profile is 100% complete",
    },
    almost_complete: {
        icon: <Target className="w-3 h-3" />,
        color: "bg-violet-500/15 border-violet-500/30 text-violet-400",
        description: "Profile is 75%+ complete",
    },
    halfway_there: {
        icon: <Zap className="w-3 h-3" />,
        color: "bg-amber-500/15 border-amber-500/30 text-amber-400",
        description: "Profile is 50%+ complete",
    },
    profile_starter: {
        icon: <Star className="w-3 h-3" />,
        color: "bg-slate-500/15 border-slate-500/30 text-slate-400",
        description: "Started building your profile",
    },
    million_miler: {
        icon: <Trophy className="w-3 h-3" />,
        color: "bg-yellow-500/15 border-yellow-500/30 text-yellow-400",
        description: "Over 1 million estimated miles",
    },
    road_legend: {
        icon: <Trophy className="w-3 h-3" />,
        color: "bg-yellow-500/15 border-yellow-500/30 text-yellow-400",
        description: "20+ years on the road",
    },
    decade_driver: {
        icon: <Award className="w-3 h-3" />,
        color: "bg-amber-500/15 border-amber-500/30 text-amber-400",
        description: "10+ years of experience",
    },
    five_year_veteran: {
        icon: <Medal className="w-3 h-3" />,
        color: "bg-slate-400/15 border-slate-400/30 text-slate-300",
        description: "5+ years of experience",
    },
    one_year_veteran: {
        icon: <Star className="w-3 h-3" />,
        color: "bg-slate-500/15 border-slate-500/30 text-slate-400",
        description: "1+ year of experience",
    },
    open_to_work: {
        icon: <Briefcase className="w-3 h-3" />,
        color: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
        description: "Open to new opportunities",
    },
};

const DEFAULT_CONFIG = {
    icon: <Star className="w-3 h-3" />,
    color: "bg-slate-500/15 border-slate-500/30 text-slate-400",
    description: "",
};

interface BadgeDisplayProps {
    badges: Badge[];
    compact?: boolean;
}

export function BadgeDisplay({ badges, compact = false }: BadgeDisplayProps) {
    if (!badges || badges.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1.5">
            {badges.map((badge) => {
                const config = BADGE_CONFIG[badge.id] || DEFAULT_CONFIG;
                return (
                    <div
                        key={badge.id}
                        title={config.description || badge.name}
                        className={cn(
                            "inline-flex items-center gap-1 rounded-full border transition-all",
                            config.color,
                            compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
                        )}
                    >
                        {config.icon}
                        <span className="font-medium">{badge.name}</span>
                    </div>
                );
            })}
        </div>
    );
}
