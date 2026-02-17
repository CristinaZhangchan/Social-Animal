"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, Mic, MicOff, Timer, RotateCcw, Trophy, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface SpeedPitchProps {
    onClose: () => void;
}

const PRODUCTS = [
    { name: "A toothbrush that tells jokes", emoji: "🪥" },
    { name: "Socks that never get lost", emoji: "🧦" },
    { name: "A pillow that records your dreams", emoji: "💤" },
    { name: "Sunglasses for dogs", emoji: "🐕" },
    { name: "A fork that counts calories", emoji: "🍴" },
    { name: "Headphones that translate bird songs", emoji: "🎧" },
    { name: "A mirror that gives compliments", emoji: "🪞" },
    { name: "Shoes that charge your phone", emoji: "👟" },
    { name: "A pen that corrects your spelling in real-time", emoji: "🖊️" },
    { name: "An umbrella that plays music in the rain", emoji: "☂️" },
    { name: "A water bottle that reminds you to drink", emoji: "💧" },
    { name: "Glasses that block spoilers", emoji: "👓" },
];

const SpeedPitch = ({ onClose }: SpeedPitchProps) => {
    const [gameState, setGameState] = useState<"ready" | "countdown" | "playing" | "finished">("ready");
    const [countdown, setCountdown] = useState(3);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [product, setProduct] = useState(PRODUCTS[0]);
    const [round, setRound] = useState(1);
    const [totalScore, setTotalScore] = useState(0);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        pickNewProduct();
    }, []);

    useEffect(() => {
        if (gameState === "countdown" && countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0 && gameState === "countdown") {
            setGameState("playing");
            startRecording();
        }
    }, [countdown, gameState]);

    useEffect(() => {
        if (gameState === "playing" && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && gameState === "playing") {
            endRound();
        }
    }, [gameState, timeLeft]);

    const pickNewProduct = () => {
        setProduct(PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)]);
    };

    const startGame = () => {
        setGameState("countdown");
        setCountdown(3);
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
            };

            recognitionRef.current.start();
            setIsRecording(true);
        } else {
            toast.error("Speech recognition not supported");
        }
    };

    const endRound = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsRecording(false);

        const wordCount = transcript.split(/\s+/).filter(w => w.length > 0).length;
        const roundScore = Math.min(wordCount * 5, 300);
        setTotalScore(prev => prev + roundScore);

        if (round < 3) {
            toast.success(`Round ${round} complete! +${roundScore} points`);
            setRound(r => r + 1);
            setTimeLeft(30);
            setTranscript("");
            pickNewProduct();
            setGameState("countdown");
            setCountdown(3);
        } else {
            setGameState("finished");
        }
    };

    const resetGame = () => {
        setGameState("ready");
        setTimeLeft(30);
        setTranscript("");
        setRound(1);
        setTotalScore(0);
        pickNewProduct();
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                        <Timer className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Speed Pitch</h1>
                        <p className="text-sm text-muted-foreground">Pitch fast, pitch well!</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {gameState === "ready" && (
                <Card className="p-8 text-center bg-gradient-to-br from-orange-500/5 to-orange-500/10 border-orange-500/20">
                    <div className="text-6xl mb-4">{product.emoji}</div>
                    <h2 className="text-xl font-semibold mb-2">Your Product</h2>
                    <p className="text-2xl font-bold text-orange-500 mb-6">{product.name}</p>

                    <div className="mb-6 p-4 bg-background/50 rounded-xl">
                        <h3 className="font-medium mb-2">Rules</h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• You have 30 seconds to pitch this product</li>
                            <li>• 3 rounds total with different products</li>
                            <li>• More words = more points (up to 300/round)</li>
                            <li>• Be creative and persuasive!</li>
                        </ul>
                    </div>

                    <Button size="lg" onClick={startGame} className="gap-2 bg-orange-500 hover:bg-orange-500/90">
                        <Mic className="h-5 w-5" />
                        Start Pitching
                    </Button>
                </Card>
            )}

            {gameState === "countdown" && (
                <Card className="p-16 text-center bg-gradient-to-br from-orange-500/10 to-transparent">
                    <p className="text-xl text-muted-foreground mb-4">Get ready to pitch...</p>
                    <div className="text-8xl font-bold text-orange-500 animate-pulse">{countdown}</div>
                    <div className="mt-6 text-6xl">{product.emoji}</div>
                    <p className="mt-4 text-xl font-semibold">{product.name}</p>
                </Card>
            )}

            {gameState === "playing" && (
                <div className="space-y-6">
                    <Card className="p-6 bg-gradient-to-br from-orange-500/5 to-transparent">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Round</p>
                                <p className="text-2xl font-bold">{round}/3</p>
                            </div>
                            <div className="text-center">
                                <p className={`text-5xl font-bold ${timeLeft <= 5 ? 'text-destructive animate-pulse' : 'text-orange-500'}`}>
                                    {timeLeft}
                                </p>
                                <p className="text-sm text-muted-foreground">seconds</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Score</p>
                                <p className="text-2xl font-bold text-primary">{totalScore}</p>
                            </div>
                        </div>
                        <Progress value={((30 - timeLeft) / 30) * 100} className="h-2" />
                    </Card>

                    <Card className="p-4 bg-orange-500/5 flex items-center gap-4">
                        <span className="text-4xl">{product.emoji}</span>
                        <div>
                            <p className="text-sm text-muted-foreground">Pitch this:</p>
                            <p className="font-bold text-lg">{product.name}</p>
                        </div>
                        {isRecording && (
                            <div className="ml-auto flex items-center gap-2 bg-destructive/10 px-3 py-1.5 rounded-full">
                                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                                <span className="text-sm font-medium text-destructive">Live</span>
                            </div>
                        )}
                    </Card>

                    <Card className="p-4 min-h-[120px] bg-background">
                        <p className="text-sm text-muted-foreground mb-2">Your pitch:</p>
                        <p className="text-foreground leading-relaxed">
                            {transcript || <span className="text-muted-foreground italic">Start pitching...</span>}
                        </p>
                    </Card>

                    <Button variant="outline" onClick={endRound} className="w-full">
                        <MicOff className="h-4 w-4 mr-2" />
                        End Round Early
                    </Button>
                </div>
            )}

            {gameState === "finished" && (
                <Card className="p-8 text-center bg-gradient-to-br from-orange-500/5 to-primary/5">
                    <Sparkles className="h-16 w-16 mx-auto mb-4 text-orange-500" />
                    <h2 className="text-2xl font-bold mb-2">All Rounds Complete!</h2>

                    <div className="text-5xl font-bold text-orange-500 mb-2">{totalScore}</div>
                    <p className="text-muted-foreground mb-6">total points</p>

                    <div className="p-4 bg-background rounded-xl mb-6">
                        <p className="text-sm text-muted-foreground mb-2">Performance</p>
                        <p className="font-semibold">
                            {totalScore >= 700 ? "🔥 Master Pitcher!" :
                                totalScore >= 500 ? "⭐ Great job!" :
                                    totalScore >= 300 ? "👍 Good effort!" :
                                        "Keep practicing!"}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose} className="flex-1">
                            Exit
                        </Button>
                        <Button onClick={resetGame} className="flex-1 gap-2 bg-orange-500 hover:bg-orange-500/90">
                            <RotateCcw className="h-4 w-4" />
                            Play Again
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default SpeedPitch;
