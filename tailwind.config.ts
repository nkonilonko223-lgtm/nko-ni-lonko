import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./sanity/**/*.{ts,tsx}", // 🚀 Sécurité : On s'assure que Tailwind scanne aussi le studio
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // 1. TYPOGRAPHIE
      fontFamily: {
        fr: ["var(--font-fr)", "sans-serif"],
        kigelia: ["var(--font-kigelia)", "sans-serif"],
        tech: ["var(--font-tech)", "monospace"],
      },
      
      // 2. COULEURS (Intactes)
      colors: {
        border: "var(--color-border)",
        input: "var(--color-border)",
        ring: "var(--color-gold)",
        background: "var(--color-void)",
        foreground: "var(--color-text)",
        
        void: "var(--color-void)",
        gold: {
          DEFAULT: "var(--color-gold)",
          warm: "var(--color-gold-warm)",
          light: "var(--color-gold-light)",
        },
        muted: {
          DEFAULT: "rgba(30, 41, 59, 0.5)",
          foreground: "var(--color-text-muted)",
        },
      },

      // 3. GÉOMÉTRIE (Intacte)
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
        full: "var(--radius-full)",
      },

      // 4. OMBRES MAGNÉTIQUES (🚀 NOUVEAU : Centralisation des Glows)
      boxShadow: {
        'glow-sm': '0 0 10px rgba(251, 191, 36, 0.2)',
        'glow-md': '0 0 20px rgba(251, 191, 36, 0.4)',
        'glow-lg': '0 0 40px rgba(251, 191, 36, 0.15)',
      },

      // 5. IMAGES DE FOND
      backgroundImage: {
        "gradient-panel": "var(--gradient-panel)",
        "gradient-footer": "var(--gradient-footer)",
        "gradient-gold": "var(--gradient-text-gold)",
      },

      // 6. DYNAMIQUE CINÉMATIQUE (🚀 NOUVEAU : Courbes de Bézier 1/1000)
      transitionTimingFunction: {
        'cinematic': 'cubic-bezier(0.22, 1, 0.36, 1)', // Ultra-fluide
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Rebond organique
      },

      // 7. ANIMATIONS (Enrichies)
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        // 🚀 NOUVELLES ANIMATIONS
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-gold": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shimmer": "shimmer 8s infinite linear",
        "float": "float 6s ease-in-out infinite",
        "pulse-gold": "pulse-gold 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("tailwindcss-animate"),      
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("@tailwindcss/typography"),
  ],
};

export default config;