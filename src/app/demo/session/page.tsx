"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLiveAvatar, type SessionPhase } from "@/hooks/useLiveAvatar";
import { useHeyGenAvatar } from "@/hooks/useHeyGenAvatar";
import { useHeyGenTalkingPhoto, type TalkingPhotoPhase } from "@/hooks/useHeyGenTalkingPhoto";
import { UserCameraFeed } from "@/components/UserCameraFeed";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "next-themes";

// ── Phase display helpers ──────────────────────────────────────────────────

function phaseLabel(phase: SessionPhase | 'idle' | 'connecting' | 'connected' | 'error' | 'disconnected'): string {
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
    default:
      return phase;
  }
}

// ── Shared UI Components ───────────────────────────────────────────────────

function SessionHeader({
  theme,
  scenarioDisplay,
  phase,
  isConnected,
  error,
  onEndSession,
  isLoading
}: any) {
  return (
    <header className="flex justify-between items-center mb-4 gap-4">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <Link
          href="/demo"
          className={`flex-shrink-0 transition-colors ${theme === "dark"
            ? "text-sa-text-secondary hover:text-white"
            : "text-light-secondary hover:text-light-primary"
            }`}
        >
          &larr; Back
        </Link>
        <h2
          className={`text-lg font-semibold truncate min-w-0 ${theme === "dark" ? "text-white" : "text-light-primary"
            }`}
        >
          {scenarioDisplay || "Practice Session"}
        </h2>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <ThemeToggle />
        {/* Status badge */}
        <div
          className={`px-3 py-1 text-xs font-medium whitespace-nowrap ${theme === "dark" ? "clip-chamfer" : "rounded-lg"
            } ${isConnected
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
            onClick={onEndSession}
            className={`px-4 py-2 font-semibold transition-colors text-sm whitespace-nowrap ${theme === "dark"
              ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 clip-chamfer"
              : "bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/40 rounded-lg"
              }`}
          >
            End Session
          </button>
        )}
      </div>
    </header>
  );
}

// ── LiveAvatar Session (Original) ──────────────────────────────────────────

function LiveAvatarSession({ customPrompt, selectedLanguage, avatarIdParam, avatarUrlParam, onBack }: any) {
  const router = useRouter();
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

  // Attach avatar video track
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      if (avatarVideoTrack) {
        avatarVideoTrack.attach(video);
      } else if (avatarUrlParam) {
        video.poster = avatarUrlParam;
      }
    }
    return () => {
      if (avatarVideoTrack && video) {
        avatarVideoTrack.detach(video);
      }
    };
  }, [avatarVideoTrack, avatarUrlParam]);

  const handleStart = useCallback(async () => {
    if (!customPrompt.trim()) {
      onBack();
      return;
    }
    setHasStarted(true);
    // ... (Existing start logic with polish/context creation)
    try {
      let finalPrompt = customPrompt;
      // Polish step omitted for brevity in this refactor, assuming direct start for now or keeping it if needed
      // Ideally we keep the polish logic, but for structure clarity I'm focusing on the session start
      // Re-implementing basic polish call:
      try {
        const polishRes = await fetch("/api/prompt-polish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userInput: customPrompt, language: selectedLanguage }),
        });
        if (polishRes.ok) {
          const polishData = await polishRes.json();
          finalPrompt = polishData.combinedPrompt || customPrompt;
        }
      } catch (e) {
        console.warn("Prompt polish error", e);
      }

      const ctxRes = await fetch("/api/liveavatar/context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `custom-${Date.now()}`,
          prompt: finalPrompt,
        }),
      });
      let createdContextId;
      if (ctxRes.ok) {
        const ctxData = await ctxRes.json();
        createdContextId = ctxData.data?.id;
      }

      await startSession({
        contextId: createdContextId,
        avatarId: avatarIdParam || undefined,
      });
    } catch (err) {
      console.error("Failed to start", err);
    }
  }, [customPrompt, selectedLanguage, startSession, avatarIdParam, onBack]);

  const handleEndSession = useCallback(async () => {
    localStorage.setItem("lastSession", JSON.stringify({
      scenario: customPrompt,
      sessionId,
      transcript: transcript.map(t => ({ speaker: t.speaker === "user" ? "You" : "AI", text: t.text })),
      speakEvents,
      duration: Date.now()
    }));
    await stopSession();
    router.push("/feedback");
  }, [stopSession, customPrompt, sessionId, transcript, speakEvents, router]);

  const isLoading = phase === "creating_token" || phase === "starting" || phase === "connecting";
  const isConnected = phase === "connected";
  const scenarioDisplay = customPrompt.length > 50 ? customPrompt.substring(0, 50) + "..." : customPrompt;

  return (
    <>
      <SessionHeader
        theme={theme}
        scenarioDisplay={scenarioDisplay}
        phase={phase}
        isConnected={isConnected}
        error={error}
        onEndSession={handleEndSession}
        isLoading={isLoading}
      />
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 h-full overflow-hidden">
        {/* Video Area */}
        <div className={`h-[50vh] lg:h-auto lg:flex-1 flex-shrink-0 overflow-hidden relative shadow-2xl flex items-center justify-center ${theme === "dark" ? "bg-sa-bg-secondary border border-sa-accent-cyan/20 clip-chamfer-lg" : "glass-card"}`}>
          {/* HUD Decorations (Dark Mode) */}
          {theme === "dark" && (
            <>
              <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-sa-accent-cyan/50" />
              <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-sa-accent-cyan/50" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-sa-accent-cyan/50" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-sa-accent-cyan/50" />
            </>
          )}

          {!hasStarted && (
            <div className={`absolute inset-0 flex items-center justify-center z-10 ${theme === "dark" ? "bg-sa-bg-primary" : "bg-white/80 backdrop-blur-sm"}`}>
              <div className="text-center max-w-md px-8">
                {/* ... Ready UI ... */}
                <h3 className="text-2xl font-bold mb-3">Ready to Practice</h3>
                <button onClick={handleStart} className="px-8 py-4 font-bold text-lg bg-sa-accent-cyan text-sa-bg-primary rounded-xl">Start Session</button>
              </div>
            </div>
          )}

          {hasStarted && isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50 backdrop-blur-sm">
              <div className="text-center text-white">Connecting...</div>
            </div>
          )}

          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div ref={audioContainerRef} style={{ display: "none" }} />
        </div>

        {/* Transcript Area */}
        <div className="flex-1 lg:flex-none lg:w-80 flex flex-col gap-4 min-h-0 max-h-[45vh] lg:max-h-none overflow-hidden">
          <div className={`flex-1 p-4 overflow-hidden flex flex-col min-h-0 ${theme === "dark" ? "bg-sa-bg-secondary" : "glass-card"}`}>
            <h3 className="text-sm font-bold mb-3">Live Transcript</h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {transcript.map((entry, i) => (
                <div key={i} className="text-sm">
                  <span className="font-semibold">{entry.speaker === "user" ? "You" : "Avatar"}:</span> {entry.text}
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        </div>
      </div>
      {isConnected && <UserCameraFeed isUserSpeaking={isUserSpeaking} isMicEnabled={isMicEnabled} onToggleMic={toggleMicrophone} />}
    </>
  );
}

// ── HeyGen Session (Streaming — requires Enterprise) ──────────────────────

function HeyGenSession({ customPrompt, selectedLanguage, avatarIdParam, avatarUrlParam, onBack, onFallback, onTalkingPhoto }: any) {
  const router = useRouter();
  const { theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const {
    stream,
    phase,
    error,
    debug,
    startSession,
    endSession,
    isAvatarSpeaking,
  } = useHeyGenAvatar({ language: selectedLanguage });

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play();
      };
    }
  }, [stream]);

  const handleStart = () => {
    setHasStarted(true);
    startSession(avatarIdParam || "", avatarUrlParam || undefined);
  };

  const handleEndSession = async () => {
    await endSession();
    router.push("/feedback");
  };

  // Check if error is quota-related
  const isQuotaError = error?.includes('quota') || error?.includes('10008');

  const isLoading = phase === 'connecting';
  const isConnected = phase === 'connected';

  return (
    <>
      <SessionHeader
        theme={theme}
        scenarioDisplay={customPrompt}
        phase={phase}
        isConnected={isConnected}
        error={error}
        onEndSession={handleEndSession}
        isLoading={isLoading}
      />
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 h-full overflow-hidden">
        {/* Video Area */}
        <div className={`h-[50vh] lg:h-auto lg:flex-1 flex-shrink-0 overflow-hidden relative shadow-2xl flex items-center justify-center ${theme === "dark" ? "bg-sa-bg-secondary border border-sa-accent-cyan/20 clip-chamfer-lg" : "glass-card"}`}>
          {!hasStarted ? (
            <div className={`absolute inset-0 flex items-center justify-center z-10 ${theme === "dark" ? "bg-sa-bg-primary" : "bg-white/80 backdrop-blur-sm"}`}>
              <div className="text-center max-w-md px-8">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-sa-accent-cyan">
                  {avatarUrlParam ? <img src={avatarUrlParam} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-500" />}
                </div>
                <h3 className="text-2xl font-bold mb-3">Ready to Chat</h3>
                <button onClick={handleStart} className="px-8 py-4 font-bold text-lg bg-sa-accent-cyan text-sa-bg-primary rounded-xl">Start Session</button>
              </div>
            </div>
          ) : isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50 backdrop-blur-sm text-white">
              <div className="text-center">
                <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin mx-auto mb-2" />
                {debug}
              </div>
            </div>
          )}

          {phase === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/80 text-white">
              <div className="text-center px-8 max-w-lg">
                <p className="text-red-400 font-bold text-xl mb-2">Connection Failed</p>
                <p className="text-sm text-gray-300 mb-6">
                  {isQuotaError
                    ? 'HeyGen streaming quota exhausted. Choose an alternative mode:'
                    : error}
                </p>
                <div className="flex flex-col gap-3">
                  {/* Fallback: LiveAvatar (real-time) */}
                  <button
                    onClick={onFallback}
                    className="w-full px-6 py-3 bg-sa-accent-cyan text-sa-bg-primary font-bold rounded-xl hover:opacity-90 transition"
                  >
                    🎙️ Switch to LiveAvatar (Real-time)
                  </button>
                  {/* Fallback: Talking Photo (turn-based) */}
                  <button
                    onClick={onTalkingPhoto}
                    className="w-full px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition"
                  >
                    🎬 Use Talking Photo (Turn-based)
                  </button>
                  {/* Retry */}
                  <button
                    onClick={() => setHasStarted(false)}
                    className="w-full px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition"
                  >
                    🔄 Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />

          {isAvatarSpeaking && (
            <div className="absolute bottom-6 left-6 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-white text-xs flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Speaking...
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex-1 lg:flex-none lg:w-80 flex flex-col gap-4">
          <div className={`flex-1 p-4 ${theme === "dark" ? "bg-sa-bg-secondary" : "glass-card"}`}>
            <h3 className="text-sm font-bold mb-3">Transcript</h3>
            <p className="text-xs text-muted-foreground">Transcript not available in HeyGen streaming mode.</p>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Talking Photo Session (Turn-based — no Enterprise needed) ──────────────

function TalkingPhotoSession({ customPrompt, selectedLanguage, avatarIdParam, avatarUrlParam, onBack }: any) {
  const router = useRouter();
  const { theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [userInput, setUserInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const {
    phase,
    error,
    messages,
    currentVideoUrl,
    sendMessage,
    reset,
  } = useHeyGenTalkingPhoto({
    avatarId: avatarIdParam || '',
    avatarUrl: avatarUrlParam || undefined,
    language: selectedLanguage,
  });

  // Auto-play video when a new one arrives
  useEffect(() => {
    if (currentVideoUrl && videoRef.current) {
      videoRef.current.src = currentVideoUrl;
      videoRef.current.play().catch(() => { });
    }
  }, [currentVideoUrl]);

  const handleSend = async () => {
    if (!userInput.trim() || phase === 'generating' || phase === 'polling') return;

    const text = userInput.trim();
    setUserInput('');
    setIsThinking(true);

    try {
      // Get AI response via non-streaming endpoint
      const aiRes = await fetch('/api/chat-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: customPrompt || 'You are a helpful conversation partner. Keep responses under 2 sentences.',
          messages: [
            ...messages.map(m => ({ role: m.role === 'avatar' ? 'assistant' : 'user', content: m.text })),
            { role: 'user', content: text },
          ],
        }),
      });

      let responseText = 'Sorry, I could not generate a response.';
      if (aiRes.ok) {
        const aiData = await aiRes.json();
        responseText = aiData.reply || responseText;
      }

      setIsThinking(false);
      // Generate talking photo video
      await sendMessage(text, responseText);
    } catch (e) {
      setIsThinking(false);
      console.error('Chat error:', e);
    }
  };

  const handleEndSession = () => {
    reset();
    router.push('/feedback');
  };

  const isGenerating = phase === 'generating' || phase === 'polling' || isThinking;

  return (
    <>
      <SessionHeader
        theme={theme}
        scenarioDisplay={customPrompt}
        phase={phase === 'ready' ? 'connected' : phase}
        isConnected={phase === 'ready' || phase === 'playing'}
        error={error}
        onEndSession={handleEndSession}
        isLoading={false}
      />
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 h-full overflow-hidden">
        {/* Video / Avatar Area */}
        <div className={`h-[50vh] lg:h-auto lg:flex-1 flex-shrink-0 overflow-hidden relative shadow-2xl flex items-center justify-center ${theme === "dark" ? "bg-sa-bg-secondary border border-sa-accent-cyan/20 clip-chamfer-lg" : "glass-card"}`}>
          {/* Show avatar image as default, video overlays when playing */}
          {avatarUrlParam && (
            <img src={avatarUrlParam} className="w-full h-full object-cover" alt="Avatar" />
          )}
          {currentVideoUrl && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover z-10"
              onEnded={() => { }}
            />
          )}

          {/* Generating overlay */}
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/40 backdrop-blur-sm">
              <div className="text-center text-white">
                <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin mx-auto mb-3" />
                <p className="text-sm">{isThinking ? 'Thinking...' : phase === 'generating' ? 'Generating video...' : 'Processing...'}</p>
              </div>
            </div>
          )}

          {/* Mode badge */}
          <div className="absolute top-4 left-4 z-20 bg-purple-600/80 backdrop-blur px-3 py-1 rounded-full text-white text-xs font-medium">
            🎬 Talking Photo Mode
          </div>

          {phase === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/80 text-white">
              <div className="text-center px-8">
                <p className="text-red-400 font-bold text-xl mb-2">Error</p>
                <p className="text-sm mb-4">{error}</p>
                <button onClick={reset} className="px-4 py-2 bg-white/10 rounded">Reset</button>
              </div>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        <div className="flex-1 lg:flex-none lg:w-96 flex flex-col gap-4">
          {/* Messages */}
          <div className={`flex-1 p-4 overflow-y-auto ${theme === "dark" ? "bg-sa-bg-secondary" : "glass-card"}`}>
            <h3 className="text-sm font-bold mb-3">Conversation</h3>
            {messages.length === 0 ? (
              <p className="text-xs text-muted-foreground">Type a message to start the conversation. The avatar will respond with a video!</p>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${msg.role === 'user'
                      ? 'bg-sa-accent-cyan text-sa-bg-primary'
                      : theme === 'dark' ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-800'
                      }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              disabled={isGenerating}
              className={`flex-1 px-4 py-3 rounded-xl border text-sm ${theme === 'dark'
                ? 'bg-sa-bg-secondary border-sa-accent-cyan/30 text-white placeholder:text-gray-500'
                : 'bg-white border-gray-200 text-gray-800'
                } disabled:opacity-50`}
            />
            <button
              onClick={handleSend}
              disabled={isGenerating || !userInput.trim()}
              className="px-6 py-3 bg-sa-accent-cyan text-sa-bg-primary font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50"
            >
              {isGenerating ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Page Component ────────────────────────────────────────────────────

type SessionMode = 'heygen-streaming' | 'live-avatar' | 'talking-photo';

function SessionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const apiParam = searchParams.get("api"); // "heygen" or undefined
  const [sessionMode, setSessionMode] = useState<SessionMode>(
    apiParam === 'heygen' ? 'heygen-streaming'
      : apiParam === 'talking-photo' ? 'talking-photo'
        : 'live-avatar'
  );

  const commonProps = {
    customPrompt: searchParams.get("prompt") || "",
    selectedLanguage: searchParams.get("lang") || "en",
    avatarIdParam: searchParams.get("avatarId"),
    avatarUrlParam: searchParams.get("avatarUrl"),
    onBack: () => router.push("/demo")
  };

  if (sessionMode === 'heygen-streaming') {
    return (
      <HeyGenSession
        {...commonProps}
        onFallback={() => setSessionMode('live-avatar')}
        onTalkingPhoto={() => setSessionMode('talking-photo')}
      />
    );
  }

  if (sessionMode === 'talking-photo') {
    return <TalkingPhotoSession {...commonProps} />;
  }

  return <LiveAvatarSession {...commonProps} />;
}

export default function SessionPage() {
  const { theme } = useTheme();
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>}>
      <main className={`min-h-screen relative overflow-hidden flex flex-col ${theme === "dark" ? "bg-sa-bg-primary bg-grid" : ""}`}>
        <div className="container mx-auto px-4 py-6 h-screen flex flex-col relative z-10">
          <SessionContent />
        </div>
      </main>
    </Suspense>
  );
}
