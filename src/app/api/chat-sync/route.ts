import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/chat-sync
 * Non-streaming chat endpoint for use with Talking Photo mode.
 * Returns: { reply: string }
 */
export async function POST(req: NextRequest) {
    try {
        const { messages, systemPrompt } = await req.json();

        const fullMessages = [
            { role: "system" as const, content: systemPrompt || "You are a helpful conversation partner. Keep responses under 2 sentences." },
            ...messages,
        ];

        const result = await generateText({
            model: openai("gpt-4o"),
            messages: fullMessages,
            temperature: 0.8,
        });

        return NextResponse.json({ reply: result.text });
    } catch (error) {
        console.error("Error in chat-sync API:", error);
        return NextResponse.json(
            { error: "Failed to process chat request" },
            { status: 500 }
        );
    }
}
