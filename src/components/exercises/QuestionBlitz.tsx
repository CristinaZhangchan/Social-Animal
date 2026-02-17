"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, Mic, MessageCircleQuestion, RotateCcw, Trophy, Clock, Zap } from "lucide-react";
import { toast } from "sonner";

interface QuestionBlitzProps {
    onClose: () => void;
}

const QUESTIONS = [
    "What's your favorite way to relax?",
    "If you could travel anywhere tomorrow, where would you go?",
    "What's the best advice you've ever received?",
    "What skill would you love to master?",
    "What's your guilty pleasure?",
    "If you could have dinner with anyone, who would it be?",
    "What's your morning routine?",
    "What book changed your perspective?",
    "What's your proudest achievement?",
    "If you won the lottery, what's the first thing you'd do?",
    "What's your favorite childhood memory?",
    "What motivates you to work hard?",
    "If you could live in any era, which would you choose?",
    "What's the best meal you've ever had?",
    "What's your hidden talent?",
    "What do you value most in a friendship?",
    "If you could learn any language instantly, which one?",
    "What's your favorite way to spend a weekend?",
    "What's the most spontaneous thing you've done?",
    "What would you tell your younger self?"
];

const QuestionBlitz = ({ onClose }: QuestionBlitzProps) => {
    const [gameState, setGameState] = useState<"ready" | "playing" | "finished">("ready");
    const [questions, setQuestions] = useState<string[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [timePerQuestion, setTimePerQuestion] = useState<number[]>([]);
    const [questionStartTime, setQuestionStartTime] = useState<number>(0);
    const [totalTime, setTotalTime] = useState(0);
    const [score, setScore] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
        setQuestions(shuffled);
    }, []);

    useEffect(() => {
        if (gameState === "playing") {
            timerRef.current = setInterval(() => {
                setTotalTime(t => t + 0.1);
            }, 100);
            return () => {
                if (timerRef.current) clearInterval(timerRef.current);
            };
        }
    }, [gameState]);

    const startGame = () => {
        setGameState("playing");
        setCurrentQuestionIndex(0);
        setTimePerQuestion([]);
        setTotalTime(0);
        setScore(0);
        setQuestionStartTime(Date.now());
        startListening();
    };

    const startListening = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = () => {
                nextQuestion();
            };

            recognitionRef.current.onend = () => {
                if (gameState === "playing" && currentQuestionIndex < questions.length - 1) {
                    setTimeout(() => startListening(), 300);
                }
            };

            recognitionRef.current.start();
            setIsRecording(true);
        }
    };

    const nextQuestion = () => {
        const questionTime = (Date.now() - questionStartTime) / 1000;
        setTimePerQuestion(prev => [...prev, questionTime]);

        const questionScore = Math.max(0, Math.round(100 - (questionTime * 10)));
        setScore(prev => prev + questionScore);

        if (questionTime < 3) {
            toast.success("Lightning fast! ⚡", { duration: 1000 });
        } else if (questionTime < 5) {
            toast.success("Quick response! 👍", { duration: 1000 });
        }

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setQuestionStartTime(Date.now());
        } else {
            endGame();
        }
    };

    const skipQuestion = () => {
        const questionTime = (Date.now() - questionStartTime) / 1000;
        setTimePerQuestion(prev => [...prev, questionTime]);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setQuestionStartTime(Date.now());
        } else {
            endGame();
        }
    };

    const endGame = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setIsRecording(false);
        setGameState("finished");
        setScore(prev => prev + 200);
    };

    const resetGame = () => {
        setGameState("ready");
        setCurrentQuestionIndex(0);
        setTimePerQuestion([]);
        setTotalTime(0);
        setScore(0);
        const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10);
        setQuestions(shuffled);
    };

    const averageTime = timePerQuestion.length > 0
        ? (timePerQuestion.reduce((a, b) => a + b, 0) / timePerQuestion.length).toFixed(1)
        : "0.0";

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                        <MessageCircleQuestion className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Question Blitz</h1>
                        <p className="text-sm text-muted-foreground">Think fast, respond faster!</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {gameState === "ready" && (
                <Card className="p-8 text-center bg-gradient-to-br from-red-500/5 to-red-500/10 border-red-500/20">
                    <Zap className="h-16 w-16 mx-auto mb-4 text-red-500" />
                    <h2 className="text-xl font-semibold mb-4">Ready for Rapid Fire?</h2>

                    <div className="mb-6 p-4 bg-background/50 rounded-xl">
                        <h3 className="font-medium mb-2">Rules</h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Answer 10 questions as fast as you can</li>
                            <li>• Faster answers = more points</li>
                            <li>• Under 3 seconds = maximum points</li>
                            <li>• Just start speaking to submit your answer!</li>
                        </ul>
                    </div>

                    <Button size="lg" onClick={startGame} className="gap-2 bg-red-500 hover:bg-red-500/90 text-white">
                        <Zap className="h-5 w-5" />
                        Start Blitz
                    </Button>
                </Card>
            )}

            {gameState === "playing" && questions[currentQuestionIndex] && (
                <div className="space-y-6">
                    <Card className="p-4 bg-gradient-to-br from-red-500/5 to-transparent">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">Question</p>
                                    <p className="text-xl font-bold">{currentQuestionIndex + 1}/10</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Score</p>
                                    <p className="text-xl font-bold text-red-500">{score}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-lg font-mono">{totalTime.toFixed(1)}s</span>
                            </div>
                        </div>
                        <Progress value={((currentQuestionIndex) / 10) * 100} className="h-2" />
                    </Card>

                    <Card className="p-8 text-center bg-gradient-to-br from-red-500/10 to-transparent">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            {isRecording && (
                                <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-sm font-medium text-green-500">Listening...</span>
                                </div>
                            )}
                        </div>

                        <h2 className="text-2xl font-bold text-foreground mb-6 leading-relaxed">
                            {questions[currentQuestionIndex]}
                        </h2>

                        <p className="text-sm text-muted-foreground mb-4">
                            Start speaking to answer, or skip to move on
                        </p>

                        <Button variant="outline" onClick={skipQuestion}>
                            Skip Question
                        </Button>
                    </Card>

                    {timePerQuestion.length > 0 && (
                        <Card className="p-4 bg-muted/30">
                            <p className="text-sm text-muted-foreground mb-2">Recent answer times:</p>
                            <div className="flex gap-2 flex-wrap">
                                {timePerQuestion.slice(-5).map((time, i) => (
                                    <span
                                        key={i}
                                        className={`text-sm font-mono px-2 py-1 rounded ${time < 3 ? 'bg-green-500/20 text-green-500' :
                                                time < 5 ? 'bg-yellow-500/20 text-yellow-500' :
                                                    'bg-muted text-muted-foreground'
                                            }`}
                                    >
                                        {time.toFixed(1)}s
                                    </span>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {gameState === "finished" && (
                <Card className="p-8 text-center bg-gradient-to-br from-red-500/5 to-primary/5">
                    <Trophy className={`h-16 w-16 mx-auto mb-4 ${score >= 800 ? 'text-yellow-500' : 'text-red-500'}`} />
                    <h2 className="text-2xl font-bold mb-2">Blitz Complete!</h2>

                    <div className="text-5xl font-bold text-red-500 mb-2">{score}</div>
                    <p className="text-muted-foreground mb-6">points</p>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="p-3 bg-background rounded-xl">
                            <p className="text-xs text-muted-foreground">Total Time</p>
                            <p className="text-xl font-bold">{totalTime.toFixed(1)}s</p>
                        </div>
                        <div className="p-3 bg-background rounded-xl">
                            <p className="text-xs text-muted-foreground">Avg/Question</p>
                            <p className="text-xl font-bold">{averageTime}s</p>
                        </div>
                        <div className="p-3 bg-background rounded-xl">
                            <p className="text-xs text-muted-foreground">Answered</p>
                            <p className="text-xl font-bold">{timePerQuestion.length}/10</p>
                        </div>
                    </div>

                    <div className="p-4 bg-background rounded-xl mb-6">
                        <p className="text-sm text-muted-foreground mb-1">Performance</p>
                        <p className="font-semibold">
                            {score >= 900 ? "🔥 Lightning reflexes!" :
                                score >= 700 ? "⚡ Super fast!" :
                                    score >= 500 ? "👍 Quick thinker!" :
                                        "Keep practicing!"}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose} className="flex-1">
                            Exit
                        </Button>
                        <Button onClick={resetGame} className="flex-1 gap-2 bg-red-500 hover:bg-red-500/90 text-white">
                            <RotateCcw className="h-4 w-4" />
                            Play Again
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default QuestionBlitz;
