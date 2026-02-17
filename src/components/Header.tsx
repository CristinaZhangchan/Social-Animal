"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User as UserIcon, Settings } from "lucide-react";

export function Header() {
    const router = useRouter();
    const { user, signOut } = useAuth();

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    const getUserInitials = () => {
        if (!user?.email) return "U";
        return user.email.substring(0, 2).toUpperCase();
    };

    return (
        <nav className="relative z-10 container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
                <Link href={user ? "/home" : "/"} className="text-2xl font-bold text-primary">
                    Social Animal
                </Link>
                <div className="flex items-center gap-4">
                    <ThemeToggle />

                    {user ? (
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                onClick={() => router.push("/pricing")}
                                className="text-muted-foreground hover:text-foreground font-medium hidden sm:inline-flex"
                            >
                                Pricing
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={user?.user_metadata?.avatar_url} alt={user.email || "User"} />
                                            <AvatarFallback>{getUserInitials()}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || "User"}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {/* Could add Profile page link here later */}
                                    {/* <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem> */}
                                    <DropdownMenuItem onClick={handleSignOut}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                                onClick={() => router.push("/demo")}
                                className="bg-foreground text-background hover:bg-foreground/90 font-semibold rounded-full px-6"
                            >
                                Practice
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                onClick={() => router.push("/pricing")}
                                className="text-muted-foreground hover:text-foreground font-medium hidden sm:inline-flex"
                            >
                                Pricing
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => router.push("/auth")}
                                className="text-muted-foreground hover:text-foreground font-medium"
                            >
                                Log in
                            </Button>
                            <Button
                                onClick={() => router.push("/demo")}
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
