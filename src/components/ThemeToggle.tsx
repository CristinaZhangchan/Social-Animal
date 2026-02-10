"use client";

import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative px-4 py-2 rounded-lg transition-all duration-300 ${
        theme === "dark"
          ? "bg-sa-bg-secondary border border-sa-accent-cyan/30 text-sa-accent-cyan hover:border-sa-accent-cyan/50"
          : "glass-card-sm text-light-accent hover:shadow-accent-violet"
      } ${className}`}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <span className="flex items-center gap-2">
        {theme === "dark" ? (
          <>
            <SunIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Light</span>
          </>
        ) : (
          <>
            <MoonIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Dark</span>
          </>
        )}
      </span>
    </button>
  );
}

function SunIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function MoonIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );
}
