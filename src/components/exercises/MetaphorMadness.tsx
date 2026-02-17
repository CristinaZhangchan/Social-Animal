"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Flame, X, Mic, MicOff, RotateCcw, Sparkles, Clock, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface MetaphorMadnessProps {
    onClose: () => void;
}

const OBJECTS = [
    "a smartphone",
    "a coffee mug",
    "a bicycle",
    "a mirror",
    "a staircase",
    "a clock",
    "a book",
    "a bridge",
    "a window",
    "a key",
    "a candle",
    "a umbrella",
    "a compass",
    "a ladder",
    "a doorbell",
    "a flashlight",
    "a blanket",
    "a pencil",
    "a wallet",
    "a backpack"
];

const ROUND_DURATION = 45;
const TOTAL_ROUNDS = 5;

const MetaphorMadness = ({ onClose }: MetaphorMadnessProps) => {
    const [gameState, setGameState] = useState<"intro" | "countdown" | "playing" | "results">("intro");
    const [currentRound, setCurrentRound] = useState(0);
    const [currentObject, setCurrentObject] = useState("");
    const [usedObjects, setUsedObjects] = useState<string[]>([]);
    const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
    const [countdown, setCountdown] = useState(3);
    const [isRecording, setIsRecording] = useState(false);
    const [transcripts, setTranscripts] = useState<string[]>([]);
    const [currentTranscript, setCurrentTranscript] = useState("");
    const recognitionRef = useRef<any>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const getRandomObject = () => {
        const available = OBJECTS.filter(obj => !usedObjects.includes(obj));
        if (available.length === 0) return OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
        return available[Math.floor(Math.random() * available.length)];
    };

    useEffect(() => {
        if (gameState === "countdown" && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (gameState === "countdown" && countdown === 0) {
            startRound();
        }
    }, [gameState, countdown]);

    useEffect(() => {
        if (gameState === "playing" && timeLeft > 0) {
            timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => {
                if (timerRef.current) clearTimeout(timerRef.current);
            };
        } else if (gameState === "playing" && timeLeft === 0) {
            endRound();
        }
    }, [gameState, timeLeft]);

    const startGame = () => {
        setCurrentRound(0);
        setUsedObjects([]);
        setTranscripts([]);
        const obj = getRandomObject();
        setCurrentObject(obj);
        setUsedObjects([obj]);
        setGameState("countdown");
        setCountdown(3);
    };

    const startRound = () => {
        setGameState("playing");
        setTimeLeft(ROUND_DURATION);
        setCurrentTranscript("");
        startRecording();
    };

    const startRecording = () => {
        if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
            setIsRecording(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
            let fullTranscript = "";
            for (let i = 0; i < event.results.length; i++) {
                fullTranscript += event.results[i][0].transcript + " ";
            }
            setCurrentTranscript(fullTranscript.trim());
        };

        recognitionRef.current.onerror = () => {
            setIsRecording(false);
        };

        recognitionRef.current.start();
        setIsRecording(true);
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }
    };

    const endRound = () => {
        stopRecording();
        if (timerRef.current) clearTimeout(timerRef.current);

        setTranscripts(prev => [...prev, currentTranscript]);

        if (currentRound + 1 >= TOTAL_ROUNDS) {
            setGameState("results");
        } else {
            const nextRound = currentRound + 1;
            setCurrentRound(nextRound);
            const obj = getRandomObject();
            setCurrentObject(obj);
            setUsedObjects(prev => [...prev, obj]);
            setCountdown(3);
            setGameState("countdown");
        }
    };

    const skipObject = () => {
        stopRecording();
        if (timerRef.current) clearTimeout(timerRef.current);
        setTranscripts(prev => [...prev, "(skipped)"]);

        if (currentRound + 1 >= TOTAL_ROUNDS) {
            setGameState("results");
        } else {
            const nextRound = currentRound + 1;
            setCurrentRound(nextRound);
            const obj = getRandomObject();
            setCurrentObject(obj);
            setUsedObjects(prev => [...prev, obj]);
            setCountdown(3);
            setGameState("countdown");
        }
    };

    const getScore = () => {
        let score = 0;
        transcripts.forEach(t => {
            if (t === "(skipped)") return;
            const wordCount = t.split(/\s+/).filter(w => w.length > 0).length;
            if (wordCount >= 30) score += 20;
            else if (wordCount >= 20) score += 15;
            else if (wordCount >= 10) score += 10;
            else if (wordCount >= 5) score += 5;
        });
        return score;
    };

    const getGrade = (score: number) => {
        if (score >= 90) return { grade: "Metaphor Master!", emoji: "🔥" };
        if (score >= 70) return { grade: "Creative Genius", emoji: "✨" };
        if (score >= 50) return { grade: "Solid Storyteller", emoji: "📖" };
        if (score >= 30) return { grade: "Getting There", emoji: "🌱" };
        return { grade: "Keep Practicing", emoji: "💪" };
    };

    const playAgain = () => {
        setGameState("intro");
        setCurrentRound(0);
        setUsedObjects([]);
        setTranscripts([]);
        setCurrentTranscript("");
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Flame className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Metaphor Madness</h1>
                        <p className="text-sm text-muted-foreground">Explain objects using only metaphors</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {gameState === "intro" && (
                <Card className="p-8 bg-gradient-to-br from-primary/10 via-orange-500/5 to-emerald-500/5 border-primary/20">
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-4">🎭</div>
                        <h2 className="text-2xl font-bold mb-2">Think in Metaphors!</h2>
                        <p className="text-muted-foreground">
                            Describe everyday objects without using their literal name or function.
                            Only metaphors allowed!
                        </p>
                    </div>

                    <div className="bg-background/50 rounded-xl p-6 mb-8">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            How to Play
                        </h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="text-primary">1.</span>
                                You&apos;ll see an everyday object
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary">2.</span>
                                Describe it using ONLY metaphors (no literal descriptions!)
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary">3.</span>
                                Example: A mirror → &quot;A frozen lake that captures your soul&quot;
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary">4.</span>
                                {TOTAL_ROUNDS} objects, {ROUND_DURATION} seconds each
                            </li>
                        </ul>
                    </div>

                    <Button
                        size="lg"
                        className="w-full"
                        onClick={startGame}
                    >
                        <Flame className="h-5 w-5 mr-2" />
                        Start Challenge
                    </Button>
                </Card>
            )}

            {gameState === "countdown" && (
                <Card className="p-12 text-center bg-gradient-to-br from-primary/10 to-orange-500/5 border-primary/20">
                    <div className="text-sm text-muted-foreground mb-2">Round {currentRound + 1} of {TOTAL_ROUNDS}</div>
                    <div className="text-8xl font-bold text-primary mb-4 animate-pulse">
                        {countdown}
                    </div>
                    <p className="text-xl text-muted-foreground">Get ready to describe...</p>
                    <div className="mt-4 inline-block bg-primary/20 px-6 py-3 rounded-full">
                        <span className="text-2xl font-bold text-primary">{currentObject}</span>
                    </div>
                </Card>
            )}

            {gameState === "playing" && (
                <Card className="p-8 bg-gradient-to-br from-primary/10 to-orange-500/5 border-primary/20">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-muted-foreground">Round {currentRound + 1} of {TOTAL_ROUNDS}</span>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <span className="text-2xl font-bold text-primary">{timeLeft}s</span>
                        </div>
                    </div>

                    <Progress value={(timeLeft / ROUND_DURATION) * 100} className="h-2 mb-6" />

                    <div className="text-center mb-6">
                        <p className="text-sm text-muted-foreground mb-2">Describe using metaphors:</p>
                        <div className="inline-block bg-primary/20 px-8 py-4 rounded-2xl">
                            <span className="text-3xl font-bold text-primary">{currentObject}</span>
                        </div>
                    </div>

                    <div className="flex justify-center mb-6">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isRecording ? 'bg-destructive/20 animate-pulse' : 'bg-muted/50'}`}>
                            {isRecording ? (
                                <Mic className="h-10 w-10 text-destructive" />
                            ) : (
                                <MicOff className="h-10 w-10 text-muted-foreground" />
                            )}
                        </div>
                    </div>

                    {currentTranscript && (
                        <div className="bg-background/50 rounded-xl p-4 mb-6 max-h-24 overflow-y-auto">
                            <p className="text-sm text-muted-foreground italic">&quot;{currentTranscript}&quot;</p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={skipObject}
                        >
                            Skip <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={endRound}
                        >
                            Done with this one
                        </Button>
                    </div>
                </Card>
            )}

            {gameState === "results" && (
                <Card className="p-8 bg-gradient-to-br from-primary/10 via-orange-500/5 to-emerald-500/5 border-primary/20">
                    {(() => {
                        const finalScore = getScore();
                        const { grade, emoji } = getGrade(finalScore);

                        return (
                            <>
                                <div className="text-center mb-8">
                                    <div className="text-6xl mb-4">{emoji}</div>
                                    <h2 className="text-2xl font-bold mb-2">{grade}</h2>
                                    <div className="text-5xl font-bold text-primary">{finalScore}</div>
                                    <p className="text-muted-foreground">points</p>
                                </div>

                                <div className="bg-background/50 rounded-xl p-4 mb-6 max-h-48 overflow-y-auto">
                                    <h3 className="font-semibold mb-3 text-sm">Your Metaphors:</h3>
                                    <div className="space-y-3">
                                        {usedObjects.map((obj, index) => (
                                            <div key={index} className="border-b border-border/30 pb-2 last:border-0">
                                                <div className="font-medium text-sm text-primary">{obj}</div>
                                                <p className="text-xs text-muted-foreground italic">
                                                    {transcripts[index] || "(no response)"}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={onClose}
                                    >
                                        Exit
                                    </Button>
                                    <Button
                                        className="flex-1"
                                        onClick={playAgain}
                                    >
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Play Again
                                    </Button>
                                </div>
                            </>
                        );
                    })()}
                </Card>
            )}
        </div>
    );
};

export default MetaphorMadness;
