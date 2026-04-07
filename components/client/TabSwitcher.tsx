"use client";

import { AnimatePresence, motion, Variants } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { TabType } from "@/lib/types";

interface TabSwitcherProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  showBackButton: boolean;
  onBack?: () => void;
  visibleTabs?: TabType[];
}

const TABS: TabType[] = ["certificates", "projects", "activity", "grind", "skillset"];

const mobileActiveTabVariants: Variants = {
  enter: (direction: 1 | -1) => ({
    x: direction === 1 ? 26 : -26,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: 1 | -1) => ({
    x: direction === 1 ? -26 : 26,
    opacity: 0,
  }),
};

export default function TabSwitcher({
  activeTab,
  onTabChange,
  showBackButton,
  onBack,
  visibleTabs,
}: TabSwitcherProps) {
  const tabs = visibleTabs && visibleTabs.length > 0 ? visibleTabs : TABS;
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const previousTabRef = useRef<TabType>(activeTab);

  useEffect(() => {
    const previousIndex = tabs.indexOf(previousTabRef.current);
    const currentIndex = tabs.indexOf(activeTab);

    if (previousIndex !== -1 && currentIndex !== -1 && previousIndex !== currentIndex) {
      const totalTabs = tabs.length;
      const forwardDistance = (currentIndex - previousIndex + totalTabs) % totalTabs;
      const backwardDistance = (previousIndex - currentIndex + totalTabs) % totalTabs;
      setSlideDirection(forwardDistance <= backwardDistance ? 1 : -1);
    }

    previousTabRef.current = activeTab;
  }, [activeTab, tabs]);

  const activeIndex = tabs.indexOf(activeTab);

  const prevTab = useMemo(
    () => tabs[(activeIndex - 1 + tabs.length) % tabs.length],
    [activeIndex, tabs],
  );

  const nextTab = useMemo(
    () => tabs[(activeIndex + 1) % tabs.length],
    [activeIndex, tabs],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center p-2 bg-white dark:bg-gray-900 shadow-[0_10px_24px_rgba(15,23,42,0.06)] shrink-0 sticky top-0 z-10"
    >
      {showBackButton && onBack && (
        <motion.button
          onClick={onBack}
          className="mr-3 h-9 px-3 rounded-md bg-white dark:bg-gray-800 shadow-[0_4px_14px_rgba(15,23,42,0.08)] text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
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
              className="h-10 flex-1 min-w-0 rounded-md bg-gray-50 dark:bg-gray-800 shadow-[0_4px_14px_rgba(15,23,42,0.08)] px-2 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors truncate"
              whileTap={{ scale: 0.98 }}
              aria-label={`Previous tab: ${prevTab}`}
            >
              {prevTab}
            </motion.button>

            <div className="relative h-10 flex-[1.35] min-w-0 overflow-hidden rounded-md bg-[#FFDB14] shadow-[0_6px_16px_rgba(234,179,8,0.34)]">
              <AnimatePresence mode="wait" initial={false} custom={slideDirection}>
                <motion.button
                  key={activeTab}
                  custom={slideDirection}
                  variants={mobileActiveTabVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
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
              className="h-10 flex-1 min-w-0 rounded-md bg-gray-50 dark:bg-gray-800 shadow-[0_4px_14px_rgba(15,23,42,0.08)] px-2 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors truncate"
              whileTap={{ scale: 0.98 }}
              aria-label={`Next tab: ${nextTab}`}
            >
              {nextTab}
            </motion.button>
          </div>

          <div className="hidden sm:inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1 shadow-[0_8px_20px_rgba(15,23,42,0.1)] relative">
            {tabs.map((tab) => (
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
