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
    <div className={`h-6 flex items-center overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.p
          key={titles[index]}
          initial={forceStatic ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
          transition={forceStatic && index === 0 ? { duration: 0 } : {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-6"
        >
          {titles[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
