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
        // shadcn/ui compatibility
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
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        // SocialAnimal Warm Theme
        sa: {
          maroon: '#28020D',
          cream: '#F5EBE2',
          'cream-dark': '#F8DFC9',
          gold: '#C8AD93',
          'gold-muted': '#987C63',
          'gold-light': '#EDD7C6',
          'gold-dark': '#A7988A',
          divider: '#CFB49E',
          surface: '#D1C0B4',
          // Score colors
          'score-blue': '#A6C3FF',
          'score-blue-dark': '#2E3664',
          'score-blue-light': '#C6D9FF',
          'score-pink': '#EFC5EC',
          'score-pink-dark': '#644B62',
          'score-green': '#CDE0B4',
          'score-green-dark': '#265B38',
        },
      },
      fontFamily: {
        sans: ['Figtree', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Libre Baskerville', 'Georgia', 'serif'],
        heading: ['Libre Baskerville', 'Georgia', 'serif'],
        display: ['Libre Baskerville', 'Georgia', 'serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '30px',
        '5xl': '45px',
        'pill': '75px',
        'full-pill': '43.75px',
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'sa-fade-in 0.6s ease-out forwards',
        'scale-in': 'sa-scale-in 0.4s ease-out forwards',
        'pulse-soft': 'sa-pulse-soft 2s ease-in-out infinite',
        'spin-slow': 'sa-spin-slow 8s linear infinite',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'sa-fade-in': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'sa-scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' }
        },
        'sa-pulse-soft': {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' }
        },
        'sa-spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' }
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
