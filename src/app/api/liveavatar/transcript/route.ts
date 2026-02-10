import { NextResponse } from "next/server";

/**
 * GET /api/liveavatar/transcript?session_id=xxx
 * Retrieves the conversation transcript for a session from LiveAvatar API.
 *
 * LiveAvatar API: GET https://api.liveavatar.com/v1/sessions/{session_id}/transcript
 *
 * Response includes transcript data with role, text, and timestamps.
 */
export async function GET(req: Request) {
  try {
    const apiKey = process.env.LIVEAVATAR_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "LiveAvatar API key not configured" },
        { status: 500 }
      );
    }

    const url = new URL(req.url);
    const sessionId = url.searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "session_id is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.liveavatar.com/v1/sessions/${sessionId}/transcript`,
      {
        method: "GET",
        headers: {
          "X-API-KEY": apiKey,
          Accept: "application/json",
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
      console.error("LiveAvatar transcript API error:", errorData);
      return NextResponse.json(
        { error: "Failed to fetch transcript", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching LiveAvatar transcript:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
