import { Avatar } from "@/components/ui/Avatar";
import { StatusDot } from "@/components/ui/StatusDot";
import { MapMarker as Marker } from "../MapMarker";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface FacilityCardLayerProps {
    facilities?: any[];
}

export function FacilityCardLayer({ facilities }: FacilityCardLayerProps) {
    if (!facilities) return null;

    return (
        <>
            {facilities.map((fac) => (
                <Marker
                    key={fac.id}
                    longitude={fac.location[0]}
                    latitude={fac.location[1]}
                    anchor="bottom"
                >
                    <div className="relative bottom-4 w-72 bg-slate-900 rounded-lg shadow-2xl border border-slate-700 overflow-hidden text-left flex flex-col">
                        {/* Header */}
                        <div className="p-3 bg-slate-800/50 border-b border-slate-700">
                            <h3 className="font-bold text-sm text-white flex items-center gap-2">
                                📍 {fac.name}
                            </h3>
                            <div className="flex gap-2 text-[10px] text-slate-400 mt-1">
                                {fac.amenities?.slice(0, 3).map((a: string) => <span key={a}>{a}</span>)}
                            </div>
                        </div>

                        {/* Status Rows */}
                        <div className="p-2 space-y-2">
                            {/* Rolling */}
                            <div className="flex items-center gap-2 text-xs">
                                <StatusDot status="rolling" size="sm" />
                                <span className="text-slate-400 flex-1">ROLLING</span>
                                <span className="text-white font-mono">{fac.counts.rolling}</span>
                            </div>

                            {/* Parked - Expanded with Avatars */}
                            <div className="bg-slate-800/30 rounded p-1.5">
                                <div className="flex items-center gap-2 text-xs mb-1">
                                    <StatusDot status="parked" size="sm" />
                                    <span className="text-slate-400 flex-1">PARKED</span>
                                    <span className="text-white font-mono">{fac.counts.parked}</span>
                                </div>
                                <div className="flex -space-x-1.5 overflow-hidden py-0.5 px-0.5">
                                    {fac.avatar_ring.filter((a: any) => a.status === 'parked').slice(0, 7).map((a: any) => (
                                        <Avatar key={a.driver_id} id={a.avatar_id} size={20} className={cn("ring-1 ring-slate-900", a.is_current_user && "ring-yellow-400 z-10")} />
                                    ))}
                                </div>
                            </div>

                            {/* Waiting */}
                            <div className="flex items-center gap-2 text-xs">
                                <StatusDot status="waiting" size="sm" />
                                <span className="text-slate-400 flex-1">WAITING</span>
                                <span className="text-rose-400 font-mono">{fac.counts.waiting}</span>
                            </div>
                        </div>

                        {/* Activity Feed */}
                        <div className="border-t border-slate-800 bg-slate-950 p-2">
                            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Recent Activity</div>
                            {fac.recent_activity?.map((act: any, idx: number) => (
                                <div key={idx} className={cn(
                                    "flex items-center gap-2 text-[10px] py-0.5 pl-1.5 border-l-2",
                                    act.is_current_user ? "border-yellow-400 bg-yellow-400/5" : "border-slate-800"
                                )}>
                                    <StatusDot status={act.type} size="sm" />
                                    <span className={cn(act.is_current_user ? "text-yellow-400 font-bold" : "text-slate-300")}>
                                        {act.handle}
                                    </span>
                                    <span className="text-slate-500 ml-auto">{act.time}</span>
                                </div>
                            ))}
                        </div>

                        {/* Review link */}
                        <Link
                            href={`/reviews?search=${encodeURIComponent(fac.name || "")}`}
                            className="block border-t border-slate-800 px-3 py-2 text-center text-[10px] text-sky-400 hover:text-sky-300 hover:bg-slate-800/50 transition-colors"
                        >
                            Rate & Review
                        </Link>

                    </div>
                </Marker>
            ))}
        </>
    );
}
