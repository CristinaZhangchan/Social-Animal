"use client";

import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { Zap, MessageSquare, TrendingUp } from "lucide-react";

export default function HomePage() {
    const router = useRouter();

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto">
                {/* Welcome */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">
                        Welcome to <span className="text-primary">Social Animal</span>
                    </h1>
                    <p className="text-muted-foreground max-w-xl">
                        Master every conversation with AI-powered practice. Choose how you want to improve today.
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-5">
                    <div
                        onClick={() => router.push("/demo")}
                        className="group p-6 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <MessageSquare className="h-7 w-7 text-primary" />
                        </div>
                        <h3 className="font-bold text-xl mb-2">Practice Chat</h3>
                        <p className="text-sm text-muted-foreground">Start a conversation with an AI avatar. Practice interviews, dates, or custom scenarios.</p>
                    </div>

                    <div
                        onClick={() => router.push("/boost")}
                        className="group p-6 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-2xl cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Zap className="h-7 w-7 text-orange-600" />
                        </div>
                        <h3 className="font-bold text-xl mb-2">Skill Games</h3>
                        <p className="text-sm text-muted-foreground">Quick challenges to sharpen specific skills. Beat your high scores!</p>
                    </div>

                    <div
                        onClick={() => router.push("/track")}
                        className="group p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <TrendingUp className="h-7 w-7 text-emerald-600" />
                        </div>
                        <h3 className="font-bold text-xl mb-2">Track Progress</h3>
                        <p className="text-sm text-muted-foreground">See your growth, review past sessions, and track your communication journey.</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
