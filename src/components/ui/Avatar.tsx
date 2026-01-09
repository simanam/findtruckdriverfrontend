import { cn } from "@/lib/utils";

interface AvatarProps {
    id: string; // seed for dicebear
    size?: 'sm' | 'md' | 'lg' | number;
    className?: string;
    alt?: string;
}

export function Avatar({ id, size = 'md', className, alt }: AvatarProps) {
    // Determine dimensions based on size prop
    let width = 48; // default md
    let height = 48;

    if (typeof size === 'number') {
        width = size;
        height = size;
    } else {
        switch (size) {
            case 'sm': width = 32; height = 32; break;
            case 'md': width = 48; height = 48; break;
            case 'lg': width = 64; height = 64; break;
        }
    }

    const src = `https://api.dicebear.com/9.x/avataaars/svg?seed=${id}`;

    return (
        <div
            className={cn(
                "relative rounded-full overflow-hidden bg-slate-800 shrink-0",
                className
            )}
            style={{ width, height }}
        >
            <img
                src={src}
                alt={alt || `Avatar ${id}`}
                className="w-full h-full object-cover"
                loading="lazy"
            />
        </div>
    );
}
