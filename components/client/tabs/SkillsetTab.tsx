"use client";

import React from "react";
import { motion } from "framer-motion";
import { SkillsetGroup, SkillBadge } from "../../../lib/types";
import { containerVariants, cardVariants } from "../../../lib/animations/variants";

interface SkillsetTabProps {
  skillsetGroups: SkillsetGroup[];
}

const SkillsetTab: React.FC<SkillsetTabProps> = ({ skillsetGroups }) => {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={cardVariants} className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Skillset Matrix
        </h2>
        <span className="text-xs font-bold text-gray-500 dark:text-gray-300 tracking-wider">
          Shields.io Badges
        </span>
      </motion.div>

      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {skillsetGroups.map((group) => (
          <motion.div
            key={group.id}
            variants={cardVariants}
            className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-[0_6px_20px_rgba(15,23,42,0.05)]"
          >
            <h3 className="text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              {group.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              {group.subtitle}
            </p>
            <div className="flex flex-wrap gap-x-2 gap-y-3">
              {group.badges.map((badge: SkillBadge) => (
                <div key={badge.label} className="h-6 flex items-center">
                  <img
                    src={badge.url}
                    alt={badge.label}
                    className="h-full w-auto"
                    loading="lazy"
                    width={100}
                    height={24}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default SkillsetTab;
