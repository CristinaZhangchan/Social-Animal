"use client";

import { ReactNode, useState, useEffect } from "react";
import AppSidebar from "./AppSidebar";
import BottomTabBar from "./BottomTabBar";
import { Header } from "./Header";

interface AppLayoutProps {
    children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Main content area */}
            <main className="flex-1 flex flex-col min-h-screen">
                <Header />
                <div className="flex-1 p-4 lg:p-8">
                    {children}
                </div>
            </main>

            {/* Mobile: Bottom Tab Bar */}
            <BottomTabBar />
        </div>
    );
}
