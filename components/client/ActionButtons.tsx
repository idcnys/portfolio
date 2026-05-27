"use client";

import { motion, Variants } from "framer-motion";

const buttonVariants: Variants = {
  hover: {
    scale: 1.02,
    y: -1,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 20,
    },
  },
  tap: {
    scale: 0.98,
    y: 0,
  },
};

const iconVariants: Variants = {
  hover: {
    rotate: 5,
    scale: 1.1,
  },
};

export default function ActionButtons({ forceStatic = false }: { forceStatic?: boolean }) {
  const handleScheduleTalk = () => {
    window.open("https://cal.com/bittosaha/quick-meet", "_blank");
  };

  const handleResumeDownload = () => {
    const link = document.createElement("a");
    link.href = "/cv.pdf";
    link.download = "Resume_Bitto_Saha.pdf";
    link.click();
  };

  return (
    <motion.div
      className="flex gap-2 mt-8"
      initial={forceStatic ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={forceStatic ? { duration: 0 } : { delay: 0.5, duration: 0.4 }}
    >
      <motion.button
        onClick={handleScheduleTalk}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        className="flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 py-2.5 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
      >
        <motion.i
          variants={iconVariants}
          className="fas fa-calendar-alt text-xs"
        />
        Schedule
      </motion.button>
      <motion.button
        onClick={handleResumeDownload}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        className="flex-1 bg-[#FFDB14] text-gray-900 py-2.5 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#e6c512] transition-colors shadow-md shadow-[#FFDB14]/20"
      >
        <motion.i variants={iconVariants} className="fas fa-file-alt text-xs" />
        Resume
      </motion.button>
    </motion.div>
  );
}
