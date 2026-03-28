import { NextResponse } from "next/server";
import {
  buildLiveAvatarCatalog,
  type LiveAvatarApiAvatar,
} from "@/lib/liveavatar/catalog";
import { getLiveAvatarRuntimeConfig } from "@/lib/liveavatar/config";

export async function GET() {
  try {
    const config = getLiveAvatarRuntimeConfig();

    if (!config.apiKey) {
      return NextResponse.json(
        { error: "LiveAvatar API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.liveavatar.com/v1/avatars/public?page=1&page_size=100",
      {
        method: "GET",
        headers: {
          "X-API-KEY": config.apiKey,
          Accept: "application/json",
        },
        next: { revalidate: 3600 },
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

      console.error("LiveAvatar avatars API error:", errorData);
      return NextResponse.json(
        { error: "Failed to fetch LiveAvatar avatars", details: errorData },
        { status: response.status }
      );
    }

    const payload = await response.json();
    const results = Array.isArray(payload?.data?.results)
      ? (payload.data.results as LiveAvatarApiAvatar[])
      : [];

    const catalog = buildLiveAvatarCatalog(results, {
      environment: config.environment,
      sandboxEnabled: config.sandboxEnabled,
      sandboxAvatarId: config.sandboxAvatarId,
    });

    return NextResponse.json(catalog, {
      headers: {
        "Cache-Control": "private, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error fetching LiveAvatar avatars:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
