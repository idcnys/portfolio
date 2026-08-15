"use client";

import React from "react";
import { motion } from "framer-motion";
import { GrindCounterCard, GrindStatRow } from "../../../lib/types";
import { COUNTER_TONE_CLASSES } from "../../../lib/data/portfolio-data";
import { containerVariants, cardVariants } from "../../../lib/animations/variants";
import DynamicIcon from "../DynamicIcon";

interface GrindTabProps {
  grindCards: GrindCounterCard[];
  grindRatings: GrindStatRow[];
  grindGithubStats: GrindStatRow[];
}

const GrindTab: React.FC<GrindTabProps> = ({
  grindCards,
  grindRatings,
  grindGithubStats,
}) => {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={cardVariants} className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Grind Dashboard
        </h2>
        <span className="text-xs font-bold text-gray-500 dark:text-gray-300 tracking-wider">
          Competitive Snapshot
        </span>
      </motion.div>

      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {grindCards.map((card) => (
          <motion.div key={card.id} variants={cardVariants}>
            <div
              className={`relative overflow-hidden rounded-xl p-4 min-h-[116px] text-white shadow-md bg-gradient-to-br ${COUNTER_TONE_CLASSES[card.tone]}`}
            >
              <div className="absolute left-3 top-3 opacity-25">
                <DynamicIcon name={card.icon} className="w-10 h-10" />
              </div>
              <div className="relative z-10 pl-12">
                <p className="text-xs tracking-wide font-semibold text-white/80">
                  {card.title}
                </p>
                <p className="text-3xl font-black leading-tight mt-1">{card.value}</p>
                <p className="text-xs text-white/80 mt-1">{card.subtitle}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          variants={cardVariants}
          className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-[0_6px_20px_rgba(15,23,42,0.05)]"
        >
          <h3 className="text-sm font-bold tracking-wide text-gray-500 dark:text-gray-400 mb-4">
            Max Ratings
          </h3>
          <div className="space-y-3">
            {grindRatings.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-gray-800/70 border border-gray-100 dark:border-gray-700 px-3 py-2"
              >
                <span className="text-sm text-gray-600 dark:text-gray-300">{item.label}</span>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-[0_6px_20px_rgba(15,23,42,0.05)]"
        >
          <h3 className="text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400 mb-4">
            GitHub Contributions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {grindGithubStats.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/70 px-3 py-3"
              >
                <p className="text-[11px] tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                  {item.label}
                </p>
                <p className="text-lg font-black text-gray-900 dark:text-gray-100">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default GrindTab;
