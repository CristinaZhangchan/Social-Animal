import type { LiveAvatarEnvironment } from "@/lib/liveavatar/config";

export interface LiveAvatarApiAvatar {
  id: string;
  name: string;
  status?: string | null;
  preview_url?: string | null;
  is_expired?: boolean | null;
  default_voice?: {
    id?: string | null;
    name?: string | null;
  } | null;
}

export interface LiveAvatarCatalogAvatar {
  id: string;
  sourceName: string;
  displayName: string;
  role: string;
  summary: string;
  previewUrl: string;
  voiceId: string | null;
  voiceName: string | null;
  variantLabel: string | null;
  isFeatured: boolean;
}

export interface LiveAvatarHomeCard {
  title: string;
  description: string;
  duration: string;
  avatar: LiveAvatarCatalogAvatar;
}

export interface LiveAvatarCatalogResponse {
  environment: LiveAvatarEnvironment;
  sandboxEnabled: boolean;
  sandboxAvatarId: string;
  avatars: LiveAvatarCatalogAvatar[];
  featured: LiveAvatarCatalogAvatar[];
  homeCards: LiveAvatarHomeCard[];
}

interface BuildCatalogOptions {
  environment: LiveAvatarEnvironment;
  sandboxEnabled: boolean;
  sandboxAvatarId: string;
}

const GENERIC_ROLE = "Conversation Partner";

const HOME_SCENARIOS = [
  {
    title: "Returning a defective product",
    description:
      "Practice asking for a refund, pushing through resistance, and keeping your cool with a support rep.",
    duration: "5 Mins",
    roleKeywords: ["Customer Support", "Lawyer", GENERIC_ROLE],
  },
  {
    title: "Tough salary negotiation",
    description:
      "Rehearse a compensation conversation with someone who evaluates your case from a hiring or people perspective.",
    duration: "5 Mins",
    roleKeywords: ["HR", "Therapist", "Teacher", GENERIC_ROLE],
  },
  {
    title: "Networking at an event",
    description:
      "Warm up for a high-signal professional conversation with an expert who can challenge and engage you.",
    duration: "3 Mins",
    roleKeywords: ["Tech Expert", "Fitness Coach", "Doctor", GENERIC_ROLE],
  },
] as const;

function cleanSourceName(name: string): string {
  return name.replace(/\s+\(Portrait\)$/i, "").trim();
}

function buildSummary(
  role: string,
  voiceName: string | null,
  variantLabel: string | null
): string {
  const roleText =
    role === GENERIC_ROLE
      ? "A general conversation partner"
      : `A ${role.toLowerCase()} persona`;
  const variantText = variantLabel
    ? ` presented as ${variantLabel.toLowerCase()}`
    : "";
  const voiceText = voiceName ? ` using ${voiceName}` : "";
  return `${roleText}${variantText}${voiceText}.`;
}

function parseAvatarIdentity(sourceName: string) {
  const cleaned = cleanSourceName(sourceName);

  if (cleaned.includes(" in ")) {
    const [displayName, variant] = cleaned.split(/\s+in\s+/i);
    return {
      displayName: displayName.trim(),
      role: GENERIC_ROLE,
      variantLabel: variant?.trim() || null,
    };
  }

  const tokens = cleaned.split(/\s+/).filter(Boolean);
  const displayName = tokens[0] || cleaned;
  const remainder = tokens.slice(1).join(" ").trim();

  if (!remainder) {
    return { displayName, role: GENERIC_ROLE, variantLabel: null };
  }

  if (remainder === "Sitting" || remainder === "Standing") {
    return { displayName, role: GENERIC_ROLE, variantLabel: remainder };
  }

  const postureMatch = remainder.match(/^(.*)\s+(Sitting|Standing)$/i);
  if (postureMatch) {
    const roleCandidate = postureMatch[1]?.trim();
    return {
      displayName,
      role: roleCandidate || GENERIC_ROLE,
      variantLabel: postureMatch[2] || null,
    };
  }

  return {
    displayName,
    role: remainder || GENERIC_ROLE,
    variantLabel: null,
  };
}

function scoreAvatar(avatar: LiveAvatarCatalogAvatar): number {
  let score = 0;

  if (/customer support|hr|therapist|tech expert|lawyer|teacher|doctor/i.test(avatar.role)) {
    score += 20;
  }

  if (/sitting/i.test(avatar.variantLabel || "")) {
    score += 8;
  }

  if (!/portrait/i.test(avatar.sourceName)) {
    score += 5;
  }

  if (/santa/i.test(avatar.sourceName)) {
    score -= 100;
  }

  return score;
}

function sortAvatars(avatars: LiveAvatarCatalogAvatar[]): LiveAvatarCatalogAvatar[] {
  return [...avatars].sort((left, right) => {
    const scoreDiff = scoreAvatar(right) - scoreAvatar(left);
    if (scoreDiff !== 0) return scoreDiff;

    const nameDiff = left.displayName.localeCompare(right.displayName);
    if (nameDiff !== 0) return nameDiff;

    return left.role.localeCompare(right.role);
  });
}

function pickFeaturedAvatars(
  avatars: LiveAvatarCatalogAvatar[],
  limit = 8
): LiveAvatarCatalogAvatar[] {
  const seenKeys = new Set<string>();
  const featured: LiveAvatarCatalogAvatar[] = [];

  for (const avatar of sortAvatars(avatars)) {
    const dedupeKey = `${avatar.displayName}:${avatar.role}`;
    if (seenKeys.has(dedupeKey)) continue;
    seenKeys.add(dedupeKey);
    featured.push({ ...avatar, isFeatured: true });
    if (featured.length >= limit) break;
  }

  return featured;
}

function pickAvatarForScenario(
  avatars: LiveAvatarCatalogAvatar[],
  keywords: readonly string[],
  usedIds: Set<string>
): LiveAvatarCatalogAvatar {
  const keywordMatch = avatars.find(
    (avatar) =>
      !usedIds.has(avatar.id) &&
      keywords.some((keyword) =>
        avatar.role.toLowerCase().includes(keyword.toLowerCase())
      )
  );

  if (keywordMatch) {
    usedIds.add(keywordMatch.id);
    return keywordMatch;
  }

  const fallback = avatars.find((avatar) => !usedIds.has(avatar.id)) || avatars[0];
  usedIds.add(fallback.id);
  return fallback;
}

function buildHomeCards(avatars: LiveAvatarCatalogAvatar[]): LiveAvatarHomeCard[] {
  if (avatars.length === 0) {
    return [];
  }

  const usedIds = new Set<string>();

  return HOME_SCENARIOS.map((scenario) => ({
    title: scenario.title,
    description: scenario.description,
    duration: scenario.duration,
    avatar: pickAvatarForScenario(avatars, scenario.roleKeywords, usedIds),
  }));
}

function normalizeAvatar(apiAvatar: LiveAvatarApiAvatar): LiveAvatarCatalogAvatar | null {
  if (
    !apiAvatar.id ||
    !apiAvatar.name ||
    !apiAvatar.preview_url ||
    apiAvatar.status !== "ACTIVE" ||
    apiAvatar.is_expired
  ) {
    return null;
  }

  const identity = parseAvatarIdentity(apiAvatar.name);
  const voiceName = apiAvatar.default_voice?.name?.trim() || null;
  const voiceId = apiAvatar.default_voice?.id?.trim() || null;

  return {
    id: apiAvatar.id,
    sourceName: apiAvatar.name,
    displayName: identity.displayName,
    role: identity.role,
    summary: buildSummary(identity.role, voiceName, identity.variantLabel),
    previewUrl: apiAvatar.preview_url,
    voiceId,
    voiceName,
    variantLabel: identity.variantLabel,
    isFeatured: false,
  };
}

export function buildLiveAvatarCatalog(
  apiAvatars: LiveAvatarApiAvatar[],
  options: BuildCatalogOptions
): LiveAvatarCatalogResponse {
  const normalized = apiAvatars
    .map(normalizeAvatar)
    .filter((avatar): avatar is LiveAvatarCatalogAvatar => Boolean(avatar));

  const environmentAvatars = options.sandboxEnabled
    ? normalized.filter((avatar) => avatar.id === options.sandboxAvatarId)
    : normalized;

  const sortedAvatars = sortAvatars(environmentAvatars).map((avatar) => ({
    ...avatar,
    isFeatured: false,
  }));

  const featured = pickFeaturedAvatars(sortedAvatars);
  const featuredIds = new Set(featured.map((avatar) => avatar.id));
  const avatars = sortedAvatars.map((avatar) => ({
    ...avatar,
    isFeatured: featuredIds.has(avatar.id),
  }));

  return {
    environment: options.environment,
    sandboxEnabled: options.sandboxEnabled,
    sandboxAvatarId: options.sandboxAvatarId,
    avatars,
    featured,
    homeCards: buildHomeCards(featured.length > 0 ? featured : avatars),
  };
}
