"use client";

import { useState, useRef, useCallback } from "react";
import { FileText, Loader2, Download, X } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface DetentionProofGeneratorProps {
    sessionId: string;
    onClose: () => void;
}

interface ProofData {
    session: {
        id: string;
        facility_name: string;
        facility_type: string;
        facility_address?: string;
        checked_in_at: string;
        checked_out_at: string;
        free_time_minutes: number;
        total_time_minutes: number;
        detention_time_minutes: number;
        checkout_type: string;
        load_type?: string;
    };
    driver_name: string;
    driver_handle: string;
    generated_at: string;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} minutes`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h} hour${h > 1 ? "s" : ""} ${m} min` : `${h} hour${h > 1 ? "s" : ""}`;
}

export function DetentionProofGenerator({ sessionId, onClose }: DetentionProofGeneratorProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [proofData, setProofData] = useState<ProofData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const proofRef = useRef<HTMLDivElement>(null);

    // Fetch proof data
    const loadProofData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.detention.getProof(sessionId);
            setProofData(data);
        } catch (e: any) {
            setError(e?.message || "Failed to load proof data");
        } finally {
            setIsLoading(false);
        }
    }, [sessionId]);

    // Load on first render
    useState(() => {
        loadProofData();
    });

    // Generate and download PDF
    const handleDownload = useCallback(async () => {
        if (!proofRef.current || !proofData) return;

        setIsGenerating(true);
        try {
            const html2canvas = (await import("html2canvas")).default;
            const { jsPDF } = await import("jspdf");

            // Render the proof div to canvas
            const canvas = await html2canvas(proofRef.current, {
                scale: 2,
                backgroundColor: "#ffffff",
                logging: false,
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

            const facilitySlug = proofData.session.facility_name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .slice(0, 30);
            const date = new Date(proofData.session.checked_in_at)
                .toISOString()
                .split("T")[0];

            pdf.save(`detention-proof-${facilitySlug}-${date}.pdf`);
        } catch (e: any) {
            setError("Failed to generate PDF. Please try again.");
            console.error("PDF generation failed:", e);
        } finally {
            setIsGenerating(false);
        }
    }, [proofData]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-red-400" />
                        <h2 className="text-lg font-bold text-white">Detention Proof</h2>
                    </div>
                    <button onClick={onClose} className="p-1 text-slate-500 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-8">
                            <p className="text-sm text-red-400 mb-3">{error}</p>
                            <button
                                onClick={loadProofData}
                                className="text-sm text-blue-400 hover:text-blue-300"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {proofData && (
                        <>
                            {/* Hidden proof template for PDF capture */}
                            <div
                                ref={proofRef}
                                className="bg-white text-black p-6 rounded-lg"
                                style={{ fontFamily: "Arial, sans-serif" }}
                            >
                                {/* PDF Header */}
                                <div style={{ borderBottom: "2px solid #dc2626", paddingBottom: "12px", marginBottom: "16px" }}>
                                    <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#dc2626", margin: 0 }}>
                                        DETENTION TIME REPORT
                                    </h1>
                                    <p style={{ fontSize: "11px", color: "#666", margin: "4px 0 0" }}>
                                        Generated by FindTruckDriver
                                    </p>
                                </div>

                                {/* Driver Info */}
                                <div style={{ marginBottom: "16px" }}>
                                    <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>Driver</p>
                                    <p style={{ fontSize: "14px", fontWeight: "bold", margin: "2px 0 0" }}>
                                        @{proofData.driver_handle || proofData.driver_name}
                                    </p>
                                </div>

                                {/* Facility Info */}
                                <div style={{ background: "#f8f8f8", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
                                    <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>Facility</p>
                                    <p style={{ fontSize: "16px", fontWeight: "bold", margin: "2px 0 0" }}>
                                        {proofData.session.facility_name}
                                    </p>
                                    <p style={{ fontSize: "11px", color: "#888", margin: "2px 0 0", textTransform: "capitalize" }}>
                                        {(proofData.session.facility_type || "").replace("_", " ")}
                                    </p>
                                    {proofData.session.facility_address && (
                                        <p style={{ fontSize: "11px", color: "#888", margin: "2px 0 0" }}>
                                            {proofData.session.facility_address}
                                        </p>
                                    )}
                                </div>

                                {/* Time Details */}
                                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px" }}>
                                    <tbody>
                                        {proofData.session.load_type && proofData.session.load_type !== "none" && (
                                            <tr style={{ borderBottom: "1px solid #eee" }}>
                                                <td style={{ padding: "8px 0", fontSize: "13px", color: "#666" }}>Load Type</td>
                                                <td style={{ padding: "8px 0", fontSize: "13px", fontWeight: "bold", textAlign: "right", textTransform: "capitalize" }}>
                                                    {proofData.session.load_type === "pickup" ? "Picking Up" :
                                                     proofData.session.load_type === "dropoff" ? "Dropping Off" :
                                                     proofData.session.load_type === "both" ? "Pickup & Dropoff" :
                                                     proofData.session.load_type}
                                                </td>
                                            </tr>
                                        )}
                                        <tr style={{ borderBottom: "1px solid #eee" }}>
                                            <td style={{ padding: "8px 0", fontSize: "13px", color: "#666" }}>Date</td>
                                            <td style={{ padding: "8px 0", fontSize: "13px", fontWeight: "bold", textAlign: "right" }}>
                                                {formatDate(proofData.session.checked_in_at)}
                                            </td>
                                        </tr>
                                        <tr style={{ borderBottom: "1px solid #eee" }}>
                                            <td style={{ padding: "8px 0", fontSize: "13px", color: "#666" }}>Arrival Time</td>
                                            <td style={{ padding: "8px 0", fontSize: "13px", fontWeight: "bold", textAlign: "right" }}>
                                                {formatTime(proofData.session.checked_in_at)}
                                            </td>
                                        </tr>
                                        <tr style={{ borderBottom: "1px solid #eee" }}>
                                            <td style={{ padding: "8px 0", fontSize: "13px", color: "#666" }}>Departure Time</td>
                                            <td style={{ padding: "8px 0", fontSize: "13px", fontWeight: "bold", textAlign: "right" }}>
                                                {formatTime(proofData.session.checked_out_at)}
                                            </td>
                                        </tr>
                                        <tr style={{ borderBottom: "1px solid #eee" }}>
                                            <td style={{ padding: "8px 0", fontSize: "13px", color: "#666" }}>Total Time at Facility</td>
                                            <td style={{ padding: "8px 0", fontSize: "13px", fontWeight: "bold", textAlign: "right" }}>
                                                {formatDuration(proofData.session.total_time_minutes)}
                                            </td>
                                        </tr>
                                        <tr style={{ borderBottom: "1px solid #eee" }}>
                                            <td style={{ padding: "8px 0", fontSize: "13px", color: "#666" }}>Free Time Allowed</td>
                                            <td style={{ padding: "8px 0", fontSize: "13px", textAlign: "right" }}>
                                                {formatDuration(proofData.session.free_time_minutes)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: "10px 0", fontSize: "15px", fontWeight: "bold", color: "#dc2626" }}>
                                                DETENTION TIME
                                            </td>
                                            <td style={{ padding: "10px 0", fontSize: "18px", fontWeight: "bold", color: "#dc2626", textAlign: "right" }}>
                                                {formatDuration(proofData.session.detention_time_minutes)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Checkout type note */}
                                {proofData.session.checkout_type === "manual_entry" && (
                                    <p style={{ fontSize: "10px", color: "#999", fontStyle: "italic", marginBottom: "12px" }}>
                                        * Departure time was manually entered by the driver
                                    </p>
                                )}

                                {/* Footer */}
                                <div style={{ borderTop: "1px solid #ddd", paddingTop: "10px" }}>
                                    <p style={{ fontSize: "10px", color: "#999", margin: 0 }}>
                                        Report ID: {proofData.session.id}
                                    </p>
                                    <p style={{ fontSize: "10px", color: "#999", margin: "2px 0 0" }}>
                                        Generated: {new Date(proofData.generated_at).toLocaleString()}
                                    </p>
                                    <p style={{ fontSize: "10px", color: "#999", margin: "2px 0 0" }}>
                                        findtruckdriver.com
                                    </p>
                                </div>
                            </div>

                            {/* Preview label */}
                            <p className="text-[10px] text-slate-600 text-center mt-2 mb-4">
                                Preview of your detention proof document
                            </p>
                        </>
                    )}
                </div>

                {/* Actions */}
                {proofData && (
                    <div className="px-4 pb-4">
                        <button
                            onClick={handleDownload}
                            disabled={isGenerating}
                            className={cn(
                                "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-colors",
                                isGenerating
                                    ? "bg-red-800/50 text-red-400/50 cursor-not-allowed"
                                    : "bg-red-600 hover:bg-red-500 text-white active:scale-95"
                            )}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Generating PDF...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
