"use client";

import { cn } from "@/lib/utils";

interface PrivacyToggleProps {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (val: boolean) => void;
}

export function PrivacyToggle({ label, description, checked, onChange }: PrivacyToggleProps) {
    return (
        <div
            className="flex items-center justify-between gap-4 py-3 cursor-pointer group"
            onClick={() => onChange(!checked)}
        >
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                    {label}
                </p>
                {description && (
                    <p className="text-xs text-slate-500 mt-0.5">
                        {description}
                    </p>
                )}
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={(e) => {
                    e.stopPropagation();
                    onChange(!checked);
                }}
                className={cn(
                    "relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950",
                    checked ? "bg-sky-500" : "bg-slate-700"
                )}
            >
                <span
                    className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        checked ? "translate-x-5" : "translate-x-0"
                    )}
                />
            </button>
        </div>
    );
}
