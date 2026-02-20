import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
      
      // 2. COULEURS
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

      // 3. GÉOMÉTRIE
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
        full: "var(--radius-full)",
      },

      // 4. IMAGES DE FOND
      backgroundImage: {
        "gradient-panel": "var(--gradient-panel)",
        "gradient-footer": "var(--gradient-footer)",
        "gradient-gold": "var(--gradient-text-gold)",
      },

      // 5. ANIMATIONS
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
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shimmer": "shimmer 8s infinite linear",
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