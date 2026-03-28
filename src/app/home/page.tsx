"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { buildTransitionHref, pushWithTransition } from "@/lib/navigation";
import Logo from "@/components/Logo";

function ArrowIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 12H19M19 12L13 6M19 12L13 18"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      className="h-[30px] w-[30px]"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [customScenario, setCustomScenario] = useState("");

  const handleCustomSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextScenario = customScenario.trim();
    if (!nextScenario) return;

    const params = new URLSearchParams();
    params.set("source", "home-custom");
    params.set("stage", "details");
    params.set("title", nextScenario);
    params.set("description", nextScenario);

    router.push(buildTransitionHref(`/demo?${params.toString()}`));
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5ebe2]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(-57deg, rgba(245,235,226,0.5) 1%, rgba(248,223,201,0.5) 99%)",
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center px-6 pb-20 pt-16 lg:px-10 lg:pt-20">
        <div className="mb-24 lg:mb-28">
          <Logo collapsed size="lg" />
        </div>

        <div className="flex w-full flex-1 flex-col items-center justify-center">
          <h1
            className="max-w-[982px] text-center text-[#28020d]"
            style={{
              fontFamily:
                "'FONTSPRING DEMO - Fedro SemBd', 'Libre Baskerville', Georgia, serif",
              fontSize: "clamp(42px, 4.2vw, 60px)",
              lineHeight: "0.94",
              letterSpacing: "-2.4px",
            }}
          >
            What kind of conversation would you like to practice?
          </h1>

          <form
            onSubmit={handleCustomSubmit}
            className="mt-14 w-full max-w-[898px]"
          >
            <div className="relative">
              <input
                type="text"
                value={customScenario}
                onChange={(event) => setCustomScenario(event.target.value)}
                placeholder="Describe your scenario..."
                className="sa-glass-input-hero w-full pr-[190px]"
                style={{ mixBlendMode: "multiply" }}
              />
              <button
                type="submit"
                disabled={!customScenario.trim()}
                className="absolute right-[17px] top-1/2 flex h-[70px] w-[140px] -translate-y-1/2 items-center justify-center rounded-[35px] bg-[#28020d] text-[#f5ebe2] transition-all hover:translate-y-[calc(-50%-2px)] hover:shadow-lg disabled:opacity-40"
                aria-label="Continue to scenario details"
              >
                <ArrowIcon />
              </button>
            </div>
          </form>
        </div>

        <button
          type="button"
          onClick={() => router.push("/demo?entry=home-arrow")}
          className="mt-16 flex flex-col items-center gap-5 text-[#28020d] transition-opacity hover:opacity-80"
        >
          <span className="font-sans text-[24px] underline underline-offset-4 lg:text-[28px]">
            Or Try One Of These
          </span>
          <span className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#28020d] text-[#f5ebe2]">
            <ChevronDownIcon />
          </span>
        </button>
      </div>
    </main>
  );
}
