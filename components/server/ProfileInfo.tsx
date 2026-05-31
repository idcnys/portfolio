"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, Variants, AnimatePresence } from "framer-motion";
import ThemeToggle from "../client/ThemeToggle";
import SocialLinks from "../client/SocialLinks";
import AppearingTextAnimation from "../client/AppearingTextAnimation";
import ActionButtons from "../client/ActionButtons";
import { usePathname, useSearchParams } from "next/navigation";

const TypewriterText: React.FC<{
  text: string;
  speed?: number;
  className?: string;
  onStart?: () => void;
  onComplete?: () => void;
}> = ({ text, speed = 28, className, onStart, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [canStartTyping, setCanStartTyping] = useState(false);
  const [delayElapsed, setDelayElapsed] = useState(false);
  const hasTypedRef = useRef(false);
  const onStartRef = useRef(onStart);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onStartRef.current = onStart;
    onCompleteRef.current = onComplete;
  }, [onStart, onComplete]);

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      setDelayElapsed(true);
    }, 3000);

    return () => clearTimeout(delayTimer);
  }, []);

  useEffect(() => {
    if (document.readyState === "complete") {
      setCanStartTyping(true);
      return;
    }

    const handleLoaded = () => setCanStartTyping(true);
    window.addEventListener("load", handleLoaded);

    return () => window.removeEventListener("load", handleLoaded);
  }, []);

  useEffect(() => {
    if (!canStartTyping || !delayElapsed || hasTypedRef.current) return;

    hasTypedRef.current = true;
    let charIndex = 0;
    setDisplayedText("");
    onStartRef.current?.();

    const timer = setInterval(() => {
      charIndex += 1;
      setDisplayedText(text.slice(0, charIndex));

      if (charIndex >= text.length) {
        clearInterval(timer);
        onCompleteRef.current?.();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, canStartTyping, delayElapsed]);

  return <p className={className}>{displayedText}</p>;
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const avatarVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.68, -0.55, 0.265, 1.55],
    },
  },
};

const timelineVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export default function ProfileInfo({ 
  forceStatic, 
  embedded = false,
  isEdgeToEdge = false
}: { 
  forceStatic?: boolean;
  embedded?: boolean;
  isEdgeToEdge?: boolean;
}) {
  const [hasBottomTypingStarted, setHasBottomTypingStarted] = useState(false);
  const [hasBottomTypingCompleted, setHasBottomTypingCompleted] = useState(false);
  const [isBottomTextVisible, setIsBottomTextVisible] = useState(true);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const view = searchParams.get("view");
  const isHome = !view && pathname === "/";

  const handleBottomTypingStart = useCallback(() => {
    setHasBottomTypingStarted(true);
  }, []);

  const handleBottomTypingComplete = useCallback(() => {
    setHasBottomTypingCompleted(true);
    // Hide text after 5 seconds
    setTimeout(() => {
      setIsBottomTextVisible(false);
    }, 5000);
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial={forceStatic ? "visible" : "hidden"}
      animate="visible"
      className={`h-full ${embedded ? "bg-transparent border-none shadow-none p-0" : `bg-white/70 dark:bg-gray-900/70 backdrop-blur-md p-6 ${isEdgeToEdge ? "rounded-none" : "rounded-l-xl md:rounded-r-none"} shadow-[0_10px_30px_rgba(15,23,42,0.06)] border border-gray-100 dark:border-gray-800`} relative flex flex-col`}
    >
      {!embedded && !isHome && (
        <motion.div variants={itemVariants}>
          <ThemeToggle />
        </motion.div>
      )}

      <motion.div
        variants={itemVariants}
        className="flex items-center gap-4 mb-4"
      >
        <motion.div
          variants={avatarVariants}
          className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-600 dark:border-[#FFDB14] flex-shrink-0 relative"
          whileHover={{ scale: 1.02, rotate: 1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Image
            src="/avatar.png"
            alt="Bitto Saha"
            width={64}
            height={64}
            sizes="64px"
            className="w-full h-full object-cover"
            priority
          />
        </motion.div>
        <div className="min-w-0 flex-1">
          <motion.h1
            variants={itemVariants}
            className="text-3xl font-bold text-gray-800 dark:text-gray-100"
          >
            Bitto Saha
          </motion.h1>
          <motion.div variants={itemVariants}>
            <AppearingTextAnimation forceStatic={forceStatic} />
          </motion.div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <SocialLinks />
      </motion.div>

      <motion.hr
        variants={itemVariants}
        className="mb-1 border-gray-100 dark:border-gray-800"
      />

      <motion.div
        variants={itemVariants}
        className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3"
      >
        I'm a Computer Science student at RUET. I love turning ideas into real
        products and have a deep interest in Artificial Intelligence and Cyber
        Security.
      </motion.div>

      <motion.h3
        variants={itemVariants}
        className="text-xl mb-4 text-amber-600 dark:text-[#FFDB14] font-playwrite"
      >
        Education
      </motion.h3>
      <motion.div
        variants={containerVariants}
        className="space-y-4 relative border-l-2 border-amber-600/40 dark:border-gray-700 ml-2 pl-6"
      >
        <motion.div variants={timelineVariants} className="relative">
          <motion.span
            className="absolute -left-[31px] top-1.5 w-3 h-3 bg-[#FFDB14] dark:bg-[#FFDB14] rounded-full border-2 border-amber-600 dark:border-gray-900"
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <span className="inline-block px-2 py-0.5 bg-[#FFDB14] dark:bg-[#FFDB14] text-[10px] font-bold rounded mb-1 text-gray-900">
            Present
          </span>
          <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">
            Bachelor's in CSE
          </h4>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Rajshahi University Of Engineering & Technology, Rajshahi
          </p>
        </motion.div>
        <motion.div variants={timelineVariants} className="relative">
          <motion.span
            className="absolute -left-[31px] top-1.5 w-3 h-3 bg-[#FFDB14] dark:bg-[#FFDB14] rounded-full border-2 border-amber-600 dark:border-gray-900"
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <span className="inline-block px-2 py-0.5 bg-[#FFDB14] dark:bg-[#FFDB14] text-[10px] font-bold rounded mb-1 text-gray-900">
            2024
          </span>
          <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">
            Higher Secondary Certificate (HSC)
          </h4>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Rajshahi College, Rajshahi
          </p>
        </motion.div>
        <motion.div variants={timelineVariants} className="relative">
          <motion.span
            className="absolute -left-[31px] top-1.5 w-3 h-3 bg-[#FFDB14] dark:bg-[#FFDB14] rounded-full border-2 border-amber-600 dark:border-gray-900"
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <span className="inline-block px-2 py-0.5 bg-[#FFDB14] dark:bg-[#FFDB14] text-[10px] font-bold rounded mb-1 text-gray-900">
            2022
          </span>
          <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">
            Senior School Certificate (SSC)
          </h4>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Dhunat Govt. N. U. Pilot Model High School, Bogura
          </p>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="relative z-10 mb-3 shrink-0">
        <ActionButtons forceStatic={forceStatic} />
      </motion.div>

      <AnimatePresence>
        {isBottomTextVisible && (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="hidden md:block bg-gradient-to-br mt-auto from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-850 p-2 rounded shadow-[0_10px_26px_rgba(15,23,42,0.1)] relative z-0"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-start gap-3 mb-1">
              <motion.div
                className={`w-10 h-10 rounded-full border-2 flex-shrink-0 relative overflow-hidden ${
                  hasBottomTypingCompleted ? "border-[#FFDB14]" : "border-transparent"
                }`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity: hasBottomTypingStarted ? 1 : 0,
                  scale: hasBottomTypingStarted ? 1 : 0.95,
                }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                whileHover={{ rotate: 2 }}
              >
                <Image
                  src="/avatar.png"
                  alt="Avatar"
                    width={40}
                    height={40}
                    sizes="40px"
                    className="w-full h-full object-cover"
                />
              </motion.div>
              <TypewriterText
                text="Thanks for visiting my portfolio! Explore my projects, activities, and certificates. Feel free to reach out if you'd like to collaborate or just chat."
                className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
                onStart={handleBottomTypingStart}
                onComplete={handleBottomTypingComplete}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
