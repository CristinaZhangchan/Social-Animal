"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, Check, SkipForward, RotateCcw, Eye, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface MicroexpressionQuizProps {
    onClose: () => void;
}

interface Expression {
    id: string;
    name: string;
    emoji: string;
    description: string;
    cues: string[];
}

const EXPRESSIONS: Expression[] = [
    {
        id: 'happiness',
        name: 'Happiness',
        emoji: '😊',
        description: 'Genuine joy and positive emotion',
        cues: ["Crow's feet wrinkles around eyes", 'Raised cheeks', 'Corners of mouth turned up', 'Eyes slightly narrowed'],
    },
    {
        id: 'sadness',
        name: 'Sadness',
        emoji: '😢',
        description: 'Sorrow or emotional pain',
        cues: ['Inner corners of eyebrows raised', 'Corners of lips pulled down', 'Lower lip may tremble', 'Eyes may appear glossy'],
    },
    {
        id: 'anger',
        name: 'Anger',
        emoji: '😠',
        description: 'Frustration or hostility',
        cues: ['Eyebrows pulled down and together', 'Hard stare with narrowed eyes', 'Lips pressed firmly together', 'Flared nostrils'],
    },
    {
        id: 'fear',
        name: 'Fear',
        emoji: '😨',
        description: 'Anxiety or perceived threat',
        cues: ['Eyebrows raised and pulled together', 'Upper eyelids raised', 'Mouth open slightly', 'Lips stretched horizontally'],
    },
    {
        id: 'surprise',
        name: 'Surprise',
        emoji: '😲',
        description: 'Unexpected event or information',
        cues: ['Eyebrows raised high', 'Eyes wide open', 'Jaw drops open', 'Forehead wrinkles horizontally'],
    },
    {
        id: 'disgust',
        name: 'Disgust',
        emoji: '🤢',
        description: 'Revulsion or strong disapproval',
        cues: ['Nose wrinkled', 'Upper lip raised', 'Cheeks raised', 'Lower lip pushed out and up'],
    },
    {
        id: 'contempt',
        name: 'Contempt',
        emoji: '😏',
        description: 'Feeling of superiority or disdain',
        cues: ['One-sided lip raise (smirk)', 'Tightening of one corner of mouth', 'Slight head tilt back', 'Asymmetrical expression'],
    }
];

const MicroexpressionQuiz: React.FC<MicroexpressionQuizProps> = ({ onClose }) => {
    const [gameState, setGameState] = useState<'ready' | 'playing' | 'feedback' | 'finished'>('ready');
    const [currentQuestion, setCurrentQuestion] = useState<Expression | null>(null);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [questions, setQuestions] = useState<Expression[]>([]);
    const totalQuestions = 7;

    const shuffleArray = <T,>(array: T[]): T[] => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const generateQuestions = () => {
        return shuffleArray([...EXPRESSIONS]);
    };

    const startGame = () => {
        const newQuestions = generateQuestions();
        setQuestions(newQuestions);
        setCurrentQuestion(newQuestions[0]);
        setQuestionIndex(0);
        setScore(0);
        setSelectedAnswer(null);
        setGameState('playing');
    };

    const handleAnswer = (expressionId: string) => {
        if (selectedAnswer) return;

        setSelectedAnswer(expressionId);
        const isCorrect = expressionId === currentQuestion?.id;

        if (isCorrect) {
            setScore(prev => prev + 1);
            toast.success('Correct! Great eye for expressions!');
        } else {
            toast.error(`That was ${currentQuestion?.name}`);
        }

        setGameState('feedback');
    };

    const nextQuestion = () => {
        const nextIndex = questionIndex + 1;

        if (nextIndex >= totalQuestions) {
            setGameState('finished');
        } else {
            setCurrentQuestion(questions[nextIndex]);
            setQuestionIndex(nextIndex);
            setSelectedAnswer(null);
            setGameState('playing');
        }
    };

    const skipQuestion = () => {
        nextQuestion();
    };

    const getScoreMessage = () => {
        const percentage = (score / totalQuestions) * 100;
        if (percentage >= 90) return "Microexpression Master! 🏆";
        if (percentage >= 70) return "Excellent Observer! 👁️";
        if (percentage >= 50) return "Good Progress! 📈";
        return "Keep Practicing! 💪";
    };

    if (gameState === 'ready') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                        <Eye className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Microexpression Quiz</h2>
                    <p className="text-muted-foreground mb-6">
                        Learn to identify the 7 universal microexpressions that reveal true emotions.
                    </p>

                    <div className="grid grid-cols-7 gap-2 mb-8">
                        {EXPRESSIONS.map(exp => (
                            <div key={exp.id} className="flex flex-col items-center">
                                <span className="text-2xl">{exp.emoji}</span>
                                <span className="text-xs text-muted-foreground mt-1">{exp.name}</span>
                            </div>
                        ))}
                    </div>

                    <Card className="p-4 mb-6 bg-muted/30">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            How to Play
                        </h3>
                        <ul className="text-sm text-muted-foreground text-left space-y-1">
                            <li>• You&apos;ll see an emoji depicting a facial expression</li>
                            <li>• Identify which of the 7 microexpressions is shown</li>
                            <li>• Learn the key facial cues for each emotion</li>
                            <li>• Train your observation skills!</li>
                        </ul>
                    </Card>

                    <Button onClick={startGame} size="lg" className="w-full">
                        Start Quiz
                    </Button>
                </div>
            </div>
        );
    }

    if (gameState === 'finished') {
        const percentage = Math.round((score / totalQuestions) * 100);

        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                        <Eye className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">{getScoreMessage()}</h2>
                    <p className="text-5xl font-bold text-primary mb-2">{score}/{totalQuestions}</p>
                    <p className="text-muted-foreground mb-8">{percentage}% accuracy</p>

                    <Card className="p-4 mb-6 bg-muted/30">
                        <h3 className="font-semibold mb-3">Quick Reference</h3>
                        <div className="grid grid-cols-2 gap-2 text-left">
                            {EXPRESSIONS.map(exp => (
                                <div key={exp.id} className="flex items-center gap-2 text-sm">
                                    <span>{exp.emoji}</span>
                                    <span className="text-muted-foreground">{exp.name}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose} className="flex-1">
                            Exit
                        </Button>
                        <Button onClick={startGame} className="flex-1">
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Play Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center p-6">
            {/* Header */}
            <div className="w-full max-w-2xl mb-6">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">
                        Question {questionIndex + 1} of {totalQuestions}
                    </span>
                    <span className="text-sm font-medium text-primary">
                        Score: {score}/{questionIndex + (gameState === 'feedback' ? 1 : 0)}
                    </span>
                </div>
                <Progress value={((questionIndex + (gameState === 'feedback' ? 1 : 0)) / totalQuestions) * 100} className="h-2" />
            </div>

            {/* Question Card */}
            <Card className="w-full max-w-2xl p-6 mb-6">
                <div className="text-center mb-6">
                    <p className="text-lg font-medium">What microexpression is this person showing?</p>
                </div>

                {/* Expression Display - using large emoji instead of image */}
                <div className="flex justify-center mb-6">
                    {currentQuestion && (
                        <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-border/30 shadow-lg bg-muted/30 flex items-center justify-center">
                            <span className="text-8xl">{currentQuestion.emoji}</span>
                        </div>
                    )}
                </div>

                {/* Answer Options */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {EXPRESSIONS.slice(0, 4).map(exp => (
                        <Button
                            key={exp.id}
                            variant={selectedAnswer === exp.id
                                ? (exp.id === currentQuestion?.id ? 'default' : 'destructive')
                                : selectedAnswer && exp.id === currentQuestion?.id
                                    ? 'default'
                                    : 'outline'
                            }
                            className="h-auto py-3 flex flex-col items-center gap-1"
                            onClick={() => handleAnswer(exp.id)}
                            disabled={!!selectedAnswer}
                        >
                            <span className="text-xl">{exp.emoji}</span>
                            <span className="text-xs">{exp.name}</span>
                        </Button>
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {EXPRESSIONS.slice(4).map(exp => (
                        <Button
                            key={exp.id}
                            variant={selectedAnswer === exp.id
                                ? (exp.id === currentQuestion?.id ? 'default' : 'destructive')
                                : selectedAnswer && exp.id === currentQuestion?.id
                                    ? 'default'
                                    : 'outline'
                            }
                            className="h-auto py-3 flex flex-col items-center gap-1"
                            onClick={() => handleAnswer(exp.id)}
                            disabled={!!selectedAnswer}
                        >
                            <span className="text-xl">{exp.emoji}</span>
                            <span className="text-xs">{exp.name}</span>
                        </Button>
                    ))}
                </div>
            </Card>

            {/* Feedback Section */}
            {gameState === 'feedback' && currentQuestion && (
                <Card className="w-full max-w-2xl p-4 mb-6 bg-muted/30">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                        {currentQuestion.emoji} {currentQuestion.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                        {currentQuestion.description}
                    </p>
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-primary">Key Facial Cues:</p>
                        <ul className="text-xs text-muted-foreground space-y-0.5">
                            {currentQuestion.cues.map((cue, i) => (
                                <li key={i}>• {cue}</li>
                            ))}
                        </ul>
                    </div>
                </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 w-full max-w-2xl">
                {gameState === 'playing' ? (
                    <Button variant="ghost" onClick={skipQuestion} className="flex-1">
                        <SkipForward className="h-4 w-4 mr-2" />
                        Skip
                    </Button>
                ) : (
                    <Button onClick={nextQuestion} className="flex-1">
                        {questionIndex + 1 >= totalQuestions ? 'See Results' : 'Next Question'}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default MicroexpressionQuiz;
