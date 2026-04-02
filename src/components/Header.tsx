"use client";

import { useRouter } from "next/navigation";
import { pushWithTransition } from "@/lib/navigation";
import Logo from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
    const router = useRouter();
    const { user, signOut } = useAuth();

    const handleSignOut = async () => {
        await signOut();
        pushWithTransition(router, "/");
    };

    const getUserInitials = () => {
        if (!user?.email) return "U";
        return user.email.substring(0, 2).toUpperCase();
    };

    return (
        <nav className="relative z-10 container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
                <Logo href={user ? "/home" : "/"} size="md" />
                <div className="flex items-center gap-4">
                    <ThemeToggle />

                    {user ? (
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                onClick={() => pushWithTransition(router, "/pricing")}
                                className="text-muted-foreground hover:text-foreground font-medium hidden sm:inline-flex"
                            >
                                Pricing
                            </Button>

                            {/* Simple Avatar */}
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

                            <Button
                                variant="ghost"
                                onClick={handleSignOut}
                                className="text-muted-foreground hover:text-foreground font-medium hidden xs:inline-flex"
                            >
                                Log out
                            </Button>
                            <Button
                                onClick={() => pushWithTransition(router, "/demo")}
                                className="bg-foreground text-background hover:bg-foreground/90 font-semibold rounded-full px-6"
                            >
                                Practice
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                onClick={() => pushWithTransition(router, "/pricing")}
                                className="text-muted-foreground hover:text-foreground font-medium hidden sm:inline-flex"
                            >
                                Pricing
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => pushWithTransition(router, "/auth")}
                                className="text-muted-foreground hover:text-foreground font-medium"
                            >
                                Log in
                            </Button>
                            <Button
                                onClick={() => pushWithTransition(router, "/demo")}
                                className="bg-foreground text-background hover:bg-foreground/90 font-semibold rounded-full px-6"
                            >
                                Get Started
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
