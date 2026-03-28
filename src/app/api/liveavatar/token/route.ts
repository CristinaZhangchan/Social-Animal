import { NextResponse } from "next/server";
import {
  DEFAULT_SANDBOX_AVATAR_ID,
  getLiveAvatarRuntimeConfig,
} from "@/lib/liveavatar/config";

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
    const config = getLiveAvatarRuntimeConfig();
    if (!config.apiKey) {
      return NextResponse.json(
        { error: "LiveAvatar API key not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    let avatarId = body.avatar_id;

    if (!avatarId) {
      avatarId = config.sandboxEnabled
        ? config.sandboxAvatarId
        : config.sandboxAvatarId || DEFAULT_SANDBOX_AVATAR_ID;
    } else if (config.sandboxEnabled && body.provider !== "heygen") {
      avatarId = config.sandboxAvatarId || DEFAULT_SANDBOX_AVATAR_ID;
    }

    if (!avatarId) {
      return NextResponse.json(
        { error: "avatar_id is required" },
        { status: 400 }
      );
    }

    const payload: Record<string, unknown> = {
      mode: "FULL",
      avatar_id: avatarId,
      is_sandbox: config.sandboxEnabled && body.provider !== "heygen",
    };

    // Attach avatar_persona if voice or context provided
    if (body.voice_id || body.context_id || body.language) {
      payload.avatar_persona = {
        voice_id: body.voice_id || null,
        context_id: body.context_id || null,
        language: body.language || "en",
      };
    }

    if (body.provider) {
      payload.provider = body.provider;
    }

    const response = await fetch(
      "https://api.liveavatar.com/v1/sessions/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": config.apiKey,
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
      const message =
        (typeof errorData?.message === "string" && errorData.message) ||
        (typeof errorData?.error === "string" && errorData.error) ||
        "Failed to create session token";
      return NextResponse.json(
        { error: message, details: errorData },
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
