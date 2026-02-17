import { useState, useCallback, useRef } from 'react';

export type TalkingPhotoPhase =
    | 'idle'
    | 'generating'
    | 'polling'
    | 'playing'
    | 'error'
    | 'ready';

export interface TalkingPhotoMessage {
    role: 'user' | 'avatar';
    text: string;
    videoUrl?: string;
    timestamp: number;
}

export interface UseHeyGenTalkingPhotoProps {
    avatarId: string;
    avatarUrl?: string;  // Custom photo URL (for lip sync on uploaded photos)
    voiceId?: string;
    language?: string;
}

/**
 * Hook for turn-based HeyGen Talking Photo video generation.
 * Does NOT require Enterprise streaming plan.
 *
 * Flow: User message → AI responds → HeyGen generates video → Play video
 */
export function useHeyGenTalkingPhoto({ avatarId, avatarUrl, voiceId, language = 'en' }: UseHeyGenTalkingPhotoProps) {
    const [phase, setPhase] = useState<TalkingPhotoPhase>('ready');
    const [error, setError] = useState<string | null>(null);
    const [messages, setMessages] = useState<TalkingPhotoMessage[]>([]);
    const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Clean up polling
    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    }, []);

    // Poll for video status until complete
    const pollVideoStatus = useCallback(async (videoId: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 60; // 2 minutes max

            pollingRef.current = setInterval(async () => {
                attempts++;
                if (attempts > maxAttempts) {
                    stopPolling();
                    reject(new Error('Video generation timed out'));
                    return;
                }

                try {
                    const res = await fetch(`/api/heygen/video-status?id=${videoId}`);
                    const data = await res.json();

                    if (data?.data?.status === 'completed' && data?.data?.video_url) {
                        stopPolling();
                        resolve(data.data.video_url);
                    } else if (data?.data?.status === 'failed') {
                        stopPolling();
                        reject(new Error(data?.data?.error || 'Video generation failed'));
                    }
                    // Otherwise keep polling...
                } catch (err) {
                    stopPolling();
                    reject(err);
                }
            }, 2000); // Poll every 2 seconds
        });
    }, [stopPolling]);

    /**
     * Send a message and generate a Talking Photo video response.
     * The `responseText` is the AI-generated reply (you should generate it
     * via your own AI pipeline before calling this).
     */
    const sendMessage = useCallback(async (userText: string, responseText: string) => {
        setError(null);

        // Add user message
        const userMsg: TalkingPhotoMessage = {
            role: 'user',
            text: userText,
            timestamp: Date.now(),
        };
        setMessages(prev => [...prev, userMsg]);

        try {
            // Step 1: Request video generation
            setPhase('generating');
            const genRes = await fetch('/api/heygen/talk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    avatar_id: avatarUrl ? undefined : avatarId,  // Don't send avatar_id if we have a custom photo
                    talking_photo_url: avatarUrl || undefined,     // Use custom photo URL for lip sync
                    text: responseText,
                    voice_id: voiceId,
                }),
            });

            if (!genRes.ok) {
                const errData = await genRes.json().catch(() => ({}));
                throw new Error(errData?.error || `Video generation failed (${genRes.status})`);
            }

            const genData = await genRes.json();
            const videoId = genData?.data?.video_id;

            if (!videoId) {
                throw new Error('No video_id returned from HeyGen');
            }

            // Step 2: Poll for completion
            setPhase('polling');
            const videoUrl = await pollVideoStatus(videoId);

            // Step 3: Add avatar response with video
            const avatarMsg: TalkingPhotoMessage = {
                role: 'avatar',
                text: responseText,
                videoUrl,
                timestamp: Date.now(),
            };
            setMessages(prev => [...prev, avatarMsg]);
            setCurrentVideoUrl(videoUrl);
            setPhase('playing');

        } catch (e: any) {
            console.error('Talking Photo error:', e);
            setError(e?.message || 'Unknown error');
            setPhase('error');

            // Still add the text response even if video fails
            const avatarMsg: TalkingPhotoMessage = {
                role: 'avatar',
                text: responseText,
                timestamp: Date.now(),
            };
            setMessages(prev => [...prev, avatarMsg]);
        }
    }, [avatarId, voiceId, pollVideoStatus]);

    const reset = useCallback(() => {
        stopPolling();
        setMessages([]);
        setCurrentVideoUrl(null);
        setPhase('ready');
        setError(null);
    }, [stopPolling]);

    return {
        phase,
        error,
        messages,
        currentVideoUrl,
        videoRef,
        sendMessage,
        reset,
    };
}
