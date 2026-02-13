"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
    value: number;
    onChange?: (value: number) => void;
    size?: "sm" | "md" | "lg";
    readonly?: boolean;
    className?: string;
}

const sizeMap = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
};

const touchMap = {
    sm: "p-0.5",
    md: "p-1",
    lg: "p-1.5",
};

export function StarRating({ value, onChange, size = "md", readonly = false, className }: StarRatingProps) {
    return (
        <div className={cn("flex items-center gap-0.5", className)}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => onChange?.(star)}
                    className={cn(
                        touchMap[size],
                        readonly
                            ? "cursor-default"
                            : "cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                    )}
                    aria-label={`${star} star${star > 1 ? "s" : ""}`}
                >
                    <Star
                        className={cn(
                            sizeMap[size],
                            "transition-colors",
                            star <= value
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-600"
                        )}
                    />
                </button>
            ))}
        </div>
    );
}
