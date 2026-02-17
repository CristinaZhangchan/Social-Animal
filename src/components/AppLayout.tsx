"use client";

import { ReactNode, useState, useEffect } from "react";
import AppSidebar from "./AppSidebar";
import BottomTabBar from "./BottomTabBar";

interface AppLayoutProps {
    children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    return (
        <div className="min-h-screen bg-background">
            {/* Desktop: Sidebar */}
            {!isMobile && (
                <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            )}

            {/* Main content area */}
            <main
                className={`min-h-screen transition-all duration-300 ${isMobile ? "pb-20" : collapsed ? "ml-16" : "ml-64"
                    }`}
            >
                <div className={isMobile ? "p-4" : "p-8"}>
                    {children}
                </div>
            </main>

            {/* Mobile: Bottom Tab Bar */}
            {isMobile && <BottomTabBar />}
        </div>
    );
}
