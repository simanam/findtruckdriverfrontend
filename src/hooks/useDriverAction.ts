import { useCallback } from 'react';
import { api } from '@/lib/api';
import { useFollowUpStore } from '@/stores/followUpStore';
import { useOnboardingStore, DriverStatus } from '@/stores/onboardingStore';

export function useDriverAction() {
    const { setStatus, setLastLocationUpdate, setFacilityName } = useOnboardingStore();
    const { open } = useFollowUpStore();

    const updateStatus = useCallback(async (newStatus: DriverStatus) => {
        try {
            // Get current location for precise context
            let location = undefined;
            if (navigator.geolocation) {
                try {
                    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
                    });
                    location = {
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude
                    };
                } catch (e) {
                    console.warn("Could not get location for status update", e);
                }
            }

            // Call API
            console.log("📍 [useDriverAction] Sending status update:", { newStatus, location });
            const res = await api.drivers.updateStatus(newStatus, location);
            console.log("✅ [useDriverAction] Response received:", res);

            // Update local state
            setStatus(newStatus);
            setLastLocationUpdate(Date.now());
            if (res.location?.facility_name) {
                setFacilityName(res.location.facility_name);
            } else {
                setFacilityName(null);
            }

            // Handle Follow-Up
            if (res.follow_up_question) {
                console.log("💬 [useDriverAction] Triggering follow-up question:", res.follow_up_question);
                open(res.follow_up_question, res.status_update_id);
            } else {
                console.log("ℹ️ [useDriverAction] No follow-up question in response");
            }

            return res;
        } catch (error: any) {
            console.error("Failed to update status", error);
            // Log full details for debugging
            if (error?.data) console.error("API Error Data:", error.data);
            if (error?.message) console.error("Error Message:", error.message);

            throw error;
        }
    }, [setStatus, setLastLocationUpdate, open]);

    return { updateStatus };
}
