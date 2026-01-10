import { create } from 'zustand';

export type DriverStatus = 'rolling' | 'waiting' | 'parked';

interface OnboardingState {
    step: number;
    status: DriverStatus | null;
    avatarId: string | null;
    handle: string;
    email: string;
    lastLocationUpdate: number;
    facilityName: string | null;

    setStep: (step: number) => void;
    setStatus: (status: DriverStatus) => void;
    setAvatarId: (id: string) => void;
    setHandle: (handle: string) => void;
    setEmail: (email: string) => void;
    setLastLocationUpdate: (ts: number) => void;
    setFacilityName: (name: string | null) => void;
    reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
    step: 1,
    status: null,
    avatarId: null,
    handle: '',
    email: '',
    lastLocationUpdate: 0,
    facilityName: null,

    setStep: (step) => set({ step }),
    setStatus: (status) => set({ status }),
    setAvatarId: (avatarId) => set({ avatarId }),
    setHandle: (handle) => set({ handle }),
    setEmail: (email) => set({ email }),
    setLastLocationUpdate: (lastLocationUpdate) => set({ lastLocationUpdate }),
    setFacilityName: (name) => set({ facilityName: name }),
    reset: () => set({
        step: 1,
        status: null,
        avatarId: null,
        handle: '',
        email: '',
        lastLocationUpdate: 0,
        facilityName: null
    }),
}));
