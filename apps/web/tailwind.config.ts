import type { Config } from "tailwindcss";

export default {
  // Configured to use the `.dark` class we defined in your CSS file
  darkMode: ["class"], 
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
extend: {
  colors: {
    ink: "var(--color-text-primary)",
    muted: "var(--color-text-secondary)",
    inverse: "var(--color-text-inverse)",

    primary: "var(--color-bg-primary)",
    secondary: "var(--color-bg-secondary)",
    surface: "var(--color-bg-surface)",
    elevated: "var(--color-bg-elevated)",

    brand: "var(--color-brand-primary)",
    teal: "var(--color-brand-accent)",
    red: "var(--color-brand-danger)",

    line: "var(--color-border-subtle)",
  },
  fontFamily: {
    sans: ["var(--font-sans)"],
  },
}
  },
  plugins: [],
} satisfies Config;
