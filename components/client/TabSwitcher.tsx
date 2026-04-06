"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { TabType } from "@/lib/types";

interface TabSwitcherProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  showBackButton: boolean;
  onBack?: () => void;
}

const TABS: TabType[] = ["certificates", "projects", "activity", "grind", "skillset"];

export default function TabSwitcher({
  activeTab,
  onTabChange,
  showBackButton,
  onBack,
}: TabSwitcherProps) {
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const previousTabRef = useRef<TabType>(activeTab);

  useEffect(() => {
    const previousIndex = TABS.indexOf(previousTabRef.current);
    const currentIndex = TABS.indexOf(activeTab);

    if (previousIndex !== -1 && currentIndex !== -1 && previousIndex !== currentIndex) {
      const totalTabs = TABS.length;
      const forwardDistance = (currentIndex - previousIndex + totalTabs) % totalTabs;
      const backwardDistance = (previousIndex - currentIndex + totalTabs) % totalTabs;
      setSlideDirection(forwardDistance <= backwardDistance ? 1 : -1);
    }

    previousTabRef.current = activeTab;
  }, [activeTab]);

  const activeIndex = TABS.indexOf(activeTab);

  const prevTab = useMemo(
    () => TABS[(activeIndex - 1 + TABS.length) % TABS.length],
    [activeIndex],
  );

  const nextTab = useMemo(
    () => TABS[(activeIndex + 1) % TABS.length],
    [activeIndex],
  );

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

      {!showBackButton && (
        <>
          <div className="sm:hidden flex items-center gap-2 w-full">
            <motion.button
              onClick={() => onTabChange(prevTab)}
              className="h-10 flex-1 min-w-0 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-2 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors truncate"
              whileTap={{ scale: 0.98 }}
              aria-label={`Previous tab: ${prevTab}`}
            >
              {prevTab}
            </motion.button>

            <div className="relative h-10 flex-[1.35] min-w-0 overflow-hidden rounded-md border border-yellow-400/60 bg-[#FFDB14] shadow-sm">
              <AnimatePresence mode="wait" initial={false} custom={slideDirection}>
                <motion.button
                  key={activeTab}
                  custom={slideDirection}
                  initial={(direction: 1 | -1) => ({
                    x: direction === 1 ? 26 : -26,
                    opacity: 0,
                  })}
                  animate={{ x: 0, opacity: 1 }}
                  exit={(direction: 1 | -1) => ({
                    x: direction === 1 ? -26 : 26,
                    opacity: 0,
                  })}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute inset-0 z-10 px-2 text-sm font-bold capitalize text-gray-900 truncate"
                  onClick={() => onTabChange(activeTab)}
                  aria-current="page"
                >
                  {activeTab}
                </motion.button>
              </AnimatePresence>
            </div>

            <motion.button
              onClick={() => onTabChange(nextTab)}
              className="h-10 flex-1 min-w-0 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-2 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors truncate"
              whileTap={{ scale: 0.98 }}
              aria-label={`Next tab: ${nextTab}`}
            >
              {nextTab}
            </motion.button>
          </div>

          <div className="hidden sm:inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1 shadow-sm relative border border-gray-200 dark:border-gray-700">
            {TABS.map((tab) => (
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
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
