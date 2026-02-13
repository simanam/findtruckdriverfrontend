"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { Star, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function MyReviewsPage() {
    const router = useRouter();
    const [reviews, setReviews] = useState<any[]>([]);
    const [facilities, setFacilities] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!api.isLoggedIn) {
            router.push("/login");
            return;
        }

        const fetchReviews = async () => {
            try {
                const data = await api.reviews.getMyReviews();
                setReviews(data.reviews || []);

                // Fetch facility names for each review
                const facilityMap: Record<string, any> = {};
                for (const review of data.reviews || []) {
                    if (!facilityMap[review.reviewed_facility_id]) {
                        try {
                            const facData = await api.reviews.getFacility(review.reviewed_facility_id);
                            facilityMap[review.reviewed_facility_id] = facData.facility;
                        } catch {
                            // Skip if facility not found
                        }
                    }
                }
                setFacilities(facilityMap);
            } catch (err) {
                console.error("Failed to load reviews:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [router]);

    const handleDelete = async (facilityId: string) => {
        if (!confirm("Delete this review?")) return;
        try {
            await api.reviews.deleteReview(facilityId);
            setReviews((prev) => prev.filter((r) => r.reviewed_facility_id !== facilityId));
        } catch (err: any) {
            alert(err?.message || "Failed to delete review");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-8">
                {/* Back */}
                <Link
                    href="/reviews"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Reviews
                </Link>

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Star className="w-6 h-6 text-amber-400" />
                        My Reviews
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {reviews.length} {reviews.length === 1 ? "review" : "reviews"} submitted
                    </p>
                </div>

                {/* Reviews */}
                {reviews.length === 0 ? (
                    <div className="text-center py-16">
                        <Star className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 text-lg">No reviews yet</p>
                        <p className="text-slate-500 text-sm mt-1">
                            Start by searching for a facility to review
                        </p>
                        <Link
                            href="/reviews"
                            className="inline-flex mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-medium rounded-lg text-sm transition-colors"
                        >
                            Find Facilities
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reviews.map((review) => {
                            const fac = facilities[review.reviewed_facility_id];
                            return (
                                <div key={review.id}>
                                    {fac && (
                                        <Link
                                            href={`/reviews/${review.reviewed_facility_id}`}
                                            className="text-sm font-medium text-sky-400 hover:text-sky-300 mb-1.5 block transition-colors"
                                        >
                                            {fac.name}
                                            <span className="text-slate-600 ml-1.5 text-xs">
                                                {fac.facility_type?.replace(/_/g, " ")}
                                                {fac.city && ` · ${fac.city}, ${fac.state || ""}`}
                                            </span>
                                        </Link>
                                    )}
                                    <ReviewCard
                                        review={review}
                                        showActions
                                        onEdit={() => router.push(`/reviews/${review.reviewed_facility_id}`)}
                                        onDelete={() => handleDelete(review.reviewed_facility_id)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
