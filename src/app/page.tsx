"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { pushWithTransition } from "@/lib/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/home");
    }
  }, [loading, router, user]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#28020d] flex items-center justify-center overflow-hidden">
        <div className="sa-animate-scale-in">
          <Image
            src="/logo-cream.svg"
            alt="Social Animal"
            width={291}
            height={432}
            priority
            className="h-auto w-[220px] sm:w-[250px] lg:w-[291px]"
          />
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-[#28020d] flex items-center justify-center cursor-pointer overflow-hidden"
      onClick={() => pushWithTransition(router, "/auth")}
    >
      <div className="sa-animate-scale-in">
        <Image
          src="/logo-cream.svg"
          alt="Social Animal"
          width={291}
          height={432}
          priority
          className="h-auto w-[220px] sm:w-[250px] lg:w-[291px]"
        />
      </div>
    </main>
  );
}
