import { useEffect, useRef, useState, useCallback } from 'react';
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskType,
  VoiceEmotion
} from '@heygen/streaming-avatar';

export interface UseHeyGenAvatarProps {
  tokenUrl?: string;
  language?: string;
}

export function useHeyGenAvatar({ tokenUrl = '/api/heygen/token', language = 'en' }: UseHeyGenAvatarProps = {}) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [debug, setDebug] = useState<string>('Init');
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false); // Placeholder for VAD if needed
  const [phase, setPhase] = useState<'idle' | 'connecting' | 'connected' | 'error' | 'disconnected'>('idle');
  const [error, setError] = useState<string | null>(null);

  const avatarRef = useRef<StreamingAvatar | null>(null);
  const mediaStreamRef = useRef<HTMLVideoElement>(null);

  // Initialize Avatar SDK
  // We don't init in useEffect to avoid double init, we do it on startSession

  const startSession = useCallback(async (avatarId: string, avatarUrl?: string) => {
    setPhase('connecting');
    setError(null);
    setDebug('Fetching token...');

    try {
      const response = await fetch(tokenUrl, { method: 'POST' });
      const data = await response.json();

      if (!data.data || !data.data.token) {
        // Log the error detail if available
        console.error("Token fetch failed:", data);
        throw new Error(data.error || 'Failed to get access token');
      }

      const token = data.data.token;

      avatarRef.current = new StreamingAvatar({
        token: token,
      });

      // Event Listeners
      avatarRef.current.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
        setIsAvatarSpeaking(true);
      });
      avatarRef.current.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
        setIsAvatarSpeaking(false);
      });
      avatarRef.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log('Stream disconnected');
        setPhase('disconnected');
        endSession();
      });
      avatarRef.current.on(StreamingEvents.STREAM_READY, (event) => {
        console.log('Stream ready:', event.detail);
        setStream(event.detail);
        setPhase('connected');
      });

      let finalAvatarId = avatarId;

      // Handle Custom Upload (Talking Photo)
      if (avatarId === 'custom' && avatarUrl) {
        setDebug('Uploading photo...');
        try {
          const uploadRes = await fetch('/api/heygen/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: avatarUrl })
          });

          if (!uploadRes.ok) {
            const uploadErr = await uploadRes.json();
            throw new Error(uploadErr.error || 'Failed to upload photo');
          }

          const uploadData = await uploadRes.json();
          if (uploadData.data && uploadData.data.talking_photo_id) {
            finalAvatarId = uploadData.data.talking_photo_id;
            setDebug('Photo uploaded. Starting session...');
            console.log("Using Talking Photo ID:", finalAvatarId);
          } else {
            throw new Error('No talking photo ID returned');
          }
        } catch (uploadError) {
          console.error("Upload flow failed:", uploadError);
          throw new Error("Failed to process custom photo. " + (uploadError instanceof Error ? uploadError.message : ""));
        }
      }

      setDebug('Starting avatar...');

      console.log('Starting avatar with ID:', finalAvatarId, 'language:', language);

      await avatarRef.current.createStartAvatar({
        quality: AvatarQuality.Medium,
        avatarName: finalAvatarId,
        language: language,
      });

      setDebug('Avatar started');

    } catch (e: any) {
      console.error('Failed to start HeyGen session:', e);
      // The HeyGen SDK throws APIError with responseText
      const errorMsg = e?.responseText || e?.message || 'Unknown error';
      console.error('HeyGen error details:', errorMsg);
      setError(errorMsg);
      setPhase('error');
    }
  }, [tokenUrl, language]);

  const endSession = useCallback(async () => {
    if (avatarRef.current) {
      try {
        await avatarRef.current.stopAvatar();
      } catch (e) {
        console.warn("Failed to stop avatar cleanly", e);
      }
      avatarRef.current = null;
    }
    setStream(null);
    setPhase('disconnected');
  }, []);

  const speakText = useCallback(async (text: string) => {
    if (!avatarRef.current) return;
    try {
      await avatarRef.current.speak({ text, task_type: TaskType.REPEAT });
    } catch (e) {
      console.error("Speak failed", e);
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      endSession();
    };
  }, []);

  return {
    stream,
    phase,
    error,
    debug,
    isAvatarSpeaking,
    startSession,
    endSession,
    speakText,
    avatarRef
  };
}
