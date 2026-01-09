import { MapMarker as Marker } from "../MapMarker";
import { cn } from "@/lib/utils";

interface NationalLayerProps {
    regions?: any[];
}

export function NationalLayer({ regions }: NationalLayerProps) {
    if (!regions) return null;

    return (
        <>
            {regions.map((region) => (
                <Marker
                    key={region.geohash}
                    longitude={region.center[0]}
                    latitude={region.center[1]}
                >
                    <div className="flex flex-col items-center justify-center p-4 rounded-full bg-slate-900/40 border border-slate-600 backdrop-blur-sm shadow-xl transition-all hover:scale-110 cursor-zoom-in group">
                        <span className="text-sm font-bold text-white group-hover:text-yellow-400">
                            {region.total >= 1000 ? `${(region.total / 1000).toFixed(1)}K` : region.total}
                        </span>
                    </div>
                </Marker>
            ))}
        </>
    );
}
