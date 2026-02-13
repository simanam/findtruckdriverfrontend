"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import {
    ArrowLeft,
    Loader2,
    Truck,
    Shield,
    Building2,
    Award,
    MapPin,
    FileText,
    Briefcase,
    Clock,
} from "lucide-react";
import { ProfessionalProfile } from "@/types/profile";
import { OpenToWorkBadge } from "@/components/profile/OpenToWorkBadge";
import { cn } from "@/lib/utils";

export default function PublicTruckerProfilePage() {
    const params = useParams();
    const driverId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [profileData, setProfileData] = useState<any>(null);

    useEffect(() => {
        if (driverId) {
            loadPublicProfile();
        }
    }, [driverId]);

    const loadPublicProfile = async () => {
        try {
            const data = await api.profile.getPublic(driverId);
            setProfileData(data);
        } catch (e: any) {
            if (e.status === 404) {
                setError("Profile not found or is private.");
            } else {
                setError("Failed to load profile.");
            }
            console.error("Failed to load public profile", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (error || !profileData) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-6">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                    <Truck className="w-8 h-8 text-slate-600" />
                </div>
                <h1 className="text-xl font-bold text-white mb-2">Profile Not Available</h1>
                <p className="text-slate-500 text-sm mb-6">
                    {error || "This profile does not exist or is set to private."}
                </p>
                <Link
                    href="/map"
                    className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl transition-colors text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Map
                </Link>
            </div>
        );
    }

    // The API may return combined driver + profile data or nested. Adapt accordingly.
    const driver = profileData.driver || profileData;
    const profile: ProfessionalProfile | null = profileData.profile || profileData;

    const avatarSrc = driver?.avatar_id?.startsWith('http')
        ? driver.avatar_id
        : `https://api.dicebear.com/9.x/avataaars/svg?seed=${driver?.avatar_id || 'driver'}`;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-slate-950 pb-20 pointer-events-auto overflow-y-auto">
            {/* Back Nav */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800">
                <Link
                    href="/map"
                    className="p-2 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h2 className="text-lg font-bold text-white">Trucker Profile</h2>
                <div className="w-9" /> {/* spacer for centering */}
            </div>

            {/* Hero Section */}
            <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/50 pt-24 pb-8 px-6">
                <div className="max-w-md mx-auto flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className={cn(
                        "w-28 h-28 rounded-full bg-slate-800 overflow-hidden ring-4 shadow-xl",
                        profile?.open_to_work ? "ring-emerald-500/50" : "ring-slate-900"
                    )}>
                        <img
                            src={avatarSrc}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Open to Work Badge */}
                    {profile?.open_to_work && (
                        <div className="mt-3">
                            <OpenToWorkBadge size="md" />
                        </div>
                    )}

                    {/* Name / Handle */}
                    <h1 className="text-2xl font-bold text-white tracking-tight mt-3">
                        @{driver?.handle || 'trucker'}
                    </h1>
                    {driver?.role && (
                        <p className="text-sm text-slate-500 capitalize mt-0.5">{driver.role}</p>
                    )}
                    {driver?.created_at && (
                        <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Member since {formatDate(driver.created_at)}
                        </p>
                    )}
                </div>
            </div>

            <div className="max-w-md mx-auto px-6 py-6 space-y-5">
                {/* Badges */}
                {profile?.badges && profile.badges.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center">
                        {profile.badges.map((badge) => (
                            <span
                                key={badge.id}
                                className="inline-flex items-center gap-1 text-xs bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2.5 py-1 rounded-full font-medium"
                            >
                                <Award className="w-3 h-3" />
                                {badge.name}
                            </span>
                        ))}
                    </div>
                )}

                {/* Bio */}
                {profile?.bio && (
                    <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">About</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{profile.bio}</p>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {profile?.show_experience && profile?.years_experience && (
                        <div className="bg-slate-900/50 border border-slate-800/50 p-4 rounded-xl flex flex-col items-center justify-center gap-1">
                            <Truck className="w-5 h-5 text-sky-400 mb-1" />
                            <span className="text-2xl font-black text-white">{profile.years_experience}</span>
                            <span className="text-[10px] text-slate-500 font-medium uppercase">Years Exp</span>
                        </div>
                    )}

                    {profile?.estimated_miles && (
                        <div className="bg-slate-900/50 border border-slate-800/50 p-4 rounded-xl flex flex-col items-center justify-center gap-1">
                            <MapPin className="w-5 h-5 text-amber-400 mb-1" />
                            <span className="text-2xl font-black text-white">{(profile.estimated_miles / 1000).toFixed(0)}k</span>
                            <span className="text-[10px] text-slate-500 font-medium uppercase">Est. Miles</span>
                        </div>
                    )}
                </div>

                {/* Experience & Equipment */}
                {profile?.show_experience && (profile?.haul_type || profile?.equipment_type) && (
                    <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Truck className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Equipment & Haul</span>
                        </div>
                        <div className="space-y-2">
                            {profile.haul_type && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Haul Type</span>
                                    <span className="text-sm text-white font-medium">{profile.haul_type}</span>
                                </div>
                            )}
                            {profile.equipment_type && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Equipment</span>
                                    <span className="text-sm text-white font-medium">{profile.equipment_type}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* CDL */}
                {profile?.show_cdl && profile?.cdl_class && (
                    <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Shield className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">CDL Information</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">Class</span>
                                <span className="text-sm text-white font-medium">Class {profile.cdl_class}</span>
                            </div>
                            {profile.cdl_state && (
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500">State</span>
                                    <span className="text-sm text-white font-medium">{profile.cdl_state}</span>
                                </div>
                            )}
                        </div>
                        {profile.endorsements.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                                {profile.endorsements.map((e) => (
                                    <span key={e} className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                                        {e}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Company */}
                {profile?.show_company && profile?.company_name && (
                    <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Company</span>
                        </div>
                        <p className="text-sm text-white font-medium">{profile.company_name}</p>
                    </div>
                )}

                {/* Specialties */}
                {profile?.specialties && profile.specialties.length > 0 && (
                    <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Award className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Specialties</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {profile.specialties.map((s) => (
                                <span key={s} className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-2 py-1 rounded-lg">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Looking For (if Open to Work) */}
                {profile?.open_to_work && profile?.looking_for && profile.looking_for.length > 0 && (
                    <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Looking For</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {profile.looking_for.map((item) => (
                                <span key={item} className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-lg">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Back to Map Link */}
                <div className="pt-4">
                    <Link
                        href="/map"
                        className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900/50 border border-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Map
                    </Link>
                </div>
            </div>
        </div>
    );
}
