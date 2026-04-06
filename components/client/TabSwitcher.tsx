"use client";

import { motion } from "framer-motion";
import { TabType } from "@/lib/types";

interface TabSwitcherProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  showBackButton: boolean;
  onBack?: () => void;
}

export default function TabSwitcher({
  activeTab,
  onTabChange,
  showBackButton,
  onBack,
}: TabSwitcherProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center p-2 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shrink-0 sticky top-0 z-10"
    >
      {showBackButton && onBack && (
        <motion.button
          onClick={onBack}
          className="mr-3 h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
          whileHover={{ x: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          <i className="fas fa-arrow-left text-xs" />
          <span className="text-sm font-semibold">Back</span>
        </motion.button>
      )}

      <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1 shadow-sm relative border border-gray-200 dark:border-gray-700">
        {(["certificates", "projects", "activity"] as TabType[]).map(
          (tab) => (
            <motion.button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`relative px-6 py-2 text-sm font-bold capitalize transition-colors z-10 ${
                activeTab === tab
                  ? "text-gray-900 dark:text-gray-900"
                  : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-[#FFDB14] rounded-md shadow-md"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    duration: 0.2,
                  }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </motion.button>
          ),
        )}
      </div>
    </motion.div>
  );
}
