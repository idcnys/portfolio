"use client";

import { useTheme } from "@/lib/context/ThemeContext";

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme, isTransitioning } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      disabled={isTransitioning}
      className={`absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all z-10 shadow-sm ${
        isTransitioning ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {isTransitioning ? (
        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        <img
          src={
            isDarkMode
              ? "/icons/icons8-sun-50.svg"
              : "/icons/icons8-moon-symbol-50.svg"
          }
          alt="Toggle theme"
          className="w-5 h-5"
        />
      )}
    </button>
  );
}
