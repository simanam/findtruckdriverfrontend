import { cn } from "@/lib/utils";

export type DriverStatus = 'rolling' | 'waiting' | 'parked';

interface StatusDotProps {
    status: DriverStatus | string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    showPulse?: boolean;
}

export function StatusDot({ status, size = 'md', className, showPulse = false }: StatusDotProps) {
    const sizeClasses = {
        sm: "w-2 h-2",
        md: "w-3 h-3",
        lg: "w-4 h-4"
    };

    const statusColors = {
        rolling: "bg-emerald-500",
        waiting: "bg-rose-500",
        parked: "bg-sky-500",
        default: "bg-slate-500"
    };

    const normalizedStatus = (status in statusColors) ? status as keyof typeof statusColors : 'default';
    const colorClass = statusColors[normalizedStatus];

    return (
        <div className={cn("relative flex items-center justify-center", className)}>
            {showPulse && (
                <span className={cn(
                    "absolute inset-0 rounded-full opacity-75 animate-ping",
                    colorClass
                )} />
            )}
            <span className={cn(
                "rounded-full relative",
                sizeClasses[size],
                colorClass
            )} />
        </div>
    );
}
