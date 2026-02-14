"use client";

import { Star, Clock, MapPin, X, LogIn, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDetentionStore } from "@/stores/detentionStore";
import Link from "next/link";

interface FacilityDetailPopupProps {
    facility: any;
    userDistance?: number; // miles from user
    onClose: () => void;
}

function formatDetentionTime(minutes: number): string {
    if (minutes <= 0) return "No data yet";
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

const FACILITY_TYPE_LABELS: Record<string, string> = {
    shipper: "Shipper",
    receiver: "Receiver",
    warehouse: "Warehouse",
    mechanic: "Mechanic",
    truck_stop: "Truck Stop",
    rest_area: "Rest Area",
    broker: "Broker",
    weigh_station: "Weigh Station",
    service_plaza: "Service Plaza",
    other: "Other",
};

export function FacilityDetailPopup({ facility, userDistance, onClose }: FacilityDetailPopupProps) {
    const { activeSession, setShowCheckInFlow, setSelectedFacilityId } = useDetentionStore();

    const avgDetention = parseFloat(facility.avg_detention_minutes) || 0;
    const rating = parseFloat(facility.avg_overall_rating) || 0;
    const totalReviews = facility.total_reviews || 0;
    const totalSessions = facility.total_detention_sessions || 0;
    const detentionPct = parseFloat(facility.detention_percentage) || 0;
    const canCheckIn = !activeSession && (userDistance === undefined || userDistance <= 1.0);

    const handleCheckIn = () => {
        setSelectedFacilityId(facility.id);
        setShowCheckInFlow(true);
        onClose();
    };

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 pointer-events-none">
            <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-4 max-w-md mx-auto pointer-events-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-sm truncate">{facility.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-medium">
                                {FACILITY_TYPE_LABELS[facility.facility_type] || facility.facility_type}
                            </span>
                        </div>
                        {(facility.address || (facility.city && facility.state)) && (
                            <p className="text-[10px] text-slate-500 mt-1 truncate">
                                <MapPin className="w-3 h-3 inline mr-0.5 -mt-0.5" />
                                {facility.address || `${facility.city}, ${facility.state}`}
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="p-1 text-slate-500 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                    {/* Rating */}
                    <div className="bg-slate-800/50 rounded-xl p-2 text-center">
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-bold text-yellow-400">
                                {rating > 0 ? rating.toFixed(1) : "—"}
                            </span>
                        </div>
                        <span className="text-[9px] text-slate-500 uppercase">
                            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                        </span>
                    </div>

                    {/* Avg Detention */}
                    <div className="bg-slate-800/50 rounded-xl p-2 text-center">
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                            <Clock className={cn("w-3.5 h-3.5", avgDetention > 0 ? "text-red-400" : "text-slate-500")} />
                            <span className={cn("text-sm font-bold", avgDetention > 0 ? "text-red-400" : "text-slate-500")}>
                                {formatDetentionTime(avgDetention)}
                            </span>
                        </div>
                        <span className="text-[9px] text-slate-500 uppercase">Avg Detention</span>
                    </div>

                    {/* Detention % */}
                    <div className="bg-slate-800/50 rounded-xl p-2 text-center">
                        <span className={cn(
                            "text-sm font-bold block mb-0.5",
                            detentionPct > 50 ? "text-red-400" : detentionPct > 0 ? "text-yellow-400" : "text-slate-500"
                        )}>
                            {totalSessions > 0 ? `${detentionPct.toFixed(0)}%` : "—"}
                        </span>
                        <span className="text-[9px] text-slate-500 uppercase">
                            {totalSessions} {totalSessions === 1 ? 'visit' : 'visits'}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    {canCheckIn && (
                        <button
                            onClick={handleCheckIn}
                            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-sm transition-colors active:scale-95"
                        >
                            <LogIn className="w-4 h-4" />
                            Check In Here
                        </button>
                    )}
                    <Link
                        href={`/reviews/${facility.id}`}
                        className={cn(
                            "flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-colors active:scale-95",
                            canCheckIn
                                ? "bg-slate-800 hover:bg-slate-700 text-slate-300 px-4"
                                : "flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300"
                        )}
                    >
                        <MessageSquare className="w-4 h-4" />
                        Reviews
                    </Link>
                </div>

                {/* Distance hint */}
                {userDistance !== undefined && !activeSession && (
                    <p className={cn(
                        "text-[10px] text-center mt-2",
                        userDistance <= 1.0 ? "text-emerald-500/70" : "text-slate-500"
                    )}>
                        <MapPin className="w-3 h-3 inline mr-0.5" />
                        {userDistance < 0.1
                            ? "You're here"
                            : `${userDistance.toFixed(1)} mi away`}
                        {userDistance > 1.0 && " — must be within 1 mile to check in"}
                    </p>
                )}
                {activeSession && (
                    <p className="text-[10px] text-yellow-500/70 text-center mt-2">
                        You have an active session. Check out first to check in here.
                    </p>
                )}
            </div>
        </div>
    );
}
