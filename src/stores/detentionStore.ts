import { create } from 'zustand';

export interface DetentionSession {
    id: string;
    driver_id: string;
    reviewed_facility_id: string;
    facility_name: string;
    facility_type: string;
    facility_address?: string;
    facility_latitude?: number;
    facility_longitude?: number;
    checked_in_at: string;
    checked_out_at?: string;
    checkin_latitude: number;
    checkin_longitude: number;
    checkout_latitude?: number;
    checkout_longitude?: number;
    free_time_minutes: number;
    total_time_minutes?: number;
    detention_time_minutes?: number;
    checkout_type?: string;
    load_type?: string;
    status: 'active' | 'completed' | 'cancelled';
    notes?: string;
    proof_generated_at?: string;
    created_at: string;
}

export interface AutoCheckoutAlert {
    session_id: string;
    facility_name: string;
    facility_type: string;
    checked_in_at: string;
    distance_from_facility_miles: number;
}

interface DetentionState {
    // Active session
    activeSession: DetentionSession | null;
    isLoading: boolean;

    // Completed session (for showing checkout summary)
    completedSession: DetentionSession | null;

    // UI state
    showCheckInFlow: boolean;
    showCheckOutSummary: boolean;
    showManualCheckout: boolean;
    autoCheckoutAlert: AutoCheckoutAlert | null;

    // Settings
    freeTimeMinutes: number;

    // Selected facility for check-in (from search or map tap)
    selectedFacilityId: string | null;

    // Facility popup visibility (controls hiding the bottom bar)
    facilityPopupOpen: boolean;

    // Actions
    setActiveSession: (session: DetentionSession | null) => void;
    setCompletedSession: (session: DetentionSession | null) => void;
    setLoading: (loading: boolean) => void;
    setShowCheckInFlow: (show: boolean) => void;
    setShowCheckOutSummary: (show: boolean) => void;
    setShowManualCheckout: (show: boolean) => void;
    setAutoCheckoutAlert: (alert: AutoCheckoutAlert | null) => void;
    setFreeTimeMinutes: (minutes: number) => void;
    setSelectedFacilityId: (id: string | null) => void;
    setFacilityPopupOpen: (open: boolean) => void;
    reset: () => void;
}

export const useDetentionStore = create<DetentionState>((set) => ({
    activeSession: null,
    isLoading: false,
    completedSession: null,
    showCheckInFlow: false,
    showCheckOutSummary: false,
    showManualCheckout: false,
    autoCheckoutAlert: null,
    freeTimeMinutes: 120,
    selectedFacilityId: null,
    facilityPopupOpen: false,

    setActiveSession: (session) => set({ activeSession: session }),
    setCompletedSession: (session) => set({ completedSession: session }),
    setLoading: (loading) => set({ isLoading: loading }),
    setShowCheckInFlow: (show) => set({ showCheckInFlow: show }),
    setShowCheckOutSummary: (show) => set({ showCheckOutSummary: show }),
    setShowManualCheckout: (show) => set({ showManualCheckout: show }),
    setAutoCheckoutAlert: (alert) => set({ autoCheckoutAlert: alert }),
    setFreeTimeMinutes: (minutes) => set({ freeTimeMinutes: minutes }),
    setSelectedFacilityId: (id) => set({ selectedFacilityId: id }),
    setFacilityPopupOpen: (open) => set({ facilityPopupOpen: open }),
    reset: () => set({
        activeSession: null,
        isLoading: false,
        completedSession: null,
        showCheckInFlow: false,
        showCheckOutSummary: false,
        showManualCheckout: false,
        autoCheckoutAlert: null,
        selectedFacilityId: null,
        facilityPopupOpen: false,
    }),
}));
