"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { pushWithTransition } from "@/lib/navigation";
import { useLiveAvatar, type SessionPhase } from "@/hooks/useLiveAvatar";
import { useHeyGenAvatar } from "@/hooks/useHeyGenAvatar";
import { useHeyGenTalkingPhoto, type TalkingPhotoPhase } from "@/hooks/useHeyGenTalkingPhoto";
import { useAuth } from "@/hooks/useAuth";
import { saveSession } from "@/lib/supabase/chatHistory";
import Logo from "@/components/Logo";
import SceneTransition from "@/components/SceneTransition";

// ── Timer Component ──────────────────────────────────────────────────────

function SessionTimer({ startTime }: { startTime: number | null }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <div className="absolute top-[59px] right-[61px] z-30 flex h-[85px] w-[160px] items-center justify-center gap-2 rounded-[43.75px] bg-[#f5ebe2]">
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" stroke="#28020D" strokeWidth="1.5" />
        <path d="M8 4V8L10.5 10.5" stroke="#28020D" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="font-sans text-[24px] font-medium text-sa-maroon">
        {mins}:{secs.toString().padStart(2, '0')}
      </span>
    </div>
  );
}

// ── Floating Control Bar ──────────────────────────────────────────────────

function ControlBar({
  isMicEnabled,
  onToggleMic,
  onEndSession,
  onToggleTranscript,
  showTranscript,
}: {
  isMicEnabled: boolean;
  onToggleMic: () => void;
  onEndSession: () => void;
  onToggleTranscript: () => void;
  showTranscript: boolean;
}) {
  return (
    <div className="absolute bottom-[59px] left-1/2 z-30 flex h-[120px] w-[545px] -translate-x-1/2 items-center justify-center gap-[15px] rounded-[120px] bg-[#f5ebe2] px-[17px]">
      {/* Mic Button */}
      <button
        onClick={onToggleMic}
        className={`sa-icon-btn-lg ${isMicEnabled
          ? 'bg-sa-gold hover:bg-sa-gold-muted'
          : 'bg-sa-maroon hover:bg-sa-maroon/80'
          }`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          {isMicEnabled ? (
            <>
              <rect x="9" y="2" width="6" height="12" rx="3" fill={isMicEnabled ? '#28020D' : '#F5EBE2'} />
              <path d="M5 10C5 13.866 8.134 17 12 17C15.866 17 19 13.866 19 10" stroke={isMicEnabled ? '#28020D' : '#F5EBE2'} strokeWidth="2" strokeLinecap="round" />
              <path d="M12 17V21M8 21H16" stroke={isMicEnabled ? '#28020D' : '#F5EBE2'} strokeWidth="2" strokeLinecap="round" />
            </>
          ) : (
            <>
              <rect x="9" y="2" width="6" height="12" rx="3" fill="#F5EBE2" opacity="0.5" />
              <path d="M3 3L21 21" stroke="#F5EBE2" strokeWidth="2" strokeLinecap="round" />
            </>
          )}
        </svg>
      </button>

      {/* End Conversation Button */}
      <button
        onClick={onEndSession}
        className="sa-btn-primary-lg w-[310px] px-0 text-[30px]"
      >
        End Conversation
      </button>

      {/* Transcript Toggle Button */}
      <button
        onClick={onToggleTranscript}
        className={`sa-icon-btn-lg ${showTranscript ? 'bg-sa-maroon' : 'bg-sa-gold hover:bg-sa-gold-muted'
          }`}
      >
        <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
          <path d="M2 2H20M2 6H16M2 10H20M2 14H12" stroke={showTranscript ? '#F5EBE2' : '#28020D'} strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

// ── Transcript Panel ──────────────────────────────────────────────────────

function TranscriptPanel({
  transcript,
  show,
}: {
  transcript: Array<{ speaker: string; text: string }>;
  show: boolean;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  if (!show) return null;

  return (
    <div className="absolute right-6 top-6 bottom-36 w-[360px] z-20 bg-sa-cream/95 backdrop-blur-md rounded-[30px] p-6 shadow-xl overflow-hidden flex flex-col sa-animate-fade-in">
      <h3 className="font-serif text-sa-maroon text-xl font-bold mb-4">Transcript</h3>
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {transcript.length === 0 ? (
          <p className="text-sa-gold-muted text-sm">Conversation will appear here...</p>
        ) : (
          transcript.map((entry, i) => (
            <div key={i} className="text-sm">
              <span className="font-semibold text-sa-maroon">
                {entry.speaker === "user" ? "You" : "Avatar"}:
              </span>{' '}
              <span className="text-sa-gold-muted">{entry.text}</span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}

// ── Loading Overlay ──────────────────────────────────────────────────────

function LoadingOverlay() {
  return (
    <SceneTransition className="absolute inset-0 z-20 h-full min-h-0 rounded-none" />
  );
}

// ── LiveAvatar Session ──────────────────────────────────────────────────

function LiveAvatarSession({
  customPrompt,
  selectedLanguage,
  avatarIdParam,
  avatarPreviewUrlParam,
  avatarNameParam,
  avatarRoleParam,
  voiceIdParam,
  onBack,
}: any) {
  const router = useRouter();
  const { user } = useAuth();
  const {
    phase, error, sessionId, isAvatarSpeaking, isUserSpeaking,
    transcript, speakEvents, avatarVideoTrack, audioContainerRef,
    isMicEnabled, startSession, stopSession, toggleMicrophone,
  } = useLiveAvatar();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      if (avatarVideoTrack) {
        avatarVideoTrack.attach(video);
      } else if (avatarPreviewUrlParam) {
        video.poster = avatarPreviewUrlParam;
      }
    }
    return () => {
      if (avatarVideoTrack && video) avatarVideoTrack.detach(video);
    };
  }, [avatarPreviewUrlParam, avatarVideoTrack]);

  const handleStart = useCallback(async () => {
    if (!customPrompt.trim()) { onBack(); return; }
    setHasStarted(true);
    try {
      let finalPrompt = customPrompt;
      try {
        const polishRes = await fetch("/api/prompt-polish", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userInput: customPrompt, language: selectedLanguage }),
        });
        if (polishRes.ok) {
          const polishData = await polishRes.json();
          finalPrompt = polishData.combinedPrompt || customPrompt;
        }
      } catch (e) { console.warn("Prompt polish error", e); }

      const ctxRes = await fetch("/api/liveavatar/context", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `custom-${Date.now()}`, prompt: finalPrompt }),
      });
      let createdContextId;
      if (ctxRes.ok) {
        const ctxData = await ctxRes.json();
        createdContextId = ctxData.data?.id;
      }

      await startSession({
        contextId: createdContextId,
        avatarId: avatarIdParam || undefined,
        voiceId: voiceIdParam || undefined,
        language: selectedLanguage || "en",
      });
      setStartTime(Date.now());
    } catch (err) { console.error("Failed to start", err); }
  }, [customPrompt, selectedLanguage, startSession, avatarIdParam, voiceIdParam, onBack]);

  const handleEndSession = useCallback(async () => {
    const mappedTranscript = transcript.map(t => ({ speaker: t.speaker === "user" ? "You" : "AI", text: t.text }));
    const durationSeconds = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;

    console.log('[LiveAvatarSession] Ending session...', {
      customPrompt, durationSeconds,
      transcriptCount: mappedTranscript.length,
      userId: user?.id
    });

    localStorage.setItem("lastSession", JSON.stringify({
      scenario: customPrompt, sessionId,
      transcript: mappedTranscript,
      speakEvents, duration: Date.now()
    }));

    // Save to Supabase if logged in
    if (user?.id) {
      console.log('[LiveAvatarSession] Saving to Supabase...');
      try {
        const { sessionId: dbId, error } = await saveSession(user.id, {
          scenario: customPrompt,
          avatarName: avatarNameParam || undefined,
          durationSeconds,
          transcript: mappedTranscript.map(t => ({ speaker: t.speaker, text: t.text })),
        });
        if (error) {
          console.error('[LiveAvatarSession] Database save error:', error);
        } else if (dbId) {
          console.log('[LiveAvatarSession] Successfully saved session to DB:', dbId);
          // Update localStorage with the DB session ID for feedback page to use
          localStorage.setItem("lastSession", JSON.stringify({
            scenario: customPrompt, sessionId,
            dbSessionId: dbId, // <--- Add this
            transcript: mappedTranscript,
            speakEvents, duration: Date.now()
          }));
        }
      } catch (err) {
        console.error('[LiveAvatarSession] Unexpected error saving to DB:', err);
      }
    } else {
      console.warn('[LiveAvatarSession] User not logged in, skipping database save.');
    }

    await stopSession();
    router.push("/feedback");
  }, [stopSession, customPrompt, sessionId, transcript, speakEvents, router, user, startTime, avatarNameParam]);

  const isLoading = phase === "creating_token" || phase === "starting" || phase === "connecting";
  const isConnected = phase === "connected";

  return (
    <div className="relative w-full h-full">
      {/* Fullscreen Avatar Video */}
      <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
      <div ref={audioContainerRef} style={{ display: "none" }} />

      {/* Pre-start overlay */}
      {!hasStarted && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-sa-cream">
          <div className="text-center max-w-lg px-8 sa-animate-fade-in">
            <div className="w-32 h-32 mx-auto mb-8 rounded-full overflow-hidden bg-sa-surface">
              {avatarPreviewUrlParam && <img src={avatarPreviewUrlParam} className="w-full h-full object-cover" alt={avatarNameParam || "Selected avatar"} />}
            </div>
            <h2 className="font-serif text-sa-maroon text-4xl mb-4">Ready to Begin</h2>
            {(avatarNameParam || avatarRoleParam) && (
              <p className="text-sa-maroon text-lg mb-3">
                <span className="font-semibold">{avatarNameParam || "Your avatar"}</span>
                {avatarRoleParam ? ` - ${avatarRoleParam}` : ""}
              </p>
            )}
            <p className="text-sa-gold-muted text-lg mb-8">
              {customPrompt.length > 100 ? customPrompt.substring(0, 100) + '...' : customPrompt}
            </p>
            <button onClick={handleStart} className="sa-btn-primary text-2xl px-12 py-5">
              Start Conversation
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {hasStarted && isLoading && <LoadingOverlay />}

      {/* Timer */}
      {isConnected && <SessionTimer startTime={startTime} />}

      {/* Transcript */}
      <TranscriptPanel transcript={transcript.map(t => ({ speaker: t.speaker, text: t.text }))} show={showTranscript} />

      {/* Controls */}
      {isConnected && (
        <ControlBar
          isMicEnabled={isMicEnabled}
          onToggleMic={toggleMicrophone}
          onEndSession={handleEndSession}
          onToggleTranscript={() => setShowTranscript(!showTranscript)}
          showTranscript={showTranscript}
        />
      )}

    </div>
  );
}

// ── HeyGen Session ──────────────────────────────────────────────────────

function HeyGenSession({ customPrompt, selectedLanguage, avatarIdParam, avatarPreviewUrlParam, onBack, onFallback, onTalkingPhoto }: any) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  const { stream, phase, error, debug, startSession, endSession, isAvatarSpeaking } = useHeyGenAvatar({ language: selectedLanguage });

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => videoRef.current?.play();
    }
  }, [stream]);

  const handleStart = () => {
    setHasStarted(true);
    setStartTime(Date.now());
    startSession(avatarIdParam || "", avatarPreviewUrlParam || undefined);
  };

  const handleEndSession = async () => {
    await endSession();
    router.push("/feedback");
  };

  const isQuotaError = error?.includes('quota') || error?.includes('10008');
  const isLoading = phase === 'connecting';
  const isConnected = phase === 'connected';

  return (
    <div className="relative w-full h-full">
      <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />

      {!hasStarted && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-sa-cream">
          <div className="text-center max-w-lg px-8 sa-animate-fade-in">
            <div className="w-32 h-32 mx-auto mb-8 rounded-full overflow-hidden bg-sa-surface">
              {avatarPreviewUrlParam && <img src={avatarPreviewUrlParam} className="w-full h-full object-cover" alt="" />}
            </div>
            <h2 className="font-serif text-sa-maroon text-4xl mb-4">Ready to Chat</h2>
            <button onClick={handleStart} className="sa-btn-primary text-2xl px-12 py-5">Start Session</button>
          </div>
        </div>
      )}

      {hasStarted && isLoading && <LoadingOverlay />}

      {phase === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-sa-maroon/90">
          <div className="text-center px-8 max-w-lg">
            <p className="text-red-300 font-serif text-2xl mb-3">Connection Failed</p>
            <p className="text-sa-cream/70 text-sm mb-8">
              {isQuotaError ? 'HeyGen streaming quota exhausted. Choose an alternative:' : error}
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={onFallback} className="sa-btn-primary w-full justify-center">Switch to LiveAvatar</button>
              <button onClick={onTalkingPhoto} className="sa-btn-secondary w-full justify-center">Use Talking Photo</button>
              <button onClick={() => setHasStarted(false)} className="text-sa-cream/60 hover:text-sa-cream text-sm mt-2">Try Again</button>
            </div>
          </div>
        </div>
      )}

      {isConnected && <SessionTimer startTime={startTime} />}
      {isConnected && (
        <ControlBar
          isMicEnabled={true}
          onToggleMic={() => { }}
          onEndSession={handleEndSession}
          onToggleTranscript={() => setShowTranscript(!showTranscript)}
          showTranscript={showTranscript}
        />
      )}
    </div>
  );
}

// ── Talking Photo Session ──────────────────────────────────────────────────

function TalkingPhotoSession({ customPrompt, selectedLanguage, avatarIdParam, avatarPreviewUrlParam, onBack }: any) {
  const router = useRouter();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [userInput, setUserInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(Date.now());

  const { phase, error, messages, currentVideoUrl, sendMessage, reset } = useHeyGenTalkingPhoto({
    avatarId: avatarIdParam || '', avatarUrl: avatarPreviewUrlParam || undefined, language: selectedLanguage,
  });

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
      const aiRes = await fetch('/api/chat-sync', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: customPrompt || 'You are a helpful conversation partner. Keep responses under 2 sentences.',
          messages: [
            ...messages.map(m => ({ role: m.role === 'avatar' ? 'assistant' : 'user', content: m.text })),
            { role: 'user', content: text },
          ],
        }),
      });
      let responseText = 'Sorry, I could not generate a response.';
      if (aiRes.ok) { const d = await aiRes.json(); responseText = d.reply || responseText; }
      setIsThinking(false);
      await sendMessage(text, responseText);
    } catch (e) { setIsThinking(false); console.error('Chat error:', e); }
  };

  const handleEndSession = async () => {
    const durationSeconds = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
    const mappedTranscript = messages.map((m: any) => ({
      speaker: m.role === 'user' ? 'You' : 'AI',
      text: m.content,
    }));

    console.log('[TalkingPhotoSession] Ending session...', {
      customPrompt, durationSeconds,
      messagesCount: mappedTranscript.length,
      userId: user?.id
    });

    localStorage.setItem('lastSession', JSON.stringify({
      scenario: customPrompt,
      transcript: mappedTranscript,
      duration: Date.now(),
    }));

    // Save to Supabase if logged in
    if (user?.id) {
      console.log('[TalkingPhotoSession] Saving to Supabase...');
      try {
        const { sessionId: dbId, error } = await saveSession(user.id, {
          scenario: customPrompt,
          durationSeconds,
          transcript: mappedTranscript.map((t: any) => ({ speaker: t.speaker, text: t.text })),
        });
        if (error) {
          console.error('[TalkingPhotoSession] Database save error:', error);
        } else if (dbId) {
          console.log('[TalkingPhotoSession] Successfully saved session to DB:', dbId);
          // Update localStorage with the DB session ID for feedback page to use
          localStorage.setItem('lastSession', JSON.stringify({
            scenario: customPrompt,
            dbSessionId: dbId, // <--- Add this
            transcript: mappedTranscript,
            duration: Date.now(),
          }));
        }
      } catch (err) {
        console.error('[TalkingPhotoSession] Unexpected error saving to DB:', err);
      }
    } else {
      console.warn('[TalkingPhotoSession] User not logged in, skipping database save.');
    }

    reset();
    router.push('/feedback');
  };
  const isGenerating = phase === 'generating' || phase === 'polling' || isThinking;

  return (
    <div className="relative w-full h-full">
      {avatarPreviewUrlParam && <img src={avatarPreviewUrlParam} className="absolute inset-0 w-full h-full object-cover" alt="" />}
      {currentVideoUrl && (
        <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover z-10" />
      )}

      {isGenerating && <LoadingOverlay />}

      <SessionTimer startTime={startTime} />

      {/* Chat input overlay at bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-[600px] max-w-[90vw]">
        <div className="bg-sa-cream/95 backdrop-blur-md rounded-[30px] p-4 shadow-xl flex gap-3">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            disabled={isGenerating}
            className="sa-input-flat flex-1"
          />
          <button onClick={handleSend} disabled={isGenerating || !userInput.trim()} className="sa-btn-primary px-6 py-3 text-lg disabled:opacity-50">
            Send
          </button>
          <button onClick={handleEndSession} className="sa-btn-secondary px-4 py-3 text-base">
            End
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────

type SessionMode = 'heygen-streaming' | 'live-avatar' | 'talking-photo';

function SessionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const apiParam = searchParams.get("api");
  const [sessionMode, setSessionMode] = useState<SessionMode>(
    apiParam === 'heygen' ? 'heygen-streaming'
      : apiParam === 'talking-photo' ? 'talking-photo'
        : 'live-avatar'
  );

  const commonProps = {
    customPrompt: searchParams.get("prompt") || "",
    selectedLanguage: searchParams.get("lang") || "en",
    avatarIdParam: searchParams.get("avatarId"),
    avatarPreviewUrlParam:
      searchParams.get("avatarPreviewUrl") || searchParams.get("avatarUrl"),
    avatarNameParam: searchParams.get("avatarName"),
    avatarRoleParam: searchParams.get("avatarRole"),
    voiceIdParam: searchParams.get("voiceId"),
    onBack: () => pushWithTransition(router, "/demo"),
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
  return (
    <Suspense fallback={
      <div className="h-screen w-screen bg-sa-cream flex items-center justify-center">
        <div className="sa-animate-spin-slow">
          <Logo collapsed size="sm" color="maroon" href={undefined} />
        </div>
      </div>
    }>
      <main className="h-screen w-screen overflow-hidden bg-sa-maroon">
        <div className="w-full h-full rounded-[30px] overflow-hidden relative">
          <SessionContent />
        </div>
      </main>
    </Suspense>
  );
}
