"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { pushWithTransition } from "@/lib/navigation";
import AppLayout from "@/components/AppLayout";
import { cn } from "@/lib/utils";
import {
    Trophy,
    Target,
    Calendar,
    Zap,
    TrendingUp,
    MessageSquare,
    Clock,
    Star,
    Flame,
    Award,
    Sparkles,
    Lightbulb,
} from "lucide-react";

// ── Static data (replace with Supabase hook later) ──────────────────────────

const progress = {
    streak: 0,
    xp: 59,
    sessionsCompleted: 1,
    weeklyGoal: 5,
    weeklyProgress: 0,
};

const weeklyStats = {
    sessionsThisWeek: 0,
    avgScore: 0,
    totalTime: 0,
    dayStreak: 0,
};

const sessions: any[] = [];

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TrackPage() {
    const router = useRouter();
    const weeklyGoalPercent = Math.min(
        (progress.weeklyProgress / progress.weeklyGoal) * 100,
        100
    );

    return (
        <AppLayout>
            <div className="space-y-8 max-w-6xl mx-auto">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Your Progress</h1>
                    <p className="text-muted-foreground">
                        Track your communication journey and growth
                    </p>
                </div>

                {/* ── Inline Progress Tracker ─────────────────────────────── */}
                <div className="inline-flex items-center gap-4 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-primary/20 shadow-sm">
                    {/* Streak */}
                    <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded-lg", progress.streak > 0 ? "bg-orange-500/20" : "bg-muted/30")}>
                            <Flame className={cn("h-4 w-4", progress.streak > 0 ? "text-orange-500" : "text-muted-foreground")} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground leading-tight">Streak</span>
                            <span className="font-bold text-sm leading-tight">{progress.streak} {progress.streak === 1 ? "day" : "days"}</span>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    {/* XP */}
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/20">
                            <Zap className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground leading-tight">XP</span>
                            <span className="font-bold text-sm leading-tight">{progress.xp.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    {/* Weekly Goal */}
                    <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded-lg", weeklyGoalPercent >= 100 ? "bg-green-500/20" : "bg-orange-500/20")}>
                            {weeklyGoalPercent >= 100 ? <Trophy className="h-4 w-4 text-green-500" /> : <Target className="h-4 w-4 text-orange-600" />}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground leading-tight">Weekly</span>
                            <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-muted/50 rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full transition-all duration-500", weeklyGoalPercent >= 100 ? "bg-green-500" : "bg-primary")}
                                        style={{ width: `${weeklyGoalPercent}%` }}
                                    />
                                </div>
                                <span className="text-xs font-medium">{progress.weeklyProgress}/{progress.weeklyGoal}</span>
                            </div>
                        </div>
                    </div>
                    {/* Sessions */}
                    <div className="hidden sm:flex items-center gap-2 ml-2">
                        <div className="w-px h-8 bg-border" />
                        <div className="text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">{progress.sessionsCompleted}</span> sessions total
                        </div>
                    </div>
                </div>

                {/* ── Your Skills ──────────────────────────────────────────── */}
                <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-border/30">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            Your Skills
                        </h2>
                        <p className="text-sm text-muted-foreground">See how you&apos;re doing in different areas</p>
                    </div>
                    <div className="p-6 text-center py-12">
                        <p className="text-muted-foreground mb-4">Complete a few sessions to see how you&apos;re doing</p>
                        <button
                            onClick={() => pushWithTransition(router, "/demo")}
                            className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-medium hover:opacity-90 transition"
                        >
                            Start Practicing
                        </button>
                    </div>
                </div>

                {/* ── What We've Noticed ───────────────────────────────────── */}
                <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-border/30">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            What We&apos;ve Noticed
                        </h2>
                        <p className="text-sm text-muted-foreground">Personalized tips based on your practice sessions</p>
                    </div>
                    <div className="p-6 text-center py-12">
                        <Lightbulb className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-muted-foreground">Complete a few more sessions to get personalized tips</p>
                    </div>
                </div>

                {/* ── Your Growth ──────────────────────────────────────────── */}
                <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-border/30">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Your Growth
                        </h2>
                        <p className="text-sm text-muted-foreground">Watch how you&apos;re improving session by session</p>
                    </div>
                    <div className="p-6 text-center py-12">
                        <p className="text-muted-foreground">Complete more sessions to see your skill progression</p>
                    </div>
                </div>

                {/* ── This Week's Summary ──────────────────────────────────── */}
                <div className="bg-gradient-to-br from-primary/10 via-card to-orange-500/10 border border-primary/20 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-border/30">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            This Week&apos;s Summary
                        </h2>
                        <p className="text-sm text-muted-foreground">Your performance overview for the current week</p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 rounded-lg bg-background/50">
                                <p className="text-3xl font-bold text-primary">{weeklyStats.sessionsThisWeek}</p>
                                <p className="text-sm text-muted-foreground">Sessions</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-background/50">
                                <p className="text-3xl font-bold text-amber-500">
                                    {weeklyStats.avgScore > 0 ? `${weeklyStats.avgScore}%` : "—"}
                                </p>
                                <p className="text-sm text-muted-foreground">Avg Score</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-background/50">
                                <p className="text-3xl font-bold text-green-500">
                                    {weeklyStats.totalTime > 0 ? formatDuration(weeklyStats.totalTime) : "—"}
                                </p>
                                <p className="text-sm text-muted-foreground">Practice Time</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-background/50">
                                <p className="text-3xl font-bold text-orange-500">{weeklyStats.dayStreak}</p>
                                <p className="text-sm text-muted-foreground">Day Streak</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Weekly Goal ──────────────────────────────────────────── */}
                <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-border/30">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <Target className="h-5 w-5 text-green-500" />
                            Weekly Goal
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Complete {progress.weeklyGoal} sessions this week to stay on track
                        </p>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Progress</span>
                            <span className="text-sm font-medium">
                                {progress.weeklyProgress} / {progress.weeklyGoal} sessions
                            </span>
                        </div>
                        <div className="w-full h-3 bg-muted/50 rounded-full overflow-hidden">
                            <div
                                className={cn("h-full rounded-full transition-all duration-500", weeklyGoalPercent >= 100 ? "bg-green-500" : "bg-primary")}
                                style={{ width: `${weeklyGoalPercent}%` }}
                            />
                        </div>
                        {weeklyGoalPercent >= 100 ? (
                            <div className="flex items-center gap-2 text-green-500">
                                <Award className="h-5 w-5" />
                                <span className="font-medium">Goal achieved! Great work this week!</span>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {progress.weeklyGoal - progress.weeklyProgress} more session{progress.weeklyGoal - progress.weeklyProgress !== 1 ? "s" : ""} to reach your goal
                            </p>
                        )}
                    </div>
                </div>

                {/* ── Stats Grid ───────────────────────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-card border border-border/50 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <Trophy className="h-5 w-5 text-amber-500" />
                            <span className="text-sm font-medium">Total Sessions</span>
                        </div>
                        <p className="text-2xl font-bold">{progress.sessionsCompleted}</p>
                    </div>
                    <div className="bg-card border border-border/50 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <Zap className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium">Total XP</span>
                        </div>
                        <p className="text-2xl font-bold">{progress.xp.toLocaleString()}</p>
                    </div>
                    <div className="bg-card border border-border/50 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <Flame className="h-5 w-5 text-orange-500" />
                            <span className="text-sm font-medium">Current Streak</span>
                        </div>
                        <p className="text-2xl font-bold">{progress.streak} days</p>
                    </div>
                    <div className="bg-card border border-border/50 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <Clock className="h-5 w-5 text-blue-500" />
                            <span className="text-sm font-medium">Avg Duration</span>
                        </div>
                        <p className="text-2xl font-bold">—</p>
                    </div>
                </div>

                {/* ── Saved Sessions ───────────────────────────────────────── */}
                <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-border/30">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            Saved Sessions
                        </h2>
                        <p className="text-sm text-muted-foreground">Your practice conversation history</p>
                    </div>
                    <div className="p-6 text-center py-12">
                        <p className="text-muted-foreground mb-4">No sessions yet. Start practicing!</p>
                        <button
                            onClick={() => pushWithTransition(router, "/demo")}
                            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition"
                        >
                            Start a Session
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
