"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft, Paperclip, Mic } from "lucide-react";

interface StepDetailsProps {
    initialData: {
        title: string;
        description: string;
        goal: string;
        difficulty: "Easy" | "Medium" | "Hard";
    };
    onNext: (data: any) => void;
    onBack: () => void;
}

export function StepDetails({ initialData, onNext, onBack }: StepDetailsProps) {
    const [data, setData] = useState(initialData);

    const isValid = data.title && data.description;

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 font-serif">Refine your scenario</h1>
                <p className="text-muted-foreground">
                    Customize the details to make this practice session perfect for you.
                </p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Scenario title</label>
                    <Input
                        value={data.title}
                        onChange={(e) => setData({ ...data, title: e.target.value })}
                        placeholder="e.g., Defective Product Return"
                        className="bg-card/50"
                    />
                </div>

                <div className="space-y-2 relative">
                    <label className="text-sm font-medium">Situation description</label>
                    <div className="relative">
                        <Textarea
                            value={data.description}
                            onChange={(e) => setData({ ...data, description: e.target.value })}
                            placeholder="Describe the situation in detail..."
                            className="bg-card/50 min-h-[120px] pb-10"
                        />
                        <div className="absolute bottom-2 right-2 flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <Paperclip className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <Mic className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        What's your goal for this practice? <span className="text-muted-foreground font-normal">(optional)</span>
                    </label>
                    <Textarea
                        value={data.goal}
                        onChange={(e) => setData({ ...data, goal: e.target.value })}
                        placeholder="e.g., I want to stay calm under pressure..."
                        className="bg-card/50 min-h-[80px]"
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-medium">Difficulty</label>
                    <div className="flex gap-3">
                        {(["Easy", "Medium", "Hard"] as const).map((level) => (
                            <button
                                key={level}
                                onClick={() => setData({ ...data, difficulty: level })}
                                className={`px-6 py-2 rounded-full border transition-all ${data.difficulty === level
                                    ? "bg-primary/10 border-primary text-primary font-medium"
                                    : "bg-background border-border hover:border-primary/50 text-muted-foreground"
                                    }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-4 mt-12">
                <Button variant="outline" onClick={onBack} className="px-8 py-6 rounded-xl border-border/50">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Button
                    onClick={() => onNext(data)}
                    disabled={!isValid}
                    className="flex-1 py-6 rounded-xl font-semibold bg-sa-light-accent hover:bg-sa-light-accent/90 text-white dark:bg-sa-accent-cyan dark:hover:bg-sa-accent-cyan/90 dark:text-sa-bg-primary shadow-lg shadow-sa-light-accent/20 dark:shadow-sa-accent-cyan/20"
                >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
