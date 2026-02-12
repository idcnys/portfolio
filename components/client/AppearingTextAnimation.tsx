"use client";

import React, { useState, useEffect } from "react";

export default function AppearingTextAnimation() {
  const titles = [
    "Undergrad Student",
    "Problem Solver",
    "Developer",
    "Dreamer",
    "Explorer",
  ];
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % titles.length);
        setIsVisible(true);
      }, 500);
    }, 3000);
    return () => clearInterval(interval);
  }, [titles.length]);

  return (
    <div className="h-6 flex items-center overflow-hidden">
      <p
        className={`text-gray-500 dark:text-gray-400 text-sm font-medium leading-6 transition-opacity duration-500 ease-in-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {titles[index]}
      </p>
    </div>
  );
}
