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
    weather_event?: string;
    weather_emoji?: string;
}

interface FollowUpState {
    isOpen: boolean;
    statusUpdateId: string | null;
    question: FollowUpQuestion | null; // The currently active question
    queue: FollowUpQuestion[]; // Future questions

    open: (questions: FollowUpQuestion | FollowUpQuestion[], statusUpdateId: string) => void;
    close: () => void;
}

export const useFollowUpStore = create<FollowUpState>((set, get) => ({
    isOpen: false,
    statusUpdateId: null,
    question: null,
    queue: [],

    open: (questions, statusUpdateId) => {
        const list = Array.isArray(questions) ? questions : [questions];
        if (list.length === 0) return;

        set({
            isOpen: true,
            statusUpdateId,
            question: list[0],
            queue: list.slice(1)
        });
    },

    close: () => {
        const { queue } = get();
        if (queue.length > 0) {
            // Next question
            set({
                question: queue[0],
                queue: queue.slice(1)
            });
        } else {
            // All done
            set({
                isOpen: false,
                question: null,
                queue: [],
                statusUpdateId: null
            });
        }
    },
}));
