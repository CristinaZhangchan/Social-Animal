"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { jsPDF } from "jspdf";
import { buildTransitionHref } from "@/lib/navigation";
import Logo from "@/components/Logo";
import SceneTransition from "@/components/SceneTransition";
import { updateSessionScore } from "@/lib/supabase/chatHistory";

const MIN_FEEDBACK_TRANSITION_MS = 3000;

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

interface SpeakEvent {
  type: "avatar" | "user";
  action: "start" | "end";
  timestamp: number;
}

interface SessionData {
  scenario: string;
  sessionId?: string;
  dbSessionId?: string; // <--- Add this
  transcript: Array<{ speaker: string; text: string }>;
  speakEvents?: SpeakEvent[];
  duration: number;
}

interface FeedbackData {
  overallScore: number;
  emotionalIntelligence: number;
  clarity: number;
  pace: number;
  encouragement?: string;
  insights: Array<{
    icon: string;
    title: string;
    description: string;
    type: "positive" | "improvement";
  }>;
  rhythmMetrics?: { interruptionCount: number; avgResponseLatency: number };
  practiceExercises?: Array<{
    title: string;
    description: string;
    duration: string;
    targetSkill: string;
    steps: string[];
  }>;
}

// Improvement items for each cue category
const visualCueItems = [
  { number: 1, title: "Eye Contact", description: "Maintain consistent eye contact for 3-5 seconds at a time. Avoid staring or looking away too frequently during key points." },
  { number: 2, title: "Facial Expression", description: "Match your facial expressions to your message. Practice genuine smiling and showing engagement through micro-expressions." },
  { number: 3, title: "Posture", description: "Keep an open, upright posture. Avoid crossing arms or slouching, which can signal disinterest or defensiveness." },
  { number: 4, title: "Blink Rate", description: "Keep your blinking natural and relaxed so you look attentive instead of tense or distracted during important moments." },
  { number: 5, title: "Nodding", description: "Use subtle and occasional nodding to show understanding and engagement without breaking the flow of the interaction." },
];

const vocalCueItems = [
  { number: 1, title: "Tone of Voice", description: "Maintain a clear, warm tone that matches your message. Avoid sounding flat or overdramatic when you want to communicate confidence." },
  { number: 2, title: "Speech Rhythm", description: "Use a steady pace with deliberate pauses so important ideas land clearly instead of feeling rushed or monotone." },
  { number: 3, title: "Pitch", description: "Add small variations in pitch to avoid sounding flat and to help key moments feel more expressive and memorable." },
];

const verbalCueItems = [
  { number: 1, title: "Questions Asked", description: "Ask relevant, purposeful questions that keep the exchange moving and show real curiosity instead of filling space." },
  { number: 2, title: "Repetition", description: "Repeat your strongest points strategically so they stick, but avoid sounding circular or repetitive." },
];

function FeedbackIcon({ kind }: { kind: "visual" | "vocal" | "verbal" }) {
  if (kind === "visual") {
    return (
      <svg width="86" height="60" viewBox="0 0 86 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M43 6C24 6 8.8 17.5 2 30C8.8 42.5 24 54 43 54C62 54 77.2 42.5 84 30C77.2 17.5 62 6 43 6Z" stroke="#28020D" strokeWidth="4" />
        <circle cx="43" cy="30" r="10" fill="#28020D" />
      </svg>
    );
  }

  if (kind === "vocal") {
    return (
      <svg width="64" height="60" viewBox="0 0 64 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 4C27.6 4 24 7.6 24 12V28C24 32.4 27.6 36 32 36C36.4 36 40 32.4 40 28V12C40 7.6 36.4 4 32 4Z" stroke="#28020D" strokeWidth="4" />
        <path d="M14 24C14 34 22 42 32 42C42 42 50 34 50 24" stroke="#28020D" strokeWidth="4" strokeLinecap="round" />
        <path d="M32 42V56M22 56H42" stroke="#28020D" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg width="44" height="60" viewBox="0 0 44 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 8H37" stroke="#28020D" strokeWidth="4" strokeLinecap="round" />
      <path d="M7 22H37" stroke="#28020D" strokeWidth="4" strokeLinecap="round" />
      <path d="M7 36H27" stroke="#28020D" strokeWidth="4" strokeLinecap="round" />
      <path d="M7 50H21" stroke="#28020D" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function FeedbackDetailSection({
  kind,
  title,
  items,
}: {
  kind: "visual" | "vocal" | "verbal";
  title: string;
  items: Array<{ number: number; title: string; description: string }>;
}) {
  return (
    <section className="sa-feedback-section-card px-8 py-10 lg:px-[72px] lg:py-[90px]">
      <div className="grid gap-12 lg:grid-cols-[360px_1fr] lg:gap-16">
        <div className="flex flex-col gap-8 lg:sticky lg:top-10 lg:self-start">
          <FeedbackIcon kind={kind} />
          <h3
            className="text-[54px] leading-[0.92] text-[#28020d] lg:text-[90px]"
            style={{ fontFamily: "'Fedro', 'Libre Baskerville', Georgia, serif", letterSpacing: "-1.8px" }}
          >
            {title.split(" ").map((word, index) => (
              <span key={word}>
                {index > 0 ? <br /> : null}
                {word}
              </span>
            ))}
          </h3>
        </div>

        <div>
          {items.map((item, index) => (
            <div key={`${title}-${item.number}`}>
              <div className="grid gap-6 py-7 lg:grid-cols-[1fr_auto] lg:gap-10 lg:py-8">
                <div>
                  <p className="mb-4 font-sans text-[28px] font-semibold tracking-[-0.03em] text-[#28020d] lg:text-[48px]">
                    {item.title}
                  </p>
                  <p className="font-sans text-[18px] font-medium leading-[1.45] tracking-[-0.01em] text-[#28020d] lg:text-[32px]">
                    {item.description}
                  </p>
                </div>
                <p className="font-sans text-[28px] font-light tracking-[-0.03em] text-[#28020d] lg:text-[48px]">
                  {String(item.number).padStart(2, "0")}
                </p>
              </div>
              {index < items.length - 1 ? <div className="sa-feedback-rule" /> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function FeedbackPage() {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [hasLoadedSession, setHasLoadedSession] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [previousScore] = useState(() => {
    if (typeof window !== "undefined") {
      const prev = localStorage.getItem("previousScore");
      return prev ? parseInt(prev) : null;
    }
    return null;
  });
  const [sessionCount] = useState(() => {
    if (typeof window !== "undefined") {
      const count = parseInt(localStorage.getItem("sessionCount") || "0", 10);
      const newCount = count + 1;
      localStorage.setItem("sessionCount", newCount.toString());
      return newCount;
    }
    return 1;
  });

  const fetchTranscriptFromAPI = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/liveavatar/transcript?session_id=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          return data.data.map((entry: { role: string; text: string }) => ({
            speaker: entry.role === "user" ? "You" : "AI",
            text: entry.text,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching transcript:", error);
    }
    return [];
  };

  useEffect(() => {
    const loadSessionData = async () => {
      const analysisStartedAt = Date.now();
      const data = localStorage.getItem("lastSession");

      if (data) {
        const parsed = JSON.parse(data) as SessionData;
        if (parsed.sessionId && (!parsed.transcript || parsed.transcript.length === 0)) {
          const apiTranscript = await fetchTranscriptFromAPI(parsed.sessionId);
          if (apiTranscript.length > 0) {
            parsed.transcript = apiTranscript;
            localStorage.setItem("lastSession", JSON.stringify(parsed));
          }
        }
        setSessionData(parsed);
        await fetchAnalysis(parsed, analysisStartedAt);
        setHasLoadedSession(true);
      } else {
        setHasLoadedSession(true);
        setIsAnalyzing(false);
      }
    };
    loadSessionData();
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAnalysis = async (data: SessionData, startedAt: number) => {
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: data.transcript,
          scenario: data.scenario,
          speakEvents: data.speakEvents || [],
        }),
      });
      if (response.ok) {
        const analysisData = await response.json();
        setFeedback(analysisData);
        if (analysisData.overallScore) {
          const score = Math.round(analysisData.overallScore * 10);
          localStorage.setItem("previousScore", score.toString());

          // Update Supabase if we have a DB session ID
          if (data.dbSessionId) {
            console.log('[Feedback] Updating DB session score:', data.dbSessionId, score);
            updateSessionScore(data.dbSessionId, score).catch(err =>
              console.error('[Feedback] Failed to update DB score:', err)
            );
          }
        }
      } else {
        setFeedback(getMockFeedback());
      }
    } catch (error) {
      console.error("Error fetching analysis:", error);
      setFeedback(getMockFeedback());
    } finally {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, MIN_FEEDBACK_TRANSITION_MS - elapsed);

      if (remaining > 0) {
        await wait(remaining);
      }

      setIsAnalyzing(false);
    }
  };

  const getMockFeedback = (): FeedbackData => ({
    overallScore: 7.3,
    emotionalIntelligence: 8.0,
    clarity: 6.0,
    pace: 7.9,
    insights: [
      { icon: "eye", title: "Visual Cues", description: "Good eye contact maintained throughout.", type: "positive" },
      { icon: "mic", title: "Vocal Cues", description: "Strong vocal presence with clear articulation.", type: "positive" },
      { icon: "chat", title: "Verbal Cues", description: "Effective use of persuasive language.", type: "positive" },
    ],
    rhythmMetrics: { interruptionCount: 0, avgResponseLatency: 1.5 },
  });

  if (!mounted) {
    return (
      <main className="h-screen w-screen bg-sa-maroon p-0">
        <SceneTransition className="min-h-screen" />
      </main>
    );
  }

  // Calculate scores from analysis data
  const overallPercent = feedback ? Math.round(feedback.overallScore * 10) : 0;
  const visualPercent = feedback ? Math.round(feedback.emotionalIntelligence * 10) : 0;
  const vocalPercent = feedback ? Math.round(feedback.pace * 10) : 0;
  const verbalPercent = feedback ? Math.round(feedback.clarity * 10) : 0;
  const prevPercent = previousScore || 0;

  // Analyzing state
  if (isAnalyzing || !hasLoadedSession) {
    return (
      <main className="h-screen w-screen bg-sa-maroon p-0">
        <SceneTransition className="min-h-screen" />
      </main>
    );
  }

  // No session data state
  if (!sessionData) {
    return (
      <main className="min-h-screen bg-[#f5ebe2] flex items-center justify-center">
        <div className="text-center sa-animate-fade-in">
          <Logo collapsed size="md" color="maroon" href={undefined} className="mx-auto mb-6" />
          <p className="text-[#28020d] text-2xl font-sans mb-4">No session data found</p>
          <Link href={buildTransitionHref("/demo")} className="text-[#28020d]/60 hover:text-[#28020d] underline transition-colors font-sans">
            Start a new practice session
          </Link>
        </div>
      </main>
    );
  }

  const feedbackSummary = (() => {
    // Use AI-generated personalized encouragement if available
    if (feedback?.encouragement) {
      return feedback.encouragement;
    }
    // Fallback: generate encouragement based on session count and score
    if (sessionCount <= 1) {
      return overallPercent >= 60
        ? "Great first session! You're already showing natural charisma. Keep practicing and you'll see even more improvement."
        : "Congrats! You've started your journey to improved social skills. This will help you in all areas of life!";
    }
    if (previousScore && overallPercent > previousScore) {
      return "Nice improvement! Keep practicing and you'll master this! Your consistency is paying off.";
    }
    return "Great start, taking initiative matters. Social skills grow with practice; keep going, stay patient, and celebrate every bit of progress. Consistency builds lasting confidence.";
  })();

  const feedbackSummaryPreview = (() => {
    const normalized = feedbackSummary.replace(/\s+/g, " ").trim();
    const sentenceMatches = normalized.match(/[^.!?]+[.!?]?/g) ?? [normalized];
    const concise = sentenceMatches.slice(0, 2).join(" ").trim();
    if (concise.length <= 220) {
      return concise;
    }
    return `${concise.slice(0, 217).trimEnd()}...`;
  })();

  const exportFeedbackPdf = async () => {
    if (!sessionData || !feedback || isExportingPdf) return;

    setIsExportingPdf(true);

    try {
      const doc = new jsPDF({
        orientation: "p",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginX = 48;
      const marginTop = 54;
      const contentWidth = pageWidth - marginX * 2;
      const bottomLimit = pageHeight - 54;
      let cursorY = marginTop;

      const ensurePageSpace = (neededHeight: number) => {
        if (cursorY + neededHeight <= bottomLimit) return;
        doc.addPage();
        cursorY = marginTop;
      };

      const addWrappedText = (
        text: string,
        options: {
          fontSize?: number;
          lineHeight?: number;
          color?: [number, number, number];
          indent?: number;
        } = {}
      ) => {
        const fontSize = options.fontSize ?? 12;
        const lineHeight = options.lineHeight ?? fontSize * 1.45;
        const indent = options.indent ?? 0;
        const textWidth = contentWidth - indent;
        const lines = doc.splitTextToSize(text, textWidth);

        doc.setFontSize(fontSize);
        if (options.color) {
          doc.setTextColor(...options.color);
        } else {
          doc.setTextColor(40, 2, 13);
        }

        lines.forEach((line: string) => {
          ensurePageSpace(lineHeight);
          doc.text(line, marginX + indent, cursorY);
          cursorY += lineHeight;
        });
      };

      const addSectionTitle = (title: string) => {
        ensurePageSpace(34);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(40, 2, 13);
        doc.text(title, marginX, cursorY);
        cursorY += 24;
      };

      const addSubTitle = (title: string) => {
        ensurePageSpace(24);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(40, 2, 13);
        doc.text(title, marginX, cursorY);
        cursorY += 18;
      };

      doc.setFont("helvetica", "bold");
      doc.setFontSize(26);
      doc.setTextColor(40, 2, 13);
      doc.text("Session Summary", marginX, cursorY);
      cursorY += 30;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(92, 72, 86);
      doc.text(`Exported ${new Date().toLocaleString()}`, marginX, cursorY);
      cursorY += 28;

      addSectionTitle("Scenario");
      doc.setFont("helvetica", "normal");
      addWrappedText(sessionData.scenario, { fontSize: 12 });
      cursorY += 10;

      addSectionTitle("Scores");
      doc.setFont("helvetica", "normal");
      addWrappedText(`Overall Final Score: ${overallPercent}%`, { fontSize: 12 });
      addWrappedText(`Previous Score: ${prevPercent > 0 ? `${prevPercent}%` : "--"}`, { fontSize: 12 });
      addWrappedText(`Visual Cues: ${visualPercent}%`, { fontSize: 12 });
      addWrappedText(`Vocal Cues: ${vocalPercent}%`, { fontSize: 12 });
      addWrappedText(`Verbal Cues: ${verbalPercent}%`, { fontSize: 12 });
      cursorY += 10;

      addSectionTitle("Summary");
      doc.setFont("helvetica", "normal");
      addWrappedText(feedbackSummary, {
        fontSize: 12,
        lineHeight: 18,
        color: [38, 91, 56],
      });
      cursorY += 10;

      addSectionTitle("How to Improve");
      [
        { title: "Visual Cues", items: visualCueItems },
        { title: "Vocal Cues", items: vocalCueItems },
        { title: "Verbal Cues", items: verbalCueItems },
      ].forEach((section) => {
        addSubTitle(section.title);
        doc.setFont("helvetica", "normal");
        section.items.forEach((item) => {
          addWrappedText(`${String(item.number).padStart(2, "0")} ${item.title}`, {
            fontSize: 12,
            lineHeight: 18,
          });
          addWrappedText(item.description, {
            fontSize: 11,
            lineHeight: 16,
            indent: 14,
            color: [92, 72, 86],
          });
          cursorY += 8;
        });
        cursorY += 6;
      });

      addSectionTitle("Transcript");
      doc.setFont("helvetica", "normal");
      if (sessionData.transcript.length === 0) {
        addWrappedText("No transcript available.", { fontSize: 12 });
      } else {
        sessionData.transcript.forEach((entry) => {
          const speaker = entry.speaker || "Speaker";
          addWrappedText(`[${speaker}]`, {
            fontSize: 12,
            lineHeight: 18,
          });
          addWrappedText(entry.text, {
            fontSize: 11,
            lineHeight: 16,
            indent: 14,
          });
          cursorY += 8;
        });
      }

      doc.save(`session-summary-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5ebe2]">
      <div className="mx-auto max-w-[1715px] px-6 py-10 lg:px-0 lg:py-16">
        {/* Logo at top center */}
        <div className="mb-12 flex justify-center lg:mb-16">
          <Logo collapsed size="lg" color="maroon" href="/" />
        </div>

        {/* Session Summary heading + download button */}
        <div className="mb-10 flex items-center justify-between lg:mb-12">
          <h1 className="font-sans text-[36px] font-semibold tracking-[-1.2px] text-[#28020d] md:text-[48px] lg:text-[60px]">
            Session Summary
          </h1>
          <button
            onClick={exportFeedbackPdf}
            disabled={isExportingPdf}
            className="sa-icon-btn-lg shrink-0 bg-[#28020d]"
            title="Export PDF"
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 5V18.5M14 18.5L8.5 13M14 18.5L19.5 13" stroke="#F5EBE2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 22H23" stroke="#F5EBE2" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Score Cards Grid */}
        <div className="sa-stagger mb-12 grid items-start gap-4 lg:mb-20 lg:grid-cols-[650px_minmax(0,1fr)] lg:gap-[30px]">
          <div className="rounded-[30px] bg-[#a6c3ff] px-6 py-8 lg:min-h-[410px] lg:px-6 lg:py-[38px]">
            <div className="flex h-full flex-col justify-between">
              <div className="flex items-start justify-between gap-6">
                <div className="max-w-[220px]">
                  <p className="font-sans text-[24px] font-semibold leading-[0.95] tracking-[-0.03em] text-[#2e3664]">
                    Overall Final
                    <br />
                    Score
                  </p>
                </div>
                <div className="pt-1 text-right">
                  <p className="font-sans text-[24px] font-semibold leading-[0.95] tracking-[-0.03em] text-[#c6d9ff]">
                    Previous
                    <br />
                    Score
                  </p>
                </div>
              </div>
              <div className="mt-8 flex items-end justify-between gap-5">
                <p className="sa-feedback-number text-[92px] text-[#2e3664] md:text-[140px] lg:text-[180px]">
                  {overallPercent}%
                </p>
                <p className="sa-feedback-number pb-4 text-[62px] text-[#c6d9ff] md:text-[80px] lg:text-[108px]">
                  {prevPercent > 0 ? `${prevPercent}%` : "--"}
                </p>
              </div>
              <div className="mt-8 h-[15px] rounded-[30px] bg-[#c6d9ff]">
                <div
                  className="h-full rounded-[30px] bg-[#2e3664] transition-all duration-1000 ease-out"
                  style={{ width: `${overallPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:gap-[30px]">
            <div className="grid gap-4 md:grid-cols-3 lg:gap-[30px]">
              {[
                { label: "Visual Cues", value: visualPercent },
                { label: "Vocal Cues", value: vocalPercent },
                { label: "Verbal Cues", value: verbalPercent },
              ].map((item) => (
                <div key={item.label} className="rounded-[30px] bg-[#efc5ec] px-6 py-6 lg:min-h-[190px] lg:px-5 lg:py-8">
                  <p className="mb-5 font-sans text-[22px] font-semibold tracking-[-0.03em] text-[#644b62]">
                    {item.label}
                  </p>
                  <p className="sa-feedback-number text-[64px] text-[#644b62] md:text-[80px] lg:text-[110px]">
                    {item.value}%
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-[30px] bg-[#cde0b4] px-6 py-7 lg:min-h-[190px] lg:px-8 lg:py-9">
              <div className="mb-5 flex items-start justify-between gap-4">
                <p className="font-sans text-[15px] font-semibold uppercase tracking-[0.14em] text-[#265b38]/70">
                  Feedback Summary
                </p>
                <p className="font-sans text-[13px] font-medium text-[#265b38]/60">
                  Quick read
                </p>
              </div>
              <p className="max-w-[920px] font-sans text-[22px] font-medium italic leading-[1.32] tracking-[-0.01em] text-[#265b38] lg:text-[28px]">
                {feedbackSummaryPreview}
              </p>
            </div>
          </div>
        </div>

        {/* How to Improve Section */}
        <div className="mb-8 flex items-center justify-between gap-4 lg:mb-12">
          <h2 className="font-sans text-[36px] font-semibold tracking-[-1.2px] text-[#28020d] md:text-[48px] lg:text-[60px]">
            How to Improve
          </h2>
          <button className="sa-icon-btn-lg shrink-0 bg-[#28020d]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 7V17M7 12L12 17L17 12" stroke="#F5EBE2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="mb-12 flex flex-col gap-5 lg:mb-20">
          <FeedbackDetailSection kind="visual" title="Visual Cues" items={visualCueItems} />
          <FeedbackDetailSection kind="vocal" title="Vocal Cues" items={vocalCueItems} />
          <FeedbackDetailSection kind="verbal" title="Verbal Cues" items={verbalCueItems} />
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex flex-col items-center justify-center gap-5 pb-12 sm:flex-row">
          <button
            onClick={exportFeedbackPdf}
            disabled={isExportingPdf}
            className="flex h-[120px] w-full items-center justify-center gap-3 rounded-[61.765px] bg-[#28020d] px-10 text-[24px] font-medium text-[#f5ebe2] transition-transform hover:scale-[1.02] disabled:opacity-60 sm:w-[265.5px] lg:text-[31px]"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 4V16M12 16L7 11M12 16L17 11" stroke="#F5EBE2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 20H20" stroke="#F5EBE2" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {isExportingPdf ? "Exporting..." : "Download PDF"}
          </button>
          <Link
            href={buildTransitionHref("/demo")}
            className="flex h-[120px] w-full items-center justify-center gap-3 rounded-[61.765px] bg-[#28020d] px-10 text-[24px] font-medium text-[#f5ebe2] transition-transform hover:scale-[1.02] sm:w-[261px] lg:text-[31px]"
          >
            Try Again
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 12H20M20 12L14 6M20 12L14 18" stroke="#F5EBE2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}
