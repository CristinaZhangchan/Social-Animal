import { NextResponse } from "next/server";

/**
 * POST /api/liveavatar/stop
 * Stops a LiveAvatar session.
 *
 * Request body:
 *   { session_id: string }
 *
 * LiveAvatar API: POST https://api.liveavatar.com/v1/sessions/stop
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

    const { session_id } = await req.json();

    const response = await fetch(
      "https://api.liveavatar.com/v1/sessions/stop",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
          Accept: "application/json",
        },
        body: JSON.stringify({
          session_id: session_id || null,
          reason: "USER_CLOSED",
        }),
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
      console.error("LiveAvatar stop API error:", errorData);
      return NextResponse.json(
        { error: "Failed to stop session", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error stopping LiveAvatar session:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
