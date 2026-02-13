"use client";

import { StarRating } from "./StarRating";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";

const VISIT_COUNT_LABELS: Record<string, string> = {
    first_visit: "First visit",
    "2_to_5": "2-5 visits",
    "6_to_10": "6-10 visits",
    regular: "Regular",
};

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

interface ReviewCardProps {
    review: {
        id: string;
        overall_rating: number;
        category_ratings?: Record<string, number>;
        comment?: string;
        visit_date?: string;
        would_return?: boolean;
        visit_count?: string;
        revision_number?: number;
        created_at: string;
        updated_at?: string;
        reviewer_handle?: string;
        reviewer_avatar_id?: string;
    };
    onEdit?: () => void;
    onDelete?: () => void;
    showActions?: boolean;
}

export function ReviewCard({ review, onEdit, onDelete, showActions = false }: ReviewCardProps) {
    const avatarSrc = review.reviewer_avatar_id?.startsWith("http")
        ? review.reviewer_avatar_id
        : `https://api.dicebear.com/9.x/avataaars/svg?seed=${review.reviewer_avatar_id || "default"}`;

    const isUpdated = (review.revision_number || 0) > 0;
    const visitLabel = review.visit_count ? VISIT_COUNT_LABELS[review.visit_count] : null;

    return (
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden ring-1 ring-slate-700">
                        <img
                            src={avatarSrc}
                            alt={review.reviewer_handle || "Driver"}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <span className="text-sm font-medium text-slate-300">
                            {review.reviewer_handle || "Anonymous"}
                        </span>
                        <span className="text-xs text-slate-600 ml-2">
                            {timeAgo(review.created_at)}
                        </span>
                        {isUpdated && (
                            <span className="inline-flex items-center gap-0.5 ml-1.5 text-[10px] text-sky-400/70">
                                <RefreshCw className="w-2.5 h-2.5" />
                                Updated
                            </span>
                        )}
                    </div>
                </div>
                <StarRating value={review.overall_rating} readonly size="sm" />
            </div>

            {/* Visit count badge */}
            {visitLabel && (
                <span className="inline-block text-[10px] px-1.5 py-0.5 bg-slate-800/80 text-slate-500 rounded mb-2">
                    {visitLabel}
                </span>
            )}

            {/* Comment */}
            {review.comment && (
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    {review.comment}
                </p>
            )}

            {/* Would return */}
            {review.would_return !== null && review.would_return !== undefined && (
                <div className="flex items-center gap-1.5 mt-2">
                    {review.would_return ? (
                        <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-xs text-emerald-400">Would return</span>
                        </>
                    ) : (
                        <>
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            <span className="text-xs text-rose-400">Would not return</span>
                        </>
                    )}
                </div>
            )}

            {/* Actions */}
            {showActions && (
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-800/50">
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
                        >
                            Edit
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={onDelete}
                            className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                        >
                            Delete
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export { VISIT_COUNT_LABELS };
