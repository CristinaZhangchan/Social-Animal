"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { pushWithTransition } from "@/lib/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getUserSessions, getSessionMessages, type ChatSession, type ChatMessage } from "@/lib/supabase/chatHistory";
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
    ChevronDown,
    ChevronUp,
    User,
    Bot,
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
}

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ── Session Card ─────────────────────────────────────────────────────────────

function SessionCard({ session }: { session: ChatSession }) {
    const [expanded, setExpanded] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);

    const toggleExpand = async () => {
        if (!expanded && messages.length === 0) {
            setLoadingMessages(true);
            const { messages: msgs } = await getSessionMessages(session.id);
            setMessages(msgs);
            setLoadingMessages(false);
        }
        setExpanded(!expanded);
    };

    return (
        <div className="border border-border/50 rounded-xl overflow-hidden transition-all hover:border-primary/30">
            {/* Header */}
            <button
                onClick={toggleExpand}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition"
            >
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                        {session.scenario || "Untitled Session"}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(session.created_at)}
                        </span>
                        {session.duration_seconds > 0 && (
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDuration(session.duration_seconds)}
                            </span>
                        )}
                        {session.avatar_name && (
                            <span className="flex items-center gap-1">
                                <Bot className="h-3 w-3" />
                                {session.avatar_name}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3 ml-3">
                    {session.overall_score != null && (
                        <span className={cn(
                            "text-xs font-semibold px-2 py-1 rounded-full",
                            session.overall_score >= 80
                                ? "bg-green-500/20 text-green-600"
                                : session.overall_score >= 60
                                    ? "bg-amber-500/20 text-amber-600"
                                    : "bg-red-500/20 text-red-600"
                        )}>
                            {session.overall_score}%
                        </span>
                    )}
                    {expanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                </div>
            </button>

            {/* Transcript */}
            {expanded && (
                <div className="border-t border-border/30 bg-muted/10 p-4 max-h-80 overflow-y-auto">
                    {loadingMessages ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Loading transcript...
                        </p>
                    ) : messages.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No messages recorded for this session
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex gap-2",
                                        msg.speaker === "user" ? "justify-end" : "justify-start"
                                    )}
                                >
                                    {msg.speaker !== "user" && (
                                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Bot className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                    )}
                                    <div
                                        className={cn(
                                            "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                                            msg.speaker === "user"
                                                ? "bg-primary text-primary-foreground rounded-br-md"
                                                : "bg-card border border-border/50 rounded-bl-md"
                                        )}
                                    >
                                        {msg.content}
                                    </div>
                                    {msg.speaker === "user" && (
                                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TrackPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);

    // Compute stats from real data
    const totalSessions = sessions.length;
    const totalXP = totalSessions * 59; // Rough XP estimate
    const avgDuration = totalSessions > 0
        ? Math.round(sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / totalSessions)
        : 0;
    const avgScore = totalSessions > 0
        ? Math.round(sessions.filter(s => s.overall_score != null).reduce((sum, s) => sum + (s.overall_score || 0), 0) / Math.max(sessions.filter(s => s.overall_score != null).length, 1))
        : 0;

    // Compute streak (consecutive days with sessions)
    const streak = (() => {
        if (sessions.length === 0) return 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let count = 0;
        let checkDate = new Date(today);
        const sessionDates = new Set(
            sessions.map(s => {
                const d = new Date(s.created_at);
                d.setHours(0, 0, 0, 0);
                return d.getTime();
            })
        );
        while (sessionDates.has(checkDate.getTime())) {
            count++;
            checkDate.setDate(checkDate.getDate() - 1);
        }
        return count;
    })();

    // This week's sessions
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const sessionsThisWeek = sessions.filter(s => new Date(s.created_at) >= weekStart).length;
    const weeklyGoal = 5;
    const weeklyGoalPercent = Math.min((sessionsThisWeek / weeklyGoal) * 100, 100);

    useEffect(() => {
        async function fetchSessions() {
            if (!user?.id) {
                setLoading(false);
                return;
            }
            const { sessions: data } = await getUserSessions(user.id);
            setSessions(data);
            setLoading(false);
        }
        fetchSessions();
    }, [user?.id]);

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
                        <div className={cn("p-1.5 rounded-lg", streak > 0 ? "bg-orange-500/20" : "bg-muted/30")}>
                            <Flame className={cn("h-4 w-4", streak > 0 ? "text-orange-500" : "text-muted-foreground")} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground leading-tight">Streak</span>
                            <span className="font-bold text-sm leading-tight">{streak} {streak === 1 ? "day" : "days"}</span>
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
                            <span className="font-bold text-sm leading-tight">{totalXP.toLocaleString()}</span>
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
                                <span className="text-xs font-medium">{sessionsThisWeek}/{weeklyGoal}</span>
                            </div>
                        </div>
                    </div>
                    {/* Sessions */}
                    <div className="hidden sm:flex items-center gap-2 ml-2">
                        <div className="w-px h-8 bg-border" />
                        <div className="text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">{totalSessions}</span> sessions total
                        </div>
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
                                <p className="text-3xl font-bold text-primary">{sessionsThisWeek}</p>
                                <p className="text-sm text-muted-foreground">Sessions</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-background/50">
                                <p className="text-3xl font-bold text-amber-500">
                                    {avgScore > 0 ? `${avgScore}%` : "—"}
                                </p>
                                <p className="text-sm text-muted-foreground">Avg Score</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-background/50">
                                <p className="text-3xl font-bold text-green-500">
                                    {avgDuration > 0 ? formatDuration(avgDuration) : "—"}
                                </p>
                                <p className="text-sm text-muted-foreground">Avg Duration</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-background/50">
                                <p className="text-3xl font-bold text-orange-500">{streak}</p>
                                <p className="text-sm text-muted-foreground">Day Streak</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Stats Grid ───────────────────────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-card border border-border/50 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <Trophy className="h-5 w-5 text-amber-500" />
                            <span className="text-sm font-medium">Total Sessions</span>
                        </div>
                        <p className="text-2xl font-bold">{totalSessions}</p>
                    </div>
                    <div className="bg-card border border-border/50 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <Zap className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium">Total XP</span>
                        </div>
                        <p className="text-2xl font-bold">{totalXP.toLocaleString()}</p>
                    </div>
                    <div className="bg-card border border-border/50 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <Flame className="h-5 w-5 text-orange-500" />
                            <span className="text-sm font-medium">Current Streak</span>
                        </div>
                        <p className="text-2xl font-bold">{streak} days</p>
                    </div>
                    <div className="bg-card border border-border/50 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <Clock className="h-5 w-5 text-blue-500" />
                            <span className="text-sm font-medium">Avg Duration</span>
                        </div>
                        <p className="text-2xl font-bold">{avgDuration > 0 ? formatDuration(avgDuration) : "—"}</p>
                    </div>
                </div>

                {/* ── Saved Sessions ───────────────────────────────────────── */}
                <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-border/30">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            Saved Sessions
                        </h2>
                        <p className="text-sm text-muted-foreground">Your practice conversation history — click to view transcript</p>
                    </div>
                    <div className="p-4">
                        {loading ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">Loading sessions...</p>
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground mb-4">No sessions yet. Start practicing!</p>
                                <button
                                    onClick={() => pushWithTransition(router, "/demo")}
                                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition"
                                >
                                    Start a Session
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {sessions.map((session) => (
                                    <SessionCard key={session.id} session={session} />
                                ))}
                            </div>
                        )}
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
                            Complete {weeklyGoal} sessions this week to stay on track
                        </p>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Progress</span>
                            <span className="text-sm font-medium">
                                {sessionsThisWeek} / {weeklyGoal} sessions
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
                                {weeklyGoal - sessionsThisWeek} more session{weeklyGoal - sessionsThisWeek !== 1 ? "s" : ""} to reach your goal
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
