import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        bricolage: ["var(--font-bricolage)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        ink: {
          primary: "#303030",
          secondary: "#5E5E5E",
          muted: "#A9A9A9",
        },
        surface: {
          white: "#FFFFFF",
          off: "#F6F6F6",
          off20: "#F0F0F0",
          off40: "#DADADA",
        },
        brand: {
          orange: "#FF5623",
          orangeAlt: "#FF7950",
          gradientFrom: "#E56820",
          gradientTo: "#D45E3E",
        },
        button: {
          primary: "#181818",
          dark: "#2B2B2B",
        },
      },
      borderRadius: {
        pill: "100px",
      },
      letterSpacing: {
        tight40: "-0.04em",
      },
      boxShadow: {
        sidebar:
          "0px 16px 24px rgba(0,0,0,0.12), 0px 32px 24px rgba(0,0,0,0.2)",
        navGlow:
          "inset 0px -1px 3.5px rgba(177,177,177,0.6), inset 0px 0px 34.5px rgba(255,255,255,0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
