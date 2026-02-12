"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  mounted: boolean;
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    // Start with a smooth initial transition
    setIsTransitioning(true);
    setMounted(true);

    // Add transition styles immediately
    document.documentElement.style.transition =
      "background-color 0.8s ease, color 0.8s ease";

    // Delay initial theme detection for smooth appearance
    setTimeout(() => {
      // Check localStorage on mount
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        const isDark = savedTheme === "dark";
        setIsDarkMode(isDark);
        if (isDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else {
        // Check system preference
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        setIsDarkMode(prefersDark);
        if (prefersDark) {
          document.documentElement.classList.add("dark");
        }
        localStorage.setItem("theme", prefersDark ? "dark" : "light");
      }

      // End initial transition after theme is applied
      setTimeout(() => {
        setIsTransitioning(false);
        setInitialLoad(false);
        document.documentElement.style.transition = "";
      }, 800); // Match the transition duration
    }, 500); // Delay for smooth initial appearance
  }, []);

  useEffect(() => {
    if (!mounted || initialLoad) return;

    // Update document class and localStorage for subsequent changes
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode, mounted, initialLoad]);

  const toggleTheme = () => {
    if (isTransitioning || initialLoad) return; // Prevent toggles during initial load or transitions

    setIsTransitioning(true);

    // Add transition class for smooth animation
    document.documentElement.style.transition =
      "background-color 0.5s ease, color 0.5s ease";

    // Delay the actual theme change for smooth transition
    setTimeout(() => {
      setIsDarkMode(!isDarkMode);

      // Remove transition after change is complete
      setTimeout(() => {
        setIsTransitioning(false);
        document.documentElement.style.transition = "";
      }, 500); // Match the CSS transition duration
    }, 300); // Small delay before changing
  };

  return (
    <ThemeContext.Provider
      value={{ isDarkMode, toggleTheme, mounted, isTransitioning }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeProvider;
