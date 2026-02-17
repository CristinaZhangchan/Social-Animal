"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, Zap, TrendingUp, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomTabBar() {
    const router = useRouter();
    const pathname = usePathname();

    const navItems = [
        { icon: Home, label: "Home", path: "/home", id: "home" },
        { icon: Zap, label: "Boost", path: "/boost", id: "boost" },
        { icon: TrendingUp, label: "Track", path: "/track", id: "track" },
        { icon: Crown, label: "Upgrade", path: "/pricing", id: "pricing" },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/50">
            <div className="flex items-center justify-around px-2 py-2 max-w-screen-sm mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    const isPricing = item.id === "pricing";

                    return (
                        <button
                            key={item.id}
                            onClick={() => router.push(item.path)}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[70px]",
                                isActive && !isPricing && "bg-primary text-primary-foreground shadow-sm",
                                isActive && isPricing && "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/25",
                                !isActive && !isPricing && "text-muted-foreground active:bg-muted",
                                !isActive && isPricing && "bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white shadow-md shadow-orange-500/20"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "h-5 w-5",
                                    isPricing && isActive && "animate-bounce"
                                )}
                            />
                            <span className="text-xs font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
