"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AppearingTextAnimation({ forceStatic = false, className = "" }: { forceStatic?: boolean, className?: string }) {
  const titles = [
    "Undergrad Student",
    "Problem Solver",
    "Developer",
    "Dreamer",
    "Explorer",
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % titles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [titles.length]);

  return (
    <div className={`h-8 flex items-center overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.p
          key={titles[index]}
          className="text-gray-500 dark:text-gray-400 text-sm font-medium flex items-center"
        >
          {titles[index].split("").map((char, i) => (
            <motion.span
              key={`${titles[index]}-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{
                duration: 0.4,
                delay: i * 0.03,
                ease: "easeOut",
              }}
              style={{ display: char === " " ? "inline-block" : "inline" }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
