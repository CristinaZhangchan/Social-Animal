import { useState, useRef, useCallback, useEffect } from "react";
import {
  Room,
  RoomEvent,
  Track,
  type RemoteTrack,
  RemoteTrackPublication,
  RemoteParticipant,
  DataPacket_Kind,
  DisconnectReason,
} from "livekit-client";

// ── Types ──────────────────────────────────────────────────────────────────

export interface LiveAvatarConfig {
  /** Avatar ID (overridden by sandbox in dev) */
  avatarId?: string;
  /** Voice ID for TTS */
  voiceId?: string;
  /** Context ID (avatar personality) */
  contextId?: string;
  /** Language code */
  language?: string;
}

export type SessionPhase =
  | "idle"
  | "creating_token"
  | "starting"
  | "connecting"
  | "connected"
  | "error"
  | "disconnected";

export interface TranscriptEntry {
  speaker: "user" | "avatar";
  text: string;
  timestamp: number;
}

export interface SpeakEvent {
  type: "avatar" | "user";
  action: "start" | "end";
  timestamp: number;
}

interface LiveAvatarServerEvent {
  event_type: string;
  text?: string;
  [key: string]: unknown;
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useLiveAvatar() {
  // State
  const [phase, setPhase] = useState<SessionPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [speakEvents, setSpeakEvents] = useState<SpeakEvent[]>([]);
  const [avatarVideoTrack, setAvatarVideoTrack] =
    useState<RemoteTrack | null>(null);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  // Audio container ref: audio tracks auto-attach <audio> elements into this div
  const audioContainerRef = useRef<HTMLDivElement | null>(null);

  // Refs
  const roomRef = useRef<Room | null>(null);
  const sessionTokenRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const keepAliveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Helpers ─────────────────────────────────────────────────────────────

  const cleanup = useCallback(() => {
    if (keepAliveTimerRef.current) {
      clearInterval(keepAliveTimerRef.current);
      keepAliveTimerRef.current = null;
    }
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    sessionTokenRef.current = null;
    setAvatarVideoTrack(null);
    // Remove all auto-created <audio> elements
    if (audioContainerRef.current) {
      audioContainerRef.current.innerHTML = "";
    }
    setIsAvatarSpeaking(false);
    setIsUserSpeaking(false);
  }, []);

  // ── Handle incoming server events from LiveAvatar ───────────────────────

  const handleServerEvent = useCallback((event: LiveAvatarServerEvent) => {
    const now = Date.now();

    switch (event.event_type) {
      case "user.speak_started":
        setIsUserSpeaking(true);
        setSpeakEvents((prev) => [
          ...prev,
          { type: "user", action: "start", timestamp: now },
        ]);
        break;
      case "user.speak_ended":
        setIsUserSpeaking(false);
        setSpeakEvents((prev) => [
          ...prev,
          { type: "user", action: "end", timestamp: now },
        ]);
        break;
      case "avatar.speak_started":
        setIsAvatarSpeaking(true);
        setSpeakEvents((prev) => [
          ...prev,
          { type: "avatar", action: "start", timestamp: now },
        ]);
        break;
      case "avatar.speak_ended":
        setIsAvatarSpeaking(false);
        setSpeakEvents((prev) => [
          ...prev,
          { type: "avatar", action: "end", timestamp: now },
        ]);
        break;
      case "user.transcription":
        if (event.text) {
          setTranscript((prev) => [
            ...prev,
            { speaker: "user", text: event.text!, timestamp: now },
          ]);
        }
        break;
      case "avatar.transcription":
        if (event.text) {
          setTranscript((prev) => [
            ...prev,
            { speaker: "avatar", text: event.text!, timestamp: now },
          ]);
        }
        break;
      default:
        console.log("LiveAvatar server event:", event.event_type, event);
    }
  }, []);

  // ── Handle remote tracks (avatar video/audio) ──────────────────────────

  const handleTrackSubscribed = useCallback(
    (
      track: RemoteTrack,
      publication: RemoteTrackPublication,
      participant: RemoteParticipant
    ) => {
      if (!track) return;

      const mst = track.mediaStreamTrack;
      console.log(
        "[LiveAvatar] Track subscribed:",
        "\n  kind:", track.kind,
        "\n  source:", track.source,
        "\n  sid:", track.sid,
        "\n  from:", participant.identity,
        "\n  isMuted:", track.isMuted,
        "\n  mediaStreamTrack.readyState:", mst?.readyState,
        "\n  mediaStreamTrack.enabled:", mst?.enabled,
        "\n  mediaStreamTrack.muted:", mst?.muted
      );

      if (track.kind === Track.Kind.Video) {
        setAvatarVideoTrack(track);
      } else if (track.kind === Track.Kind.Audio) {
        // Let LiveKit create a new <audio> element and append to container
        // This supports multiple simultaneous audio tracks (heygen + agent)
        const audioEl = track.attach();
        audioEl.setAttribute("data-lk-sid", track.sid ?? "");
        audioEl.setAttribute("data-lk-participant", participant.identity);
        console.log("[LiveAvatar] Audio track auto-attached as <audio> element, from:", participant.identity);
        if (audioContainerRef.current) {
          audioContainerRef.current.appendChild(audioEl);
        } else {
          // Fallback: append to body if container not yet available
          document.body.appendChild(audioEl);
        }
      }
    },
    []
  );

  const handleTrackUnsubscribed = useCallback(
    (
      track: RemoteTrack,
      publication: RemoteTrackPublication,
      participant: RemoteParticipant
    ) => {
      if (!track) return;
      console.log("[LiveAvatar] Track unsubscribed:", track.kind, "from", participant.identity);
      if (track.kind === Track.Kind.Video) {
        track.detach();
        setAvatarVideoTrack(null);
      } else if (track.kind === Track.Kind.Audio) {
        // detach() returns the elements it was attached to; remove them from DOM
        const detachedEls = track.detach();
        detachedEls.forEach((el) => el.remove());
      }
    },
    []
  );

  // ── Connect to LiveKit room ─────────────────────────────────────────────

  const connectToRoom = useCallback(
    async (livekitUrl: string, livekitToken: string) => {
      setPhase("connecting");

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      roomRef.current = room;

      // Subscribe to remote tracks (avatar video/audio)
      room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);

      // Diagnostic: log all track publication and mute events
      room.on(RoomEvent.TrackPublished, (pub, participant) => {
        console.log("[LiveAvatar] TrackPublished:", pub.kind, pub.source, "from", participant.identity);
      });
      room.on(RoomEvent.TrackMuted, (pub, participant) => {
        console.log("[LiveAvatar] TrackMuted:", pub.kind, pub.source, "from", participant.identity);
      });
      room.on(RoomEvent.TrackUnmuted, (pub, participant) => {
        console.log("[LiveAvatar] TrackUnmuted:", pub.kind, pub.source, "from", participant.identity);
      });
      room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        const ids = speakers.map((s) => s.identity);
        console.log("[LiveAvatar] ActiveSpeakers:", ids);
      });
      room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
        console.log("[LiveAvatar] AudioPlaybackAllowed:", room.canPlaybackAudio);
      });
      room.on(RoomEvent.ParticipantConnected, (p) => {
        console.log("[LiveAvatar] ParticipantConnected:", p.identity);
      });

      // Listen for data messages on the "agent-response" topic
      room.on(
        RoomEvent.DataReceived,
        (
          payload: Uint8Array,
          participant?: RemoteParticipant,
          kind?: DataPacket_Kind,
          topic?: string
        ) => {
          if (topic === "agent-response") {
            try {
              const text = new TextDecoder().decode(payload);
              const event: LiveAvatarServerEvent = JSON.parse(text);
              handleServerEvent(event);
            } catch (e) {
              console.error("Failed to parse server event:", e);
            }
          }
        }
      );

      room.on(RoomEvent.Disconnected, (reason?: DisconnectReason) => {
        console.log("Disconnected from LiveKit room, reason:", reason);
        cleanup();
        setPhase("disconnected");
      });

      try {
        await room.connect(livekitUrl, livekitToken);
        // Enable microphone so the avatar can hear the user
        await room.localParticipant.setMicrophoneEnabled(true);
        setPhase("connected");
      } catch (err) {
        console.error("Failed to connect to LiveKit room:", err);
        setError(
          err instanceof Error ? err.message : "Failed to connect to room"
        );
        setPhase("error");
        cleanup();
      }
    },
    [handleTrackSubscribed, handleTrackUnsubscribed, handleServerEvent, cleanup]
  );

  // ── Public: Start session ───────────────────────────────────────────────

  const startSession = useCallback(
    async (config: LiveAvatarConfig) => {
      setError(null);
      setTranscript([]);
      setSpeakEvents([]);
      setPhase("creating_token");

      try {
        // Step 1: Create session token via our backend
        const tokenRes = await fetch("/api/liveavatar/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            avatar_id: config.avatarId,
            voice_id: config.voiceId,
            context_id: config.contextId,
            language: config.language,
            provider: (config as any).provider, // Pass provider if present
          }),
        });

        if (!tokenRes.ok) {
          const errData = await tokenRes.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to create session token");
        }

        const tokenData = await tokenRes.json();
        const { session_id, session_token } = tokenData.data;
        sessionTokenRef.current = session_token;
        sessionIdRef.current = session_id;
        setSessionId(session_id);

        // Step 2: Start the session
        setPhase("starting");
        const startRes = await fetch("/api/liveavatar/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_token }),
        });

        if (!startRes.ok) {
          const errData = await startRes.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to start session");
        }

        const startData = await startRes.json();
        const { livekit_url, livekit_client_token } = startData.data;

        if (!livekit_url || !livekit_client_token) {
          throw new Error("Missing LiveKit connection details from server");
        }

        // Step 3: Connect to LiveKit room
        await connectToRoom(livekit_url, livekit_client_token);

        // Step 4: Start keep-alive timer (every 30 seconds)
        keepAliveTimerRef.current = setInterval(async () => {
          try {
            await fetch("/api/liveavatar/keep-alive", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ session_id }),
            });
          } catch (e) {
            console.warn("Keep-alive failed:", e);
          }
        }, 30_000);
      } catch (err) {
        console.error("Error starting LiveAvatar session:", err);
        setError(
          err instanceof Error ? err.message : "Failed to start session"
        );
        setPhase("error");
        cleanup();
      }
    },
    [connectToRoom, cleanup]
  );

  // ── Public: Stop session ────────────────────────────────────────────────

  const stopSession = useCallback(async () => {
    const sid = sessionIdRef.current;
    cleanup();
    setPhase("disconnected");
    setSessionId(null);

    if (sid) {
      try {
        await fetch("/api/liveavatar/stop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sid }),
        });
      } catch (e) {
        console.warn("Stop session request failed:", e);
      }
    }
  }, [cleanup]);

  // ── Public: Send command events ─────────────────────────────────────────

  const sendCommand = useCallback(
    (eventType: string, data?: Record<string, unknown>) => {
      const room = roomRef.current;
      if (!room || room.state !== "connected") {
        console.warn("Cannot send command: room not connected");
        return;
      }

      const payload = JSON.stringify({ event_type: eventType, ...data });
      const encoded = new TextEncoder().encode(payload);

      room.localParticipant.publishData(encoded, {
        reliable: true,
        topic: "agent-control",
      });
    },
    []
  );

  /** Tell the avatar to speak specific text */
  const speakText = useCallback(
    (text: string) => {
      sendCommand("avatar.speak_text", { text });
    },
    [sendCommand]
  );

  /** Tell the avatar to generate an LLM response to the text */
  const speakResponse = useCallback(
    (text: string) => {
      sendCommand("avatar.speak_response", { text });
    },
    [sendCommand]
  );

  /** Interrupt the avatar */
  const interrupt = useCallback(() => {
    sendCommand("avatar.interrupt");
  }, [sendCommand]);

  /** Switch avatar to listening state */
  const startListening = useCallback(() => {
    sendCommand("avatar.start_listening");
  }, [sendCommand]);

  /** Switch avatar back to idle state */
  const stopListening = useCallback(() => {
    sendCommand("avatar.stop_listening");
  }, [sendCommand]);

  // ── Microphone control ─────────────────────────────────────────────────

  /** Toggle microphone on/off */
  const toggleMicrophone = useCallback(async () => {
    const room = roomRef.current;
    if (!room || room.state !== "connected") {
      console.warn("Cannot toggle mic: room not connected");
      return;
    }

    const newState = !isMicEnabled;
    try {
      await room.localParticipant.setMicrophoneEnabled(newState);
      setIsMicEnabled(newState);
    } catch (err) {
      console.error("Failed to toggle microphone:", err);
    }
  }, [isMicEnabled]);

  // ── Helper: Get speak timestamps for rhythm analysis ───────────────────

  const getSpeakTimestamps = useCallback(() => {
    return speakEvents;
  }, [speakEvents]);

  // ── Cleanup on unmount ──────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Return ──────────────────────────────────────────────────────────────

  return {
    // State
    phase,
    error,
    sessionId,
    isAvatarSpeaking,
    isUserSpeaking,
    transcript,
    speakEvents,
    avatarVideoTrack,
    isMicEnabled,
    /** Attach this ref to a hidden <div> — audio elements are auto-appended here */
    audioContainerRef,

    // Actions
    startSession,
    stopSession,
    speakText,
    speakResponse,
    interrupt,
    startListening,
    stopListening,
    sendCommand,
    getSpeakTimestamps,
    toggleMicrophone,
  };
}
