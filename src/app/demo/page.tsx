"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SUPPORTED_LANGUAGES,
  getLanguageByCode,
  getLanguageFlag,
} from "@/lib/constants/languages";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";

export default function DemoPage() {
  const router = useRouter();
  const [customScenario, setCustomScenario] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartPractice = async () => {
    if (!customScenario.trim()) return;
    setIsLoading(true);
    router.push(
      `/demo/session?scenario=custom&prompt=${encodeURIComponent(customScenario)}&lang=${selectedLanguage}`
    );
  };

  const selectedLang = getLanguageByCode(selectedLanguage);
  const { theme } = useTheme();

  return (
    <main
      className={`min-h-screen relative overflow-hidden ${
        theme === "dark" ? "bg-sa-bg-primary bg-grid" : ""
      }`}
    >
      {/* Ambient glow effects - only in dark mode */}
      {theme === "dark" && (
        <>
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-sa-accent-cyan/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-sa-accent-purple/10 rounded-full blur-3xl" />
        </>
      )}

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <Link
            href="/"
            className={`flex items-center gap-3 transition-colors ${
              theme === "dark"
                ? "text-sa-text-secondary hover:text-white"
                : "text-light-secondary hover:text-light-primary"
            }`}
          >
            <span className="text-xl">&larr;</span>
            <span
              className={`text-2xl font-bold ${
                theme === "dark"
                  ? "text-white text-glow-cyan"
                  : "text-light-primary text-glow-violet"
              }`}
            >
              SocialAnimal
            </span>
          </Link>
          <ThemeToggle />
        </header>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div
              className={`inline-block mb-4 px-4 py-1 text-sm font-medium ${
                theme === "dark"
                  ? "bg-sa-accent-cyan/20 border border-sa-accent-cyan/40 text-sa-accent-cyan clip-chamfer"
                  : "badge-light"
              }`}
            >
              CUSTOM SCENARIO
            </div>
            <h1
              className={`text-4xl md:text-5xl font-bold mb-4 ${
                theme === "dark" ? "text-white" : "text-light-primary"
              }`}
            >
              Describe Your Scene
            </h1>
            <p
              className={`text-lg max-w-xl mx-auto ${
                theme === "dark" ? "text-sa-text-secondary" : "text-light-secondary"
              }`}
            >
              Tell us the situation you want to practice. Our AI will create a
              realistic avatar to match your scenario.
            </p>
          </div>

          {/* Custom Scenario Input */}
          <div
            className={`p-8 relative ${
              theme === "dark"
                ? "bg-sa-bg-secondary border border-sa-accent-cyan/30 clip-chamfer-lg"
                : "glass-card"
            }`}
          >
            {/* Corner decorations - only in dark mode */}
            {theme === "dark" && (
              <>
                <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-sa-accent-cyan/50" />
                <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-sa-accent-cyan/50" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-sa-accent-cyan/50" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-sa-accent-cyan/50" />
              </>
            )}

            {/* Language Selection */}
            <div className="mb-6">
              <label
                className={`block text-sm font-medium mb-2 ${
                  theme === "dark" ? "text-sa-text-secondary" : "text-light-secondary"
                }`}
              >
                Practice Language
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className={`w-full sm:w-auto min-w-[240px] px-4 py-3 text-left flex items-center justify-between gap-3 transition-colors ${
                    theme === "dark"
                      ? "bg-sa-bg-tertiary border border-sa-accent-purple/30 text-white hover:border-sa-accent-purple/50 clip-chamfer"
                      : "input-light text-light-primary"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">
                      {getLanguageFlag(selectedLanguage)}
                    </span>
                    <span>{selectedLang?.name}</span>
                    <span
                      className={`text-sm ${
                        theme === "dark" ? "text-sa-text-muted" : "text-light-secondary"
                      }`}
                    >
                      ({selectedLang?.nativeName})
                    </span>
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isLanguageDropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isLanguageDropdownOpen && (
                  <div
                    className={`absolute z-50 mt-2 w-full sm:w-80 max-h-60 overflow-y-auto shadow-lg ${
                      theme === "dark"
                        ? "bg-sa-bg-tertiary border border-sa-accent-purple/30 clip-chamfer"
                        : "bg-white rounded-xl border border-gray-200"
                    }`}
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setSelectedLanguage(lang.code);
                          setIsLanguageDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left flex items-center gap-3 transition-colors ${
                          theme === "dark"
                            ? selectedLanguage === lang.code
                              ? "bg-sa-accent-purple/20 text-sa-accent-purple"
                              : "text-white hover:bg-sa-accent-purple/10"
                            : selectedLanguage === lang.code
                              ? "bg-light-accent/10 text-light-accent"
                              : "text-light-primary hover:bg-gray-100"
                        }`}
                      >
                        <span className="text-lg">{getLanguageFlag(lang.code)}</span>
                        <span>{lang.name}</span>
                        <span
                          className={`text-sm ${
                            theme === "dark" ? "text-sa-text-muted" : "text-light-secondary"
                          }`}
                        >
                          ({lang.nativeName})
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p
                className={`mt-2 text-xs ${
                  theme === "dark" ? "text-sa-text-muted" : "text-light-secondary"
                }`}
              >
                The avatar will respond in this language
              </p>
            </div>

            <label
              className={`block text-lg font-semibold mb-4 ${
                theme === "dark" ? "text-white" : "text-light-primary"
              }`}
            >
              What scenario do you want to practice?
            </label>

            <textarea
              value={customScenario}
              onChange={(e) => setCustomScenario(e.target.value)}
              placeholder="e.g., I'm interviewing at Google, and the interviewer is a serious HR manager..."
              className={`w-full px-5 py-4 resize-none transition-all ${
                theme === "dark"
                  ? "bg-sa-bg-tertiary border border-sa-accent-cyan/20 text-white placeholder-sa-text-muted focus:border-sa-accent-cyan focus:outline-none focus:shadow-neon-cyan clip-chamfer"
                  : "input-light"
              }`}
              rows={5}
            />

            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleStartPractice}
                disabled={!customScenario.trim() || isLoading}
                className={`flex-1 px-6 py-4 font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  theme === "dark"
                    ? "bg-sa-accent-cyan text-sa-bg-primary hover:shadow-neon-cyan-strong clip-chamfer"
                    : "btn-light-primary"
                }`}
              >
                {isLoading ? (
                  <>
                    <span
                      className={`w-5 h-5 border-2 rounded-full animate-spin ${
                        theme === "dark"
                          ? "border-sa-bg-primary/30 border-t-sa-bg-primary"
                          : "border-light-accent/30 border-t-light-accent"
                      }`}
                    />
                    Initializing...
                  </>
                ) : (
                  "Start Practice"
                )}
              </button>
            </div>

            {/* Example scenarios */}
            <div
              className={`mt-8 pt-6 border-t ${
                theme === "dark" ? "border-sa-accent-cyan/10" : "border-gray-200"
              }`}
            >
              <p
                className={`text-sm mb-3 ${
                  theme === "dark" ? "text-sa-text-muted" : "text-light-secondary"
                }`}
              >
                Example scenarios:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Job interview for a software engineer position",
                  "Negotiating a raise with my manager",
                  "Networking at a tech conference",
                  "Handling a difficult customer complaint",
                ].map((example) => (
                  <button
                    key={example}
                    onClick={() => setCustomScenario(example)}
                    className={`text-xs px-3 py-1.5 transition-colors ${
                      theme === "dark"
                        ? "bg-sa-bg-tertiary border border-sa-accent-purple/20 text-sa-text-secondary hover:text-white hover:border-sa-accent-purple/50 clip-chamfer"
                        : "bg-white border border-gray-200 text-light-secondary hover:text-light-accent hover:border-light-accent/50 rounded-lg"
                    }`}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Info note */}
          <div className="mt-8 text-center">
            <p
              className={`text-sm ${
                theme === "dark" ? "text-sa-text-muted" : "text-light-secondary"
              }`}
            >
              The avatar will wait for you to speak first. Take your time to
              start the conversation.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
