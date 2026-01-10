import { create } from 'zustand';

export interface FollowUpOption {
    emoji: string;
    label: string;
    value: string;
    description?: string;
}

export interface FollowUpQuestion {
    question_type: string;
    text: string;
    subtext?: string;
    options: FollowUpOption[];
    skippable: boolean;
    auto_dismiss_seconds?: number;
}

interface FollowUpState {
    isOpen: boolean;
    statusUpdateId: string | null;
    question: FollowUpQuestion | null;

    open: (question: FollowUpQuestion, statusUpdateId: string) => void;
    close: () => void;
}

export const useFollowUpStore = create<FollowUpState>((set) => ({
    isOpen: false,
    statusUpdateId: null,
    question: null,

    open: (question, statusUpdateId) => set({
        isOpen: true,
        question,
        statusUpdateId
    }),

    close: () => set({
        isOpen: false,
        question: null,
        statusUpdateId: null
    }),
}));
