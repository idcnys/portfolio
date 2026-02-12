"use client";

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
    <div
      className={`justify-center p-2 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shrink-0 sticky top-0 z-10 ${
        viewingDetail ? "hidden md:flex" : "flex"
      }`}
    >
      <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent p-1 shadow-sm">
        {(["certificates", "projects", "activity"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-6 py-2 text-sm font-bold capitalize transition-all ${
              activeTab === tab
                ? "bg-gray-900 dark:bg-gray-700 text-white shadow-md rounded-md"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
