"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { isDarkMode, toggleTheme, isTransitioning } = useTheme();

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    toggleTheme({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  };

  return (
    <motion.button
      onClick={handleToggle}
      disabled={isTransitioning}
      whileHover={{
        scale: 1.03,
        rotate: 4,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: { delay: 0.5, duration: 0.4, ease: "backOut" },
      }}
      className={`${
        className ??
        "absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      } flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10 shadow-sm ${
        isTransitioning ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <AnimatePresence mode="wait">
        {isTransitioning ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: 360,
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              rotate: { duration: 1, repeat: Infinity, ease: "linear" },
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 },
            }}
            className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"
          />
        ) : (
          <motion.img
            key={isDarkMode ? "sun" : "moon"}
            src={
              isDarkMode
                ? "/icons/icons8-sun-50.svg"
                : "/icons/icons8-moon-symbol-50.svg"
            }
            alt="Toggle theme"
            className="w-5 h-5"
            initial={{ opacity: 0, rotate: -180, scale: 0.8 }}
            animate={{
              opacity: 1,
              rotate: 0,
              scale: 1,
              transition: {
                duration: 0.4,
                ease: "backOut",
              },
            }}
            exit={{
              opacity: 0,
              rotate: 180,
              scale: 0.8,
              transition: { duration: 0.2 },
            }}
            whileHover={{
              scale: 1.03,
              transition: { duration: 0.2 },
            }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}
