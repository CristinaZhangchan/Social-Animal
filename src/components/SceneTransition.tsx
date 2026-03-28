"use client";

import { cn } from "@/lib/utils";

type HighlightPetal = "top-left" | "top-right" | "right" | "bottom" | "left";

function LoaderMark({
  className,
  highlightPetal,
}: {
  className?: string;
  highlightPetal?: HighlightPetal;
}) {
  const baseFill = "#EED7C4";
  const highlightFill = "#C6AF99";

  return (
    <svg
      viewBox="0 0 291 235"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M128.77 103.192C138.937 95.771 152.734 95.771 162.9 103.192C172.999 110.563 177.188 123.693 173.341 135.589C169.487 147.503 158.357 155.685 145.835 155.685C133.313 155.685 122.183 147.503 118.33 135.589C114.483 123.693 118.672 110.563 128.77 103.192Z"
        fill="#C9AD93"
      />
      <path
        d="M113.71 187.549C129.566 165.725 162.102 165.725 177.959 187.55L212.126 234.579H181.165C177.987 234.579 175.002 233.057 173.134 230.486L145.834 192.911L118.534 230.487C116.666 233.057 113.681 234.579 110.503 234.579H79.541L113.71 187.549Z"
        fill={highlightPetal === "bottom" ? highlightFill : baseFill}
      />
      <path
        d="M56.14 200.324C55.158 197.301 55.682 193.992 57.55 191.421L92.065 143.914L36.218 125.768C33.196 124.786 30.826 122.416 29.844 119.394L22.51 96.82L77.795 114.784C103.451 123.12 113.505 154.065 97.649 175.889L63.481 222.918L56.14 200.324Z"
        fill={highlightPetal === "left" ? highlightFill : baseFill}
      />
      <path
        d="M47.878 63.961C50.449 62.094 53.758 61.569 56.78 62.551L112.616 80.693V21.984C112.616 18.806 114.137 15.821 116.708 13.953L135.912 0V58.131C135.912 85.108 109.59 104.232 83.934 95.896L28.649 77.932L47.878 63.961Z"
        fill={highlightPetal === "top-left" ? highlightFill : baseFill}
      />
      <path
        d="M207.74 95.896C182.084 104.232 155.761 85.108 155.761 58.131V0L174.989 13.97C177.56 15.838 179.081 18.824 179.081 22.001V80.7L234.906 62.56C237.928 61.578 241.238 62.103 243.809 63.97L263.025 77.932L207.74 95.896Z"
        fill={highlightPetal === "top-right" ? highlightFill : baseFill}
      />
      <path
        d="M261.825 119.411C260.843 122.433 258.473 124.803 255.451 125.784L199.619 143.925L234.125 191.419C235.993 193.99 236.517 197.299 235.535 200.322L228.194 222.918L194.025 175.889C178.169 154.064 188.223 123.12 213.879 114.784L269.165 96.82L261.825 119.411Z"
        fill={highlightPetal === "right" ? highlightFill : baseFill}
      />
    </svg>
  );
}

export default function SceneTransition({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex h-full min-h-screen w-full items-center justify-center overflow-hidden rounded-[30px] bg-[#f5ebe2] sa-noise-overlay",
        className
      )}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(249.38deg, rgba(245,235,226,0.5) 0.9%, rgba(248,223,201,0.5) 99.1%)",
        }}
      />

      <div className="relative z-10 flex h-[230px] w-[242px] items-center justify-center">
        <div className="relative h-[230px] w-[242px]">
          <LoaderMark className="h-[230px] w-[242px]" />
          <div className="pointer-events-none absolute inset-0">
            <div className="sa-loader-layer" style={{ animationDelay: "0s" }}>
              <LoaderMark className="h-[230px] w-[242px]" highlightPetal="top-left" />
            </div>
            <div className="sa-loader-layer" style={{ animationDelay: "0.24s" }}>
              <LoaderMark className="h-[230px] w-[242px]" highlightPetal="top-right" />
            </div>
            <div className="sa-loader-layer" style={{ animationDelay: "0.48s" }}>
              <LoaderMark className="h-[230px] w-[242px]" highlightPetal="right" />
            </div>
            <div className="sa-loader-layer" style={{ animationDelay: "0.72s" }}>
              <LoaderMark className="h-[230px] w-[242px]" highlightPetal="bottom" />
            </div>
            <div className="sa-loader-layer" style={{ animationDelay: "0.96s" }}>
              <LoaderMark className="h-[230px] w-[242px]" highlightPetal="left" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
