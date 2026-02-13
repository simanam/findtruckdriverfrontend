"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Star, MapPin, Factory, Package, Wrench, Fuel, ParkingCircle, ClipboardList, Globe, CheckCircle, User } from "lucide-react";

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
    shipper: { label: "Shipper", icon: Factory, color: "text-orange-400" },
    receiver: { label: "Receiver", icon: Factory, color: "text-orange-400" },
    warehouse: { label: "Warehouse", icon: Package, color: "text-blue-400" },
    mechanic: { label: "Mechanic", icon: Wrench, color: "text-yellow-400" },
    truck_stop: { label: "Truck Stop", icon: Fuel, color: "text-emerald-400" },
    rest_area: { label: "Rest Area", icon: ParkingCircle, color: "text-sky-400" },
    broker: { label: "Broker", icon: ClipboardList, color: "text-purple-400" },
    weigh_station: { label: "Weigh Station", icon: MapPin, color: "text-slate-400" },
    service_plaza: { label: "Service Plaza", icon: Fuel, color: "text-emerald-400" },
    other: { label: "Other", icon: MapPin, color: "text-slate-400" },
};

function getVerificationBadge(facility: any) {
    if (facility.google_place_id) {
        return { label: "Google Verified", color: "text-emerald-400", bgColor: "bg-emerald-500/10", icon: CheckCircle };
    }
    if (facility.total_reviews >= 3) {
        return { label: "Community Verified", color: "text-sky-400", bgColor: "bg-sky-500/10", icon: CheckCircle };
    }
    if (facility.total_reviews > 0) {
        return { label: "Driver Added", color: "text-slate-500", bgColor: "bg-slate-800", icon: User };
    }
    return null;
}

interface FacilityCardProps {
    facility: {
        id: string;
        name: string;
        facility_type: string;
        city?: string;
        state?: string;
        avg_overall_rating: number;
        total_reviews: number;
        category_averages?: Record<string, number>;
        source?: string;
        google_place_id?: string;
        google_rating?: number;
        google_review_count?: number;
    };
    onClick?: () => void;
}

export function FacilityCard({ facility, onClick }: FacilityCardProps) {
    const typeInfo = TYPE_CONFIG[facility.facility_type] || TYPE_CONFIG.other;
    const Icon = typeInfo.icon;
    const location = [facility.city, facility.state].filter(Boolean).join(", ");
    const hasOurReviews = facility.total_reviews > 0;
    const badge = getVerificationBadge(facility);

    const content = (
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4 hover:border-slate-700 transition-all duration-300 hover:shadow-lg cursor-pointer">
            <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                    <Icon className={cn("w-5 h-5 shrink-0", typeInfo.color)} />
                    <h3 className="text-white font-semibold text-sm leading-tight truncate">
                        {facility.name}
                    </h3>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {hasOurReviews ? (
                        <>
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="text-sm font-medium text-amber-400">
                                {facility.avg_overall_rating}
                            </span>
                            <span className="text-xs text-slate-500">
                                ({facility.total_reviews})
                            </span>
                        </>
                    ) : facility.google_rating ? (
                        <>
                            <Globe className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-sm text-slate-500">
                                {facility.google_rating}
                            </span>
                            <span className="text-xs text-slate-600">
                                ({facility.google_review_count || 0})
                            </span>
                        </>
                    ) : (
                        <span className="text-xs text-slate-600">No reviews</span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                <span className={typeInfo.color}>{typeInfo.label}</span>
                {location && (
                    <>
                        <span>·</span>
                        <span>{location}</span>
                    </>
                )}
            </div>

            {/* Top category ratings preview */}
            {facility.category_averages && Object.keys(facility.category_averages).length > 0 && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                    {Object.entries(facility.category_averages).slice(0, 3).map(([key, val]) => (
                        <span key={key} className="text-[11px] text-slate-500">
                            {key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}:{" "}
                            <span className="text-amber-400/70">{val}</span>
                        </span>
                    ))}
                </div>
            )}

            {badge && (
                <span className={cn("inline-flex items-center gap-1 mt-2 text-[10px] px-1.5 py-0.5 rounded", badge.bgColor, badge.color)}>
                    <badge.icon className="w-2.5 h-2.5" />
                    {badge.label}
                </span>
            )}
        </div>
    );

    if (onClick) {
        return <div onClick={onClick}>{content}</div>;
    }

    return <Link href={`/reviews/${facility.id}`}>{content}</Link>;
}

export { TYPE_CONFIG };
