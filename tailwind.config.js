/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        misty: { light: "#E1E9F4", DEFAULT: "#B2C8DF", dark: "#6E85B7" },
        sage: { light: "#F0F7F4", DEFAULT: "#D2E9E1", dark: "#A3C6B9" },
        wheat: { light: "#FCF1E6", DEFAULT: "#F9E0BB", dark: "#E8C08A" },
        coral: { light: "#FFE5E5", DEFAULT: "#FFCAC8", dark: "#E09B99" },
        lavender: { light: "#F3E9FF", DEFAULT: "#D1C4E9", dark: "#9575CD" },
        base: { 50: "#F8FAFC", 100: "#F1F5F9", 800: "#1E293B", 900: "#0F172A" },
      },
      borderRadius: { "4xl": "3rem" },
      fontFamily: { sans: ['"Pretendard"', "sans-serif"] },
      animation: { "bounce-soft": "bounce-soft 2s infinite" },
      keyframes: {
        "bounce-soft": {
          "0%, 100%": { transform: "translateY(-2%)" },
          "50%": { transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
