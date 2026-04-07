"use client";

import type { ReactNode } from "react";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buildTransitionHref, pushWithTransition } from "@/lib/navigation";
import SceneTransition from "@/components/SceneTransition";
import { cn } from "@/lib/utils";
import type {
  LiveAvatarCatalogResponse,
} from "@/lib/liveavatar/catalog";
import Logo from "@/components/Logo";
import {
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  Clock,
  Eye,
  MessageSquareText,
  Pencil,
  User,
} from "lucide-react";

type DemoStage = "scenario" | "details" | "avatar" | "preview";
type PreviewBackTarget = "scenario" | "details" | "avatar";

interface ScenarioChoice {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  catalogMatch?: string;
}

const SCENARIO_CHOICES: ScenarioChoice[] = [
  {
    id: "restaurant",
    title: "Ordering at a restaurant",
    description:
      "Learn how to order food, ask about the menu, and handle small talk with staff.",
    durationMinutes: 3,
  },
  {
    id: "networking",
    title: "Networking at an event",
    description:
      "Start conversations, talk about work, and exchange contact information.",
    durationMinutes: 2,
    catalogMatch: "networking",
  },
  {
    id: "salary",
    title: "Tough salary negotiation",
    description:
      "Practice negotiating your salary confidently while handling pushback from your manager.",
    durationMinutes: 5,
    catalogMatch: "salary",
  },
];

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9 5v4l2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function buildCustomModeKey(searchParams: ReturnType<typeof useSearchParams>) {
  const mode = searchParams.get("mode");
  const source = searchParams.get("source");
  const stage = searchParams.get("stage");
  const title = searchParams.get("title");
  const description = searchParams.get("description");

  if (mode !== "custom" && !(source === "home-custom" && stage === "details")) {
    return "";
  }

  return `${mode ?? source ?? ""}:${title ?? ""}:${description ?? ""}`;
}

function buildPreviewModeKey(searchParams: ReturnType<typeof useSearchParams>) {
  const source = searchParams.get("source");
  const preview = searchParams.get("preview");
  const title = searchParams.get("title");
  const description = searchParams.get("description");
  const duration = searchParams.get("duration");
  const avatarId = searchParams.get("avatarId");

  if (preview !== "1" || (source !== "home-card" && source !== "home-custom")) {
    return "";
  }

  return `${source}:${preview}:${title ?? ""}:${description ?? ""}:${duration ?? ""}:${avatarId ?? ""}`;
}

function DemoPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customModeKey = buildCustomModeKey(searchParams);
  const previewModeKey = buildPreviewModeKey(searchParams);
  const launchSource = searchParams.get("source");
  const initialTitle = searchParams.get("title")?.trim() ?? "";
  const initialDescription = searchParams.get("description")?.trim() ?? "";
  const initialAvatarId = searchParams.get("avatarId")?.trim() ?? "";
  const initialDuration = Number.parseInt(searchParams.get("duration") ?? "5", 10);
  const entryTransition = searchParams.get("entry");
  const initialStage: DemoStage = previewModeKey
    ? "preview"
    : customModeKey
      ? "details"
      : "scenario";

  const [stage, setStage] = useState<DemoStage>(initialStage);
  const [isArrowEntryAnimating, setIsArrowEntryAnimating] = useState(
    entryTransition === "home-arrow" && initialStage === "scenario"
  );
  const [isArrowExitAnimating, setIsArrowExitAnimating] = useState(false);
  const [previewBackTarget, setPreviewBackTarget] =
    useState<PreviewBackTarget>("scenario");
  const [returnToPreview, setReturnToPreview] = useState(
    previewModeKey.length > 0
  );

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [durationMinutes, setDurationMinutes] = useState(
    Number.isFinite(initialDuration) && initialDuration > 0 ? initialDuration : 5
  );

  const [catalog, setCatalog] = useState<LiveAvatarCatalogResponse | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [avatarId, setAvatarId] = useState(initialAvatarId);
  const [partnerName, setPartnerName] = useState("");
  const [partnerRole, setPartnerRole] = useState("");
  const [partnerDescription, setPartnerDescription] = useState("");

  const autoFinish = true;

  const allAvatars = useMemo(() => catalog?.avatars ?? [], [catalog?.avatars]);
  const featuredAvatars = useMemo(
    () => catalog?.featured ?? [],
    [catalog?.featured]
  );
  const displayAvatars = useMemo(
    () => (featuredAvatars.length > 0 ? featuredAvatars : allAvatars).slice(0, 4),
    [allAvatars, featuredAvatars]
  );
  const defaultAvatar = displayAvatars[0] ?? allAvatars[0] ?? null;
  const selectedAvatar =
    allAvatars.find((avatar) => avatar.id === avatarId) ?? defaultAvatar;

  const applyAvatar = useCallback(
    (nextAvatarId: string) => {
      const nextAvatar =
        allAvatars.find((avatar) => avatar.id === nextAvatarId) ?? defaultAvatar;

      if (!nextAvatar) return;

      setAvatarId(nextAvatar.id);
      setPartnerName(nextAvatar.displayName);
      setPartnerRole(nextAvatar.role);
      setPartnerDescription(nextAvatar.summary);
    },
    [allAvatars, defaultAvatar]
  );

  const loadAvatarCatalog = useCallback(async () => {
    try {
      setCatalogError(null);
      const response = await fetch("/api/liveavatar/avatars");
      if (!response.ok) {
        throw new Error("Failed to load LiveAvatar avatars");
      }

      const data = (await response.json()) as LiveAvatarCatalogResponse;
      setCatalog(data);
    } catch (error) {
      console.error("Failed to load demo avatar catalog", error);
      setCatalogError(
        error instanceof Error ? error.message : "Failed to load avatars"
      );
    }
  }, []);

  useEffect(() => {
    if (!isArrowEntryAnimating) return;

    const frame = window.requestAnimationFrame(() => {
      setIsArrowEntryAnimating(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isArrowEntryAnimating]);

  useEffect(() => {
    loadAvatarCatalog();
  }, [loadAvatarCatalog]);

  useEffect(() => {
    if (!defaultAvatar || avatarId) return;
    applyAvatar(defaultAvatar.id);
  }, [applyAvatar, avatarId, defaultAvatar]);

  useEffect(() => {
    if (!customModeKey) return;
    // If preview mode is active (home-custom with preview=1), skip — handled by previewModeKey effect
    if (previewModeKey) return;

    const nextTitle = searchParams.get("title")?.trim() ?? "";
    const nextDescription = searchParams.get("description")?.trim() ?? "";

    setTitle(nextTitle);
    setDescription(nextDescription || nextTitle);
    setDurationMinutes(5);
    setPreviewBackTarget("details");
    setReturnToPreview(false);
    setStage("details");
  }, [customModeKey, previewModeKey, searchParams]);

  useEffect(() => {
    if (!previewModeKey) return;

    const nextTitle = searchParams.get("title")?.trim() ?? "";
    const nextDescription = searchParams.get("description")?.trim() ?? "";
    const nextDuration = Number.parseInt(searchParams.get("duration") ?? "5", 10);
    const nextAvatarId = searchParams.get("avatarId")?.trim() ?? "";

    setTitle(nextTitle);
    setDescription(nextDescription || nextTitle);
    setDurationMinutes(Number.isFinite(nextDuration) && nextDuration > 0 ? nextDuration : 5);
    setAvatarId(nextAvatarId);
    setPreviewBackTarget("scenario");
    setReturnToPreview(true);
    setStage("preview");
  }, [previewModeKey, searchParams]);

  const resetConversationPartner = useCallback(() => {
    if (defaultAvatar) {
      applyAvatar(defaultAvatar.id);
      return;
    }

    setAvatarId("");
    setPartnerName("");
    setPartnerRole("");
    setPartnerDescription("");
  }, [applyAvatar, defaultAvatar]);

  const isAvatarCatalogReady = allAvatars.length > 0;
  const sandboxNotice = useMemo(() => {
    if (!catalog?.sandboxEnabled) return null;
    return "Sandbox mode is enabled. Only the sandbox-approved avatar is currently available.";
  }, [catalog?.sandboxEnabled]);

  const scenarioCards = useMemo(() => {
    const homeCards = catalog?.homeCards ?? [];
    const cardAvatars = featuredAvatars.length > 0 ? featuredAvatars : allAvatars;

    return SCENARIO_CHOICES.map((scenario, index) => {
      const homeCardMatch = scenario.catalogMatch
        ? homeCards.find((card) =>
            card.title.toLowerCase().includes(scenario.catalogMatch!.toLowerCase())
          )
        : null;

      return {
        ...scenario,
        avatar: homeCardMatch?.avatar ?? cardAvatars[index] ?? defaultAvatar,
      };
    });
  }, [allAvatars, catalog?.homeCards, defaultAvatar, featuredAvatars]);

  const handleScenarioCardSelect = useCallback(
    (scenario: (typeof scenarioCards)[number]) => {
      setTitle(scenario.title);
      setDescription(scenario.description);
      setDurationMinutes(scenario.durationMinutes);

      if (scenario.avatar) {
        applyAvatar(scenario.avatar.id);
      } else {
        resetConversationPartner();
      }

      setPreviewBackTarget("scenario");
      setReturnToPreview(false);
      setStage("preview");
    },
    [applyAvatar, resetConversationPartner]
  );

  const [isStarting, setIsStarting] = useState(false);

  const handleStartSession = async () => {
    if (isStarting) return;
    setIsStarting(true);

    // Try to get mic + camera permissions (user gesture context)
    // If denied, proceed anyway — session still works (user just can't speak)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      stream.getTracks().forEach(t => t.stop());
    } catch {
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStream.getTracks().forEach(t => t.stop());
      } catch {
        // Permissions denied — proceed anyway, avatar will still work
      }
    }

    const params = new URLSearchParams();
    params.append("scenario", "custom");
    params.append("lang", "en");

    let prompt = `Scenario: ${title}.\nSituation: ${description}\n`;
    prompt += `\nYour Role: You are ${partnerName}, ${partnerRole}. ${partnerDescription}`;

    params.append("prompt", prompt);
    params.append("duration", durationMinutes.toString());
    params.append("autoWrap", autoFinish.toString());

    if (selectedAvatar) {
      params.append("avatarId", selectedAvatar.id);
      params.append("avatarPreviewUrl", selectedAvatar.previewUrl);
      params.append("avatarName", partnerName || selectedAvatar.displayName);
      params.append("avatarRole", partnerRole || selectedAvatar.role);

      if (selectedAvatar.voiceId) {
        params.append("voiceId", selectedAvatar.voiceId);
      }
    }

    // Navigate directly — no transition page (permissions already granted)
    router.push(`/demo/session?${params.toString()}`);
  };

  const handleBack = () => {
    if (stage === "details") {
      if (returnToPreview) {
        setReturnToPreview(false);
        setStage("preview");
        return;
      }

      if (launchSource === "home-custom" || customModeKey) {
        pushWithTransition(router, "/home");
        return;
      }

      setStage("scenario");
      return;
    }

    if (stage === "avatar") {
      setStage("details");
      return;
    }

    if (stage === "preview") {
      if (launchSource === "home-card" || launchSource === "home-custom") {
        pushWithTransition(router, "/home");
        return;
      }

      setStage(previewBackTarget);
    }
  };

  const renderCircleNavButton = (
    label: string,
    onClick: () => void,
    icon: ReactNode
  ) => (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="sa-icon-btn-lg bg-[#ead5c3] text-[#c8ad93] hover:bg-[#e4c9b2]"
    >
      {icon}
    </button>
  );

  const rightStageShellClass =
    "relative min-w-[920px] flex-1 self-stretch";
  const rightStagePanelClass =
    "absolute inset-0 overflow-hidden rounded-[30px] sa-glass-panel bg-[rgba(245,235,226,0.92)] sa-animate-scale-in";
  const rightStageGlow = (
    <>
      <div className="pointer-events-none absolute -right-[12%] top-[6%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,_rgba(237,215,198,0.78)_0%,_rgba(237,215,198,0)_72%)] opacity-80 blur-2xl" />
      <div className="pointer-events-none absolute left-[6%] top-[12%] h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.5)_0%,_rgba(255,255,255,0)_70%)] blur-xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[180px] bg-[linear-gradient(180deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0)_100%)]" />
    </>
  );

  if (stage === "scenario") {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#f5ebe2]">
        {/* Home page mirror — visible behind cards during exit slide */}
        <div className="absolute inset-0 z-0 rounded-[30px]">
          <div
            className="absolute inset-0 pointer-events-none rounded-[30px]"
            style={{
              background:
                "linear-gradient(-57deg, rgba(245,235,226,0.5) 1%, rgba(248,223,201,0.5) 99%)",
            }}
          />
          <div className="relative z-10 flex min-h-screen flex-col items-center px-6 pb-20 pt-16 lg:px-10 lg:pt-20">
            <div className="mb-24 lg:mb-28">
              <Logo collapsed size="lg" href={undefined} />
            </div>
            <div className="flex w-full flex-1 flex-col items-center justify-center">
              <h1
                className="max-w-[982px] text-center text-[#28020d]"
                style={{
                  fontFamily: "'FONTSPRING DEMO - Fedro SemBd', 'Libre Baskerville', Georgia, serif",
                  fontSize: "clamp(42px, 4.2vw, 60px)",
                  lineHeight: "60px",
                  letterSpacing: "-2.4px",
                }}
              >
                What kind of conversation would you like to practice?
              </h1>
              <div className="mt-14 w-full max-w-[898px]">
                <div className="relative">
                  <div className="sa-glass-input-hero w-full pr-[190px] flex items-center text-[#c8ad93] pl-10">
                    Describe your scenario...
                  </div>
                  <div className="absolute right-[17px] top-1/2 z-[1] flex h-[70px] w-[140px] -translate-y-1/2 items-center justify-center rounded-[35px] bg-[#28020d] text-[#f5ebe2] opacity-40">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-16 flex flex-col items-center gap-5 text-[#28020d]">
              <span className="font-sans text-[28px] capitalize underline underline-offset-4 tracking-[-0.84px]">
                Or Try One Of These
              </span>
              <span className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#28020d] text-[#f5ebe2]">
                <svg className="h-[30px] w-[30px]" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </div>
          </div>
        </div>

        {/* Scenario cards layer — slides up on entry, slides down on exit */}
        <div
          className="absolute inset-0 z-10 bg-[#f5ebe2] transition-transform duration-700 will-change-transform"
          style={{
            transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
            transform: isArrowEntryAnimating
              ? "translate3d(0, 100%, 0)"
              : isArrowExitAnimating
                ? "translate3d(0, 100%, 0)"
                : "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(-57deg, rgba(245,235,226,0.5) 1%, rgba(248,223,201,0.5) 99%)",
            }}
          />

          <div className="relative z-10 flex min-h-screen flex-col px-6 pb-8 pt-8 lg:px-11 lg:pt-6">
            <div className="flex justify-center pb-8 lg:pb-10">
              <button
                type="button"
                onClick={() => {
                  setIsArrowExitAnimating(true);
                  setTimeout(() => router.push("/home"), 700);
                }}
                className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#28020d] text-[#f5ebe2] shadow-[0_10px_25px_rgba(40,2,13,0.14)]"
                aria-label="Back to home"
              >
                <ChevronUp className="h-[28px] w-[28px]" />
              </button>
            </div>

            <div className="flex flex-1 items-center justify-center">
              <div className="grid w-full max-w-[1832px] grid-cols-1 gap-6 md:grid-cols-3 xl:gap-[46px]">
                {scenarioCards.map((scenario) => (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => handleScenarioCardSelect(scenario)}
                    className="group text-left"
                  >
                    <div
                      className={cn(
                        "relative flex min-h-[760px] flex-col items-start rounded-[45px] border-2 px-[26px] py-[26px] shadow-[0_18px_45px_rgba(244,224,209,0.28)] transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_24px_50px_rgba(40,2,13,0.08)] xl:min-h-[828px] xl:px-[30px] xl:py-[30px]",
                        scenario.id === "networking"
                          ? "border-[#f3e6db] bg-[#f7efe8]"
                          : "border-[#f3e6db] bg-[#f7efe8]"
                      )}
                    >
                      <div className="relative mb-[44px] h-[377px] w-full overflow-hidden rounded-[15px] bg-[#d4c5b8]">
                        {scenario.avatar ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={scenario.avatar.previewUrl}
                              alt={scenario.avatar.sourceName}
                              className="relative z-10 h-full w-full object-cover object-center"
                            />
                          </>
                        ) : null}
                        <div className="pointer-events-none absolute inset-0 rounded-[15px] ring-1 ring-inset ring-white/10" />
                      </div>

                      <h2
                        className="mb-5 max-w-[490px] text-[#28020d]"
                        style={{
                          fontFamily:
                            "'FONTSPRING DEMO - Fedro SemBd', 'Libre Baskerville', Georgia, serif",
                          fontSize: "clamp(48px, 3.6vw, 60px)",
                          lineHeight: "1",
                          letterSpacing: "-2.4px",
                        }}
                      >
                        {scenario.title}
                      </h2>

                      <p className="mb-10 max-w-[486px] flex-1 font-sans text-[20px] leading-[1.12] text-[#987c63] xl:text-[24px]">
                        {scenario.description}
                      </p>

                      <div className="inline-flex h-[85px] min-w-[185px] items-center justify-center gap-2 rounded-[43.75px] bg-[#b89a7e] px-8 text-[#f0dece] shadow-[0_4px_12px_rgba(160,130,100,0.25)]">
                        <ClockIcon className="h-[18px] w-[18px]" />
                        <span className="font-sans text-[24px] font-semibold">
                          {scenario.durationMinutes} Mins
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (stage === "details") {
    return (
      <main className="relative flex min-h-screen overflow-hidden bg-[#f5ebe2]">
        <div className="relative flex flex-1 flex-col justify-center bg-[#f5ebe2] px-[70px] py-20">
          <button
            type="button"
            onClick={handleBack}
            className="sa-icon-btn-lg absolute left-[70px] top-[60px] z-20 bg-[#28020d]"
          >
            <ArrowLeft className="h-6 w-6 text-[#f5ebe2]" />
          </button>

          <h1
            className="mb-6 max-w-[473px] font-serif text-[#28020d]"
            style={{
              fontSize: "clamp(58px, 5.4vw, 90px)",
              lineHeight: "1em",
              letterSpacing: "-3.6px",
            }}
          >
            Refine your scenario
          </h1>
          <p className="max-w-[473px] font-sans text-[20px] leading-relaxed text-[#987c63]">
            Customize the details to make this practice session perfect for you.
          </p>
        </div>

        <div className={rightStageShellClass}>
          <div className={rightStagePanelClass}>
            {rightStageGlow}
            <div className="relative z-10 flex h-full flex-col px-[84px] pb-[96px] pt-[300px]">
              <div className="mb-[45px] w-full max-w-[830px]">
                <label className="mb-4 block font-sans text-[32px] font-medium tracking-[-0.36px] text-[#a7988a] xl:text-[36px]">
                  Scenario Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="h-[90px] w-full rounded-[20px] border-none bg-white/50 px-10 font-sans text-[24px] text-[#28020d] outline-none transition-all focus:bg-white/70"
                />
              </div>

              <div className="w-full max-w-[830px]">
                <label className="mb-4 block font-sans text-[32px] font-medium tracking-[-0.36px] text-[#a7988a] xl:text-[36px]">
                  Scenario Description
                </label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={5}
                  className="min-h-[180px] w-full resize-none rounded-[20px] border-none bg-white/50 px-10 py-7 font-sans text-[24px] text-[#28020d] outline-none transition-all focus:bg-white/70"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-[60px] left-[70px] right-[68px] z-30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStage("details")}
              className="flex h-[85px] items-center gap-3 rounded-[43.75px] bg-[#28020d] px-9 font-sans text-[22px] text-[#f5ebe2]"
            >
              <Pencil className="h-4 w-4" />
              Details
            </button>
            {renderCircleNavButton("Avatar", () => setStage("avatar"), <User className="h-5 w-5" />)}
            {renderCircleNavButton(
              "Preview",
              () => {
                setPreviewBackTarget("details");
                setStage("preview");
              },
              <Eye className="h-5 w-5" />
            )}
          </div>

          <button
            type="button"
	            onClick={() => {
	              if (title.trim() && description.trim() && isAvatarCatalogReady) {
	                setPreviewBackTarget("details");
	                setReturnToPreview(false);
	                setStage("avatar");
	              }
	            }}
            disabled={!title.trim() || !description.trim() || !isAvatarCatalogReady}
            className="sa-btn-primary-lg disabled:opacity-40"
          >
            Next
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </main>
    );
  }

  if (stage === "avatar") {
    return (
      <main className="relative flex min-h-screen overflow-hidden bg-[#f5ebe2]">
        <div className="relative flex flex-1 flex-col justify-center bg-[#f5ebe2] px-[70px] py-20">
          <button
            type="button"
            onClick={handleBack}
            className="sa-icon-btn-lg absolute left-[70px] top-[60px] z-20 bg-[#28020d]"
          >
            <ArrowLeft className="h-6 w-6 text-[#f5ebe2]" />
          </button>

          <h1
            className="mb-6 max-w-[544px] font-serif text-[#28020d]"
            style={{
              fontSize: "clamp(58px, 5.4vw, 90px)",
              lineHeight: "1em",
              letterSpacing: "-3.6px",
            }}
          >
            Choose your conversation partner
          </h1>
          <p className="max-w-[320px] font-sans text-[20px] leading-relaxed text-[#987c63]">
            Pick who you&apos;ll be talking to
          </p>
        </div>

        <div className={rightStageShellClass}>
          <div className={rightStagePanelClass}>
            {rightStageGlow}
            <div className="relative z-10 flex h-full flex-col px-[44px] pb-[72px] pt-[120px] xl:px-[84px]">
              <div className="mb-[40px]">
                <label className="mb-4 block font-sans text-[32px] font-medium tracking-[-0.36px] text-[#a7988a] xl:text-[36px]">
                  Choose Face
                </label>

                {catalogError && (
                  <div className="mb-4 rounded-[16px] border border-[#c8ad93] bg-white/40 px-4 py-3">
                    <p className="text-[14px] text-[#28020d]">{catalogError}</p>
                  </div>
                )}

                {!catalogError && sandboxNotice && (
                  <div className="mb-4 rounded-[16px] bg-[#edd7c6] px-4 py-3 text-[14px] text-[#28020d]">
                    {sandboxNotice}
                  </div>
                )}

                {displayAvatars.length > 0 ? (
                  <div className="grid grid-cols-2 gap-[16px] md:grid-cols-[repeat(4,minmax(0,195px))] md:justify-between">
                    {displayAvatars.map((avatar) => (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => applyAvatar(avatar.id)}
                        className={`h-[220px] overflow-hidden rounded-[15px] transition-all ${
                          avatar.id === avatarId ? "bg-[#c8ad93] p-1" : "bg-[#f6efea]"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={avatar.previewUrl}
                          alt={avatar.sourceName}
                          className="h-full w-full rounded-[12px] object-cover"
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-[16px] md:grid-cols-[repeat(4,minmax(0,195px))] md:justify-between">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-[220px] rounded-[15px] bg-[#f6efea]/80 animate-pulse"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-[36px] grid grid-cols-1 gap-6 md:grid-cols-[393px_393px] md:justify-between">
                <div className="w-full">
                  <label className="mb-4 block font-sans text-[30px] font-medium tracking-[-0.36px] text-[#a7988a] xl:text-[36px]">
                    Their Name
                  </label>
                  <input
                    type="text"
                    value={partnerName}
                    onChange={(event) => setPartnerName(event.target.value)}
                    className="h-[90px] w-full rounded-[20px] border-none bg-white/50 px-8 font-sans text-[24px] text-[#28020d] outline-none transition-all focus:bg-white/70"
                  />
                </div>

                <div className="w-full">
                  <label className="mb-4 block font-sans text-[30px] font-medium tracking-[-0.36px] text-[#a7988a] xl:text-[36px]">
                    Their Role
                  </label>
                  <input
                    type="text"
                    value={partnerRole}
                    onChange={(event) => setPartnerRole(event.target.value)}
                    className="h-[90px] w-full rounded-[20px] border-none bg-white/50 px-8 font-sans text-[24px] text-[#28020d] outline-none transition-all focus:bg-white/70"
                  />
                </div>
              </div>

              <div className="w-full max-w-[830px]">
                <label className="mb-4 block font-sans text-[30px] font-medium tracking-[-0.36px] text-[#a7988a] xl:text-[36px]">
                  Personality Description
                </label>
                <textarea
                  value={partnerDescription}
                  onChange={(event) => setPartnerDescription(event.target.value)}
                  rows={4}
                  className="min-h-[135px] w-full resize-none rounded-[20px] border-none bg-white/50 px-10 py-7 font-sans text-[24px] text-[#28020d] outline-none transition-all focus:bg-white/70"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-[60px] left-[70px] right-[68px] z-30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {renderCircleNavButton("Details", () => setStage("details"), <Pencil className="h-4 w-4" />)}
            <button
              type="button"
              onClick={() => setStage("avatar")}
              className="flex h-[85px] items-center gap-3 rounded-[43.75px] bg-[#28020d] px-9 font-sans text-[22px] text-[#f5ebe2]"
            >
              <User className="h-5 w-5" />
              Avatar
            </button>
            {renderCircleNavButton(
              "Preview",
              () => {
                setPreviewBackTarget("avatar");
                setStage("preview");
              },
              <Eye className="h-5 w-5" />
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setPreviewBackTarget("avatar");
              setStage("preview");
            }}
            disabled={!selectedAvatar}
            className="sa-btn-primary-lg disabled:opacity-40"
          >
            Next
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </main>
    );
  }

  const previewName = partnerName || selectedAvatar?.displayName || "Conversation Partner";
  const previewRole = partnerRole || selectedAvatar?.role || "Conversation Partner";

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#f5ebe2]">
      <button
        type="button"
        onClick={handleBack}
        className="sa-icon-btn-lg absolute left-[70px] top-[60px] z-20 bg-[#28020d]"
      >
        <ArrowLeft className="h-6 w-6 text-[#f5ebe2]" />
      </button>

      <div className="relative flex flex-1 flex-col justify-center bg-[#f5ebe2] px-[70px] py-20">
        <h1
          className="mb-8 max-w-[601px] font-serif text-[#28020d]"
          style={{
            fontSize: "clamp(58px, 5.4vw, 90px)",
            lineHeight: "1.04em",
            letterSpacing: "-3.6px",
          }}
        >
          {title ? `Ready For ${title}?` : "Ready For A Conversation?"}
        </h1>

        <p className="mb-12 max-w-[614px] font-sans text-[20px] leading-relaxed text-[#987c63]">
          {description}
        </p>

        <div className="mb-16 flex flex-wrap gap-4">
          <span className="inline-flex items-center gap-2 rounded-[43.75px] bg-[#edd7c6] px-6 py-5 text-[24px] text-[#28020d]">
            <Clock className="h-5 w-5" />
            {durationMinutes} Mins
          </span>
          <span className="inline-flex items-center gap-2 rounded-[43.75px] bg-[#edd7c6] px-6 py-5 text-[24px] text-[#28020d]">
            <MessageSquareText className="h-5 w-5" />
            Auto-Finish
          </span>
        </div>

	        <button
	          type="button"
	          onClick={() => {
	            setReturnToPreview(true);
	            setStage("details");
	          }}
	          className="absolute bottom-[60px] left-[70px] flex h-[85px] items-center gap-3 rounded-[43.75px] bg-[#28020d] px-9 text-[22px] text-[#f5ebe2]"
	        >
          <Pencil className="h-4 w-4" />
          Edit
        </button>
      </div>

	      <div className={rightStageShellClass}>
	        <div className={cn(rightStagePanelClass, "bg-transparent before:hidden")}>
	          {selectedAvatar ? (
	            /* eslint-disable-next-line @next/next/no-img-element */
	            <img
	              src={selectedAvatar.previewUrl}
	              alt={previewName}
              className="h-full w-full object-cover object-center"
            />
	          ) : (
	            <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(200,173,147,0.4),_rgba(40,2,13,0.16))]" />
	          )}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_36%,rgba(237,215,198,0.08)_100%)]" />
	          <div className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-b from-transparent to-[#f5ebe2]" />
	          <div className="absolute bottom-[60px] left-[68px] rounded-[43.75px] bg-[#edd7c6] px-10 py-6 text-[24px] text-[#28020d]">
            <span className="font-semibold">{previewName}</span>
            <span>{` - ${previewRole}`}</span>
          </div>
          <button
            type="button"
            onClick={handleStartSession}
            disabled={!selectedAvatar}
            className="absolute bottom-[60px] right-[48px] h-[85px] rounded-[43.75px] bg-[#28020d] px-10 text-[30px] text-[#f5ebe2] transition-transform hover:-translate-y-1 disabled:opacity-40"
          >
            {isStarting ? "Connecting..." : "Start Conversation"}
          </button>
        </div>
      </div>

    </main>
  );
}

export default function DemoPage() {
  return (
    <Suspense
      fallback={
        <main className="relative h-screen w-screen overflow-hidden bg-[#f5ebe2] sa-noise-overlay">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(-57deg, rgba(245,235,226,0.5) 1%, rgba(248,223,201,0.5) 99%)",
            }}
          />
        </main>
      }
    >
      <DemoPageContent />
    </Suspense>
  );
}
