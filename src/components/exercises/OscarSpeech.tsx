"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PartyPopper, X, Mic, MicOff, RotateCcw, Trophy, Star, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface OscarSpeechProps {
    onClose: () => void;
}

const SPEECH_DURATION = 45;

const AWARD_CATEGORIES = [
    "Best Actor",
    "Best Actress",
    "Best Director",
    "Best Picture",
    "Best Original Screenplay",
    "Best Supporting Actor",
    "Best Supporting Actress",
    "Best Documentary Feature",
    "Best Animated Feature",
    "Best International Feature Film"
];

const SPEECH_TIPS = [
    "Thank the Academy first",
    "Mention 2-3 key people who helped you",
    "Share a brief personal story or emotion",
    "End with something memorable",
    "Pace yourself - 45 seconds goes fast!"
];

const OscarSpeech = ({ onClose }: OscarSpeechProps) => {
    const [gameState, setGameState] = useState<"intro" | "countdown" | "speaking" | "results">("intro");
    const [category, setCategory] = useState("");
    const [timeLeft, setTimeLeft] = useState(SPEECH_DURATION);
    const [isRecording, setIsRecording] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [transcript, setTranscript] = useState("");
    const recognitionRef = useRef<any>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setCategory(AWARD_CATEGORIES[Math.floor(Math.random() * AWARD_CATEGORIES.length)]);
    }, []);

    useEffect(() => {
        if (gameState === "countdown" && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (gameState === "countdown" && countdown === 0) {
            startSpeaking();
        }
    }, [gameState, countdown]);

    useEffect(() => {
        if (gameState === "speaking" && timeLeft > 0) {
            timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => {
                if (timerRef.current) clearTimeout(timerRef.current);
            };
        } else if (gameState === "speaking" && timeLeft === 0) {
            endSpeech();
        }
    }, [gameState, timeLeft]);

    const startGame = () => {
        setGameState("countdown");
        setCountdown(3);
    };

    const startSpeaking = () => {
        setGameState("speaking");
        setTimeLeft(SPEECH_DURATION);
        setTranscript("");
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
            setTranscript(fullTranscript.trim());
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

    const endSpeech = () => {
        stopRecording();
        if (timerRef.current) clearTimeout(timerRef.current);
        setGameState("results");
    };

    const getScore = () => {
        const wordCount = transcript.split(/\s+/).filter(w => w.length > 0).length;
        const timeUsed = SPEECH_DURATION - timeLeft;

        let score = 0;

        if (wordCount >= 60 && wordCount <= 150) {
            score += 40;
        } else if (wordCount >= 40) {
            score += 25;
        } else if (wordCount >= 20) {
            score += 15;
        }

        if (timeUsed >= 40) {
            score += 30;
        } else if (timeUsed >= 30) {
            score += 20;
        } else if (timeUsed >= 20) {
            score += 10;
        }

        if (timeLeft === 0) {
            score += 30;
        }

        return Math.min(100, score);
    };

    const getGrade = (score: number) => {
        if (score >= 90) return { grade: "Standing Ovation!", emoji: "🎭" };
        if (score >= 70) return { grade: "Crowd Pleaser", emoji: "👏" };
        if (score >= 50) return { grade: "Respectable", emoji: "✨" };
        if (score >= 30) return { grade: "Needs Practice", emoji: "🎬" };
        return { grade: "Stage Fright", emoji: "😅" };
    };

    const playAgain = () => {
        setCategory(AWARD_CATEGORIES[Math.floor(Math.random() * AWARD_CATEGORIES.length)]);
        setGameState("intro");
        setTimeLeft(SPEECH_DURATION);
        setTranscript("");
        setCountdown(3);
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                        <PartyPopper className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Oscar Acceptance Speech</h1>
                        <p className="text-sm text-muted-foreground">Deliver an unforgettable 45-second speech</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {gameState === "intro" && (
                <Card className="p-8 bg-gradient-to-br from-yellow-500/10 via-red-500/5 to-primary/5 border-yellow-500/20">
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-4">🏆</div>
                        <h2 className="text-3xl font-bold mb-2 text-yellow-500">And the Oscar goes to...</h2>
                        <p className="text-xl text-foreground font-semibold">YOU!</p>
                        <div className="mt-4 inline-block bg-yellow-500/20 px-6 py-3 rounded-full">
                            <span className="text-lg font-medium text-yellow-500">{category}</span>
                        </div>
                    </div>

                    <div className="bg-background/50 rounded-xl p-6 mb-8">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            Speech Tips
                        </h3>
                        <ul className="space-y-2">
                            {SPEECH_TIPS.map((tip, index) => (
                                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-yellow-500">•</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">You have 45 seconds - make it count!</span>
                    </div>

                    <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
                        onClick={startGame}
                    >
                        <Mic className="h-5 w-5 mr-2" />
                        Accept Your Award
                    </Button>
                </Card>
            )}

            {gameState === "countdown" && (
                <Card className="p-12 text-center bg-gradient-to-br from-yellow-500/10 to-red-500/5 border-yellow-500/20">
                    <div className="text-8xl font-bold text-yellow-500 mb-4 animate-pulse">
                        {countdown}
                    </div>
                    <p className="text-xl text-muted-foreground">Get ready to speak...</p>
                    <p className="text-lg mt-4 font-medium">{category}</p>
                </Card>
            )}

            {gameState === "speaking" && (
                <Card className="p-8 bg-gradient-to-br from-yellow-500/10 to-red-500/5 border-yellow-500/20">
                    <div className="text-center mb-6">
                        <div className="text-4xl font-bold text-yellow-500 mb-2">{timeLeft}s</div>
                        <Progress value={(timeLeft / SPEECH_DURATION) * 100} className="h-3" />
                    </div>

                    <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-full mb-4">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            <span className="font-medium">{category}</span>
                        </div>
                    </div>

                    <div className="flex justify-center mb-6">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center ${isRecording ? 'bg-destructive/20 animate-pulse' : 'bg-muted/50'}`}>
                            {isRecording ? (
                                <Mic className="h-12 w-12 text-destructive" />
                            ) : (
                                <MicOff className="h-12 w-12 text-muted-foreground" />
                            )}
                        </div>
                    </div>

                    {transcript && (
                        <div className="bg-background/50 rounded-xl p-4 mb-6 max-h-32 overflow-y-auto">
                            <p className="text-sm text-muted-foreground italic">&quot;{transcript}&quot;</p>
                        </div>
                    )}

                    <Button
                        variant="outline"
                        className="w-full border-yellow-500/30"
                        onClick={endSpeech}
                    >
                        Finish Speech Early
                    </Button>
                </Card>
            )}

            {gameState === "results" && (
                <Card className="p-8 bg-gradient-to-br from-yellow-500/10 via-red-500/5 to-primary/5 border-yellow-500/20">
                    {(() => {
                        const finalScore = getScore();
                        const { grade, emoji } = getGrade(finalScore);
                        const wordCount = transcript.split(/\s+/).filter(w => w.length > 0).length;
                        const timeUsed = SPEECH_DURATION - timeLeft;

                        return (
                            <>
                                <div className="text-center mb-8">
                                    <div className="text-6xl mb-4">{emoji}</div>
                                    <h2 className="text-2xl font-bold mb-2">{grade}</h2>
                                    <div className="text-5xl font-bold text-yellow-500">{finalScore}</div>
                                    <p className="text-muted-foreground">points</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-background/50 rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold text-foreground">{wordCount}</div>
                                        <p className="text-sm text-muted-foreground">Words Spoken</p>
                                    </div>
                                    <div className="bg-background/50 rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold text-foreground">{timeUsed}s</div>
                                        <p className="text-sm text-muted-foreground">Time Used</p>
                                    </div>
                                </div>

                                {transcript && (
                                    <div className="bg-background/50 rounded-xl p-4 mb-6">
                                        <h3 className="font-semibold mb-2 text-sm">Your Speech:</h3>
                                        <p className="text-sm text-muted-foreground italic max-h-24 overflow-y-auto">
                                            &quot;{transcript}&quot;
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={onClose}
                                    >
                                        Exit
                                    </Button>
                                    <Button
                                        className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black"
                                        onClick={playAgain}
                                    >
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Try Another Award
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

export default OscarSpeech;
