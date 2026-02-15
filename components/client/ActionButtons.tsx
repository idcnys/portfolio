"use client";

import { motion, Variants } from "framer-motion";
import { getCalApi } from "@calcom/embed-react";
import { useEffect, useState } from "react";

const buttonVariants: Variants = {
  hover: {
    scale: 1.05,
    y: -2,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 20,
    },
  },
  tap: {
    scale: 0.95,
    y: 0,
  },
};

const iconVariants: Variants = {
  hover: {
    rotate: 10,
    scale: 1.1,
  },
};

export default function ActionButtons() {
  const [calLoaded, setCalLoaded] = useState(false);

  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      setCalLoaded(true);
    })();
  }, []);

  const handleScheduleTalk = () => {
    if (calLoaded) {
      // Use the Cal API to open the modal
      getCalApi().then((cal) => {
        cal("modal", {
          calLink: "bittosaha/quick-meet",
        });
      });
    } else {
      // Fallback to direct link if Cal hasn't loaded yet
      window.open("https://cal.com/bittosaha/quick-meet", "_blank");
    }
  };

  const handleResumeDownload = () => {
    const link = document.createElement("a");
    link.href = "/cv.pdf";
    link.download = "Resume.pdf";
    link.click();
  };

  return (
    <motion.div
      className="flex gap-2 mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
    >
      <motion.button
        onClick={handleScheduleTalk}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        className="flex-1 bg-gray-900 dark:bg-gray-800 text-white py-2.5 px-3 rounded text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors shadow-sm"
      >
        <motion.i
          variants={iconVariants}
          className="fas fa-calendar-alt text-xs"
        />
        Schedule Talk
      </motion.button>
      <motion.button
        onClick={handleResumeDownload}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        className="flex-1 bg-[#FFDB14] text-gray-900 py-2.5 px-3 rounded text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#e6c512] transition-colors shadow-sm"
      >
        <motion.i variants={iconVariants} className="fas fa-file-alt text-xs" />
        Resume
      </motion.button>
    </motion.div>
  );
}
