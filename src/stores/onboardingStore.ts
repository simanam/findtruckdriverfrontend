import { create } from 'zustand';

export type DriverStatus = 'rolling' | 'waiting' | 'parked';

interface OnboardingState {
    step: number;
    status: DriverStatus | null;
    avatarId: string | null;
    handle: string;
    email: string;

    setStep: (step: number) => void;
    setStatus: (status: DriverStatus) => void;
    setAvatarId: (id: string) => void;
    setHandle: (handle: string) => void;
    setEmail: (email: string) => void;
    reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
    step: 1,
    status: null,
    avatarId: null,
    handle: '',
    email: '',

    setStep: (step) => set({ step }),
    setStatus: (status) => set({ status }),
    setAvatarId: (avatarId) => set({ avatarId }),
    setHandle: (handle) => set({ handle }),
    setEmail: (email) => set({ email }),
    reset: () => set({
        step: 1,
        status: null,
        avatarId: null,
        handle: '',
        email: ''
    }),
}));
