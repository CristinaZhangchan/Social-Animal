import { cn } from "@/lib/utils";
import Link from "next/link";

interface LogoProps {
    collapsed?: boolean;
    size?: "sm" | "md" | "lg";
    href?: string;
    className?: string;
}

export default function Logo({ collapsed = false, size = "md", href = "/", className }: LogoProps) {
    const sizeMap = {
        sm: { icon: "w-7 h-7 text-lg", text: "text-lg" },
        md: { icon: "w-9 h-9 text-xl", text: "text-2xl" },
        lg: { icon: "w-11 h-11 text-2xl", text: "text-3xl" },
    };

    const s = sizeMap[size];

    const content = (
        <div className={cn("flex items-center gap-2.5", className)}>
            {/* Icon mark */}
            <div className={cn("flex-shrink-0 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold shadow-md shadow-primary/25", s.icon)}>
                🐾
            </div>
            {/* Word mark */}
            {!collapsed && (
                <span className={cn("font-bold text-primary tracking-tight whitespace-nowrap", s.text)}>
                    Social Animal
                </span>
            )}
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="hover:opacity-90 transition-opacity">
                {content}
            </Link>
        );
    }

    return content;
}
