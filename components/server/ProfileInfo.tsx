"use client";

import { motion, Variants } from "framer-motion";
import ThemeToggle from "../client/ThemeToggle";
import SocialLinks from "../client/SocialLinks";
import AppearingTextAnimation from "../client/AppearingTextAnimation";
import ActionButtons from "../client/ActionButtons";

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

export default function ProfileInfo() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-auto md:h-full bg-white dark:bg-gray-900 p-6 rounded shadow-sm border border-gray-200 dark:border-gray-800 relative flex flex-col"
    >
      <motion.div variants={itemVariants}>
        <ThemeToggle />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex items-center gap-4 mb-4"
      >
        <motion.div
          variants={avatarVariants}
          className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#FFDB14] flex-shrink-0"
          whileHover={{ scale: 1.02, rotate: 1 }}
          whileTap={{ scale: 0.95 }}
        >
          <img
            src="/avatar.png"
            alt="Bitto Saha"
            className="w-full h-full object-cover"
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
            <AppearingTextAnimation />
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
        className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100 tracking-wider text-xs"
      >
        Education
      </motion.h3>
      <motion.div
        variants={containerVariants}
        className="space-y-4 relative border-l-2 border-gray-300 dark:border-gray-700 ml-2 pl-6"
      >
        <motion.div variants={timelineVariants} className="relative">
          <motion.span
            className="absolute -left-[31px] top-1.5 w-3 h-3 bg-[#FFDB14] rounded-full border-2 border-white dark:border-gray-900"
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <span className="inline-block px-2 py-0.5 bg-[#FFDB14] text-[10px] font-bold rounded mb-1 text-gray-900">
            2025 - Present
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
            className="absolute -left-[31px] top-1.5 w-3 h-3 bg-[#FFDB14] rounded-full border-2 border-white dark:border-gray-900"
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <span className="inline-block px-2 py-0.5 bg-[#FFDB14] text-[10px] font-bold rounded mb-1 text-gray-900">
            2022 - 2024
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
            className="absolute -left-[31px] top-1.5 w-3 h-3 bg-[#FFDB14] rounded-full border-2 border-white dark:border-gray-900"
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <span className="inline-block px-2 py-0.5 bg-[#FFDB14] text-[10px] font-bold rounded mb-1 text-gray-900">
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
        <ActionButtons />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="hidden md:block bg-gradient-to-br mt-auto from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-850 p-2 rounded shadow-sm border border-blue-100 dark:border-gray-700 relative z-0"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-start gap-3 mb-1">
          <motion.img
            src="/avatar.png"
            alt="Avatar"
            className="w-10 h-10 rounded-full border-2 border-[#FFDB14] flex-shrink-0"
            whileHover={{ rotate: 2 }}
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Thanks for visiting my portfolio! Explore my projects, activities,
            and certificates. Feel free to reach out if you'd like to
            collaborate or just chat.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
