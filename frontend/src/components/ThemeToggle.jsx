import React from "react";
import { useTheme } from "../context/theme.context.jsx";

const ThemeToggle = ({ isDark: overrideIsDark, switchTheme: overrideSwitchTheme }) => {
  const themeContext = useTheme();
  const isDark = overrideIsDark ?? themeContext.isDark;
  const switchTheme = overrideSwitchTheme ?? themeContext.switchTheme;

  return (
    <div
      className={`inline-flex h-10 rounded-md border p-1 ${
        isDark
          ? "border-zinc-700 text-zinc-200"
          : "border-zinc-300 text-zinc-700"
      }`}
      aria-label="Theme"
    >
      <button
        type="button"
        onClick={() => switchTheme("light")}
        className={`flex h-8 w-9 items-center justify-center rounded-md transition ${
          !isDark
            ? "bg-zinc-950 text-white"
            : "text-zinc-400 hover:text-zinc-50"
        }`}
        title="Light theme"
      >
        <i className="ri-sun-line" />
      </button>
      <button
        type="button"
        onClick={() => switchTheme("dark")}
        className={`flex h-8 w-9 items-center justify-center rounded-md transition ${
          isDark
            ? "bg-zinc-50 text-zinc-950"
            : "text-zinc-500 hover:text-zinc-950"
        }`}
        title="Dark theme"
      >
        <i className="ri-moon-line" />
      </button>
    </div>
  );
};

export default ThemeToggle;
