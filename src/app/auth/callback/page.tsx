"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase/client";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Completing sign in...");

  useEffect(() => {
    let cancelled = false;

    // Check for explicit error in query params
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      const params = new URLSearchParams({
        error: errorDescription || error,
      });
      router.replace(`/auth?${params.toString()}`);
      return;
    }

    // For PKCE flow: try exchanging the code if present
    const code = searchParams.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
        if (cancelled) return;
        if (exchangeError) {
          // If code exchange fails, fall through to session check below
          console.warn("Code exchange failed:", exchangeError.message);
        }
      });
    }

    // For implicit flow: detectSessionInUrl handles hash tokens automatically.
    // Listen for auth state changes - works for both flows.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (cancelled) return;
        if (event === "SIGNED_IN" && session) {
          setMessage("Sign in successful. Redirecting...");
          router.replace("/home");
        }
      }
    );

    // Fallback: check if session is already established
    // (e.g., detectSessionInUrl already processed the hash before this effect ran)
    const checkExistingSession = async () => {
      // Small delay to let detectSessionInUrl process the hash fragment
      await new Promise((r) => setTimeout(r, 500));
      if (cancelled) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (session && !cancelled) {
        setMessage("Sign in successful. Redirecting...");
        router.replace("/home");
      }
    };

    checkExistingSession();

    // Timeout: if nothing happens after 8 seconds, redirect back to auth
    const timeout = setTimeout(() => {
      if (!cancelled) {
        router.replace("/auth?error=Sign+in+timed+out.+Please+try+again.");
      }
    }, 8000);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router, searchParams]);

  return (
    <main className="min-h-screen bg-[#f5ebe2] flex items-center justify-center">
      <div className="text-center sa-animate-fade-in">
        <div className="mx-auto mb-8 sa-animate-spin-slow">
          <Logo collapsed size="md" color="maroon" href={undefined} />
        </div>
        <p className="text-[#28020d] text-xl font-sans">{message}</p>
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f5ebe2] flex items-center justify-center">
          <div className="text-center sa-animate-fade-in">
            <div className="mx-auto mb-8 sa-animate-spin-slow">
              <Logo collapsed size="md" color="maroon" href={undefined} />
            </div>
            <p className="text-[#28020d] text-xl font-sans">
              Completing sign in...
            </p>
          </div>
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
