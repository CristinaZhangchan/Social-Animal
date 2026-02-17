"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { X, Mic, MicOff, Shuffle, RotateCcw, Trophy, Check } from "lucide-react";
import { toast } from "sonner";

interface WordRouletteProps {
    onClose: () => void;
}

const WORD_BANK = [
    "dragon", "coffee", "moonlight", "secret", "adventure", "whisper", "thunder",
    "crystal", "shadow", "journey", "ancient", "melody", "treasure", "mystery",
    "sunrise", "echo", "forest", "silver", "dream", "horizon", "storm", "magic",
    "ocean", "flame", "silence", "wings", "bridge", "garden", "midnight", "spark"
];

const WordRoulette = ({ onClose }: WordRouletteProps) => {
    const [gameState, setGameState] = useState<"ready" | "spinning" | "playing" | "finished">("ready");
    const [timeLeft, setTimeLeft] = useState(90);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [words, setWords] = useState<string[]>([]);
    const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
    const [score, setScore] = useState(0);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (gameState === "spinning") {
            let spins = 0;
            const spinInterval = setInterval(() => {
                const randomWords = [];
                for (let i = 0; i < 5; i++) {
                    randomWords.push(WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)]);
                }
                setWords(randomWords);
                spins++;
                if (spins >= 15) {
                    clearInterval(spinInterval);
                    const finalWords: string[] = [];
                    const usedIndices = new Set<number>();
                    while (finalWords.length < 5) {
                        const idx = Math.floor(Math.random() * WORD_BANK.length);
                        if (!usedIndices.has(idx)) {
                            usedIndices.add(idx);
                            finalWords.push(WORD_BANK[idx]);
                        }
                    }
                    setWords(finalWords);
                    setTimeout(() => setGameState("playing"), 500);
                }
            }, 100);
            return () => clearInterval(spinInterval);
        }
    }, [gameState]);

    useEffect(() => {
        if (gameState === "playing" && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && gameState === "playing") {
            endGame();
        }
    }, [gameState, timeLeft]);

    useEffect(() => {
        if (gameState === "playing" && transcript) {
            const lowerTranscript = transcript.toLowerCase();
            const newUsed = new Set(usedWords);
            let foundNew = false;

            words.forEach(word => {
                if (!usedWords.has(word) && lowerTranscript.includes(word.toLowerCase())) {
                    newUsed.add(word);
                    foundNew = true;
                    toast.success(`✓ Used "${word}"!`, { duration: 1500 });
                }
            });

            if (foundNew) {
                setUsedWords(newUsed);
            }
        }
    }, [transcript, words, gameState]);

    const startGame = () => {
        setGameState("spinning");
        setUsedWords(new Set());
        setTranscript("");
        setTimeLeft(90);
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

    useEffect(() => {
        if (gameState === "playing" && !isRecording) {
            startRecording();
        }
    }, [gameState]);

    const endGame = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsRecording(false);
        setGameState("finished");

        const wordScore = usedWords.size * 100;
        const allWordsBonus = usedWords.size === 5 ? 200 : 0;
        const timeBonus = Math.floor(timeLeft * 2);
        const finalScore = wordScore + allWordsBonus + timeBonus;
        setScore(finalScore);
    };

    const resetGame = () => {
        setGameState("ready");
        setTimeLeft(90);
        setTranscript("");
        setWords([]);
        setUsedWords(new Set());
        setScore(0);
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                        <Shuffle className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Word Roulette</h1>
                        <p className="text-sm text-muted-foreground">Weave words into stories!</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {gameState === "ready" && (
                <Card className="p-8 text-center bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
                    <Shuffle className="h-16 w-16 mx-auto mb-4 text-emerald-500" />
                    <h2 className="text-xl font-semibold mb-4">Spin the Word Wheel!</h2>

                    <div className="mb-6 p-4 bg-background/50 rounded-xl">
                        <h3 className="font-medium mb-2">Rules</h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Get 5 random words</li>
                            <li>• Tell a 90-second story using all of them</li>
                            <li>• 100 points per word used</li>
                            <li>• Bonus 200 points for using all 5!</li>
                        </ul>
                    </div>

                    <Button size="lg" onClick={startGame} className="gap-2 bg-emerald-500 hover:bg-emerald-500/90 text-white">
                        <Shuffle className="h-5 w-5" />
                        Spin Words
                    </Button>
                </Card>
            )}

            {gameState === "spinning" && (
                <Card className="p-8 text-center bg-gradient-to-br from-emerald-500/10 to-transparent">
                    <p className="text-xl text-muted-foreground mb-6">Spinning words...</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {words.map((word, i) => (
                            <Badge
                                key={i}
                                variant="secondary"
                                className="text-lg px-4 py-2 animate-pulse"
                            >
                                {word}
                            </Badge>
                        ))}
                    </div>
                </Card>
            )}

            {gameState === "playing" && (
                <div className="space-y-6">
                    <Card className="p-6 bg-gradient-to-br from-emerald-500/5 to-transparent">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Words Used</p>
                                <p className="text-2xl font-bold">{usedWords.size}/5</p>
                            </div>
                            <div className="text-center">
                                <p className={`text-5xl font-bold ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-emerald-500'}`}>
                                    {timeLeft}
                                </p>
                                <p className="text-sm text-muted-foreground">seconds</p>
                            </div>
                            <div className="text-right">
                                {isRecording && (
                                    <div className="flex items-center gap-2 bg-destructive/10 px-3 py-1.5 rounded-full">
                                        <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                                        <span className="text-sm font-medium text-destructive">Live</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Progress value={((90 - timeLeft) / 90) * 100} className="h-2" />
                    </Card>

                    <Card className="p-4 bg-emerald-500/5">
                        <p className="text-sm text-muted-foreground mb-3">Use these words in your story:</p>
                        <div className="flex flex-wrap gap-2">
                            {words.map((word, i) => (
                                <Badge
                                    key={i}
                                    variant={usedWords.has(word) ? "default" : "outline"}
                                    className={`text-base px-3 py-1.5 transition-all ${usedWords.has(word) ? 'bg-green-500 text-white' : ''}`}
                                >
                                    {usedWords.has(word) && <Check className="h-3 w-3 mr-1" />}
                                    {word}
                                </Badge>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-4 min-h-[120px] bg-background">
                        <p className="text-sm text-muted-foreground mb-2">Your story:</p>
                        <p className="text-foreground leading-relaxed">
                            {transcript || <span className="text-muted-foreground italic">Start telling your story...</span>}
                        </p>
                    </Card>

                    <Button variant="outline" onClick={endGame} className="w-full">
                        <MicOff className="h-4 w-4 mr-2" />
                        Finish Story
                    </Button>
                </div>
            )}

            {gameState === "finished" && (
                <Card className="p-8 text-center bg-gradient-to-br from-emerald-500/5 to-primary/5">
                    <Trophy className={`h-16 w-16 mx-auto mb-4 ${usedWords.size === 5 ? 'text-yellow-500' : 'text-emerald-500'}`} />
                    <h2 className="text-2xl font-bold mb-2">Story Complete!</h2>

                    <div className="text-5xl font-bold text-emerald-500 mb-2">{score}</div>
                    <p className="text-muted-foreground mb-6">points</p>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="p-3 bg-background rounded-xl">
                            <p className="text-xs text-muted-foreground">Words Used</p>
                            <p className="text-xl font-bold">{usedWords.size}/5</p>
                        </div>
                        <div className="p-3 bg-background rounded-xl">
                            <p className="text-xs text-muted-foreground">Time Left</p>
                            <p className="text-xl font-bold">{timeLeft}s</p>
                        </div>
                        <div className="p-3 bg-background rounded-xl">
                            <p className="text-xs text-muted-foreground">Bonus</p>
                            <p className="text-xl font-bold text-green-500">
                                {usedWords.size === 5 ? "+200" : "0"}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose} className="flex-1">
                            Exit
                        </Button>
                        <Button onClick={resetGame} className="flex-1 gap-2 bg-emerald-500 hover:bg-emerald-500/90 text-white">
                            <RotateCcw className="h-4 w-4" />
                            Play Again
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default WordRoulette;
