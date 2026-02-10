import { useState, useRef, useCallback, useEffect } from "react";
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskType,
  TaskMode,
} from "@heygen/streaming-avatar";

export interface HeyGenAvatarConfig {
  onAvatarStartedSpeaking?: () => void;
  onAvatarStoppedSpeaking?: () => void;
  onStreamReady?: () => void;
  onStreamDisconnected?: () => void;
}

export function useHeyGenAvatar(config?: HeyGenAvatarConfig) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const avatarRef = useRef<StreamingAvatar | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Initialize avatar session
  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get session token from our backend
      const response = await fetch("/api/heygen/session", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Backend error:", errorData);
        throw new Error(errorData.error || "Failed to create streaming session");
      }

      const data = await response.json();
      const { session_id, access_token, sdp, ice_servers2 } = data.data;

      setSessionId(session_id);

      // Initialize the StreamingAvatar
      const avatar = new StreamingAvatar({
        token: access_token,
      });

      avatarRef.current = avatar;

      // Set up event listeners
      avatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
        console.log("Avatar started talking");
        setIsSpeaking(true);
        config?.onAvatarStartedSpeaking?.();
      });

      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
        console.log("Avatar stopped talking");
        setIsSpeaking(false);
        config?.onAvatarStoppedSpeaking?.();
      });

      avatar.on(StreamingEvents.STREAM_READY, (event) => {
        console.log("Stream ready:", event.detail);
        mediaStreamRef.current = event.detail;
        setIsConnected(true);
        config?.onStreamReady?.();
      });

      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log("Stream disconnected");
        setIsConnected(false);
        config?.onStreamDisconnected?.();
      });

      // Start the avatar with the SDP and ICE servers from backend
      await avatar.createStartAvatar({
        quality: AvatarQuality.High,
        avatarName: "Wayne_20240711", // You can customize this
        voice: {
          voiceId: "1bd001e7e50f421d891986aad5158bc8", // You can customize this
        },
      });

      console.log("Avatar session started successfully");
    } catch (err) {
      console.error("Error connecting to HeyGen:", err);
      setError(err instanceof Error ? err.message : "Failed to connect");
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  // Disconnect avatar session
  const disconnect = useCallback(async () => {
    if (avatarRef.current && sessionId) {
      try {
        await avatarRef.current.stopAvatar();
        avatarRef.current = null;
        mediaStreamRef.current = null;
        setIsConnected(false);
        setSessionId(null);
        console.log("Avatar session ended");
      } catch (err) {
        console.error("Error disconnecting:", err);
      }
    }
  }, [sessionId]);

  // Make avatar speak text
  const speak = useCallback(
    async (text: string) => {
      if (!avatarRef.current || !isConnected) {
        throw new Error("Avatar not connected");
      }

      try {
        await avatarRef.current.speak({
          text,
          taskType: TaskType.REPEAT,
          taskMode: TaskMode.SYNC,
        });
      } catch (err) {
        console.error("Error making avatar speak:", err);
        throw err;
      }
    },
    [isConnected]
  );

  // Start voice chat (for user input)
  const startVoiceChat = useCallback(async () => {
    if (!avatarRef.current || !isConnected) {
      throw new Error("Avatar not connected");
    }

    try {
      await avatarRef.current.startVoiceChat();
      console.log("Voice chat started");
    } catch (err) {
      console.error("Error starting voice chat:", err);
      throw err;
    }
  }, [isConnected]);

  // Stop voice chat
  const stopVoiceChat = useCallback(async () => {
    if (!avatarRef.current) {
      return;
    }

    try {
      await avatarRef.current.closeVoiceChat();
      console.log("Voice chat stopped");
    } catch (err) {
      console.error("Error stopping voice chat:", err);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (avatarRef.current && sessionId) {
        avatarRef.current.stopAvatar().catch(console.error);
      }
    };
  }, [sessionId]);

  return {
    isConnected,
    isLoading,
    isSpeaking,
    error,
    sessionId,
    mediaStream: mediaStreamRef.current,
    connect,
    disconnect,
    speak,
    startVoiceChat,
    stopVoiceChat,
  };
}
