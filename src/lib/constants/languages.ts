/**
 * Supported languages for LiveAvatar conversations
 * Based on LiveAvatar API documentation
 */
export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά" },
  { code: "cs", name: "Czech", nativeName: "Čeština" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar" },
  { code: "ro", name: "Romanian", nativeName: "Română" },
  { code: "sv", name: "Swedish", nativeName: "Svenska" },
  { code: "da", name: "Danish", nativeName: "Dansk" },
  { code: "fi", name: "Finnish", nativeName: "Suomi" },
  { code: "no", name: "Norwegian", nativeName: "Norsk" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu" },
  { code: "tl", name: "Tagalog", nativeName: "Tagalog" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "hr", name: "Croatian", nativeName: "Hrvatski" },
  { code: "bg", name: "Bulgarian", nativeName: "Български" },
  { code: "sk", name: "Slovak", nativeName: "Slovenčina" },
  { code: "mt", name: "Maltese", nativeName: "Malti" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Get language name by code
 */
export function getLanguageName(code: string): string {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  return lang?.name || "English";
}

/**
 * Get language by code
 */
export function getLanguageByCode(code: string): Language | undefined {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code);
}

/**
 * Get flag emoji for language code
 */
export function getLanguageFlag(code: string): string {
  const flags: Record<string, string> = {
    en: "🇺🇸",
    zh: "🇨🇳",
    ja: "🇯🇵",
    ko: "🇰🇷",
    es: "🇪🇸",
    fr: "🇫🇷",
    de: "🇩🇪",
    pt: "🇧🇷",
    it: "🇮🇹",
    ru: "🇷🇺",
    ar: "🇸🇦",
    hi: "🇮🇳",
    vi: "🇻🇳",
    nl: "🇳🇱",
    pl: "🇵🇱",
    tr: "🇹🇷",
    uk: "🇺🇦",
    el: "🇬🇷",
    cs: "🇨🇿",
    hu: "🇭🇺",
    ro: "🇷🇴",
    sv: "🇸🇪",
    da: "🇩🇰",
    fi: "🇫🇮",
    no: "🇳🇴",
    id: "🇮🇩",
    ms: "🇲🇾",
    tl: "🇵🇭",
    ta: "🇮🇳",
    hr: "🇭🇷",
    bg: "🇧🇬",
    sk: "🇸🇰",
    mt: "🇲🇹",
    bn: "🇧🇩",
  };
  return flags[code] || "🌐";
}
