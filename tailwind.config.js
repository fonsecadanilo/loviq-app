/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    // Sobrescreve os raios padrão do Tailwind com os valores desejados
    borderRadius: {
      none: "0px",
      xs: "0.375rem",      // 6px - Tabs e filtros
      sm: "0.5rem",        // 8px - inputs menores
      DEFAULT: "0.25rem",  // 4px padrão Tailwind
      md: "0.75rem",       // 12px - botões/nav
      lg: "1rem",          // 16px - cards
      xl: "1.25rem",       // 20px - players
      '2xl': "1.5rem",     // 24px
      '3xl': "2rem",       // 32px
      full: "9999px",
    },
    extend: {
      backgroundImage: {
        // O Gradiente "Mágico" para Sidebar Active e Cards de Upgrade
        'loviq-gradient': 'linear-gradient(135deg, #FFF0F0 0%, #F3F0FF 50%, #FDF4FF 100%)',
      },
      colors: {
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--border) / <alpha-value>)",
        ring: "rgb(var(--primary) / <alpha-value>)",
        background: "rgb(var(--background) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        
        // Cores da Marca
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)", // Roxo #7D2AE8
          foreground: "#ffffff",
        },
        brand: {
          soft: "#F5F3FF", // Lilás sutil
        },
        
        // Cores de Status Suaves
        success: { DEFAULT: "#22c55e", light: "#dcfce7" },
        warning: { DEFAULT: "#f97316", light: "#ffedd5" },
        error:   { DEFAULT: "#ef4444", light: "#fee2e2" },
        info:    { DEFAULT: "#3b82f6", light: "#dbeafe" },
        
        // CTA Principal (Slate 900)
        cta: {
          DEFAULT: "#0F172A", 
          hover: "#1E293B",
        },

        muted: {
          DEFAULT: "#f8fafc", // Slate 50
          foreground: "#64748b", // Slate 500
        },
        accent: {
          DEFAULT: "#F5F3FF",
          foreground: "rgb(var(--primary) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          foreground: "rgb(var(--foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          foreground: "rgb(var(--foreground) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Playfair Display", "serif"],
        display: ["Manrope", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-from-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-in": "slide-in-from-right 0.3s ease-out",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
