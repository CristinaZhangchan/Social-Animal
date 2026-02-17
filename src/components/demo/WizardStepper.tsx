"use client";

import { Check } from "lucide-react";

interface WizardStepperProps {
    currentStep: number;
}

export function WizardStepper({ currentStep }: WizardStepperProps) {
    const steps = [
        { id: 1, label: "Scenario" }, // Step 1 is "Scenario" (or Details in the screenshot's context of flow)
        { id: 2, label: "Details" },
        { id: 3, label: "Avatar" },
        { id: 4, label: "Settings" },
    ];

    return (
        <div className="flex items-center justify-center gap-2 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            {steps.map((step) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;

                return (
                    <div
                        key={step.id}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive
                                ? "bg-sa-light-accent text-white dark:bg-sa-accent-cyan dark:text-sa-bg-primary shadow-lg shadow-sa-light-accent/20 dark:shadow-sa-accent-cyan/20"
                                : isCompleted
                                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                                    : "bg-secondary/50 text-muted-foreground"
                            }`}
                    >
                        {isCompleted ? (
                            <Check className="w-3.5 h-3.5" />
                        ) : isActive ? (
                            <span className="w-2 h-2 rounded-full bg-current" />
                        ) : null}
                        {step.label}
                    </div>
                );
            })}
            {/* Preview 'step' is usually the final result, handled by logic */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${currentStep > 4 // Assuming step 5 is preview? Or just static label
                    ? "bg-sa-light-accent text-white"
                    : "bg-secondary/50 text-muted-foreground"
                }`}>
                Preview
            </div>
        </div>
    );
}
