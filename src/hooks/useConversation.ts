import { useState, useCallback } from "react";
import { useChat } from "@ai-sdk/react";

export interface TranscriptEntry {
  speaker: string;
  text: string;
}

export function useConversation(
  scenario: string,
  customPrompt?: string,
  avatarSpeak?: (text: string) => Promise<void>
) {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: string; parts: Array<{ type: string; text: string }> }>>([]);

  const transcribeAudio = useCallback(async (audioBlob: Blob): Promise<string> => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    const response = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Transcription failed");
    }

    const data = await response.json();
    return data.text;
  }, []);

  const speakText = useCallback(async (text: string): Promise<void> => {
    const response = await fetch("/api/speak", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error("TTS failed");
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = reject;
      audio.play();
    });
  }, []);

  const processUserInput = useCallback(
    async (audioBlob: Blob) => {
      setIsProcessing(true);

      try {
        // 1. Transcribe user's audio
        const userText = await transcribeAudio(audioBlob);

        // Add user's message to transcript
        setTranscript((prev) => [...prev, { speaker: "You", text: userText }]);

        // 2. Get AI response from our API
        // Convert messages from parts format to content format for API
        const apiMessages = messages.map(msg => ({
          role: msg.role,
          content: msg.parts[0].text
        }));

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              ...apiMessages,
              { role: "user", content: userText },
            ],
            scenario,
            customPrompt,
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error("Failed to get AI response");
        }

        // Read the stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let aiResponse = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          aiResponse += decoder.decode(value, { stream: true });
        }

        console.log("✅ AI Response received:", aiResponse);

        // Update messages
        const newMessages = [
          ...messages,
          { role: "user", parts: [{ type: "text", text: userText }] },
          { role: "assistant", parts: [{ type: "text", text: aiResponse }] },
        ];
        setMessages(newMessages);

        // Add AI response to transcript
        setTranscript((prev) => [...prev, { speaker: "AI", text: aiResponse }]);
        console.log("✅ Transcript updated with AI response");

        // Use HeyGen avatar to speak if available, otherwise fallback to TTS
        if (aiResponse && aiResponse.trim().length > 0) {
          try {
            if (avatarSpeak) {
              // Use HeyGen avatar to speak
              console.log("Using HeyGen avatar to speak");
              await avatarSpeak(aiResponse);
            } else {
              // Fallback to TTS
              console.log("Falling back to TTS");
              await speakText(aiResponse);
            }
          } catch (speakError) {
            console.error("Speech failed, but conversation continues:", speakError);
            // Continue without audio - user can still see the text
          }
        } else {
          console.log("⚠️ AI response is empty, skipping speech");
        }
      } catch (error) {
        console.error("Error processing input:", error);
        alert("Failed to process your message. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    },
    [messages, scenario, customPrompt, transcribeAudio, speakText, avatarSpeak]
  );

  return {
    transcript,
    setTranscript,
    isProcessing,
    messages,
    processUserInput,
  };
}
