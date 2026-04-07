"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface ThemeToggleOrigin {
  x: number;
  y: number;
}

interface ThemeRippleState {
  x: number;
  y: number;
  size: number;
  nextDark: boolean;
  key: number;
  visible: boolean;
}

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: (origin?: ThemeToggleOrigin) => void;
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
  const [ripple, setRipple] = useState<ThemeRippleState>({
    x: 0,
    y: 0,
    size: 0,
    nextDark: false,
    key: 0,
    visible: false,
  });

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

  const toggleTheme = (origin?: ThemeToggleOrigin) => {
    if (isTransitioning || initialLoad) return; // Prevent toggles during initial load or transitions

    setIsTransitioning(true);

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const centerX = origin?.x ?? viewportWidth / 2;
    const centerY = origin?.y ?? viewportHeight / 2;
    const radius = Math.hypot(
      Math.max(centerX, viewportWidth - centerX),
      Math.max(centerY, viewportHeight - centerY),
    );
    const nextDark = !isDarkMode;

    setRipple((prev) => ({
      x: centerX,
      y: centerY,
      size: radius,
      nextDark,
      key: prev.key + 1,
      visible: true,
    }));

    // Add transition class for smooth animation
    document.documentElement.style.transition =
      "background-color 0.75s ease, color 0.75s ease";

    // Delay the actual theme change for smooth transition
    setTimeout(() => {
      setIsDarkMode(nextDark);

      // Remove transition after change is complete
      setTimeout(() => {
        setIsTransitioning(false);
        setRipple((prev) => ({ ...prev, visible: false }));
        document.documentElement.style.transition = "";
      }, 750); // Match the CSS transition duration
    }, 380); // Small delay before changing
  };

  return (
    <ThemeContext.Provider
      value={{ isDarkMode, toggleTheme, mounted, isTransitioning }}
    >
      {ripple.visible && (
        <div
          key={ripple.key}
          className="theme-ripple-overlay"
          style={{
            left: `${ripple.x - ripple.size}px`,
            top: `${ripple.y - ripple.size}px`,
            width: `${ripple.size * 2}px`,
            height: `${ripple.size * 2}px`,
            backgroundColor: ripple.nextDark ? "#0f0f0f" : "#ffffff",
          }}
        />
      )}
      {children}
      <style jsx global>{`
        .theme-ripple-overlay {
          position: fixed;
          border-radius: 9999px;
          transform: scale(0);
          transform-origin: center;
          pointer-events: none;
          z-index: 9999;
          animation: theme-ripple-expand 0.95s cubic-bezier(0.19, 1, 0.22, 1)
            forwards;
          opacity: 0.35;
        }

        @keyframes theme-ripple-expand {
          0% {
            transform: scale(0);
            opacity: 0.3;
          }
          60% {
            opacity: 0.35;
          }
          100% {
            transform: scale(1);
            opacity: 0.4;
          }
        }
      `}</style>
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
