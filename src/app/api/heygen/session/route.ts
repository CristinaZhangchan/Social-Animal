import { NextResponse } from "next/server";

export async function POST() {
  try {
    const apiKey = process.env.HEYGEN_API_KEY;

    console.log("🔑 API Key present:", !!apiKey);

    if (!apiKey) {
      return NextResponse.json(
        { error: "HeyGen API key not configured" },
        { status: 500 }
      );
    }

    console.log("📡 Calling HeyGen API to create streaming session...");

    // Create a new streaming session with HeyGen API
    const response = await fetch(
      "https://api.heygen.com/v1/streaming.new",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey, // Changed from X-Api-Key to x-api-key (lowercase)
        },
        body: JSON.stringify({
          quality: "high",
          avatar_name: "Wayne_20240711", // Default avatar, you can customize
          voice: {
            voice_id: "1bd001e7e50f421d891986aad5158bc8", // Default voice
          },
        }),
      }
    );

    console.log("📊 HeyGen API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      console.error("❌ HeyGen API error:", errorData);
      return NextResponse.json(
        { error: "Failed to create streaming session", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("✅ HeyGen session created successfully");
    return NextResponse.json(data);
  } catch (error) {
    console.error("💥 Error creating HeyGen session:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
