import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      xs: "480px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        // Primary: Biru Muda Terang
        primary: {
          DEFAULT: "#38bdf8", // Sky-400
          hover: "#0ea5e9", // Sky-500
          light: "#e0f2fe", // Sky-50
          border: "#bae6fd", // Sky-200
        },
        // Secondary: Biru Langit Agak Gelap
        secondary: {
          DEFAULT: "#0284c7", // Sky-600
          light: "#f0f9ff", // Sky-50
        },
        // System Colors
        danger: {
          DEFAULT: "#ef4444", // Red-500
          hover: "#dc2626", // Red-600
          bg: "#fee2e2", // Red-100
          border: "#fecaca", // Red-200
        },
        success: "#10b981",
        warning: "#f59e0b",
        // Backgrounds & Text
        "bg-page": "#f8fafc",
        "bg-card": "#ffffff",
        borderDim: "#e2e8f0",
        "text-main": "#0c4a6e", // Sky-900
        "text-body": "#334155", // Slate-700
        "text-muted": "#94a3b8", // Slate-400
      },
      borderRadius: {
        DEFAULT: "12px",
      },
      boxShadow: {
        "sm-custom": "0 1px 2px 0 rgb(56 189 248 / 0.1)",
        "md-custom": "0 4px 6px -1px rgb(56 189 248 / 0.2)",
      },
      fontFamily: {
        sans: [
          '"Vend Sans"',
          "system-ui",
          "Avenir",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translate(-50%, 10px)" },
          "100%": { opacity: "1", transform: "translate(-50%, 0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.2s ease-out",
        scaleIn: "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        slideDown: "slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        slideUp: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [typography],
};
