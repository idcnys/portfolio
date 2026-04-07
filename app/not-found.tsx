"use client";

import React from "react";
import Link from "next/link";
import { ThemeProvider, useTheme } from "../lib/context/ThemeContext";

const NotFoundComponent: React.FC = () => {
  const { isDarkMode, toggleTheme, mounted } = useTheme();

  const handleThemeToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    toggleTheme({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-center transition-colors duration-300 relative">
      {/* Theme Toggle Button */}
      <button
        onClick={handleThemeToggle}
        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-lg z-10"
      >
        <img
          src={
            isDarkMode
              ? "/icons/icons8-sun-50.svg"
              : "/icons/icons8-moon-symbol-50.svg"
          }
          alt="Toggle theme"
          className="w-6 h-6"
        />
      </button>

      <div className="relative">
        {/* Decorative background element */}
        <div className="absolute -inset-10 bg-[#FFDB14]/20 dark:bg-[#FFDB14]/10 blur-3xl rounded-full opacity-50 animate-pulse"></div>

        <h1 className="relative text-[120px] md:text-[200px] font-black leading-none text-gray-900 dark:text-white tracking-tighter select-none">
          4<span className="text-[#FFDB14]">0</span>4
        </h1>
      </div>

      <div className="mt-8 max-w-md">
        <h2 className="text-2xl md:text-3xl font-black text-gray-800 dark:text-gray-100 mb-4 tracking-tight uppercase">
          Lost in the Matrix?
        </h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium mb-10 leading-relaxed">
          The page you're looking for has either been moved, deleted, or never
          existed in this timeline. Let's get you back on track.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-100 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl hover:shadow-[#FFDB14]/20"
        >
          <i className="fas fa-home"></i>
          Back to Safety
        </Link>
      </div>

      <div className="mt-20 flex gap-6 text-gray-400 dark:text-gray-600 text-xl">
        <i className="fas fa-code"></i>
        <i className="fas fa-terminal"></i>
        <i className="fas fa-bolt"></i>
      </div>

      <style jsx>{`
        @keyframes glitch {
          0% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
          100% {
            transform: translate(0);
          }
        }
        h1:hover {
          animation: glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both
            infinite;
        }
      `}</style>
    </div>
  );
};

const NotFound: React.FC = () => {
  return (
    <ThemeProvider>
      <NotFoundComponent />
    </ThemeProvider>
  );
};

export default NotFound;
