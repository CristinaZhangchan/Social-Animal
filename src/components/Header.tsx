"use client";

import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

export function Header() {
    const router = useRouter();
    const { user, signOut } = useAuth();

    const getUserInitials = () => {
        if (!user?.email) return "U";
        return user.email.substring(0, 2).toUpperCase();
    };

    const handleSignOut = async () => {
        await signOut();
        router.push("/auth");
    };

    return (
        <nav className="relative z-10 container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
                <Logo href={user ? "/home" : "/"} size="md" />
                <div className="flex items-center gap-4">
                    {user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="relative h-10 w-10 rounded-full cursor-pointer hover:opacity-80 transition-opacity">
                                    <Avatar className="h-10 w-10 ring-2 ring-sa-maroon/10">
                                        <AvatarImage src={user.user_metadata?.avatar_url} />
                                        <AvatarFallback className="bg-sa-maroon text-sa-cream font-bold">
                                            {getUserInitials()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 mt-2">
                                <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground border-b mb-1">
                                    {user.email || "User Account"}
                                </div>
                                <DropdownMenuItem
                                    onClick={handleSignOut}
                                    className="text-red-600 focus:text-red-700 cursor-pointer"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </nav>
    );
}
