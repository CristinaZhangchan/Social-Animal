"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface StepSettingsProps {
    initialData: {
        duration: number;
        autoWrap: boolean;
    };
    onNext: (data: any) => void;
    onBack: () => void;
}

export function StepSettings({ initialData, onNext, onBack }: StepSettingsProps) {
    const [duration, setDuration] = useState(initialData.duration || 5);
    const [autoWrap, setAutoWrap] = useState(initialData.autoWrap ?? true);

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 font-serif">Session settings</h1>
                <p className="text-muted-foreground">
                    Configure how long and how your practice session runs.
                </p>
            </div>

            <div className="bg-card border border-border/50 rounded-3xl p-8 space-y-12 shadow-sm">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <label className="text-lg font-medium flex items-center gap-2">
                            <ClockIcon className="w-5 h-5" />
                            Session length
                        </label>
                        <span className="text-2xl font-bold">{duration} min</span>
                    </div>
                    <Slider
                        value={[duration]}
                        onValueChange={(val) => setDuration(val[0])}
                        min={1}
                        max={30}
                        step={1}
                        className="py-4"
                    />
                    <p className="text-sm text-muted-foreground">
                        Standard practice — good balance of depth and focus
                    </p>
                </div>

                <div className="flex items-center justify-between p-6 bg-secondary/30 rounded-2xl">
                    <div className="space-y-1">
                        <label className="text-lg font-medium flex items-center gap-2">
                            <MessageSquareIcon className="w-5 h-5" />
                            AI wraps up the conversation
                        </label>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            When enabled, the AI will naturally end the conversation after the session time. Otherwise, you end it whenever you want.
                        </p>
                    </div>
                    <Switch
                        checked={autoWrap}
                        onCheckedChange={setAutoWrap}
                        className="scale-125"
                    />
                </div>
            </div>

            <div className="flex gap-4 mt-12">
                <Button variant="outline" onClick={onBack} className="px-8 py-6 rounded-xl border-border/50">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Button
                    onClick={() => onNext({ duration, autoWrap })}
                    className="flex-1 py-6 rounded-xl font-semibold bg-sa-light-accent hover:bg-sa-light-accent/90 text-white dark:bg-sa-accent-cyan dark:hover:bg-sa-accent-cyan/90 dark:text-sa-bg-primary shadow-lg shadow-sa-light-accent/20 dark:shadow-sa-accent-cyan/20"
                >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

function ClockIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

function MessageSquareIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
}
