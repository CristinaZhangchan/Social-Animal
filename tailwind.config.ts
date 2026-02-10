import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // SocialAnimal Brand Colors - Dark Sci-Fi Theme
        sa: {
          bg: {
            primary: "#0a0a0f",
            secondary: "#12121a",
            tertiary: "#1a1a24",
          },
          accent: {
            cyan: "#00d4ff",
            purple: "#a855f7",
            magenta: "#ff00ff",
          },
          text: {
            primary: "#ffffff",
            secondary: "#94a3b8",
            muted: "#64748b",
          },
        },
        // SocialAnimal Light Theme - Nordic Sunrise
        "sa-light": {
          bg: {
            start: "#FDE68A", // Amber-200
            middle: "#FBCFE8", // Pink-200
            end: "#E9D5FF", // Purple-200
          },
          surface: "rgba(255, 255, 255, 0.6)",
          text: {
            primary: "#1F2937", // Gray-800
            secondary: "#6B7280", // Gray-500
          },
          accent: "#8B5CF6", // Violet-500
          border: "rgba(255, 255, 255, 0.8)",
        },
        // Legacy CharmUp colors (for gradual migration)
        charmup: {
          pink: "#FFB6D9",
          yellow: "#FFE66D",
          purple: "#D4A5FF",
          lilac: "#E0C4FF",
        },
      },
      backgroundImage: {
        "sa-grid":
          "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
        "sa-glow-cyan":
          "radial-gradient(ellipse at center, rgba(0,212,255,0.15) 0%, transparent 70%)",
        "sa-glow-purple":
          "radial-gradient(ellipse at center, rgba(168,85,247,0.15) 0%, transparent 70%)",
        "charmup-gradient":
          "linear-gradient(135deg, #FFE66D 0%, #FFB6D9 50%, #D4A5FF 100%)",
        "charmup-gradient-reverse":
          "linear-gradient(135deg, #D4A5FF 0%, #FFB6D9 50%, #FFE66D 100%)",
        // Light Theme Gradients
        "light-gradient":
          "linear-gradient(135deg, #FDE68A 0%, #FBCFE8 50%, #E9D5FF 100%)",
        "light-gradient-flow":
          "linear-gradient(90deg, #FDE68A, #FBCFE8, #E9D5FF, #FBCFE8, #FDE68A)",
      },
      backgroundSize: {
        "grid-pattern": "40px 40px",
        "gradient-flow": "200% 100%",
      },
      boxShadow: {
        "neon-cyan":
          "0 0 20px rgba(0,212,255,0.3), 0 0 40px rgba(0,212,255,0.1)",
        "neon-purple":
          "0 0 20px rgba(168,85,247,0.3), 0 0 40px rgba(168,85,247,0.1)",
        "neon-cyan-strong":
          "0 0 30px rgba(0,212,255,0.5), 0 0 60px rgba(0,212,255,0.2)",
        // Light Theme Shadows
        glass: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
        "glass-strong": "0 15px 35px -5px rgba(0, 0, 0, 0.15)",
        "accent-violet": "0 4px 14px 0 rgba(124, 58, 237, 0.3)",
        "accent-violet-strong": "0 6px 20px 0 rgba(124, 58, 237, 0.4)",
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "border-glow": "border-glow 2s ease-in-out infinite",
        "scan-line": "scan-line 3s linear infinite",
        "gradient-flow": "gradient-flow 2s linear infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        "border-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0,212,255,0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(0,212,255,0.6)" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "gradient-flow": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};

export default config;
