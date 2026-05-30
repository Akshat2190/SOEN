import React, { createContext, useContext, useMemo, useState } from "react";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem("soen-theme") || "light");

  const value = useMemo(() => {
    const switchTheme = (nextTheme) => {
      setTheme(nextTheme);
      localStorage.setItem("soen-theme", nextTheme);
    };

    return {
      theme,
      isDark: theme === "dark",
      switchTheme,
    };
  }, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
};
