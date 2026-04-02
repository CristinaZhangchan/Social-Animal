"use client";

import { useRouter, usePathname } from "next/navigation";
import { pushWithTransition } from "@/lib/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
    Home,
    TrendingUp,
    LogOut,
    Zap,
    Crown,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import Logo from "./Logo";

interface AppSidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

export default function AppSidebar({ collapsed, setCollapsed }: AppSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { signOut } = useAuth();

    const handleSignOut = async () => {
        await signOut();
        pushWithTransition(router, "/");
    };

    const navItems = [
        { icon: Home, label: "Home", path: "/home", id: "home" },
        { icon: Zap, label: "Boost", path: "/boost", id: "boost" },
        { icon: TrendingUp, label: "Track", path: "/track", id: "track" },
    ];

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 h-full bg-card/80 backdrop-blur-xl border-r border-border/50 flex flex-col z-50 transition-all duration-300",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* Logo & Toggle */}
            <div
                className={cn(
                    "border-b border-border/30 flex items-center",
                    collapsed ? "p-3 justify-center" : "p-6 justify-between"
                )}
            >
                {!collapsed && (
                    <Logo size="md" href="/home" hideIcon={true} />
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? (
                        <ChevronRight className="h-5 w-5" />
                    ) : (
                        <ChevronLeft className="h-5 w-5" />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-2 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.path;

                    return (
                        <button
                            key={item.id}
                            onClick={() => pushWithTransition(router, item.path)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                                collapsed ? "justify-center" : "justify-start",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                            title={collapsed ? item.label : undefined}
                        >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            {!collapsed && (
                                <span className="font-medium">{item.label}</span>
                            )}
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
}
