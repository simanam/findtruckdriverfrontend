"use client";

import { StarRating } from "./StarRating";

interface CategoryRatingFormProps {
    facilityType: string;
    values: Record<string, number>;
    onChange: (values: Record<string, number>) => void;
    className?: string;
}

const CATEGORY_CONFIG: Record<string, Array<{ key: string; label: string }>> = {
    shipper: [
        { key: "dock_wait_time", label: "Dock Wait Time" },
        { key: "check_in_process", label: "Check-in Process" },
        { key: "dock_staff", label: "Dock Staff" },
        { key: "parking", label: "Parking" },
        { key: "restroom_access", label: "Restroom Access" },
        { key: "safety", label: "Safety" },
    ],
    receiver: [
        { key: "dock_wait_time", label: "Dock Wait Time" },
        { key: "check_in_process", label: "Check-in Process" },
        { key: "dock_staff", label: "Dock Staff" },
        { key: "parking", label: "Parking" },
        { key: "restroom_access", label: "Restroom Access" },
        { key: "safety", label: "Safety" },
    ],
    warehouse: [
        { key: "dock_wait_time", label: "Dock Wait Time" },
        { key: "organization", label: "Organization" },
        { key: "dock_equipment", label: "Dock Equipment" },
        { key: "parking", label: "Parking" },
        { key: "lumper_fees", label: "Lumper Fees" },
        { key: "safety", label: "Safety" },
    ],
    mechanic: [
        { key: "turnaround_time", label: "Turnaround Time" },
        { key: "quality_of_work", label: "Quality of Work" },
        { key: "pricing", label: "Pricing" },
        { key: "communication", label: "Communication" },
        { key: "parts_availability", label: "Parts Availability" },
        { key: "truck_parking", label: "Truck Parking" },
    ],
    truck_stop: [
        { key: "fuel_price", label: "Fuel Price" },
        { key: "parking", label: "Parking" },
        { key: "showers", label: "Showers" },
        { key: "food", label: "Food" },
        { key: "restrooms", label: "Restrooms" },
        { key: "wifi", label: "WiFi" },
        { key: "safety", label: "Safety" },
    ],
    rest_area: [
        { key: "parking", label: "Parking" },
        { key: "restrooms", label: "Restrooms" },
        { key: "safety", label: "Safety" },
        { key: "truck_friendly", label: "Truck Friendly" },
    ],
    broker: [
        { key: "pay_speed", label: "Pay Speed" },
        { key: "rate_fairness", label: "Rate Fairness" },
        { key: "communication", label: "Communication" },
        { key: "load_accuracy", label: "Load Accuracy" },
        { key: "detention_pay", label: "Detention Pay" },
    ],
    weigh_station: [
        { key: "wait_time", label: "Wait Time" },
        { key: "staff", label: "Staff" },
        { key: "safety", label: "Safety" },
    ],
    service_plaza: [
        { key: "fuel_price", label: "Fuel Price" },
        { key: "parking", label: "Parking" },
        { key: "food", label: "Food" },
        { key: "restrooms", label: "Restrooms" },
        { key: "safety", label: "Safety" },
    ],
};

export function CategoryRatingForm({ facilityType, values, onChange, className }: CategoryRatingFormProps) {
    const categories = CATEGORY_CONFIG[facilityType] || [];

    if (categories.length === 0) return null;

    const handleChange = (key: string, rating: number) => {
        onChange({ ...values, [key]: rating });
    };

    return (
        <div className={className}>
            <p className="text-sm font-medium text-slate-300 mb-3">Quick Ratings</p>
            <div className="space-y-2.5">
                {categories.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between gap-3">
                        <span className="text-sm text-slate-400 min-w-[120px]">{label}</span>
                        <StarRating
                            value={values[key] || 0}
                            onChange={(v) => handleChange(key, v)}
                            size="sm"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export { CATEGORY_CONFIG };
