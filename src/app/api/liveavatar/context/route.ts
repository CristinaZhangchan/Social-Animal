import { NextResponse } from "next/server";

/**
 * POST /api/liveavatar/context
 * Creates a LiveAvatar context (personality/prompt for the avatar).
 *
 * Request body:
 *   { name: string, prompt: string, opening_text?: string }
 *
 * LiveAvatar API: POST https://api.liveavatar.com/v1/contexts
 *
 * GET /api/liveavatar/context
 * Lists user's existing contexts.
 *
 * LiveAvatar API: GET https://api.liveavatar.com/v1/contexts
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
    const { name, prompt, opening_text } = body;

    if (!name || !prompt) {
      return NextResponse.json(
        { error: "name and prompt are required" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.liveavatar.com/v1/contexts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: name.startsWith("socialanimal-")
          ? name
          : `socialanimal-${name}-${Date.now()}`,
        prompt,
        // Set opening_text to empty string for silent avatar start (user-led conversation)
        opening_text: opening_text === undefined ? "" : opening_text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      console.error("LiveAvatar context API error:", errorData);
      return NextResponse.json(
        { error: "Failed to create context", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating LiveAvatar context:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const apiKey = process.env.LIVEAVATAR_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "LiveAvatar API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.liveavatar.com/v1/contexts?page=1&page_size=100",
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
      console.error("LiveAvatar list contexts API error:", errorData);
      return NextResponse.json(
        { error: "Failed to list contexts", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error listing LiveAvatar contexts:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
