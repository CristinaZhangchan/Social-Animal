"use client";

import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { cn } from "@/lib/utils";
import {
    Zap,
    Timer,
    Shuffle,
    Drama,
    MessageCircleQuestion,
    Play,
    Trophy,
    Flame,
    PartyPopper,
    Eye,
    Dumbbell,
    X,
    ArrowLeft,
} from "lucide-react";

// Game components
import FillerZapper from "@/components/exercises/FillerZapper";
import SpeedPitch from "@/components/exercises/SpeedPitch";
import WordRoulette from "@/components/exercises/WordRoulette";
import EmotionExpress from "@/components/exercises/EmotionExpress";
import QuestionBlitz from "@/components/exercises/QuestionBlitz";
import MicroexpressionQuiz from "@/components/exercises/MicroexpressionQuiz";
import OscarSpeech from "@/components/exercises/OscarSpeech";
import MetaphorMadness from "@/components/exercises/MetaphorMadness";

const exercises = [
    {
        id: "filler-zapper",
        title: "Filler Zapper",
        description: "Speak for 60 seconds without saying 'um', 'uh', 'like', or 'you know'. Can you do it?",
        icon: Zap,
        color: "primary",
        tags: ["Fluency", "Awareness"],
        difficulty: "Medium",
        bestScore: null,
    },
    {
        id: "speed-pitch",
        title: "Speed Pitch",
        description: "You have 30 seconds to pitch a random product. Think fast, speak confidently!",
        icon: Timer,
        color: "accent",
        tags: ["Quick Thinking", "Persuasion"],
        difficulty: "Hard",
        bestScore: null,
    },
    {
        id: "word-roulette",
        title: "Word Roulette",
        description: "Weave 5 random words into a coherent 2-minute story. Creativity wins!",
        icon: Shuffle,
        color: "secondary",
        tags: ["Creativity", "Storytelling"],
        difficulty: "Medium",
        bestScore: null,
    },
    {
        id: "emotion-express",
        title: "Emotion Express",
        description: "Say the same sentence with different emotions. Master your vocal range!",
        icon: Drama,
        color: "warm",
        tags: ["Expression", "Versatility"],
        difficulty: "Easy",
        bestScore: null,
    },
    {
        id: "question-blitz",
        title: "Question Blitz",
        description: "Answer 10 random questions as fast as you can. No hesitation allowed!",
        icon: MessageCircleQuestion,
        color: "destructive",
        tags: ["Spontaneity", "Confidence"],
        difficulty: "Hard",
        bestScore: null,
    },
    {
        id: "microexpression-quiz",
        title: "Microexpression Quiz",
        description: "Identify the 7 universal microexpressions. Train your eye to read faces like a pro!",
        icon: Eye,
        color: "accent",
        tags: ["Body Language", "Observation"],
        difficulty: "Medium",
        bestScore: null,
    },
    {
        id: "award-speech",
        title: "Oscar Acceptance Speech",
        description: "You just won! Deliver an unforgettable acceptance speech in 45 seconds.",
        icon: PartyPopper,
        color: "destructive",
        tags: ["Public Speaking", "Emotion"],
        difficulty: "Medium",
        bestScore: null,
    },
    {
        id: "metaphor-madness",
        title: "Metaphor Madness",
        description: "Explain everyday objects using only metaphors. Get creative!",
        icon: Flame,
        color: "primary",
        tags: ["Creativity", "Language"],
        difficulty: "Expert",
        bestScore: null,
    },
];

const colorMap: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
    primary: { bg: "bg-[hsl(var(--primary)/0.1)]", text: "text-[hsl(var(--primary))]", border: "border-[hsl(var(--primary)/0.3)]", gradient: "from-[hsl(var(--primary)/0.2)] to-[hsl(var(--primary)/0.05)]" },
    secondary: { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/30", gradient: "from-emerald-500/20 to-emerald-500/5" },
    accent: { bg: "bg-orange-500/10", text: "text-orange-600", border: "border-orange-500/30", gradient: "from-orange-500/20 to-orange-500/5" },
    warm: { bg: "bg-pink-500/10", text: "text-pink-600", border: "border-pink-500/30", gradient: "from-pink-500/20 to-pink-500/5" },
    destructive: { bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/30", gradient: "from-red-500/20 to-red-500/5" },
};

function getDifficultyColor(difficulty: string) {
    switch (difficulty) {
        case "Easy": return "text-green-600 bg-green-500/10";
        case "Medium": return "text-yellow-600 bg-yellow-500/10";
        case "Hard": return "text-orange-600 bg-orange-500/10";
        case "Expert": return "text-red-600 bg-red-500/10";
        default: return "text-muted-foreground bg-muted/50";
    }
}

// Map game IDs to their components
const gameComponents: Record<string, React.ComponentType<{ onClose: () => void }>> = {
    "filler-zapper": FillerZapper,
    "speed-pitch": SpeedPitch,
    "word-roulette": WordRoulette,
    "emotion-express": EmotionExpress,
    "question-blitz": QuestionBlitz,
    "microexpression-quiz": MicroexpressionQuiz,
    "award-speech": OscarSpeech,
    "metaphor-madness": MetaphorMadness,
};

export default function BoostPage() {
    const [activeGame, setActiveGame] = useState<string | null>(null);

    const handlePlayGame = (gameId: string) => {
        setActiveGame(gameId);
    };

    const handleCloseGame = () => {
        setActiveGame(null);
    };

    // If a game is active, render it in a full-screen overlay
    if (activeGame) {
        const GameComponent = gameComponents[activeGame];
        if (GameComponent) {
            return (
                <AppLayout>
                    <div className="max-w-5xl mx-auto">
                        {/* Back button */}
                        <button
                            onClick={handleCloseGame}
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Games
                        </button>

                        {/* Game Component */}
                        <GameComponent onClose={handleCloseGame} />
                    </div>
                </AppLayout>
            );
        }
    }

    return (
        <AppLayout>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 bg-orange-500/10 px-4 py-2 rounded-full mb-4">
                        <Dumbbell className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-semibold text-orange-600">Skill Games</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold mb-3">
                        Level up your <span className="text-primary">communication</span>
                    </h1>

                    <p className="text-muted-foreground max-w-xl">
                        Quick, fun challenges to sharpen specific skills. Beat your high scores and unlock new levels!
                    </p>
                </div>

                {/* Games grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {exercises.map((exercise, index) => {
                        const colors = colorMap[exercise.color] || colorMap.primary;
                        const Icon = exercise.icon;

                        return (
                            <div
                                key={exercise.id}
                                className={cn(
                                    "group relative overflow-hidden p-6 bg-gradient-to-br rounded-2xl border transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]",
                                    colors.gradient,
                                    colors.border
                                )}
                                style={{ animationDelay: `${index * 0.05}s` }}
                                onClick={() => handlePlayGame(exercise.id)}
                            >
                                {/* Decorative blur */}
                                <div className={cn("absolute -right-8 -top-8 w-32 h-32 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity", colors.bg)} />

                                <div className="relative flex flex-col h-full">
                                    {/* Header row */}
                                    <div className="mb-4 flex items-start justify-between">
                                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm", colors.bg)}>
                                            <Icon className={cn("h-7 w-7", colors.text)} />
                                        </div>
                                        <div className={cn("text-xs font-medium px-2 py-1 rounded-full", getDifficultyColor(exercise.difficulty))}>
                                            {exercise.difficulty}
                                        </div>
                                    </div>

                                    {/* Title & Description */}
                                    <h3 className="font-bold text-xl mb-2">{exercise.title}</h3>
                                    <p className="text-sm text-muted-foreground mb-4 flex-grow leading-relaxed">
                                        {exercise.description}
                                    </p>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {exercise.tags.map((tag) => (
                                            <span key={tag} className={cn("text-xs px-2.5 py-1 rounded-full font-medium", colors.bg, colors.text)}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Score & CTA */}
                                    <div className="flex items-center justify-between pt-2 border-t border-border/30">
                                        {exercise.bestScore !== null ? (
                                            <div className="flex items-center gap-1.5 text-sm">
                                                <Trophy className="h-4 w-4 text-yellow-500" />
                                                <span className="font-semibold">{exercise.bestScore}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">No high score yet</span>
                                        )}
                                        <button className={cn("inline-flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80", colors.bg, colors.text)}>
                                            <Play className="h-4 w-4" />
                                            Play
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pro tip */}
                <div className="mt-8 p-6 bg-gradient-to-r from-orange-500/5 via-primary/5 to-emerald-500/5 border border-border/30 rounded-2xl text-center">
                    <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">🎮 Pro tip:</span> Play a quick game before important calls to warm up your speaking muscles!
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
