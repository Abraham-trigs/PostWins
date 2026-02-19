// apps/website/tailwind.config.ts
import type { Config } from "tailwindcss";

/**
 * Design reasoning:
 * Tailwind v4 is zero-config first. Keep configuration minimal.
 * No container-queries plugin (built-in in v4).
 * Scan entire src directory to prevent missing class generation.
 *
 * Structure:
 * - Unified content glob
 * - Extended theme tokens
 * - Custom animation + keyframes
 *
 * Implementation guidance:
 * - Do NOT use require()
 * - Do NOT include @tailwind directives in CSS (v4 uses @import)
 * - Keep config small for Turbopack performance
 *
 * Scalability insight:
 * If design tokens expand across apps, extract shared theme
 * into a workspace preset package instead of duplicating config.
 */

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],

  theme: {
    extend: {
      colors: {
        dimpact: {
          brand: "#0F172A",
          action: "#2563EB",
          surface: "#F8FAFC",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },

  plugins: [],
};

export default config;
