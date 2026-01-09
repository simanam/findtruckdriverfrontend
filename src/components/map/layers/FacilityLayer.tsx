import { AvatarRing } from "../markers/AvatarRing";
import { MapMarker as Marker } from "../MapMarker";

interface FacilityLayerProps {
    facilities?: any[];
}

export function FacilityLayer({ facilities }: FacilityLayerProps) {
    if (!facilities) return null;

    return (
        <>
            {facilities.map((facility) => (
                <Marker
                    key={facility.id}
                    longitude={facility.location[0]}
                    latitude={facility.location[1]}
                >
                    <div className="flex flex-col items-center">
                        <AvatarRing
                            avatars={facility.avatar_ring}
                            overflowCount={facility.total - facility.avatar_ring.length}
                            size="md"
                        />
                        <div className="mt-2 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700">
                            {facility.name}
                        </div>
                    </div>
                </Marker>
            ))}
        </>
    );
}
