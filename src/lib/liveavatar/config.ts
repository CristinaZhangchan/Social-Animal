export const DEFAULT_SANDBOX_AVATAR_ID = "dd73ea75-1218-4ef3-92ce-606d5f7fbc0a";

export type LiveAvatarEnvironment = "sandbox" | "production";

export interface LiveAvatarRuntimeConfig {
  apiKey: string;
  sandboxEnabled: boolean;
  sandboxAvatarId: string;
  environment: LiveAvatarEnvironment;
}

export function getLiveAvatarRuntimeConfig(): LiveAvatarRuntimeConfig {
  const apiKey = process.env.LIVEAVATAR_API_KEY?.trim() ?? "";
  const sandboxEnabled = process.env.LIVEAVATAR_SANDBOX_MODE === "true";
  const sandboxAvatarId =
    process.env.LIVEAVATAR_SANDBOX_AVATAR_ID?.trim() ||
    DEFAULT_SANDBOX_AVATAR_ID;

  return {
    apiKey,
    sandboxEnabled,
    sandboxAvatarId,
    environment: sandboxEnabled ? "sandbox" : "production",
  };
}
