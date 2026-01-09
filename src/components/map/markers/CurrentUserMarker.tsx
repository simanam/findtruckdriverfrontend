import { Avatar } from "@/components/ui/Avatar";
import { StatusDot, DriverStatus } from "@/components/ui/StatusDot";
import { cn } from "@/lib/utils";
import { MapMarker as Marker } from "../MapMarker";

interface CurrentUserMarkerProps {
    user: {
        driver_id: string;
        handle: string;
        avatar_id: string;
        status: DriverStatus | string;
        location: [number, number];
    };
    onClick?: () => void;
}

export function CurrentUserMarker({ user, onClick }: CurrentUserMarkerProps) {

    return (
        <Marker
            longitude={user.location[0]}
            latitude={user.location[1]}
            anchor="bottom"
            onClick={(e) => {
                e.originalEvent.stopPropagation();
                onClick?.();
            }}
        >
            <div className="group relative flex flex-col items-center pointer-events-auto">

                {/* Pulsing ring behind avatar */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-yellow-400/30 rounded-full animate-ping opacity-75 pointer-events-none" />

                {/* Avatar with gold border */}
                <div className="relative z-10 transition-transform group-hover:scale-110">
                    <Avatar
                        id={user.avatar_id}
                        size={56}
                        className="border-4 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)]"
                    />

                    <div className="absolute bottom-0 right-0 p-1 bg-slate-900 rounded-full border border-yellow-400">
                        <StatusDot status={user.status} size="md" />
                    </div>
                </div>

                {/* Label */}
                <div className="mt-2 px-3 py-1.5 bg-slate-900/90 backdrop-blur border-2 border-yellow-400 rounded-xl text-center shadow-lg transform transition-all">
                    <span className="block text-yellow-400 font-bold text-sm leading-tight">
                        {user.handle}
                    </span>
                    <span className="block text-slate-400 text-[10px] leading-tight uppercase font-medium">
                        You are here
                    </span>
                </div>

                {/* Arrow */}
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-yellow-400 -mt-[54px] mb-[46px] z-20" />
            </div>
        </Marker>
    );
}
