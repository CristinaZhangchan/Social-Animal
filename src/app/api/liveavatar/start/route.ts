import { NextResponse } from "next/server";

/**
 * POST /api/liveavatar/start
 * Starts a LiveAvatar session. Frontend passes the session_token obtained from /token.
 *
 * Request body:
 *   { session_token: string }
 *
 * LiveAvatar API: POST https://api.liveavatar.com/v1/sessions/start
 */
export async function POST(req: Request) {
  try {
    const { session_token } = await req.json();

    if (!session_token) {
      return NextResponse.json(
        { error: "session_token is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://api.liveavatar.com/v1/sessions/start",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${session_token}`,
        },
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
      console.error("LiveAvatar start API error:", errorData);
      return NextResponse.json(
        { error: "Failed to start session", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    // data.data contains { session_id, livekit_url, livekit_client_token, ... }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error starting LiveAvatar session:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
