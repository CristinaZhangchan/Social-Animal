"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";

export default function LandingPage() {
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
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-sa-accent-cyan/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sa-accent-purple/10 rounded-full blur-3xl" />
        </>
      )}

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-20">
          <h1
            className={`text-3xl font-bold ${
              theme === "dark"
                ? "text-white text-glow-cyan"
                : "text-light-primary text-glow-violet"
            }`}
          >
            SocialAnimal
          </h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div
              className={`flex items-center gap-2 px-4 py-2 ${
                theme === "dark"
                  ? "bg-sa-bg-secondary border border-sa-accent-cyan/30 clip-chamfer"
                  : "glass-card-sm"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  theme === "dark" ? "bg-sa-accent-cyan" : "bg-light-accent"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-sa-accent-cyan" : "text-light-accent"
                }`}
              >
                ONLINE
              </span>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center">
          <div
            className={`inline-block mb-6 px-4 py-1 text-sm font-medium ${
              theme === "dark"
                ? "bg-sa-accent-purple/20 border border-sa-accent-purple/40 text-sa-accent-purple clip-chamfer"
                : "glass-card-sm text-light-accent"
            }`}
          >
            AI-POWERED SOCIAL TRAINING
          </div>

          <h2
            className={`text-5xl md:text-7xl font-bold mb-6 leading-tight ${
              theme === "dark" ? "text-white" : "text-light-primary"
            }`}
          >
            Master Your
            <br />
            <span
              className={
                theme === "dark"
                  ? "text-glow-cyan text-sa-accent-cyan"
                  : "text-glow-violet text-light-accent"
              }
            >
              Social Skills
            </span>
          </h2>

          <p
            className={`text-xl md:text-2xl mb-12 max-w-2xl mx-auto ${
              theme === "dark" ? "text-sa-text-secondary" : "text-light-secondary"
            }`}
          >
            Practice real conversations with AI avatars. Describe any scenario
            and get immersive, personalized feedback.
          </p>

          <Link
            href="/demo"
            className={`inline-block px-8 py-4 text-lg font-bold transition-all transform hover:scale-105 ${
              theme === "dark"
                ? "bg-sa-accent-cyan text-sa-bg-primary hover:shadow-neon-cyan-strong clip-chamfer"
                : "btn-light-primary rounded-xl"
            }`}
          >
            Start Practice
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="mt-32 grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div
            className={`p-8 relative group transition-colors ${
              theme === "dark"
                ? "bg-sa-bg-secondary border border-sa-accent-cyan/20 text-white hover:border-sa-accent-cyan/50 clip-chamfer-lg"
                : "glass-card hover:shadow-accent-violet"
            }`}
          >
            {theme === "dark" && (
              <div className="absolute top-0 right-0 w-20 h-20 bg-sa-accent-cyan/5 blur-2xl group-hover:bg-sa-accent-cyan/10 transition-colors" />
            )}
            <div
              className={`text-4xl mb-4 ${
                theme === "dark" ? "text-sa-accent-cyan" : "text-light-accent"
              }`}
            >
              01
            </div>
            <h3
              className={`text-xl font-bold mb-3 ${
                theme === "dark" ? "text-white" : "text-light-primary"
              }`}
            >
              Immersive Practice
            </h3>
            <p
              className={
                theme === "dark" ? "text-sa-text-secondary" : "text-light-secondary"
              }
            >
              Interact with lifelike AI avatars. You describe the scene, they
              bring it to life.
            </p>
          </div>

          <div
            className={`p-8 relative group transition-colors ${
              theme === "dark"
                ? "bg-sa-bg-secondary border border-sa-accent-purple/20 text-white hover:border-sa-accent-purple/50 clip-chamfer-lg"
                : "glass-card hover:shadow-accent-violet"
            }`}
          >
            {theme === "dark" && (
              <div className="absolute top-0 right-0 w-20 h-20 bg-sa-accent-purple/5 blur-2xl group-hover:bg-sa-accent-purple/10 transition-colors" />
            )}
            <div
              className={`text-4xl mb-4 ${
                theme === "dark" ? "text-sa-accent-purple" : "text-purple-500"
              }`}
            >
              02
            </div>
            <h3
              className={`text-xl font-bold mb-3 ${
                theme === "dark" ? "text-white" : "text-light-primary"
              }`}
            >
              Real-time Feedback
            </h3>
            <p
              className={
                theme === "dark" ? "text-sa-text-secondary" : "text-light-secondary"
              }
            >
              Get instant analysis on your response timing, interruptions, and
              communication style.
            </p>
          </div>

          <div
            className={`p-8 relative group transition-colors ${
              theme === "dark"
                ? "bg-sa-bg-secondary border border-sa-accent-cyan/20 text-white hover:border-sa-accent-cyan/50 clip-chamfer-lg"
                : "glass-card hover:shadow-accent-violet"
            }`}
          >
            {theme === "dark" && (
              <div className="absolute top-0 right-0 w-20 h-20 bg-sa-accent-cyan/5 blur-2xl group-hover:bg-sa-accent-cyan/10 transition-colors" />
            )}
            <div
              className={`text-4xl mb-4 ${
                theme === "dark" ? "text-sa-accent-cyan" : "text-light-accent"
              }`}
            >
              03
            </div>
            <h3
              className={`text-xl font-bold mb-3 ${
                theme === "dark" ? "text-white" : "text-light-primary"
              }`}
            >
              Any Scenario
            </h3>
            <p
              className={
                theme === "dark" ? "text-sa-text-secondary" : "text-light-secondary"
              }
            >
              Job interviews, sales pitches, difficult conversations — practice
              what matters to you.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-24 text-center">
          <p
            className={`text-sm ${
              theme === "dark" ? "text-sa-text-muted" : "text-light-secondary"
            }`}
          >
            No sign-up required. Start practicing in seconds.
          </p>
        </div>
      </div>
    </main>
  );
}
