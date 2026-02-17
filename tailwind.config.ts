import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        // shadcn/ui color system (from CharmUp)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        warm: {
          DEFAULT: 'hsl(var(--warm))',
          foreground: 'hsl(var(--warm-foreground))',
          muted: 'hsl(var(--warm-muted))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        // SocialAnimal Brand Colors - Dark Sci-Fi Theme (preserved)
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
        // SocialAnimal Light Theme - Nordic Sunrise (preserved)
        "sa-light": {
          bg: {
            start: "#FDE68A",
            middle: "#FBCFE8",
            end: "#E9D5FF",
          },
          surface: "rgba(255, 255, 255, 0.6)",
          text: {
            primary: "#1F2937",
            secondary: "#6B7280",
          },
          accent: "#8B5CF6",
          border: "rgba(255, 255, 255, 0.8)",
        },
      },
      backgroundImage: {
        // CharmUp gradients
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-accent': 'var(--gradient-accent)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-mesh': 'var(--gradient-mesh)',
        // SocialAnimal gradients (preserved)
        "sa-grid":
          "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
        "sa-glow-cyan":
          "radial-gradient(ellipse at center, rgba(0,212,255,0.15) 0%, transparent 70%)",
        "sa-glow-purple":
          "radial-gradient(ellipse at center, rgba(168,85,247,0.15) 0%, transparent 70%)",
      },
      backgroundSize: {
        "grid-pattern": "40px 40px",
        "gradient-flow": "200% 100%",
      },
      boxShadow: {
        // CharmUp shadows
        soft: 'var(--shadow-soft)',
        glow: 'var(--shadow-glow)',
        elevated: 'var(--shadow-elevated)',
        '2xs': 'var(--shadow-2xs)',
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        // SocialAnimal shadows (preserved)
        "neon-cyan":
          "0 0 20px rgba(0,212,255,0.3), 0 0 40px rgba(0,212,255,0.1)",
        "neon-purple":
          "0 0 20px rgba(168,85,247,0.3), 0 0 40px rgba(168,85,247,0.1)",
        "neon-cyan-strong":
          "0 0 30px rgba(0,212,255,0.5), 0 0 60px rgba(0,212,255,0.2)",
        glass: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
        "glass-strong": "0 15px 35px -5px rgba(0, 0, 0, 0.15)",
        "accent-violet": "0 4px 14px 0 rgba(124, 58, 237, 0.3)",
        "accent-violet-strong": "0 6px 20px 0 rgba(124, 58, 237, 0.4)",
      },
      fontFamily: {
        sans: [
          'DM Sans',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ],
        serif: [
          'Source Serif Pro',
          'ui-serif',
          'Georgia',
          'Cambria',
          'Times New Roman',
          'Times',
          'serif'
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace'
        ]
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        "2xl": "16px",
        "3xl": "24px",
      },
      animation: {
        // shadcn/ui animations
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        // SocialAnimal animations (preserved)
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "border-glow": "border-glow 2s ease-in-out infinite",
        "scan-line": "scan-line 3s linear infinite",
        "gradient-flow": "gradient-flow 2s linear infinite",
      },
      keyframes: {
        // shadcn/ui keyframes
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        },
        // SocialAnimal keyframes (preserved)
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
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

