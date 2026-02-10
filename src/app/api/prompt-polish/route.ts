import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { getLanguageName } from "@/lib/constants/languages";

/**
 * POST /api/prompt-polish
 *
 * Takes a user's simple scenario description and expands it into
 * a structured configuration for LiveAvatar.
 *
 * Input: { userInput: string, language?: string }
 * Output: { persona: string, knowledge: string, instructions: string, combinedPrompt: string, language: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { userInput, language = "en" } = await req.json();

    if (!userInput || typeof userInput !== "string") {
      return NextResponse.json(
        { error: "userInput is required and must be a string" },
        { status: 400 }
      );
    }

    const languageName = getLanguageName(language);

    const systemPrompt = `You are a scenario designer for an AI social practice platform. Given a brief user description of a scenario they want to practice, expand it into a structured avatar configuration.

IMPORTANT: The user has selected "${languageName}" as their practice language.
ALL content you generate (persona, knowledge, instructions, and the avatar's responses during conversation) MUST be in ${languageName}.

You must output valid JSON with exactly this structure:
{
  "persona": "A detailed description of who the avatar is (IN ${languageName.toUpperCase()}): their name, role, personality traits, communication style, and relevant background",
  "knowledge": "Facts, context, and background information (IN ${languageName.toUpperCase()}) the avatar should know about the scenario",
  "instructions": "Specific behavioral guidelines (IN ${languageName.toUpperCase()}) for the avatar: how to respond, conversation goals, tone, and constraints"
}

Guidelines:
- Create a realistic, believable character appropriate for ${languageName}-speaking context
- The persona should match both the scenario and cultural context
- Use culturally appropriate names and references for ${languageName}-speaking regions
- Knowledge should include relevant domain information
- Instructions should guide natural conversation flow
- Keep responses concise (2-3 sentences per turn)
- The avatar MUST speak and respond ONLY in ${languageName}

Example for Chinese:
If language is Chinese and input is "Job interview at a tech company":
{
  "persona": "陈晓，某知名科技公司资深人力资源经理。从业10年，专业但平易近人。重视沟通技巧和团队协作精神。",
  "knowledge": "这是一轮技术岗位的初面。公司看重问题解决能力和团队合作。常见问题包括项目经验、技术能力和行为面试题。",
  "instructions": "以专业的态度进行面试。一次只问一个问题，认真倾听回答，并追问相关细节。保持鼓励但专业的态度。每次回复控制在2-3句话。请先让候选人做自我介绍。"
}

Example for English:
If language is English and input is "Job interview at a tech company":
{
  "persona": "Sarah Chen, Senior Technical Recruiter at a Fortune 500 tech company. Professional yet approachable, with 8 years of experience in tech hiring. Values clear communication and authentic responses.",
  "knowledge": "This is a first-round screening interview. The company values problem-solving skills, teamwork, and cultural fit. Common interview topics include past experience, technical skills, and behavioral questions.",
  "instructions": "Conduct a professional interview. Ask one question at a time, listen to responses, and ask relevant follow-ups. Be encouraging but maintain professional boundaries. Keep responses to 2-3 sentences. Start by asking the candidate to introduce themselves."
}`;

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: `User's scenario description: "${userInput}"

Target language: ${languageName}

Generate the structured avatar configuration in ${languageName}:`,
      temperature: 0.7,
    });

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse structured output from LLM");
    }

    const structured = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!structured.persona || !structured.knowledge || !structured.instructions) {
      throw new Error("Missing required fields in structured output");
    }

    // Language-specific instruction suffix
    const languageInstruction =
      language === "en"
        ? "Remember to keep your responses natural and conversational, typically 2-3 sentences. Wait for the user to speak first."
        : `Remember: You MUST respond ONLY in ${languageName}. Keep responses natural and conversational (2-3 sentences). Wait for the user to speak first.`;

    // Combine into a single prompt for LiveAvatar
    const combinedPrompt = `${structured.persona}

Background Knowledge:
${structured.knowledge}

Instructions:
${structured.instructions}

${languageInstruction}`;

    // print the combined prompt for debugging
    console.log("Combined Prompt:", combinedPrompt);
    console.log("Target Language:", languageName);

    return NextResponse.json({
      persona: structured.persona,
      knowledge: structured.knowledge,
      instructions: structured.instructions,
      combinedPrompt,
      language: languageName,
    });
  } catch (error) {
    console.error("Error in prompt-polish API:", error);
    return NextResponse.json(
      {
        error: "Failed to polish prompt",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
