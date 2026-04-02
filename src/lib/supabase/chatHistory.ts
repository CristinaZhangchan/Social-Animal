import { supabase, isSupabaseConfigured } from './client';

// ── Types ────────────────────────────────────────────────────────────────

export interface ChatSession {
    id: string;
    user_id: string;
    scenario: string;
    avatar_name: string | null;
    duration_seconds: number;
    overall_score: number | null;
    created_at: string;
}

export interface ChatMessage {
    id: string;
    session_id: string;
    speaker: string;  // 'user' or 'ai'
    content: string;
    created_at: string;
}

export interface SaveSessionInput {
    scenario: string;
    avatarName?: string;
    durationSeconds?: number;
    overallScore?: number;
    transcript: Array<{ speaker: string; text: string }>;
}

// ── Save a completed session ─────────────────────────────────────────────

export async function saveSession(
    userId: string,
    input: SaveSessionInput
): Promise<{ sessionId: string | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
        return { sessionId: null, error: 'Supabase not configured' };
    }

    try {
        // 1. Insert the session
        const { data: session, error: sessionError } = await supabase
            .from('chat_sessions')
            .insert({
                user_id: userId,
                scenario: input.scenario || 'Untitled Session',
                avatar_name: input.avatarName || null,
                duration_seconds: input.durationSeconds || 0,
                overall_score: input.overallScore || null,
            })
            .select('id')
            .single();

        if (sessionError) {
            console.error('Error saving session:', sessionError);
            return { sessionId: null, error: sessionError.message };
        }

        // 2. Insert all messages
        if (input.transcript.length > 0) {
            const messages = input.transcript.map((msg) => ({
                session_id: session.id,
                speaker: msg.speaker === 'You' || msg.speaker === 'user' ? 'user' : 'ai',
                content: msg.text,
            }));

            const { error: messagesError } = await supabase
                .from('chat_messages')
                .insert(messages);

            if (messagesError) {
                console.error('Error saving messages:', messagesError);
                // Session was saved, messages failed — not ideal but recoverable
            }
        }

        return { sessionId: session.id, error: null };
    } catch (err) {
        console.error('Unexpected error saving session:', err);
        return { sessionId: null, error: 'Unexpected error' };
    }
}

// ── Get all sessions for a user ──────────────────────────────────────────

export async function getUserSessions(
    userId: string
): Promise<{ sessions: ChatSession[]; error: string | null }> {
    if (!isSupabaseConfigured()) {
        return { sessions: [], error: 'Supabase not configured' };
    }

    const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching sessions:', error);
        return { sessions: [], error: error.message };
    }

    return { sessions: (data as ChatSession[]) || [], error: null };
}

// ── Get messages for a specific session ──────────────────────────────────

export async function getSessionMessages(
    sessionId: string
): Promise<{ messages: ChatMessage[]; error: string | null }> {
    if (!isSupabaseConfigured()) {
        return { messages: [], error: 'Supabase not configured' };
    }

    const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching messages:', error);
        return { messages: [], error: error.message };
    }

    return { messages: (data as ChatMessage[]) || [], error: null };
}

// ── Update session score (called from feedback page) ─────────────────────

export async function updateSessionScore(
    sessionId: string,
    overallScore: number
): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured()) {
        return { error: 'Supabase not configured' };
    }

    const { error } = await supabase
        .from('chat_sessions')
        .update({ overall_score: overallScore })
        .eq('id', sessionId);

    if (error) {
        console.error('Error updating session score:', error);
        return { error: error.message };
    }

    return { error: null };
}
