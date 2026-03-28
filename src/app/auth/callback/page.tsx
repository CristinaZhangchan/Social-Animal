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

    const finishSignIn = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (error) {
        if (!cancelled) {
          const params = new URLSearchParams({
            error: errorDescription || error,
          });
          router.replace(`/auth?${params.toString()}`);
        }
        return;
      }

      if (!code) {
        router.replace("/auth");
        return;
      }

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        if (!cancelled) {
          const params = new URLSearchParams({
            error: exchangeError.message,
          });
          router.replace(`/auth?${params.toString()}`);
        }
        return;
      }

      if (!cancelled) {
        setMessage("Sign in successful. Redirecting...");
        router.replace("/home");
      }
    };

    void finishSignIn();

    return () => {
      cancelled = true;
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
