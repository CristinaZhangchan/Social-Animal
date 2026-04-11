import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

interface TranscriptEntry {
  speaker: string;
  text: string;
}

interface SpeakEvent {
  type: "avatar" | "user";
  action: "start" | "end";
  timestamp: number;
}

interface RhythmAnalysis {
  interruptionCount: number;
  avgResponseLatency: number;
  latencyFeedback: string | null;
  interruptionFeedback: string | null;
}

/**
 * Analyze rhythm metrics from speak events
 */
function analyzeRhythm(speakEvents: SpeakEvent[]): RhythmAnalysis {
  let interruptionCount = 0;
  const responseLatencies: number[] = [];

  // Find avatar speak end events and corresponding user speak start events
  let lastAvatarEnd: number | null = null;

  for (const event of speakEvents) {
    if (event.type === "avatar" && event.action === "end") {
      lastAvatarEnd = event.timestamp;
    }

    if (event.type === "user" && event.action === "start") {
      // Check for interruption: user started speaking before avatar finished
      const avatarSpeaking = speakEvents.some(
        (e) =>
          e.type === "avatar" &&
          e.action === "start" &&
          e.timestamp < event.timestamp &&
          !speakEvents.some(
            (end) =>
              end.type === "avatar" &&
              end.action === "end" &&
              end.timestamp > e.timestamp &&
              end.timestamp < event.timestamp
          )
      );

      if (avatarSpeaking) {
        interruptionCount++;
      }

      // Calculate response latency if there was a preceding avatar end
      if (lastAvatarEnd !== null) {
        const latency = (event.timestamp - lastAvatarEnd) / 1000; // Convert to seconds
        if (latency > 0 && latency < 30) {
          // Reasonable latency window
          responseLatencies.push(latency);
        }
      }
    }
  }

  const avgResponseLatency =
    responseLatencies.length > 0
      ? responseLatencies.reduce((a, b) => a + b, 0) / responseLatencies.length
      : 0;

  // Generate feedback based on thresholds
  let latencyFeedback: string | null = null;
  if (avgResponseLatency > 0) {
    if (avgResponseLatency < 0.5) {
      latencyFeedback =
        "Your responses were very quick. Consider pausing briefly to gather your thoughts before speaking.";
    } else if (avgResponseLatency > 4) {
      latencyFeedback =
        "Your response time was slow. Practice thinking on your feet to build confidence and fluency.";
    }
  }

  let interruptionFeedback: string | null = null;
  if (interruptionCount > 3) {
    interruptionFeedback =
      "You interrupted the other person multiple times. Practice active listening and waiting for natural pauses.";
  }

  return {
    interruptionCount,
    avgResponseLatency: Math.round(avgResponseLatency * 100) / 100,
    latencyFeedback,
    interruptionFeedback,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { transcript, scenario, speakEvents } = await req.json();

    if (!transcript || transcript.length === 0) {
      return NextResponse.json(
        { error: "No transcript provided" },
        { status: 400 }
      );
    }

    // Analyze rhythm if speak events are provided
    const rhythmAnalysis: RhythmAnalysis =
      speakEvents && Array.isArray(speakEvents)
        ? analyzeRhythm(speakEvents)
        : {
            interruptionCount: 0,
            avgResponseLatency: 0,
            latencyFeedback: null,
            interruptionFeedback: null,
          };

    // Format transcript for analysis
    const transcriptText = (transcript as TranscriptEntry[])
      .map((entry) => `${entry.speaker}: ${entry.text}`)
      .join("\n");

    // Use AI to analyze the conversation based on the Cues framework (Vanessa Van Edwards)
    const analysisPrompt = `You are an expert communication coach analyzing a practice conversation using the "Cues" framework by Vanessa Van Edwards. Charisma = Warmth + Competence. The scenario was: ${scenario}.

Transcript:
${transcriptText}

Analyze the user's performance (NOT the AI avatar's) across three cue categories and provide a detailed analysis in JSON format:

{
  "overallScore": <number 0-10, based on overall charisma balance of warmth + competence>,
  "visualCues": <number 0-10>,
  "vocalCues": <number 0-10>,
  "verbalCues": <number 0-10>,
  "encouragement": "<1-2 sentence personalized encouragement based on their performance — be specific, warm, and motivating. Examples: 'Great first step! Starting these conversations is the hardest part, and you showed real courage.' or 'Nice improvement in your confidence! Your directness is becoming a real strength.'>",
  "insights": [
    {
      "icon": "<emoji>",
      "title": "<short title>",
      "description": "<detailed description referencing specific moments from the conversation>",
      "type": "positive" or "improvement",
      "cueCategory": "visual" or "vocal" or "verbal"
    }
  ],
  "practiceExercises": [
    {
      "title": "<exercise title>",
      "description": "<detailed description referencing specific conversation moments>",
      "duration": "<estimated time>",
      "targetSkill": "<skill this exercise targets>",
      "steps": ["<step 1>", "<step 2>", "<step 3>"]
    }
  ]
}

SCORING GUIDELINES (based on Cues framework):

**Visual Cues** (score based on what can be inferred from the transcript about engagement):
- Warmth signals: engagement level, supportive responses, emotional openness
- Competence signals: confidence in assertions, decisive language vs. hedging

**Vocal Cues** (infer from transcript patterns):
- Warmth: emotional expression, use of interjections/affirmative sounds, mirroring
- Competence: filler words (um, uh, like, so), question inflection on statements, hedging language
- Pace: response length consistency, rushing vs. thoughtful responses

**Verbal Cues** (directly observable in transcript):
- Warmth: word choice warmth (encouraging, inclusive language), imitating partner's words, asking follow-up questions
- Competence: clarity, specificity, confident language (avoid "I think maybe", "sort of"), use of concrete examples
- Anti-charisma: pessimistic/uninteresting language, excessive self-deprecation, defensive language

IMPORTANT:
- Be HONEST with scores. If the user performed poorly, give a low score. Do NOT inflate scores.
- A short or empty conversation should score LOW (2-4 range).
- Reference SPECIFIC quotes from the transcript.
- The encouragement should be genuine and tailored to what the user actually did well or attempted.
- Provide 3-5 insights total, covering at least 2 of the 3 cue categories.
- Generate 2-3 specific exercises based on actual conversation weaknesses.`;

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: analysisPrompt,
      temperature: 0.7,
    });

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse analysis JSON");
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Add rhythm-based insights if applicable
    if (rhythmAnalysis.interruptionFeedback) {
      analysis.insights.push({
        icon: "🛑",
        title: "Interruption Pattern",
        description: rhythmAnalysis.interruptionFeedback,
        type: "improvement",
      });
    }

    if (rhythmAnalysis.latencyFeedback) {
      analysis.insights.push({
        icon: "⏱️",
        title: "Response Timing",
        description: rhythmAnalysis.latencyFeedback,
        type: "improvement",
      });
    }

    // Map new field names to what the frontend expects
    return NextResponse.json({
      overallScore: analysis.overallScore ?? 5,
      emotionalIntelligence: analysis.visualCues ?? analysis.emotionalIntelligence ?? 5,
      clarity: analysis.verbalCues ?? analysis.clarity ?? 5,
      pace: analysis.vocalCues ?? analysis.pace ?? 5,
      encouragement: analysis.encouragement || "",
      insights: analysis.insights || [],
      rhythmMetrics: {
        interruptionCount: rhythmAnalysis.interruptionCount,
        avgResponseLatency: rhythmAnalysis.avgResponseLatency,
      },
      practiceExercises: analysis.practiceExercises || [],
    });
  } catch (error) {
    console.error("Error in analysis API:", error);
    return NextResponse.json(
      { error: "Failed to analyze conversation" },
      { status: 500 }
    );
  }
}
