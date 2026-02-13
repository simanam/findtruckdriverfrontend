"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { StarRating } from "@/components/reviews/StarRating";
import { CategoryRatingForm, CATEGORY_CONFIG } from "@/components/reviews/CategoryRatingForm";
import { FacilityTypeSelector } from "@/components/reviews/FacilityTypeSelector";
import { ReviewCard, VISIT_COUNT_LABELS } from "@/components/reviews/ReviewCard";
import { TYPE_CONFIG } from "@/components/reviews/FacilityCard";
import { ArrowLeft, Star, MapPin, Phone, Globe, Loader2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function FacilityDetailPage() {
    const params = useParams();
    const router = useRouter();
    const facilityId = params.id as string;

    const [facility, setFacility] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [myReview, setMyReview] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [driverId, setDriverId] = useState<string | null>(null);

    // Review form state
    const [overallRating, setOverallRating] = useState(0);
    const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({});
    const [comment, setComment] = useState("");
    const [wouldReturn, setWouldReturn] = useState<boolean | null>(null);
    const [visitDate, setVisitDate] = useState("");
    const [visitCount, setVisitCount] = useState("first_visit");
    const [confirmType, setConfirmType] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const fetchFacility = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.reviews.getFacility(facilityId);
            setFacility(data.facility);
            setReviews(data.reviews || []);

            // Set confirm type from facility's current type
            if (!data.facility.type_confirmed) {
                setConfirmType(data.facility.facility_type);
            }
        } catch (err) {
            console.error("Failed to load facility:", err);
        } finally {
            setLoading(false);
        }
    }, [facilityId]);

    useEffect(() => {
        fetchFacility();
    }, [fetchFacility]);

    // Check login state and find my review
    useEffect(() => {
        const checkAuth = async () => {
            if (api.isLoggedIn) {
                setIsLoggedIn(true);
                try {
                    const driver = await api.drivers.getMe();
                    setDriverId(driver.id);
                } catch {
                    // Not logged in or no profile
                }
            }
        };
        checkAuth();
    }, []);

    // Find my existing review
    useEffect(() => {
        if (driverId && reviews.length > 0) {
            const mine = reviews.find((r) => r.reviewer_id === driverId);
            if (mine) {
                setMyReview(mine);
                // Pre-fill form for editing
                setOverallRating(mine.overall_rating);
                setCategoryRatings(mine.category_ratings || {});
                setComment(mine.comment || "");
                setWouldReturn(mine.would_return);
                setVisitDate(mine.visit_date || "");
                setVisitCount(mine.visit_count || "first_visit");
                setIsEditing(true);
            }
        }
    }, [driverId, reviews]);

    const handleSubmitReview = async () => {
        if (overallRating === 0) {
            setSubmitError("Please select an overall rating");
            return;
        }

        if (!facility.type_confirmed && !confirmType) {
            setSubmitError("Please select the facility type");
            return;
        }

        setSubmitting(true);
        setSubmitError("");

        try {
            const reviewData: any = {
                overall_rating: overallRating,
                category_ratings: categoryRatings,
                comment: comment || undefined,
                would_return: wouldReturn ?? undefined,
                visit_date: visitDate || undefined,
                visit_count: visitCount,
            };

            if (!facility.type_confirmed && confirmType) {
                reviewData.confirm_type = confirmType;
            }

            if (isEditing) {
                await api.reviews.updateReview(facilityId, reviewData);
            } else {
                await api.reviews.submitReview(facilityId, reviewData);
            }

            await fetchFacility();
            setSubmitError("");
        } catch (err: any) {
            setSubmitError(err?.message || "Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReview = async () => {
        if (!confirm("Delete your review?")) return;
        try {
            await api.reviews.deleteReview(facilityId);
            setMyReview(null);
            setIsEditing(false);
            setOverallRating(0);
            setCategoryRatings({});
            setComment("");
            setWouldReturn(null);
            setVisitDate("");
            setVisitCount("first_visit");
            await fetchFacility();
        } catch (err: any) {
            alert(err?.message || "Failed to delete review");
        }
    };

    const handleFlagType = async () => {
        if (!confirm("Flag this facility as the wrong category? After 3 flags, the type will be reset for re-classification.")) return;
        try {
            await api.reviews.flagType(facilityId);
            await fetchFacility();
        } catch (err: any) {
            alert(err?.message || "Failed to flag");
        }
    };

    // Dynamic facility type for the form
    const activeFacilityType = (!facility?.type_confirmed && confirmType)
        ? confirmType
        : facility?.facility_type || "other";

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
            </div>
        );
    }

    if (!facility) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">Facility not found</p>
                    <Link href="/reviews" className="text-sky-400 text-sm mt-2 inline-block hover:underline">
                        Back to Reviews
                    </Link>
                </div>
            </div>
        );
    }

    const typeInfo = TYPE_CONFIG[facility.facility_type] || TYPE_CONFIG.other;
    const TypeIcon = typeInfo.icon;
    const location = [facility.city, facility.state].filter(Boolean).join(", ");

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

                {/* Facility Header */}
                <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 mb-6">
                    <div className="flex items-start gap-3 mb-3">
                        <TypeIcon className={cn("w-7 h-7 shrink-0 mt-0.5", typeInfo.color)} />
                        <div>
                            <h1 className="text-xl font-bold text-white">{facility.name}</h1>
                            <p className="text-sm text-slate-400 mt-0.5">
                                <span className={typeInfo.color}>{typeInfo.label}</span>
                                {location && <span> · {location}</span>}
                            </p>
                            {facility.address && (
                                <p className="text-xs text-slate-500 mt-1">{facility.address}</p>
                            )}
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                        {facility.phone && (
                            <a href={`tel:${facility.phone}`} className="flex items-center gap-1 hover:text-slate-300 transition-colors">
                                <Phone className="w-3.5 h-3.5" /> {facility.phone}
                            </a>
                        )}
                        {facility.website && (
                            <a href={facility.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-slate-300 transition-colors">
                                <Globe className="w-3.5 h-3.5" /> Website
                            </a>
                        )}
                    </div>

                    {/* Overall rating */}
                    <div className="flex items-center gap-2 mt-4">
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                        <span className="text-lg font-bold text-amber-400">
                            {facility.avg_overall_rating || "—"}
                        </span>
                        <span className="text-sm text-slate-500">
                            ({facility.total_reviews} {facility.total_reviews === 1 ? "review" : "reviews"})
                        </span>
                    </div>

                    {/* Category breakdown */}
                    {facility.category_averages && Object.keys(facility.category_averages).length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-800/50">
                            <p className="text-sm font-medium text-slate-300 mb-2">Category Breakdown</p>
                            <div className="space-y-1.5">
                                {Object.entries(facility.category_averages).map(([key, val]) => (
                                    <div key={key} className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400">
                                            {key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <StarRating value={Math.round(val as number)} readonly size="sm" />
                                            <span className="text-xs text-slate-500 w-6 text-right">{val as number}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Review Form */}
                {isLoggedIn ? (
                    <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 mb-6">
                        <h2 className="text-base font-semibold text-white mb-4">
                            {isEditing ? "Edit Your Review" : "Write a Review"}
                        </h2>

                        {/* Type confirmation (first reviewer only) */}
                        {!facility.type_confirmed && (
                            <div className="mb-4 p-3 bg-slate-800/30 border border-slate-700/30 rounded-lg">
                                <FacilityTypeSelector
                                    value={confirmType}
                                    onChange={(type) => {
                                        setConfirmType(type);
                                        // Clear category ratings when type changes
                                        setCategoryRatings({});
                                    }}
                                    autoDetected={facility.auto_detected_type}
                                />
                            </div>
                        )}

                        {/* Overall rating */}
                        <div className="mb-4">
                            <p className="text-sm font-medium text-slate-300 mb-2">Overall Rating *</p>
                            <StarRating value={overallRating} onChange={setOverallRating} size="lg" />
                        </div>

                        {/* Category ratings */}
                        <CategoryRatingForm
                            facilityType={activeFacilityType}
                            values={categoryRatings}
                            onChange={setCategoryRatings}
                            className="mb-4"
                        />

                        {/* Would return */}
                        <div className="mb-4">
                            <p className="text-sm font-medium text-slate-300 mb-2">Would you return?</p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setWouldReturn(true)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                                        wouldReturn === true
                                            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                                            : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-300"
                                    )}
                                >
                                    <CheckCircle className="w-4 h-4" /> Yes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setWouldReturn(false)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                                        wouldReturn === false
                                            ? "bg-rose-500/20 border-rose-500/50 text-rose-400"
                                            : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-300"
                                    )}
                                >
                                    <XCircle className="w-4 h-4" /> No
                                </button>
                            </div>
                        </div>

                        {/* Visit count */}
                        <div className="mb-4">
                            <label className="text-sm font-medium text-slate-300 block mb-2">How often do you visit?</label>
                            <select
                                value={visitCount}
                                onChange={(e) => setVisitCount(e.target.value)}
                                className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500/50"
                            >
                                {Object.entries(VISIT_COUNT_LABELS).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Visit date */}
                        <div className="mb-4">
                            <label className="text-sm font-medium text-slate-300 block mb-2">Visit Date (optional)</label>
                            <input
                                type="date"
                                value={visitDate}
                                onChange={(e) => setVisitDate(e.target.value)}
                                max={new Date().toISOString().split("T")[0]}
                                className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500/50 w-full sm:w-auto"
                            />
                        </div>

                        {/* Comment */}
                        <div className="mb-4">
                            <label className="text-sm font-medium text-slate-300 block mb-2">Comment (optional)</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your experience..."
                                maxLength={2000}
                                rows={3}
                                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50 resize-none"
                            />
                            <p className="text-xs text-slate-600 mt-1 text-right">{comment.length}/2000</p>
                        </div>

                        {submitError && (
                            <p className="text-sm text-rose-400 mb-3">{submitError}</p>
                        )}

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSubmitReview}
                                disabled={submitting || overallRating === 0}
                                className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isEditing ? "Update Review" : "Submit Review"}
                            </button>
                            {isEditing && (
                                <button
                                    onClick={handleDeleteReview}
                                    className="px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-colors"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5 mb-6 text-center">
                        <p className="text-slate-400 text-sm mb-3">Log in to write a review</p>
                        <Link
                            href="/login"
                            className="inline-flex px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-medium rounded-lg text-sm transition-colors"
                        >
                            Login
                        </Link>
                    </div>
                )}

                {/* Wrong category flag */}
                {facility.type_confirmed && isLoggedIn && (
                    <div className="text-center mb-6">
                        <button
                            onClick={handleFlagType}
                            className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
                        >
                            Wrong category?
                        </button>
                    </div>
                )}

                {/* Reviews list */}
                <div>
                    <h2 className="text-base font-semibold text-white mb-3">
                        Reviews ({reviews.length})
                    </h2>
                    {reviews.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-8">
                            No reviews yet. Be the first!
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {reviews.map((review) => (
                                <ReviewCard
                                    key={review.id}
                                    review={review}
                                    showActions={review.reviewer_id === driverId}
                                    onEdit={review.reviewer_id === driverId ? () => {
                                        setOverallRating(review.overall_rating);
                                        setCategoryRatings(review.category_ratings || {});
                                        setComment(review.comment || "");
                                        setWouldReturn(review.would_return);
                                        setVisitDate(review.visit_date || "");
                                        setVisitCount(review.visit_count || "first_visit");
                                        setIsEditing(true);
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                    } : undefined}
                                    onDelete={review.reviewer_id === driverId ? handleDeleteReview : undefined}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
