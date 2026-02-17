"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, Mic, MicOff, Drama, RotateCcw, Trophy, Volume2 } from "lucide-react";
import { toast } from "sonner";

interface EmotionExpressProps {
    onClose: () => void;
}

const SENTENCES = [
    "I can't believe this is happening",
    "That's exactly what I was thinking",
    "I never said that",
    "This is the best day ever",
    "I knew you would say that",
    "We need to talk about something",
    "I've been waiting for this moment",
    "That's not what I expected"
];

const EMOTIONS = [
    { name: "Excited", emoji: "😄", color: "text-yellow-500" },
    { name: "Angry", emoji: "😠", color: "text-red-500" },
    { name: "Sad", emoji: "😢", color: "text-blue-500" },
    { name: "Surprised", emoji: "😲", color: "text-purple-500" },
    { name: "Sarcastic", emoji: "😏", color: "text-orange-500" },
    { name: "Scared", emoji: "😨", color: "text-green-500" },
    { name: "Loving", emoji: "🥰", color: "text-pink-500" },
    { name: "Confident", emoji: "😎", color: "text-cyan-500" }
];

const EmotionExpress = ({ onClose }: EmotionExpressProps) => {
    const [gameState, setGameState] = useState<"ready" | "playing" | "recording" | "finished">("ready");
    const [sentence, setSentence] = useState("");
    const [currentEmotionIndex, setCurrentEmotionIndex] = useState(0);
    const [emotions, setEmotions] = useState<typeof EMOTIONS>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [completedCount, setCompletedCount] = useState(0);
    const [score, setScore] = useState(0);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        setSentence(SENTENCES[Math.floor(Math.random() * SENTENCES.length)]);
        const shuffled = [...EMOTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
        setEmotions(shuffled);
    }, []);

    const startGame = () => {
        setGameState("playing");
        setCurrentEmotionIndex(0);
        setCompletedCount(0);
        setScore(0);
    };

    const startRecording = () => {
        setGameState("recording");
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = () => {
                completeEmotion();
            };

            recognitionRef.current.onend = () => {
                setIsRecording(false);
            };

            recognitionRef.current.start();
            setIsRecording(true);

            setTimeout(() => {
                if (recognitionRef.current) {
                    recognitionRef.current.stop();
                }
            }, 5000);
        } else {
            setIsRecording(true);
            setTimeout(() => {
                setIsRecording(false);
                completeEmotion();
            }, 3000);
        }
    };

    const completeEmotion = () => {
        const newCompleted = completedCount + 1;
        setCompletedCount(newCompleted);
        setScore(prev => prev + 100);

        toast.success(`Great ${emotions[currentEmotionIndex].name.toLowerCase()} delivery!`, { duration: 1500 });

        if (currentEmotionIndex < emotions.length - 1) {
            setCurrentEmotionIndex(prev => prev + 1);
            setGameState("playing");
        } else {
            setGameState("finished");
            setScore(prev => prev + 150);
        }
    };

    const skipEmotion = () => {
        if (currentEmotionIndex < emotions.length - 1) {
            setCurrentEmotionIndex(prev => prev + 1);
        } else {
            setGameState("finished");
        }
    };

    const resetGame = () => {
        setGameState("ready");
        setCurrentEmotionIndex(0);
        setCompletedCount(0);
        setScore(0);
        setSentence(SENTENCES[Math.floor(Math.random() * SENTENCES.length)]);
        const shuffled = [...EMOTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
        setEmotions(shuffled);
    };

    const currentEmotion = emotions[currentEmotionIndex];

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center">
                        <Drama className="h-6 w-6 text-pink-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Emotion Express</h1>
                        <p className="text-sm text-muted-foreground">Master your vocal range!</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {gameState === "ready" && (
                <Card className="p-8 text-center bg-gradient-to-br from-pink-500/5 to-pink-500/10 border-pink-500/20">
                    <Drama className="h-16 w-16 mx-auto mb-4 text-pink-500" />
                    <h2 className="text-xl font-semibold mb-2">Your Sentence</h2>
                    <p className="text-2xl font-bold text-pink-500 mb-6">&quot;{sentence}&quot;</p>

                    <div className="mb-6 p-4 bg-background/50 rounded-xl">
                        <h3 className="font-medium mb-2">Rules</h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Say the same sentence 5 times</li>
                            <li>• Each time with a different emotion</li>
                            <li>• 100 points per delivery</li>
                            <li>• Focus on tone, pace, and expression!</li>
                        </ul>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                        {emotions.map((emotion, i) => (
                            <span key={i} className="text-2xl" title={emotion.name}>
                                {emotion.emoji}
                            </span>
                        ))}
                    </div>

                    <Button size="lg" onClick={startGame} className="gap-2 bg-pink-500 hover:bg-pink-500/90 text-white">
                        <Volume2 className="h-5 w-5" />
                        Start Acting
                    </Button>
                </Card>
            )}

            {(gameState === "playing" || gameState === "recording") && currentEmotion && (
                <div className="space-y-6">
                    <Card className="p-4 bg-gradient-to-br from-pink-500/5 to-transparent">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-muted-foreground">Progress</span>
                            <span className="text-sm font-medium">{currentEmotionIndex + 1} / {emotions.length}</span>
                        </div>
                        <Progress value={((currentEmotionIndex) / emotions.length) * 100} className="h-2" />
                    </Card>

                    <Card className="p-8 text-center bg-gradient-to-br from-pink-500/10 to-transparent">
                        <div className="text-7xl mb-4">{currentEmotion.emoji}</div>
                        <h2 className={`text-3xl font-bold mb-4 ${currentEmotion.color}`}>
                            {currentEmotion.name}
                        </h2>
                        <p className="text-xl text-foreground mb-6">&quot;{sentence}&quot;</p>

                        {gameState === "recording" && isRecording ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="flex items-center gap-2 bg-destructive/10 px-4 py-2 rounded-full">
                                    <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                                    <span className="font-medium text-destructive">Recording...</span>
                                </div>
                                <p className="text-sm text-muted-foreground">Say the sentence with {currentEmotion.name.toLowerCase()} emotion</p>
                            </div>
                        ) : (
                            <div className="flex gap-3 justify-center">
                                <Button variant="outline" onClick={skipEmotion}>
                                    Skip
                                </Button>
                                <Button onClick={startRecording} className="gap-2 bg-pink-500 hover:bg-pink-500/90 text-white">
                                    <Mic className="h-5 w-5" />
                                    Record
                                </Button>
                            </div>
                        )}
                    </Card>

                    <Card className="p-4 bg-muted/30">
                        <p className="text-sm text-muted-foreground mb-3">Coming up:</p>
                        <div className="flex gap-3">
                            {emotions.slice(currentEmotionIndex + 1).map((emotion, i) => (
                                <div key={i} className="flex flex-col items-center gap-1">
                                    <span className="text-2xl opacity-60">{emotion.emoji}</span>
                                    <span className="text-xs text-muted-foreground">{emotion.name}</span>
                                </div>
                            ))}
                            {emotions.slice(currentEmotionIndex + 1).length === 0 && (
                                <span className="text-sm text-muted-foreground">Last one!</span>
                            )}
                        </div>
                    </Card>
                </div>
            )}

            {gameState === "finished" && (
                <Card className="p-8 text-center bg-gradient-to-br from-pink-500/5 to-primary/5">
                    <Trophy className={`h-16 w-16 mx-auto mb-4 ${completedCount === emotions.length ? 'text-yellow-500' : 'text-pink-500'}`} />
                    <h2 className="text-2xl font-bold mb-2">Performance Complete!</h2>

                    <div className="text-5xl font-bold text-pink-500 mb-2">{score}</div>
                    <p className="text-muted-foreground mb-6">points</p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-background rounded-xl">
                            <p className="text-sm text-muted-foreground">Emotions Delivered</p>
                            <p className="text-2xl font-bold">{completedCount}/{emotions.length}</p>
                        </div>
                        <div className="p-4 bg-background rounded-xl">
                            <p className="text-sm text-muted-foreground">Completion Bonus</p>
                            <p className="text-2xl font-bold text-green-500">
                                {completedCount === emotions.length ? "+150" : "0"}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose} className="flex-1">
                            Exit
                        </Button>
                        <Button onClick={resetGame} className="flex-1 gap-2 bg-pink-500 hover:bg-pink-500/90 text-white">
                            <RotateCcw className="h-4 w-4" />
                            Play Again
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default EmotionExpress;
