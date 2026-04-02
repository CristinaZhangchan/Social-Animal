"use client";

import { useRouter } from "next/navigation";
import { pushWithTransition } from "@/lib/navigation";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
    const router = useRouter();
    const { user } = useAuth();

    const getUserInitials = () => {
        if (!user?.email) return "U";
        return user.email.substring(0, 2).toUpperCase();
    };

    return (
        <nav className="relative z-10 container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
                <Logo href={user ? "/home" : "/"} size="md" />
                <div className="flex items-center gap-4">
                    {user && (
                        <div
                            className="relative h-10 w-10 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => pushWithTransition(router, "/track")}
                            title="View Progress"
                        >
                            <Avatar className="h-10 w-10 ring-2 ring-sa-maroon/10">
                                <AvatarImage src={user.user_metadata?.avatar_url} />
                                <AvatarFallback className="bg-sa-maroon text-sa-cream font-bold">
                                    {getUserInitials()}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
