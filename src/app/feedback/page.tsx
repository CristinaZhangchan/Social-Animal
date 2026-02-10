"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";

interface SpeakEvent {
  type: "avatar" | "user";
  action: "start" | "end";
  timestamp: number;
}

interface SessionData {
  scenario: string;
  sessionId?: string; // LiveAvatar session ID for fetching transcript from API
  transcript: Array<{ speaker: string; text: string }>;
  speakEvents?: SpeakEvent[];
  duration: number;
}

interface RhythmMetrics {
  interruptionCount: number;
  avgResponseLatency: number;
}

interface PracticeExercise {
  title: string;
  description: string;
  duration: string;
  targetSkill: string;
  steps: string[];
}

interface FeedbackData {
  overallScore: number;
  emotionalIntelligence: number;
  clarity: number;
  pace: number;
  insights: Array<{
    icon: string;
    title: string;
    description: string;
    type: "positive" | "improvement";
  }>;
  rhythmMetrics?: RhythmMetrics;
  practiceExercises?: PracticeExercise[];
}

// Download icon component
function DownloadIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

export default function FeedbackPage() {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const { theme } = useTheme();

  // Fetch transcript from LiveAvatar API
  const fetchTranscriptFromAPI = async (sessionId: string): Promise<Array<{ speaker: string; text: string }>> => {
    try {
      const response = await fetch(`/api/liveavatar/transcript?session_id=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        // Transform API response to our format
        // API returns: { data: [{ role: "user"|"avatar", text: string, timestamp: number }] }
        if (data.data && Array.isArray(data.data)) {
          return data.data.map((entry: { role: string; text: string }) => ({
            speaker: entry.role === "user" ? "You" : "AI",
            text: entry.text,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching transcript from API:", error);
    }
    return [];
  };

  useEffect(() => {
    const loadSessionData = async () => {
      const data = localStorage.getItem("lastSession");
      if (data) {
        const parsed = JSON.parse(data) as SessionData;

        // If we have a sessionId but transcript is empty, fetch from API
        if (parsed.sessionId && (!parsed.transcript || parsed.transcript.length === 0)) {
          setIsLoadingTranscript(true);
          const apiTranscript = await fetchTranscriptFromAPI(parsed.sessionId);
          if (apiTranscript.length > 0) {
            parsed.transcript = apiTranscript;
            // Update localStorage with the fetched transcript
            localStorage.setItem("lastSession", JSON.stringify(parsed));
          }
          setIsLoadingTranscript(false);
        }

        setSessionData(parsed);
        // Fetch analysis from API
        fetchAnalysis(parsed);
      } else {
        setIsAnalyzing(false);
      }
    };

    loadSessionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAnalysis = async (data: SessionData) => {
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: data.transcript,
          scenario: data.scenario,
          speakEvents: data.speakEvents || [],
        }),
      });

      if (response.ok) {
        const analysisData = await response.json();
        setFeedback(analysisData);
      } else {
        // Fallback to mock data if API fails
        setFeedback(getMockFeedback());
      }
    } catch (error) {
      console.error("Error fetching analysis:", error);
      // Fallback to mock data
      setFeedback(getMockFeedback());
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMockFeedback = (): FeedbackData => ({
    overallScore: 7.5,
    emotionalIntelligence: 8.0,
    clarity: 7.0,
    pace: 7.5,
    insights: [
      {
        icon: "🎯",
        title: "Great Engagement",
        description:
          "You maintained strong engagement throughout the conversation.",
        type: "positive",
      },
      {
        icon: "⚡",
        title: "Speech Pace",
        description:
          "You spoke a bit fast at times. Try to slow down to sound more confident.",
        type: "improvement",
      },
      {
        icon: "💬",
        title: "Active Listening",
        description: "Good use of follow-up questions to show interest.",
        type: "positive",
      },
    ],
    rhythmMetrics: {
      interruptionCount: 0,
      avgResponseLatency: 1.5,
    },
    practiceExercises: [
      {
        title: "The STAR Method Practice",
        description:
          "Based on your responses, structuring your answers using the STAR method would make them more impactful.",
        duration: "15 minutes",
        targetSkill: "Structured responses",
        steps: [
          "Write down 3 challenging situations from your experience",
          "For each, document: Situation, Task, Action, Result",
          "Practice saying each story out loud in under 2 minutes",
        ],
      },
      {
        title: "Mirror Confidence Exercise",
        description:
          "Your pacing suggested some hesitation. This exercise builds confidence.",
        duration: "5 minutes daily",
        targetSkill: "Confident delivery",
        steps: [
          "Stand in front of a mirror",
          "Maintain eye contact with yourself while speaking",
          "Practice your introduction with a strong, steady voice",
        ],
      },
    ],
  });

  // Download transcript as TXT
  const downloadTranscript = () => {
    if (!sessionData) return;

    const header = `=== Conversation Transcript ===\n`;
    const scenario = `Scenario: ${sessionData.scenario}\n`;
    const date = `Date: ${new Date().toLocaleString()}\n`;
    const separator = `${"=".repeat(40)}\n\n`;

    const transcriptText = sessionData.transcript
      .map((entry) => `[${entry.speaker}]: ${entry.text}`)
      .join("\n\n");

    const fullContent = header + scenario + date + separator + transcriptText;

    const blob = new Blob([fullContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `conversation-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download as JSON
  const downloadAsJSON = () => {
    if (!sessionData) return;

    const exportData = {
      scenario: sessionData.scenario,
      transcript: sessionData.transcript,
      exportedAt: new Date().toISOString(),
      feedback: feedback,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `session-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!sessionData) {
    return (
      <main
        className={`min-h-screen flex items-center justify-center relative overflow-hidden ${
          theme === "dark" ? "bg-sa-bg-primary bg-grid" : ""
        }`}
      >
        {theme === "dark" && (
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-sa-accent-cyan/10 rounded-full blur-3xl" />
        )}
        <div
          className={`text-center relative z-10 ${
            theme === "dark" ? "text-white" : "text-light-primary"
          }`}
        >
          <div
            className={`w-16 h-16 mx-auto mb-6 border-2 rounded-full flex items-center justify-center ${
              theme === "dark"
                ? "border-sa-accent-cyan/50"
                : "border-light-accent/50"
            }`}
          >
            <span className="text-2xl">?</span>
          </div>
          <p className="text-2xl mb-4">No session data found</p>
          <Link
            href="/demo"
            className={`transition-colors underline ${
              theme === "dark"
                ? "text-sa-accent-cyan hover:text-white"
                : "text-light-accent hover:text-light-primary"
            }`}
          >
            Start a new practice session
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen relative overflow-hidden ${
        theme === "dark" ? "bg-sa-bg-primary bg-grid" : ""
      }`}
    >
      {/* Ambient glow - only in dark mode */}
      {theme === "dark" && (
        <>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-sa-accent-cyan/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sa-accent-purple/10 rounded-full blur-3xl" />
        </>
      )}

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <Link
            href="/"
            className={`text-2xl font-bold ${
              theme === "dark"
                ? "text-white text-glow-cyan"
                : "text-light-primary text-glow-violet"
            }`}
          >
            SocialAnimal
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div
              className={`flex items-center gap-2 px-4 py-2 ${
                theme === "dark"
                  ? "bg-sa-bg-secondary border border-sa-accent-cyan/30 clip-chamfer"
                  : "glass-card-sm"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  theme === "dark" ? "bg-sa-accent-cyan" : "bg-light-accent"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-sa-accent-cyan" : "text-light-accent"
                }`}
              >
                ANALYSIS COMPLETE
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div
              className={`inline-block mb-4 px-4 py-1 text-sm font-medium ${
                theme === "dark"
                  ? "bg-sa-accent-purple/20 border border-sa-accent-purple/40 text-sa-accent-purple clip-chamfer"
                  : "glass-card-sm text-purple-500"
              }`}
            >
              PERFORMANCE REPORT
            </div>
            <h1
              className={`text-4xl md:text-5xl font-bold mb-4 ${
                theme === "dark" ? "text-white" : "text-light-primary"
              }`}
            >
              Communication Scorecard
            </h1>
            <p
              className={`text-lg ${
                theme === "dark" ? "text-sa-text-secondary" : "text-light-secondary"
              }`}
            >
              Here&apos;s how you did in your practice session
            </p>
          </div>

          {isAnalyzing ? (
            <div className="text-center py-20">
              <div
                className={`w-16 h-16 border-2 rounded-full animate-spin mx-auto mb-4 ${
                  theme === "dark"
                    ? "border-sa-accent-cyan/30 border-t-sa-accent-cyan"
                    : "border-light-accent/30 border-t-light-accent"
                }`}
              />
              <p
                className={`text-xl ${
                  theme === "dark" ? "text-sa-accent-cyan" : "text-light-accent"
                }`}
              >
                Analyzing your conversation...
              </p>
            </div>
          ) : feedback ? (
            <>
              {/* Overall Score */}
              <div
                className={`p-8 mb-8 text-center relative ${
                  theme === "dark"
                    ? "bg-sa-bg-secondary border border-sa-accent-cyan/30 clip-chamfer-lg"
                    : "glass-card"
                }`}
              >
                {/* Corner decorations - dark mode only */}
                {theme === "dark" && (
                  <>
                    <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-sa-accent-cyan/50" />
                    <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-sa-accent-cyan/50" />
                    <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-sa-accent-cyan/50" />
                    <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-sa-accent-cyan/50" />
                  </>
                )}

                <div
                  className={`text-7xl font-bold mb-2 ${
                    theme === "dark" ? "text-white" : "text-light-primary"
                  }`}
                >
                  <span
                    className={
                      theme === "dark" ? "text-glow-cyan" : "text-glow-violet"
                    }
                  >
                    {feedback.overallScore}
                  </span>
                  <span
                    className={`text-4xl ${
                      theme === "dark" ? "text-sa-text-muted" : "text-light-secondary"
                    }`}
                  >
                    /10
                  </span>
                </div>
                <p
                  className={`text-lg ${
                    theme === "dark" ? "text-sa-text-secondary" : "text-light-secondary"
                  }`}
                >
                  Overall Performance
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div
                  className={`p-6 text-center ${
                    theme === "dark"
                      ? "bg-sa-bg-secondary border border-sa-accent-purple/20 clip-chamfer-lg"
                      : "glass-card"
                  }`}
                >
                  <div
                    className={`text-3xl font-bold mb-1 ${
                      theme === "dark" ? "text-sa-accent-purple" : "text-purple-500"
                    }`}
                  >
                    {feedback.emotionalIntelligence}
                  </div>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-sa-text-secondary" : "text-light-secondary"
                    }`}
                  >
                    Emotional Intelligence
                  </p>
                </div>
                <div
                  className={`p-6 text-center ${
                    theme === "dark"
                      ? "bg-sa-bg-secondary border border-sa-accent-cyan/20 clip-chamfer-lg"
                      : "glass-card"
                  }`}
                >
                  <div
                    className={`text-3xl font-bold mb-1 ${
                      theme === "dark" ? "text-sa-accent-cyan" : "text-light-accent"
                    }`}
                  >
                    {feedback.clarity}
                  </div>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-sa-text-secondary" : "text-light-secondary"
                    }`}
                  >
                    Clarity
                  </p>
                </div>
                <div
                  className={`p-6 text-center ${
                    theme === "dark"
                      ? "bg-sa-bg-secondary border border-sa-accent-purple/20 clip-chamfer-lg"
                      : "glass-card"
                  }`}
                >
                  <div
                    className={`text-3xl font-bold mb-1 ${
                      theme === "dark" ? "text-sa-accent-purple" : "text-purple-500"
                    }`}
                  >
                    {feedback.pace}
                  </div>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-sa-text-secondary" : "text-light-secondary"
                    }`}
                  >
                    Speech Pace
                  </p>
                </div>
              </div>

              {/* Rhythm Metrics */}
              {feedback.rhythmMetrics && (
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <div
                    className={`p-6 ${
                      theme === "dark"
                        ? "bg-sa-bg-secondary border border-sa-accent-cyan/20 clip-chamfer-lg"
                        : "glass-card"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-xs uppercase tracking-wider mb-1 ${
                            theme === "dark" ? "text-sa-text-muted" : "text-light-secondary"
                          }`}
                        >
                          Interruptions
                        </p>
                        <div
                          className={`text-2xl font-bold ${
                            theme === "dark" ? "text-white" : "text-light-primary"
                          }`}
                        >
                          {feedback.rhythmMetrics.interruptionCount}
                          <span
                            className={`text-sm ml-1 ${
                              theme === "dark" ? "text-sa-text-muted" : "text-light-secondary"
                            }`}
                          >
                            times
                          </span>
                        </div>
                      </div>
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          feedback.rhythmMetrics.interruptionCount > 3
                            ? "bg-red-500/20 text-red-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {feedback.rhythmMetrics.interruptionCount > 3
                          ? "!"
                          : "✓"}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`p-6 ${
                      theme === "dark"
                        ? "bg-sa-bg-secondary border border-sa-accent-purple/20 clip-chamfer-lg"
                        : "glass-card"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-xs uppercase tracking-wider mb-1 ${
                            theme === "dark" ? "text-sa-text-muted" : "text-light-secondary"
                          }`}
                        >
                          Avg Response Time
                        </p>
                        <div
                          className={`text-2xl font-bold ${
                            theme === "dark" ? "text-white" : "text-light-primary"
                          }`}
                        >
                          {feedback.rhythmMetrics.avgResponseLatency.toFixed(1)}
                          <span
                            className={`text-sm ml-1 ${
                              theme === "dark" ? "text-sa-text-muted" : "text-light-secondary"
                            }`}
                          >
                            sec
                          </span>
                        </div>
                      </div>
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          feedback.rhythmMetrics.avgResponseLatency < 0.5
                            ? "bg-yellow-500/20 text-yellow-400"
                            : feedback.rhythmMetrics.avgResponseLatency > 4
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {feedback.rhythmMetrics.avgResponseLatency < 0.5 ||
                        feedback.rhythmMetrics.avgResponseLatency > 4
                          ? "!"
                          : "✓"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actionable Insights */}
              <div className="mb-8">
                <h2
                  className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                    theme === "dark" ? "text-white" : "text-light-primary"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      theme === "dark" ? "bg-sa-accent-cyan" : "bg-light-accent"
                    }`}
                  />
                  Key Insights
                </h2>
                <div className="space-y-4">
                  {feedback.insights.map((insight, index) => (
                    <div
                      key={index}
                      className={`p-6 border ${
                        theme === "dark"
                          ? `bg-sa-bg-secondary clip-chamfer-lg ${
                              insight.type === "positive"
                                ? "border-green-500/30"
                                : "border-yellow-500/30"
                            }`
                          : `glass-card ${
                              insight.type === "positive"
                                ? "border-green-500/30"
                                : "border-yellow-500/30"
                            }`
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{insight.icon}</div>
                        <div className="flex-1">
                          <h3
                            className={`text-lg font-bold mb-1 ${
                              theme === "dark" ? "text-white" : "text-light-primary"
                            }`}
                          >
                            {insight.title}
                          </h3>
                          <p
                            className={`text-sm ${
                              theme === "dark"
                                ? "text-sa-text-secondary"
                                : "text-light-secondary"
                            }`}
                          >
                            {insight.description}
                          </p>
                        </div>
                        <div
                          className={`px-2 py-1 text-xs font-medium ${
                            theme === "dark" ? "clip-chamfer" : "rounded-lg"
                          } ${
                            insight.type === "positive"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {insight.type === "positive" ? "Strength" : "Improve"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Practice Exercises Section */}
              {feedback.practiceExercises && feedback.practiceExercises.length > 0 && (
                <div className="mb-8">
                  <h2
                    className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                      theme === "dark" ? "text-white" : "text-light-primary"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        theme === "dark" ? "bg-sa-accent-purple" : "bg-purple-500"
                      }`}
                    />
                    Personalized Practice Exercises
                  </h2>
                  <div className="space-y-4">
                    {feedback.practiceExercises.map((exercise, index) => (
                      <div
                        key={index}
                        className={`p-6 ${
                          theme === "dark"
                            ? "bg-sa-bg-secondary border border-sa-accent-cyan/20 clip-chamfer-lg"
                            : "glass-card"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3
                              className={`text-lg font-bold mb-1 ${
                                theme === "dark" ? "text-white" : "text-light-primary"
                              }`}
                            >
                              {exercise.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm">
                              <span
                                className={`flex items-center gap-1 ${
                                  theme === "dark"
                                    ? "text-sa-accent-cyan"
                                    : "text-light-accent"
                                }`}
                              >
                                <span>⏱️</span> {exercise.duration}
                              </span>
                              <span
                                className={`flex items-center gap-1 ${
                                  theme === "dark"
                                    ? "text-sa-accent-purple"
                                    : "text-purple-500"
                                }`}
                              >
                                <span>🎯</span> {exercise.targetSkill}
                              </span>
                            </div>
                          </div>
                          <div
                            className={`px-3 py-1 text-xs font-medium ${
                              theme === "dark"
                                ? "bg-sa-accent-purple/20 text-sa-accent-purple clip-chamfer"
                                : "bg-purple-100 text-purple-500 rounded-lg"
                            }`}
                          >
                            Exercise {index + 1}
                          </div>
                        </div>

                        <p
                          className={`text-sm mb-4 ${
                            theme === "dark"
                              ? "text-sa-text-secondary"
                              : "text-light-secondary"
                          }`}
                        >
                          {exercise.description}
                        </p>

                        <div
                          className={`p-4 ${
                            theme === "dark"
                              ? "bg-sa-bg-tertiary clip-chamfer"
                              : "bg-white/50 rounded-lg"
                          }`}
                        >
                          <p
                            className={`text-xs uppercase tracking-wider mb-2 ${
                              theme === "dark"
                                ? "text-sa-text-muted"
                                : "text-light-secondary"
                            }`}
                          >
                            Steps to Practice
                          </p>
                          <ol className="space-y-2">
                            {exercise.steps.map((step, stepIndex) => (
                              <li
                                key={stepIndex}
                                className={`flex items-start gap-3 text-sm ${
                                  theme === "dark"
                                    ? "text-sa-text-secondary"
                                    : "text-light-secondary"
                                }`}
                              >
                                <span
                                  className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                    theme === "dark"
                                      ? "bg-sa-accent-cyan/20 text-sa-accent-cyan"
                                      : "bg-light-accent/20 text-light-accent"
                                  }`}
                                >
                                  {stepIndex + 1}
                                </span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conversation Transcript Section */}
              {sessionData && (
                <div className="mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <h2
                      className={`text-xl font-bold flex items-center gap-2 ${
                        theme === "dark" ? "text-white" : "text-light-primary"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          theme === "dark" ? "bg-sa-accent-cyan" : "bg-light-accent"
                        }`}
                      />
                      Conversation Transcript
                    </h2>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setShowTranscript(!showTranscript)}
                        className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                          theme === "dark"
                            ? "bg-sa-bg-tertiary border border-sa-accent-cyan/30 text-sa-accent-cyan hover:border-sa-accent-cyan/50 clip-chamfer"
                            : "bg-white border border-light-accent/30 text-light-accent hover:border-light-accent/50 rounded-lg"
                        }`}
                      >
                        {showTranscript ? "Hide" : "Show"} Transcript
                      </button>
                      <button
                        onClick={downloadTranscript}
                        className={`px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1 ${
                          theme === "dark"
                            ? "bg-sa-bg-tertiary border border-sa-accent-purple/30 text-sa-accent-purple hover:border-sa-accent-purple/50 clip-chamfer"
                            : "bg-white border border-purple-300 text-purple-500 hover:border-purple-400 rounded-lg"
                        }`}
                      >
                        <DownloadIcon className="w-4 h-4" />
                        TXT
                      </button>
                      <button
                        onClick={downloadAsJSON}
                        className={`px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1 ${
                          theme === "dark"
                            ? "bg-sa-bg-tertiary border border-sa-text-muted/30 text-sa-text-secondary hover:border-sa-text-muted/50 clip-chamfer"
                            : "bg-white border border-gray-300 text-gray-500 hover:border-gray-400 rounded-lg"
                        }`}
                      >
                        <DownloadIcon className="w-4 h-4" />
                        JSON
                      </button>
                    </div>
                  </div>

                  {showTranscript && (
                    <div
                      className={`p-6 max-h-96 overflow-y-auto ${
                        theme === "dark"
                          ? "bg-sa-bg-secondary border border-sa-accent-cyan/20 clip-chamfer-lg"
                          : "glass-card"
                      }`}
                    >
                      {isLoadingTranscript ? (
                        <div className="flex items-center justify-center py-8">
                          <div
                            className={`w-8 h-8 border-2 rounded-full animate-spin ${
                              theme === "dark"
                                ? "border-sa-accent-cyan/30 border-t-sa-accent-cyan"
                                : "border-light-accent/30 border-t-light-accent"
                            }`}
                          />
                          <span
                            className={`ml-3 ${
                              theme === "dark" ? "text-sa-text-secondary" : "text-light-secondary"
                            }`}
                          >
                            Loading transcript...
                          </span>
                        </div>
                      ) : sessionData.transcript.length === 0 ? (
                        <div className="text-center py-8">
                          <p
                            className={`mb-4 ${
                              theme === "dark" ? "text-sa-text-muted" : "text-light-secondary"
                            }`}
                          >
                            No transcript available
                          </p>
                          {sessionData.sessionId && (
                            <button
                              onClick={async () => {
                                setIsLoadingTranscript(true);
                                const apiTranscript = await fetchTranscriptFromAPI(sessionData.sessionId!);
                                if (apiTranscript.length > 0) {
                                  const updatedData = { ...sessionData, transcript: apiTranscript };
                                  setSessionData(updatedData);
                                  localStorage.setItem("lastSession", JSON.stringify(updatedData));
                                }
                                setIsLoadingTranscript(false);
                              }}
                              className={`px-4 py-2 text-sm font-medium transition-colors ${
                                theme === "dark"
                                  ? "bg-sa-accent-cyan/20 text-sa-accent-cyan hover:bg-sa-accent-cyan/30 clip-chamfer"
                                  : "bg-light-accent/20 text-light-accent hover:bg-light-accent/30 rounded-lg"
                              }`}
                            >
                              Retry Loading Transcript
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {sessionData.transcript.map((entry, index) => (
                            <div
                              key={index}
                              className={`flex gap-3 ${
                                entry.speaker === "You" ? "flex-row-reverse" : ""
                              }`}
                            >
                              <div
                                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                  entry.speaker === "You"
                                    ? theme === "dark"
                                      ? "bg-sa-accent-cyan/20 text-sa-accent-cyan"
                                      : "bg-light-accent/20 text-light-accent"
                                    : theme === "dark"
                                    ? "bg-sa-accent-purple/20 text-sa-accent-purple"
                                    : "bg-purple-100 text-purple-500"
                                }`}
                              >
                                {entry.speaker === "You" ? "Y" : "A"}
                              </div>
                              <div
                                className={`flex-1 p-3 rounded-lg ${
                                  entry.speaker === "You"
                                    ? theme === "dark"
                                      ? "bg-sa-accent-cyan/10 text-sa-text-secondary"
                                      : "bg-light-accent/10 text-light-secondary"
                                    : theme === "dark"
                                    ? "bg-sa-bg-tertiary text-sa-text-secondary"
                                    : "bg-white/70 text-light-secondary"
                                }`}
                              >
                                <p className="text-sm">{entry.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/demo"
                  className={`px-8 py-4 font-bold transition-all text-center ${
                    theme === "dark"
                      ? "bg-sa-accent-cyan text-sa-bg-primary hover:shadow-neon-cyan-strong clip-chamfer"
                      : "btn-light-primary rounded-xl"
                  }`}
                >
                  Try Again
                </Link>
                <Link
                  href="/"
                  className={`px-8 py-4 font-semibold transition-all text-center ${
                    theme === "dark"
                      ? "bg-sa-bg-secondary border border-sa-text-muted/30 text-white hover:border-sa-text-muted/50 clip-chamfer"
                      : "bg-white border border-gray-300 text-light-primary hover:border-gray-400 rounded-xl"
                  }`}
                >
                  Back to Home
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p
                className={`text-xl ${
                  theme === "dark" ? "text-sa-text-secondary" : "text-light-secondary"
                }`}
              >
                Failed to analyze conversation
              </p>
              <Link
                href="/demo"
                className={`inline-block mt-4 transition-colors ${
                  theme === "dark"
                    ? "text-sa-accent-cyan hover:text-white"
                    : "text-light-accent hover:text-light-primary"
                }`}
              >
                Try again
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
