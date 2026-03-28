"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SceneTransition from "@/components/SceneTransition";

const DEFAULT_TARGET = "/home";
const DEFAULT_DELAY_MS = 1200;

function getSafeTarget(target: string | null) {
  if (!target || !target.startsWith("/") || target.startsWith("//")) {
    return DEFAULT_TARGET;
  }

  return target;
}

export default function TransitionRedirect({
  target,
  delay,
}: {
  target: string | null;
  delay: string | null;
}) {
  const router = useRouter();
  const nextTarget = getSafeTarget(target);
  const delayMs = Number(delay ?? DEFAULT_DELAY_MS);
  const waitTime = Number.isFinite(delayMs) && delayMs >= 0 ? delayMs : DEFAULT_DELAY_MS;

  useEffect(() => {
    router.prefetch(nextTarget);

    const timer = window.setTimeout(() => {
      router.replace(nextTarget);
    }, waitTime);

    return () => window.clearTimeout(timer);
  }, [nextTarget, router, waitTime]);

  return (
    <main className="h-screen w-screen bg-sa-maroon p-0">
      <SceneTransition className="min-h-screen" />
    </main>
  );
}
