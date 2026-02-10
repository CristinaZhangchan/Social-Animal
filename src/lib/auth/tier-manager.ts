// Simple client-side tier management using localStorage
// In production, this should be moved to a database with proper authentication

export interface UserTier {
  plan: "free" | "monthly" | "annual";
  conversationsThisWeek: number;
  weekStartDate: string;
  subscriptionExpiry?: string;
}

const FREE_TIER_LIMIT = 3;
const STORAGE_KEY = "charmup_user_tier";

export function getUserTier(): UserTier {
  if (typeof window === "undefined") {
    return getDefaultTier();
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const defaultTier = getDefaultTier();
    saveUserTier(defaultTier);
    return defaultTier;
  }

  try {
    const tier = JSON.parse(stored) as UserTier;

    // Check if we need to reset the weekly counter
    const weekStart = new Date(tier.weekStartDate);
    const now = new Date();
    const daysSinceWeekStart = Math.floor(
      (now.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceWeekStart >= 7) {
      // Reset weekly counter
      tier.conversationsThisWeek = 0;
      tier.weekStartDate = now.toISOString();
      saveUserTier(tier);
    }

    return tier;
  } catch {
    return getDefaultTier();
  }
}

export function saveUserTier(tier: UserTier): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tier));
}

export function canStartConversation(): boolean {
  const tier = getUserTier();

  if (tier.plan !== "free") {
    // Premium users have unlimited access
    return true;
  }

  // Free users are limited to 3 conversations per week
  return tier.conversationsThisWeek < FREE_TIER_LIMIT;
}

export function incrementConversationCount(): void {
  const tier = getUserTier();
  tier.conversationsThisWeek += 1;
  saveUserTier(tier);
}

export function getConversationsRemaining(): number {
  const tier = getUserTier();

  if (tier.plan !== "free") {
    return Infinity;
  }

  return Math.max(0, FREE_TIER_LIMIT - tier.conversationsThisWeek);
}

export function upgradeToPremium(plan: "monthly" | "annual"): void {
  const tier = getUserTier();
  tier.plan = plan;

  // Set expiry date
  const expiry = new Date();
  if (plan === "monthly") {
    expiry.setMonth(expiry.getMonth() + 1);
  } else {
    expiry.setFullYear(expiry.getFullYear() + 1);
  }
  tier.subscriptionExpiry = expiry.toISOString();

  saveUserTier(tier);
}

function getDefaultTier(): UserTier {
  return {
    plan: "free",
    conversationsThisWeek: 0,
    weekStartDate: new Date().toISOString(),
  };
}

export function isPremiumUser(): boolean {
  const tier = getUserTier();
  return tier.plan !== "free";
}
