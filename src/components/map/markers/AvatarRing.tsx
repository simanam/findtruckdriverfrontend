import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

interface AvatarRingProps {
    avatars: Array<{
        driver_id: string;
        avatar_id: string;
        handle: string;
        status?: string;
        is_current_user?: boolean;
    }>;
    overflowCount: number;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function AvatarRing({ avatars, overflowCount, size = 'md', className }: AvatarRingProps) {
    // Positions for 6 avatars in a ring
    const positions = [
        { top: '0%', left: '50%', transform: 'translate(-50%, 0)' },      // 12 o'clock (Position 1)
        { top: '25%', left: '93%', transform: 'translate(-50%, -50%)' },  // 2 o'clock
        { top: '75%', left: '93%', transform: 'translate(-50%, -50%)' },  // 4 o'clock
        { top: '100%', left: '50%', transform: 'translate(-50%, -100%)' }, // 6 o'clock
        { top: '75%', left: '7%', transform: 'translate(-50%, -50%)' },   // 8 o'clock
        { top: '25%', left: '7%', transform: 'translate(-50%, -50%)' },   // 10 o'clock
    ];

    const sizeClasses = {
        sm: 'w-24 h-24', // Increased from 20
        md: 'w-36 h-36', // Increased from 28
        lg: 'w-48 h-48'  // Increased from 36
    };

    const avatarSizes = { sm: 28, md: 40, lg: 56 }; // Increased sizes

    const statusColors: Record<string, string> = {
        rolling: "border-emerald-500 ring-emerald-500/30",
        waiting: "border-rose-500 ring-rose-500/30",
        parked: "border-sky-500 ring-sky-500/30",
        default: "border-slate-700 ring-slate-700/30"
    };

    // Only take first 6 avatars
    const visibleAvatars = avatars.slice(0, 6);

    return (
        <div className={cn("relative pointer-events-none", sizeClasses[size], className)}>
            {/* Avatars in ring formation */}
            {visibleAvatars.map((avatar, idx) => {
                const statusColor = statusColors[avatar.status as string] || statusColors.default;

                return (
                    <div
                        key={avatar.driver_id}
                        className="absolute z-10"
                        style={positions[idx]}
                    >
                        <div className="relative group pointer-events-auto">
                            <Avatar
                                id={avatar.avatar_id}
                                size={avatarSizes[size]}
                                className={cn(
                                    "border-2 shadow-lg transition-transform hover:scale-125 hover:z-50",
                                    statusColor, // Dynamic status color
                                    avatar.is_current_user && "border-yellow-400 ring-4 ring-yellow-400/50 scale-125 z-40"
                                )}
                            />
                            {avatar.is_current_user && (
                                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-black border-2 border-slate-900 z-50">
                                    ✓
                                </span>
                            )}
                            {/* Simple tooltip */}
                            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs font-medium rounded whitespace-nowrap pointer-events-none z-50 border border-slate-700">
                                {avatar.is_current_user ? 'You' : avatar.handle}
                                <span className="block text-[10px] text-slate-400 capitalize">{avatar.status || 'Unknown'}</span>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Center count badge */}
            {overflowCount > 0 && (
                <div className="absolute inset-0 flex items-center justify-center z-0">
                    <div className="bg-slate-900/95 backdrop-blur-md text-slate-200 text-sm font-bold px-3 py-1.5 rounded-full border border-slate-700 shadow-xl">
                        +{overflowCount}
                    </div>
                </div>
            )}
        </div>
    );
}
