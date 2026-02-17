"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StepScenario } from "@/components/demo/StepScenario";
import { StepDetails } from "@/components/demo/StepDetails";
import { StepAvatar } from "@/components/demo/StepAvatar";
import { StepSettings } from "@/components/demo/StepSettings";
import { WizardStepper } from "@/components/demo/WizardStepper";
import { AVATARS } from "@/lib/constants/avatars";

export default function DemoPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [sessionData, setSessionData] = useState({
    // Step 1
    scenario: "",
    // Step 2
    title: "",
    description: "",
    goal: "",
    difficulty: "Medium" as "Easy" | "Medium" | "Hard",
    // Step 3
    avatarId: AVATARS[0].id,
    customName: "",
    customRole: "",
    customPersonality: "",
    avatarUrl: "", // Add this
    // Step 4
    duration: 5,
    autoWrap: true,
  });

  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const handleNext = (data: Partial<typeof sessionData>) => {
    const updatedData = { ...sessionData, ...data };
    setSessionData(updatedData);

    if (step < 4) {
      setStep(step + 1);
    } else {
      // Final step: Start Session
      startSession(updatedData);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const startSession = (finalData: typeof sessionData) => {
    // Construct query params
    const params = new URLSearchParams();
    params.append("scenario", "custom"); // Internal flag
    params.append("lang", selectedLanguage);

    // Combine scenario and description for the prompt
    // If title is set, maybe preface it? 
    // "Scenario: [Title]. Situation: [Description]. Goal: [Goal]."
    let combinedPrompt = `Scenario: ${finalData.title || "Custom Practice"}.\nSituation: ${finalData.description || finalData.scenario}\n`;
    if (finalData.goal) combinedPrompt += `Goal: ${finalData.goal}\n`;
    if (finalData.difficulty) combinedPrompt += `Difficulty: ${finalData.difficulty}\n`;

    // Avatar details
    const avatar = AVATARS.find(a => a.id === finalData.avatarId);

    // Use custom details if provided, else fallback to avatar defaults (though typically they are pre-filled in Step 3)
    const avatarName = finalData.customName || avatar?.name || "AI";
    const avatarRole = finalData.customRole || avatar?.role || "Conversation Partner";
    const avatarPersona = finalData.customPersonality || avatar?.description || "";

    combinedPrompt += `\nYour Role: You are ${avatarName}, ${avatarRole}. ${avatarPersona}`;

    params.append("prompt", combinedPrompt);

    // Pass other config (duration, autoWrap) - currently the session page might not support these 
    // but we can pass them for future use or handled by a context
    params.append("duration", finalData.duration.toString());
    params.append("autoWrap", finalData.autoWrap.toString());

    // Avatar ID / Voice ID could be passed if the backend supports selecting specific avatars
    // Avatar ID / Voice ID could be passed if the backend supports selecting specific avatars
    // Avatar ID / Voice ID could be passed if the backend supports selecting specific avatars
    if (avatar) {
      params.append("avatarId", avatar.id);
      params.append("voiceId", avatar.voiceId);
    } else if (finalData.avatarId) {
      // HeyGen Avatar OR Custom Upload
      if (finalData.avatarId === "custom") {
        // Custom upload → use Talking Photo mode for lip sync
        params.append("avatarId", "custom");
        params.append("api", "talking-photo");
      } else {
        // HeyGen Avatar ID
        params.append("avatarId", finalData.avatarId);
        params.append("api", "heygen");
      }
    }

    if (finalData.avatarUrl) {
      params.append("avatarUrl", finalData.avatarUrl);
    }

    router.push(`/demo/session?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-0 w-96 h-96 rounded-full blur-[120px] opacity-20"
          style={{ background: 'radial-gradient(circle, hsl(262 83% 58%) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full blur-[100px] opacity-15"
          style={{ background: 'radial-gradient(circle, hsl(15 85% 60%) 0%, transparent 70%)' }}
        />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <Link
            href="/"
            className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="text-xl">←</span>
            <span className="text-2xl font-bold text-primary">
              SocialAnimal
            </span>
          </Link>
          <ThemeToggle />
        </header>

        {/* Wizard Progress */}
        <div className="max-w-3xl mx-auto w-full mb-4">
          <WizardStepper currentStep={step} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full">
          {step === 1 && (
            <StepScenario
              initialScenario={sessionData.scenario}
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              onNext={(scenario) => handleNext({ scenario, description: scenario })} // Pre-fill description with scenario text
            />
          )}

          {step === 2 && (
            <StepDetails
              initialData={{
                title: sessionData.title,
                description: sessionData.description,
                goal: sessionData.goal,
                difficulty: sessionData.difficulty,
              }}
              onNext={(data) => handleNext(data)}
              onBack={handleBack}
            />
          )}

          {step === 3 && (
            <StepAvatar
              initialData={{
                avatarId: sessionData.avatarId,
                customName: sessionData.customName,
                customRole: sessionData.customRole,
                customPersonality: sessionData.customPersonality,
                avatarUrl: sessionData.avatarUrl,
              }}
              onNext={(data) => handleNext(data)}
              onBack={handleBack}
            />
          )}

          {step === 4 && (
            <StepSettings
              initialData={{
                duration: sessionData.duration,
                autoWrap: sessionData.autoWrap,
              }}
              onNext={(data) => handleNext(data)}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </main>
  );
}
