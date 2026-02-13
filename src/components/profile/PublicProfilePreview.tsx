"use client";

import { cn } from "@/lib/utils";
import { ProfessionalProfile } from "@/types/profile";
import { OpenToWorkBadge } from "./OpenToWorkBadge";
import { Truck, Shield, Building2, Award, MapPin, FileText, EyeOff } from "lucide-react";

interface PublicProfilePreviewProps {
    profile: ProfessionalProfile;
    driver: any;
}

export function PublicProfilePreview({ profile, driver }: PublicProfilePreviewProps) {
    // Prefer actual profile photo over DiceBear avatar
    const avatarSrc = driver?.profile_photo_url
        ? driver.profile_photo_url
        : driver?.avatar_id?.startsWith('http')
            ? driver.avatar_id
            : `https://api.dicebear.com/9.x/avataaars/svg?seed=${driver?.avatar_id || 'driver'}`;

    // If profile is private, show private message instead of full preview
    if (!profile.is_public) {
        return (
            <div className="w-full max-w-md mx-auto bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden">
                <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-800/50">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                        Public Profile Preview
                    </p>
                </div>
                <div className="p-10 flex flex-col items-center text-center gap-3">
                    <EyeOff className="w-10 h-10 text-slate-700" />
                    <h3 className="text-sm font-bold text-slate-400">Profile is Private</h3>
                    <p className="text-xs text-slate-600 max-w-[240px]">
                        Your profile is hidden from other users. Toggle "Public Profile" on to make it visible.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden">
            {/* Preview Header Label */}
            <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-800/50">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                    Public Profile Preview
                </p>
            </div>

            {/* Profile Card */}
            <div className="p-6">
                {/* Avatar + Name */}
                <div className="flex flex-col items-center text-center mb-6">
                    <div className={cn(
                        "w-20 h-20 rounded-full bg-slate-800 overflow-hidden ring-4",
                        profile.open_to_work ? "ring-emerald-500/50" : "ring-slate-900"
                    )}>
                        <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
                    </div>

                    <h3 className="text-lg font-bold text-white mt-3">
                        @{driver?.handle || 'unknown'}
                    </h3>
                    {driver?.role && (
                        <p className="text-xs text-slate-500 capitalize mt-0.5">{driver.role}</p>
                    )}

                    {profile.open_to_work && (
                        <div className="mt-2">
                            <OpenToWorkBadge size="sm" />
                        </div>
                    )}
                </div>

                {/* Bio */}
                {profile.bio && (
                    <div className="mb-5">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bio</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{profile.bio}</p>
                    </div>
                )}

                {/* Experience & Equipment (respects privacy) */}
                {profile.show_experience && profile.years_experience && (
                    <div className="flex items-center gap-3 py-2.5 border-t border-slate-800/50">
                        <Truck className="w-4 h-4 text-sky-400 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-slate-500">Experience</p>
                            <p className="text-sm text-white font-medium">
                                {profile.years_experience} {profile.years_experience === 1 ? 'year' : 'years'}
                            </p>
                        </div>
                    </div>
                )}

                {profile.show_equipment && (profile.haul_type || profile.equipment_type) && (
                    <div className="flex items-center gap-3 py-2.5 border-t border-slate-800/50">
                        <Truck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-slate-500">Equipment</p>
                            <p className="text-sm text-white font-medium">
                                {[profile.haul_type, profile.equipment_type].filter(Boolean).join(' - ')}
                            </p>
                        </div>
                    </div>
                )}

                {/* CDL (respects privacy) */}
                {profile.show_cdl && profile.cdl_class && (
                    <div className="flex items-center gap-3 py-2.5 border-t border-slate-800/50">
                        <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-slate-500">CDL</p>
                            <p className="text-sm text-white font-medium">
                                Class {profile.cdl_class}
                                {profile.cdl_state && ` - ${profile.cdl_state}`}
                            </p>
                        </div>
                        {profile.endorsements.length > 0 && (
                            <div className="ml-auto flex gap-1 flex-wrap justify-end">
                                {profile.endorsements.map((e) => (
                                    <span key={e} className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold">
                                        {e}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Company (respects privacy) */}
                {profile.show_company && profile.company_name && (
                    <div className="flex items-center gap-3 py-2.5 border-t border-slate-800/50">
                        <Building2 className="w-4 h-4 text-violet-400 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-slate-500">Company</p>
                            <p className="text-sm text-white font-medium">{profile.company_name}</p>
                        </div>
                    </div>
                )}

                {/* Specialties */}
                {profile.specialties.length > 0 && (
                    <div className="py-2.5 border-t border-slate-800/50">
                        <div className="flex items-center gap-2 mb-2">
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

                {/* Badges */}
                {profile.badges.length > 0 && (
                    <div className="py-2.5 border-t border-slate-800/50">
                        <div className="flex items-center gap-2 mb-2">
                            <Award className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Badges</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {profile.badges.map((badge) => (
                                <span key={badge.id} className="text-xs bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-1 rounded-lg font-medium">
                                    {badge.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Looking For */}
                {profile.open_to_work && profile.looking_for.length > 0 && (
                    <div className="py-2.5 border-t border-slate-800/50">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Looking For</span>
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
            </div>
        </div>
    );
}
