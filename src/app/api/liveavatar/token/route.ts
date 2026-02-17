import { NextResponse } from "next/server";

/**
 * POST /api/liveavatar/token
 * Creates a LiveAvatar session token (backend proxy to protect API key).
 *
 * Request body:
 *   { avatar_id?: string, voice_id?: string, context_id?: string, language?: string }
 *
 * LiveAvatar API: POST https://api.liveavatar.com/v1/sessions/token
 */
export async function POST(req: Request) {
  try {
    const apiKey = process.env.LIVEAVATAR_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "LiveAvatar API key not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const isSandbox = process.env.LIVEAVATAR_SANDBOX_MODE === "true";
    const sandboxAvatarId = process.env.LIVEAVATAR_SANDBOX_AVATAR_ID;

    // Determine Avatar ID
    // If provider is heygen, we trust the avatar_id passed (bypass sandbox override if specifically requested)
    // Or if allowing sandbox bypass generally
    let avatarId = body.avatar_id;

    if (!avatarId) {
      // Fallback to sandbox ID if no ID provided
      avatarId = sandboxAvatarId || "dd73ea75-1218-4ef3-92ce-606d5f7fbc0a";
    } else if (isSandbox && body.provider !== 'heygen') {
      // If in sandbox mode AND NOT explicitly using a specific provider like heygen, override with sandbox ID
      // This keeps dev safe but allows HeyGen integration to work
      avatarId = sandboxAvatarId || "dd73ea75-1218-4ef3-92ce-606d5f7fbc0a";
    }

    if (!avatarId) {
      return NextResponse.json(
        { error: "avatar_id is required" },
        { status: 400 }
      );
    }

    // Build the request payload for LiveAvatar FULL mode
    const payload: Record<string, unknown> = {
      mode: "FULL",
      avatar_id: avatarId,
      is_sandbox: isSandbox && body.provider !== 'heygen', // Disable sandbox flag if using heygen provider? Or keep it? 
      // If we are using a real HeyGen ID, we probably shouldn't send is_sandbox=true if that forces the default avatar on their end.
    };

    // Attach avatar_persona if voice or context provided
    if (body.voice_id || body.context_id || body.language) {
      payload.avatar_persona = {
        voice_id: body.voice_id || null,
        context_id: body.context_id || null,
        language: body.language || "en",
      };
    }

    // Pass provider if needed (unclear if LiveAvatar API supports this field directly, but assumes it might for routing)
    if (body.provider) {
      payload.provider = body.provider;
    }

    const response = await fetch(
      "https://api.liveavatar.com/v1/sessions/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      console.error("LiveAvatar token API error:", errorData);
      return NextResponse.json(
        { error: "Failed to create session token", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    // data.data contains { session_id, session_token }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating LiveAvatar token:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
