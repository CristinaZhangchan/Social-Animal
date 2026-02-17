"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, Mic, MicOff, Zap, RotateCcw, Trophy } from "lucide-react";
import { toast } from "sonner";

interface FillerZapperProps {
    onClose: () => void;
}

const FILLER_WORDS = ["um", "uh", "like", "you know", "basically", "actually", "literally", "so", "right"];
const TOPICS = [
    "Why mornings are better than nights",
    "The best movie you've ever seen",
    "Your ideal vacation destination",
    "Why pizza is the perfect food",
    "The most useful skill to learn",
    "Your favorite childhood memory",
    "Why dogs are better than cats (or vice versa)",
    "The best invention of the last 100 years",
    "Your dream superpower",
    "Why everyone should read more books"
];

const FillerZapper = ({ onClose }: FillerZapperProps) => {
    const [gameState, setGameState] = useState<"ready" | "playing" | "finished">("ready");
    const [timeLeft, setTimeLeft] = useState(60);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [fillerCount, setFillerCount] = useState(0);
    const [topic, setTopic] = useState("");
    const [score, setScore] = useState(0);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        setTopic(TOPICS[Math.floor(Math.random() * TOPICS.length)]);
    }, []);

    useEffect(() => {
        if (gameState === "playing" && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(t => t - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && gameState === "playing") {
            endGame();
        }
    }, [gameState, timeLeft]);

    const startGame = () => {
        setGameState("playing");
        setTimeLeft(60);
        setTranscript("");
        setFillerCount(0);
        startRecording();
    };

    const startRecording = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                let fullTranscript = "";
                for (let i = 0; i < event.results.length; i++) {
                    fullTranscript += event.results[i][0].transcript + " ";
                }
                setTranscript(fullTranscript);

                const lowerTranscript = fullTranscript.toLowerCase();
                let count = 0;
                FILLER_WORDS.forEach(filler => {
                    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
                    const matches = lowerTranscript.match(regex);
                    if (matches) count += matches.length;
                });

                if (count > fillerCount) {
                    setFillerCount(count);
                    toast.error(`Filler detected! "${FILLER_WORDS[Math.floor(Math.random() * FILLER_WORDS.length)]}"`, {
                        duration: 1500,
                    });
                }
            };

            recognitionRef.current.start();
            setIsRecording(true);
        } else {
            toast.error("Speech recognition not supported in your browser");
        }
    };

    const endGame = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsRecording(false);
        setGameState("finished");

        const baseScore = Math.max(0, 60 - timeLeft) * 10;
        const penalty = fillerCount * 50;
        const finalScore = Math.max(0, baseScore - penalty);
        setScore(finalScore);
    };

    const resetGame = () => {
        setGameState("ready");
        setTimeLeft(60);
        setTranscript("");
        setFillerCount(0);
        setTopic(TOPICS[Math.floor(Math.random() * TOPICS.length)]);
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Filler Zapper</h1>
                        <p className="text-sm text-muted-foreground">Eliminate those filler words!</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {gameState === "ready" && (
                <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2">Your Topic</h2>
                        <p className="text-2xl font-bold text-primary">{topic}</p>
                    </div>

                    <div className="mb-6 p-4 bg-background/50 rounded-xl">
                        <h3 className="font-medium mb-2">Rules</h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Speak for 60 seconds about the topic</li>
                            <li>• Avoid filler words: um, uh, like, you know, etc.</li>
                            <li>• Each filler word costs you 50 points</li>
                            <li>• Stay focused and speak clearly!</li>
                        </ul>
                    </div>

                    <Button size="lg" onClick={startGame} className="gap-2">
                        <Mic className="h-5 w-5" />
                        Start Speaking
                    </Button>
                </Card>
            )}

            {gameState === "playing" && (
                <div className="space-y-6">
                    <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Time Left</p>
                                <p className={`text-4xl font-bold ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-primary'}`}>
                                    {timeLeft}s
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {isRecording && (
                                    <div className="flex items-center gap-2 bg-destructive/10 px-3 py-1.5 rounded-full">
                                        <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                                        <span className="text-sm font-medium text-destructive">Recording</span>
                                    </div>
                                )}
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Fillers</p>
                                <p className={`text-4xl font-bold ${fillerCount > 0 ? 'text-destructive' : 'text-green-500'}`}>
                                    {fillerCount}
                                </p>
                            </div>
                        </div>
                        <Progress value={((60 - timeLeft) / 60) * 100} className="h-2" />
                    </Card>

                    <Card className="p-4 bg-muted/50">
                        <p className="text-sm text-muted-foreground">Your topic:</p>
                        <p className="font-semibold">{topic}</p>
                    </Card>

                    <Card className="p-4 min-h-[150px] bg-background">
                        <p className="text-sm text-muted-foreground mb-2">What you&apos;re saying:</p>
                        <p className="text-foreground leading-relaxed">
                            {transcript || <span className="text-muted-foreground italic">Start speaking...</span>}
                        </p>
                    </Card>

                    <Button variant="destructive" onClick={endGame} className="w-full">
                        <MicOff className="h-4 w-4 mr-2" />
                        End Game
                    </Button>
                </div>
            )}

            {gameState === "finished" && (
                <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-accent/5">
                    <Trophy className={`h-16 w-16 mx-auto mb-4 ${score > 400 ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                    <h2 className="text-2xl font-bold mb-2">Game Over!</h2>

                    <div className="text-5xl font-bold text-primary mb-4">{score}</div>
                    <p className="text-muted-foreground mb-6">points</p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-background rounded-xl">
                            <p className="text-sm text-muted-foreground">Time Spoken</p>
                            <p className="text-2xl font-bold">{60 - timeLeft}s</p>
                        </div>
                        <div className="p-4 bg-background rounded-xl">
                            <p className="text-sm text-muted-foreground">Fillers Used</p>
                            <p className={`text-2xl font-bold ${fillerCount > 0 ? 'text-destructive' : 'text-green-500'}`}>
                                {fillerCount}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose} className="flex-1">
                            Exit
                        </Button>
                        <Button onClick={resetGame} className="flex-1 gap-2">
                            <RotateCcw className="h-4 w-4" />
                            Play Again
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default FillerZapper;
