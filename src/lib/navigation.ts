import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const DEFAULT_TRANSITION_DELAY_MS = 1200;

export function isInternalRoute(href: string) {
  return href.startsWith("/") && !href.startsWith("//") && !href.startsWith("/transition");
}

export function buildTransitionHref(
  href: string,
  delayMs = DEFAULT_TRANSITION_DELAY_MS
) {
  if (!isInternalRoute(href)) {
    return href;
  }

  const params = new URLSearchParams();
  params.set("to", href);

  if (delayMs !== DEFAULT_TRANSITION_DELAY_MS) {
    params.set("delay", String(delayMs));
  }

  return `/transition?${params.toString()}`;
}

export function pushWithTransition(
  router: AppRouterInstance,
  href: string,
  delayMs = DEFAULT_TRANSITION_DELAY_MS
) {
  router.push(buildTransitionHref(href, delayMs));
}
