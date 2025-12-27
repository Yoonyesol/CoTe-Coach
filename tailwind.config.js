/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Natural Pastel Palette
        misty: {
          light: "#E1E9F4",
          DEFAULT: "#B2C8DF", // 차분한 블루
          dark: "#6E85B7",
        },
        sage: {
          light: "#F0F7F4",
          DEFAULT: "#D2E9E1", // 편안한 녹색
          dark: "#A3C6B9",
        },
        wheat: {
          light: "#FCF1E6",
          DEFAULT: "#F9E0BB", // 부드러운 노랑
          dark: "#E8C08A",
        },
        coral: {
          light: "#FFE5E5",
          DEFAULT: "#FFCAC8", // 따뜻한 코랄 (중성적)
          dark: "#E09B99",
        },
        lavender: {
          light: "#F3E9FF",
          DEFAULT: "#D1C4E9", // 부드러운 보라
          dark: "#9575CD",
        },
        // Base Grays for Dark Mode & Backgrounds
        base: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          800: "#1E293B",
          900: "#0F172A",
        },
      },
      borderRadius: {
        "2xl": "1.5rem",
        "3xl": "2rem",
        "4xl": "3rem", // Extra Rounded for friendly feel
      },
      fontFamily: {
        sans: ['"Pretendard"', '"Inter"', "sans-serif"],
      },
      animation: {
        "bounce-soft": "bounce-soft 2s infinite",
      },
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
