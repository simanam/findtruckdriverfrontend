import { create } from 'zustand';

export type DriverStatus = 'rolling' | 'waiting' | 'parked';

interface OnboardingState {
    step: number;
    status: DriverStatus | null;
    avatarId: string | null;
    handle: string;
    phone: string;

    setStep: (step: number) => void;
    setStatus: (status: DriverStatus) => void;
    setAvatarId: (id: string) => void;
    setHandle: (handle: string) => void;
    setPhone: (phone: string) => void;
    reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
    step: 1,
    status: null,
    avatarId: null,
    handle: '',
    phone: '',

    setStep: (step) => set({ step }),
    setStatus: (status) => set({ status }),
    setAvatarId: (avatarId) => set({ avatarId }),
    setHandle: (handle) => set({ handle }),
    setPhone: (phone) => set({ phone }),
    reset: () => set({
        step: 1,
        status: null,
        avatarId: null,
        handle: '',
        phone: ''
    }),
}));
