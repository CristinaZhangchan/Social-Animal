"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLiveAvatar, type SessionPhase } from "@/hooks/useLiveAvatar";
import { UserCameraFeed } from "@/components/UserCameraFeed";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";

// ── Phase display helpers ──────────────────────────────────────────────────

function phaseLabel(phase: SessionPhase): string {
  switch (phase) {
    case "idle":
      return "Ready";
    case "creating_token":
      return "Preparing...";
    case "starting":
      return "Starting avatar...";
    case "connecting":
      return "Connecting...";
    case "connected":
      return "Connected";
    case "disconnected":
      return "Session ended";
    case "error":
      return "Error";
  }
}

// ── Main component ─────────────────────────────────────────────────────────

function SessionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const customPrompt = searchParams.get("prompt") || "";
  const selectedLanguage = searchParams.get("lang") || "en";
  const { theme } = useTheme();

  const {
    phase,
    error,
    sessionId,
    isAvatarSpeaking,
    isUserSpeaking,
    transcript,
    speakEvents,
    avatarVideoTrack,
    audioContainerRef,
    isMicEnabled,
    startSession,
    stopSession,
    toggleMicrophone,
  } = useLiveAvatar();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Attach avatar video track using LiveKit's track.attach()
  useEffect(() => {
    const video = videoRef.current;
    if (video && avatarVideoTrack) {
      avatarVideoTrack.attach(video);
    }
    return () => {
      if (avatarVideoTrack) {
        avatarVideoTrack.detach(video!);
      }
    };
  }, [avatarVideoTrack]);

  // ── Polish prompt and start session ──────────────────────────────────────

  const handleStart = useCallback(async () => {
    if (!customPrompt.trim()) {
      router.push("/demo");
      return;
    }

    setHasStarted(true);

    try {
      // Step 1: Polish the user's prompt with selected language
      const polishRes = await fetch("/api/prompt-polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: customPrompt, language: selectedLanguage }),
      });

      let finalPrompt = customPrompt;
      if (polishRes.ok) {
        const polishData = await polishRes.json();
        finalPrompt = polishData.combinedPrompt || customPrompt;
      }

      // Step 2: Create context with polished prompt (opening_text is empty for silent start)
      const ctxRes = await fetch("/api/liveavatar/context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `custom-${Date.now()}`,
          prompt: finalPrompt,
          // opening_text is intentionally omitted to trigger silent start
        }),
      });

      let createdContextId: string | undefined;
      if (ctxRes.ok) {
        const ctxData = await ctxRes.json();
        createdContextId = ctxData.data?.id;
      }

      // Step 3: Start the LiveAvatar session
      await startSession({
        contextId: createdContextId,
      });
    } catch (err) {
      console.error("Failed to start:", err);
    }
  }, [customPrompt, selectedLanguage, startSession, router]);

  // ── End session and navigate to feedback ──────────────────────────────

  const handleEndSession = useCallback(async () => {
    // Save session data for feedback page BEFORE stopping (to capture sessionId)
    localStorage.setItem(
      "lastSession",
      JSON.stringify({
        scenario: customPrompt,
        sessionId: sessionId, // Save sessionId for API transcript fetch
        transcript: transcript.map((t) => ({
          speaker: t.speaker === "user" ? "You" : "AI",
          text: t.text,
        })),
        speakEvents: speakEvents,
        duration: Date.now(),
      })
    );
    await stopSession();
    router.push("/feedback");
  }, [stopSession, customPrompt, sessionId, transcript, speakEvents, router]);

  const isLoading =
    phase === "creating_token" ||
    phase === "starting" ||
    phase === "connecting";
  const isConnected = phase === "connected";

  // Truncate scenario display
  const scenarioDisplay =
    customPrompt.length > 50
      ? customPrompt.substring(0, 50) + "..."
      : customPrompt;

  return (
    <main
      className={`min-h-screen relative overflow-hidden ${
        theme === "dark" ? "bg-sa-bg-primary bg-grid" : ""
      }`}
    >
      {/* Ambient glow - only in dark mode */}
      {theme === "dark" && (
        <>
          <div className="absolute top-0 right-0 w-96 h-96 bg-sa-accent-purple/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-sa-accent-cyan/10 rounded-full blur-3xl" />
        </>
      )}

      <div className="container mx-auto px-4 py-6 h-screen flex flex-col relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-4 gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Link
              href="/demo"
              className={`flex-shrink-0 transition-colors ${
                theme === "dark"
                  ? "text-sa-text-secondary hover:text-white"
                  : "text-light-secondary hover:text-light-primary"
              }`}
            >
              &larr; Back
            </Link>
            <h2
              className={`text-lg font-semibold truncate min-w-0 ${
                theme === "dark" ? "text-white" : "text-light-primary"
              }`}
            >
              {scenarioDisplay || "Practice Session"}
            </h2>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <ThemeToggle />
            {/* Status badge */}
            <div
              className={`px-3 py-1 text-xs font-medium whitespace-nowrap ${
                theme === "dark" ? "clip-chamfer" : "rounded-lg"
              } ${
                isConnected
                  ? theme === "dark"
                    ? "bg-sa-accent-cyan/20 text-sa-accent-cyan border border-sa-accent-cyan/40"
                    : "bg-light-accent/20 text-light-accent border border-light-accent/40"
                  : phase === "error"
                  ? "bg-red-500/20 text-red-400 border border-red-500/40"
                  : theme === "dark"
                  ? "bg-sa-bg-secondary text-sa-text-muted border border-sa-text-muted/20"
                  : "bg-white/60 text-light-secondary border border-white/80"
              }`}
            >
              {phaseLabel(phase)}
            </div>
            {(isConnected || isLoading) && (
              <button
                onClick={handleEndSession}
                className={`px-4 py-2 font-semibold transition-colors text-sm whitespace-nowrap ${
                  theme === "dark"
                    ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 clip-chamfer"
                    : "bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/40 rounded-lg"
                }`}
              >
                End Session
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 h-full overflow-hidden">
          {/* ── Video Area ──────────────────────────────────────────── */}
          <div
            className={`h-[50vh] lg:h-auto lg:flex-1 flex-shrink-0 overflow-hidden relative shadow-2xl flex items-center justify-center ${
              theme === "dark"
                ? "bg-sa-bg-secondary border border-sa-accent-cyan/20 clip-chamfer-lg"
                : "glass-card"
            }`}
          >
            {/* HUD corner decorations - only in dark mode */}
            {theme === "dark" && (
              <>
                <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-sa-accent-cyan/50" />
                <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-sa-accent-cyan/50" />
                <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-sa-accent-cyan/50" />
                <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-sa-accent-cyan/50" />
              </>
            )}

            {/* Pre-start state */}
            {!hasStarted && (
              <div
                className={`absolute inset-0 flex items-center justify-center z-10 ${
                  theme === "dark" ? "bg-sa-bg-primary" : "bg-white/80 backdrop-blur-sm"
                }`}
              >
                <div className="text-center max-w-md px-8">
                  <div
                    className={`w-20 h-20 mx-auto mb-6 border-2 rounded-full flex items-center justify-center ${
                      theme === "dark"
                        ? "border-sa-accent-cyan/50"
                        : "border-light-accent/50"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 border-2 rounded-full flex items-center justify-center ${
                        theme === "dark"
                          ? "border-sa-accent-cyan"
                          : "border-light-accent"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full animate-pulse ${
                          theme === "dark" ? "bg-sa-accent-cyan" : "bg-light-accent"
                        }`}
                      />
                    </div>
                  </div>
                  <h3
                    className={`text-2xl font-bold mb-3 ${
                      theme === "dark" ? "text-white" : "text-light-primary"
                    }`}
                  >
                    Ready to Practice
                  </h3>
                  <p
                    className={`mb-6 text-sm ${
                      theme === "dark" ? "text-sa-text-secondary" : "text-light-secondary"
                    }`}
                  >
                    The avatar will appear and wait silently for you to start
                    the conversation. Take your time.
                  </p>
                  <button
                    onClick={handleStart}
                    className={`px-8 py-4 font-bold text-lg transition-all transform hover:scale-105 ${
                      theme === "dark"
                        ? "bg-sa-accent-cyan text-sa-bg-primary hover:shadow-neon-cyan-strong clip-chamfer"
                        : "btn-light-primary rounded-xl"
                    }`}
                  >
                    Start Session
                  </button>
                </div>
              </div>
            )}

            {/* Loading state */}
            {hasStarted && isLoading && (
              <div
                className={`absolute inset-0 flex items-center justify-center z-10 ${
                  theme === "dark" ? "bg-sa-bg-primary" : "bg-white/80 backdrop-blur-sm"
                }`}
              >
                <div className="text-center">
                  <div
                    className={`w-16 h-16 border-2 rounded-full animate-spin mx-auto mb-4 ${
                      theme === "dark"
                        ? "border-sa-accent-cyan/30 border-t-sa-accent-cyan"
                        : "border-light-accent/30 border-t-light-accent"
                    }`}
                  />
                  <p
                    className={`text-lg font-semibold ${
                      theme === "dark" ? "text-sa-accent-cyan" : "text-light-accent"
                    }`}
                  >
                    {phaseLabel(phase)}
                  </p>
                </div>
              </div>
            )}

            {/* Error state */}
            {phase === "error" && (
              <div
                className={`absolute inset-0 flex items-center justify-center z-10 ${
                  theme === "dark" ? "bg-sa-bg-primary" : "bg-white/80 backdrop-blur-sm"
                }`}
              >
                <div className="text-center max-w-md px-8">
                  <div className="w-16 h-16 mx-auto mb-4 border-2 border-red-500/50 rounded-full flex items-center justify-center">
                    <span className="text-3xl text-red-500">!</span>
                  </div>
                  <p
                    className={`text-xl font-semibold mb-2 ${
                      theme === "dark" ? "text-white" : "text-light-primary"
                    }`}
                  >
                    Connection Error
                  </p>
                  <p
                    className={`mb-6 text-sm ${
                      theme === "dark" ? "text-sa-text-secondary" : "text-light-secondary"
                    }`}
                  >
                    {error}
                  </p>
                  <button
                    onClick={() => setHasStarted(false)}
                    className={`px-6 py-3 font-semibold transition-all ${
                      theme === "dark"
                        ? "bg-sa-bg-tertiary border border-sa-text-muted/30 text-white hover:border-sa-text-muted/50 clip-chamfer"
                        : "bg-white border border-gray-300 text-light-primary hover:border-gray-400 rounded-lg"
                    }`}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Avatar video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Hidden container for auto-attached audio elements */}
            <div ref={audioContainerRef} style={{ display: "none" }} />

            {/* Overlays when connected */}
            {isConnected && (
              <>
                {/* Avatar speaking indicator */}
                {isAvatarSpeaking && (
                  <div
                    className={`absolute bottom-6 left-6 backdrop-blur-md px-4 py-2 flex items-center gap-2 ${
                      theme === "dark"
                        ? "bg-sa-accent-purple/80 clip-chamfer"
                        : "bg-purple-500/80 rounded-lg"
                    }`}
                  >
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-white text-sm font-medium">
                      Avatar speaking
                    </span>
                  </div>
                )}

                {/* User speaking indicator (on avatar side) */}
                {isUserSpeaking && !isAvatarSpeaking && (
                  <div
                    className={`absolute bottom-6 left-6 backdrop-blur-md px-4 py-2 flex items-center gap-2 ${
                      theme === "dark"
                        ? "bg-sa-accent-cyan/80 clip-chamfer"
                        : "bg-light-accent/80 rounded-lg"
                    }`}
                  >
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-white text-sm font-medium">
                      Listening...
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Sidebar: Transcript ──────────────────────────────────── */}
          <div className="flex-1 lg:flex-none lg:w-80 flex flex-col gap-4 min-h-0 max-h-[45vh] lg:max-h-none overflow-hidden">
            {/* Transcript */}
            <div
              className={`flex-1 p-4 overflow-hidden flex flex-col min-h-0 ${
                theme === "dark"
                  ? "bg-sa-bg-secondary border border-sa-accent-cyan/20 clip-chamfer-lg"
                  : "glass-card"
              }`}
            >
              <h3
                className={`text-sm font-bold mb-3 uppercase tracking-wider flex items-center gap-2 ${
                  theme === "dark" ? "text-sa-accent-cyan" : "text-light-accent"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    theme === "dark" ? "bg-sa-accent-cyan" : "bg-light-accent"
                  }`}
                />
                Live Transcript
              </h3>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 overscroll-contain">
                {transcript.length === 0 && (
                  <p
                    className={`text-sm italic ${
                      theme === "dark" ? "text-sa-text-muted" : "text-light-secondary"
                    }`}
                  >
                    {isConnected
                      ? "Start speaking to begin the conversation..."
                      : "Start the session to see live transcript"}
                  </p>
                )}
                {transcript.map((entry, i) => (
                  <div
                    key={i}
                    className={`text-sm ${
                      entry.speaker === "user"
                        ? theme === "dark"
                          ? "text-sa-accent-cyan"
                          : "text-light-accent"
                        : theme === "dark"
                        ? "text-sa-accent-purple"
                        : "text-purple-500"
                    }`}
                  >
                    <span className="font-semibold">
                      {entry.speaker === "user" ? "You" : "Avatar"}:
                    </span>{" "}
                    {entry.text}
                  </div>
                ))}
                <div ref={transcriptEndRef} />
              </div>
            </div>

            {/* Instructions - hidden on small mobile to save space */}
            <div
              className={`hidden sm:block p-4 flex-shrink-0 ${
                theme === "dark"
                  ? "bg-sa-bg-secondary border border-sa-accent-purple/20 clip-chamfer-lg"
                  : "glass-card"
              }`}
            >
              <h3
                className={`text-sm font-bold mb-2 uppercase tracking-wider ${
                  theme === "dark" ? "text-sa-accent-purple" : "text-purple-500"
                }`}
              >
                How it works
              </h3>
              <ul
                className={`text-xs space-y-1.5 ${
                  theme === "dark" ? "text-sa-text-muted" : "text-light-secondary"
                }`}
              >
                <li className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 ${
                      theme === "dark" ? "text-sa-accent-cyan" : "text-light-accent"
                    }`}
                  >
                    •
                  </span>
                  The avatar waits for you to speak first
                </li>
                <li className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 ${
                      theme === "dark" ? "text-sa-accent-cyan" : "text-light-accent"
                    }`}
                  >
                    •
                  </span>
                  Speak naturally — it will respond automatically
                </li>
                <li className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 ${
                      theme === "dark" ? "text-sa-accent-cyan" : "text-light-accent"
                    }`}
                  >
                    •
                  </span>
                  End the session to see your feedback
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* User Camera Feed - only show when connected */}
      {isConnected && (
        <UserCameraFeed
          isUserSpeaking={isUserSpeaking}
          isMicEnabled={isMicEnabled}
          onToggleMic={toggleMicrophone}
        />
      )}
    </main>
  );
}

// ── Page export with Suspense ──────────────────────────────────────────────

export default function SessionPage() {
  const { theme } = useTheme();

  return (
    <Suspense
      fallback={
        <div
          className={`min-h-screen flex items-center justify-center ${
            theme === "dark" ? "bg-sa-bg-primary" : ""
          }`}
        >
          <div
            className={`w-12 h-12 border-2 rounded-full animate-spin ${
              theme === "dark"
                ? "border-sa-accent-cyan/30 border-t-sa-accent-cyan"
                : "border-light-accent/30 border-t-light-accent"
            }`}
          />
        </div>
      }
    >
      <SessionContent />
    </Suspense>
  );
}
