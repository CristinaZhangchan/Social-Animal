'use client';

import { buildTransitionHref, isInternalRoute } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface LogoProps {
  collapsed?: boolean;
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
  color?: 'maroon' | 'cream';
  hideIcon?: boolean;
}

/* The actual Social Animal logo icon from Figma — a human-star shape */
function LogoIcon({ fill, className }: { fill: string; className?: string }) {
  return (
    <svg viewBox="0 0 291 235" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Center circle (head) */}
      <path d="M128.77 103.192C138.937 95.771 152.734 95.771 162.9 103.192C172.999 110.563 177.188 123.693 173.341 135.589C169.487 147.503 158.357 155.685 145.835 155.685C133.313 155.685 122.183 147.503 118.33 135.589C114.483 123.693 118.672 110.563 128.77 103.192Z" fill={fill} />
      {/* Bottom legs */}
      <path d="M113.71 187.549C129.566 165.725 162.102 165.725 177.959 187.55L212.126 234.579H181.165C177.987 234.579 175.002 233.057 173.134 230.486L145.834 192.911L118.534 230.487C116.666 233.057 113.681 234.579 110.503 234.579H79.541L113.71 187.549Z" fill={fill} />
      {/* Left arm */}
      <path d="M56.14 200.324C55.158 197.301 55.682 193.992 57.55 191.421L92.065 143.914L36.218 125.768C33.196 124.786 30.826 122.416 29.844 119.394L22.51 96.82L77.795 114.784C103.451 123.12 113.505 154.065 97.649 175.889L63.481 222.918L56.14 200.324Z" fill={fill} />
      {/* Top-left arm */}
      <path d="M47.878 63.961C50.449 62.094 53.758 61.569 56.78 62.551L112.616 80.693V21.984C112.616 18.806 114.137 15.821 116.708 13.953L135.912 0V58.131C135.912 85.108 109.59 104.232 83.934 95.896L28.649 77.932L47.878 63.961Z" fill={fill} />
      {/* Top-right arm */}
      <path d="M207.74 95.896C182.084 104.232 155.761 85.108 155.761 58.131V0L174.989 13.97C177.56 15.838 179.081 18.824 179.081 22.001V80.7L234.906 62.56C237.928 61.578 241.238 62.103 243.809 63.97L263.025 77.932L207.74 95.896Z" fill={fill} />
      {/* Right arm */}
      <path d="M261.825 119.411C260.843 122.433 258.473 124.803 255.451 125.784L199.619 143.925L234.125 191.419C235.993 193.99 236.517 197.299 235.535 200.322L228.194 222.918L194.025 175.889C178.169 154.064 188.223 123.12 213.879 114.784L269.165 96.82L261.825 119.411Z" fill={fill} />
    </svg>
  );
}

export default function Logo({ collapsed = false, size = "md", href = "/", className, color = 'maroon', hideIcon = false }: LogoProps) {
  const sizeMap = {
    sm: { icon: 'w-10 h-10', text: 'text-lg' },
    md: { icon: 'w-16 h-16', text: 'text-2xl' },
    lg: { icon: 'w-24 h-24', text: 'text-3xl' },
  };

  const s = sizeMap[size];
  const fillColor = color === 'maroon' ? '#28020D' : '#F5EBE2';

  const content = (
    <div className={cn("flex items-center gap-3", className)}>
      {hideIcon ? null : (
        <div className={cn("flex-shrink-0", s.icon)}>
          <LogoIcon fill={fillColor} className="w-full h-full" />
        </div>
      )}
      {!collapsed && (
        <span
          className={cn(
            "font-bold tracking-tight whitespace-nowrap",
            s.text,
            color === 'maroon' ? 'text-sa-maroon' : 'text-sa-cream'
          )}
          style={{ fontFamily: "'Fedro', 'Libre Baskerville', serif" }}
        >
          Social Animal
        </span>
      )}
    </div>
  );

  if (href) {
    const nextHref = isInternalRoute(href) ? buildTransitionHref(href) : href;

    return (
      <Link href={nextHref} className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
