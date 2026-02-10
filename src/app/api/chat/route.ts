import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Scenario-specific system prompts
const SCENARIO_PROMPTS: Record<string, string> = {
  "job-interview": `You are a professional recruiter conducting a job interview. You are friendly but professional, asking relevant questions about the candidate's experience, skills, and fit for the role. Keep your responses natural and conversational, typically 2-3 sentences. Show interest in their answers and ask follow-up questions.`,

  "first-date": `You are on a first date with someone. You are friendly, curious, and warm. Ask questions to get to know them better while sharing a bit about yourself. Keep the conversation light and enjoyable. Keep your responses natural and conversational, typically 2-3 sentences.`,

  "networking": `You are attending a professional networking event. You are an industry professional interested in making meaningful connections. Ask about their work, share insights about your field, and look for common ground. Keep your responses natural and conversational, typically 2-3 sentences.`,

  "custom": `You are an AI conversation partner helping someone practice their social skills. Adapt your personality and responses based on the scenario they described. Keep your responses natural and conversational, typically 2-3 sentences. Be encouraging but realistic.`,
};

export async function POST(req: Request) {
  try {
    const { messages, scenario, customPrompt } = await req.json();

    // Get the appropriate system prompt
    let systemPrompt = SCENARIO_PROMPTS[scenario] || SCENARIO_PROMPTS["custom"];

    // If it's a custom scenario, prepend the user's custom prompt
    if (scenario === "custom" && customPrompt) {
      systemPrompt = `Scenario: ${customPrompt}\n\n${systemPrompt}`;
    }

    // Create the full message array with system prompt
    const fullMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages,
    ];

    const result = streamText({
      model: openai("gpt-4o"),
      messages: fullMessages,
      temperature: 0.8,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error in chat API:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
