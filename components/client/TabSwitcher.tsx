"use client";

import { motion } from "framer-motion";
import { TabType } from "@/lib/types";

interface TabSwitcherProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  viewingDetail: boolean;
}

export default function TabSwitcher({
  activeTab,
  onTabChange,
  viewingDetail,
}: TabSwitcherProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`justify-center p-2 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shrink-0 sticky top-0 z-10 ${
        viewingDetail ? "hidden md:flex" : "flex"
      }`}
    >
      <div className="inline-flex rounded-lg bg-transparent p-1 shadow-sm relative">
        {(["certificates", "projects", "activity"] as TabType[]).map(
          (tab, index) => (
            <motion.button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`relative px-6 py-2 text-sm font-bold capitalize transition-colors z-10 ${
                activeTab === tab
                  ? "text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gray-900 dark:bg-gray-700 rounded-md shadow-md"
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
