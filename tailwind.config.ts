import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular"],
      },
      colors: {
        brand: {
          50: "#fdf8e7",
          100: "#f9edba",
          200: "#f3d97a",
          500: "#C9A227",
          600: "#B8960C",
          700: "#9A7D0A",
          900: "#5C4A06",
        },
      },
      boxShadow: {
        soft: "0 18px 50px rgba(15, 23, 42, .08)",
        gold: "0 10px 30px rgba(185, 150, 12, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
