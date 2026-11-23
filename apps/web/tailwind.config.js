/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          900: "#0b1329",
          800: "#131f42",
          700: "#1d2d5a",
          600: "#273c75",
        },
        brand: {
          primary: "#2563eb",
          accent: "#3b82f6",
        },
      },
    },
  },
  plugins: [],
};
