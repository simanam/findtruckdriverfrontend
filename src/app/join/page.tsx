"use client";

import { useOnboardingStore } from "@/stores/onboardingStore";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { StatusSelector } from "@/components/onboarding/StatusSelector";
import { AvatarBuilder } from "@/components/onboarding/AvatarBuilder";
import { HandleInput } from "@/components/onboarding/HandleInput";
import { PhoneVerification } from "@/components/onboarding/PhoneVerification";
import { useEffect } from "react";

export default function JoinPage() {
    const { step, status, setStep } = useOnboardingStore();

    // Skip step 1 if status is already selected (from landing page)
    useEffect(() => {
        if (step === 1 && status) {
            setStep(2);
        }
    }, [step, status, setStep]);

    const getStepData = () => {
        switch (step) {
            case 1:
                return {
                    title: "What's your status?",
                    subtitle: "Let others know so they can plan.",
                    component: <StatusSelector />
                };
            case 2:
                return {
                    title: "Style your Driver",
                    subtitle: "Customize your look on the map.",
                    component: <AvatarBuilder />
                };
            case 3:
                return {
                    title: "Choose a handle",
                    subtitle: "Keep it anonymous, driver.",
                    component: <HandleInput />
                };
            case 4:
                return {
                    title: "Verify it's you",
                    subtitle: "We'll text you a code to secure your account.",
                    component: <PhoneVerification />
                };
            default:
                return { title: "", subtitle: "", component: null };
        }
    };

    const { title, subtitle, component } = getStepData();

    return (
        <OnboardingLayout
            title={title}
            subtitle={subtitle}
            step={step}
            totalSteps={4}
            onClose={() => window.location.href = '/'}
        >
            {component}
        </OnboardingLayout>
    );
}
