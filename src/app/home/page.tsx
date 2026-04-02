"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { buildTransitionHref, pushWithTransition } from "@/lib/navigation";
import { useAuth } from "@/hooks/useAuth";
import Logo from "@/components/Logo";
import { LogOut, User, ChevronDown, TrendingUp } from "lucide-react";

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
  const { user, signOut } = useAuth();
  const [customScenario, setCustomScenario] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  const handleSignOut = async () => {
    setShowUserMenu(false);
    await signOut();
    pushWithTransition(router, "/");
  };

  const getUserInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) return user.email.substring(0, 2).toUpperCase();
    return "U";
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

      {/* User info - top right corner */}
      {user && (
        <div className="absolute top-6 right-6 z-20">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#28020d]/10 hover:bg-[#28020d]/20 transition-colors"
            >
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#28020d] text-[#f5ebe2] flex items-center justify-center text-sm font-semibold">
                  {getUserInitials()}
                </div>
              )}
              <ChevronDown className="h-4 w-4 text-[#28020d]" />
            </button>

            {showUserMenu && (
              <>
                {/* Click-away overlay */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-lg border border-[#28020d]/10 py-2 z-20">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-[#28020d]/10">
                    <p className="text-sm font-semibold text-[#28020d]">
                      {user.user_metadata?.full_name || "User"}
                    </p>
                    <p className="text-xs text-[#28020d]/60 mt-0.5">
                      {user.email}
                    </p>
                  </div>
                  {/* Track Progress */}
                  <button
                    onClick={() => pushWithTransition(router, "/track")}
                    className="w-full px-4 py-3 flex items-center gap-3 text-sm text-[#28020d] hover:bg-[#28020d]/5 transition-colors border-b border-[#28020d]/10"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Track Progress
                  </button>
                  {/* Logout */}
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-3 flex items-center gap-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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

