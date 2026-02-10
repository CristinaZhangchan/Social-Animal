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

    // Use AI to analyze the conversation
    const analysisPrompt = `You are a communication coach analyzing a practice conversation. The scenario was: ${scenario}.

Transcript:
${transcriptText}

Provide a detailed analysis in JSON format with the following structure:
{
  "overallScore": <number 0-10>,
  "emotionalIntelligence": <number 0-10>,
  "clarity": <number 0-10>,
  "pace": <number 0-10>,
  "insights": [
    {
      "icon": "<emoji>",
      "title": "<short title>",
      "description": "<detailed description>",
      "type": "positive" or "improvement"
    }
  ],
  "practiceExercises": [
    {
      "title": "<exercise title>",
      "description": "<detailed description referencing specific conversation moments>",
      "duration": "<estimated time, e.g., '5 minutes'>",
      "targetSkill": "<skill this exercise targets>",
      "steps": ["<step 1>", "<step 2>", "<step 3>"]
    }
  ]
}

IMPORTANT GUIDELINES:

For insights:
- Provide 3-5 actionable insights
- Be specific and encouraging but honest
- Reference specific quotes or moments from the conversation

For practiceExercises:
1. Generate 2-3 SPECIFIC exercises based on the ACTUAL conversation content
2. Each exercise should address a specific weakness or reinforce a strength shown in the transcript
3. Reference specific moments from the conversation when explaining why this exercise is recommended
4. Include concrete, actionable steps
5. Do NOT give generic advice - make it specific to what the user said or how they responded

Example of a GOOD exercise (specific to conversation):
{
  "title": "The Pause-and-Breathe Technique",
  "description": "In your conversation, you rushed to answer when asked about your biggest weakness. Practice taking a 2-second pause before answering challenging questions.",
  "duration": "10 minutes daily",
  "targetSkill": "Response timing and composure",
  "steps": [
    "Record yourself answering 5 difficult interview questions",
    "After each question, count to 2 silently before speaking",
    "Review recordings - your pauses should feel natural, not awkward"
  ]
}

Example of a BAD exercise (too generic - avoid this):
{
  "title": "Practice speaking clearly",
  "description": "Work on your clarity",
  "steps": ["Speak more clearly"]
}`;

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

    // Include rhythm metrics in response
    return NextResponse.json({
      ...analysis,
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
