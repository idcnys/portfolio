"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ExperienceItem } from "../../../lib/types";
import { containerVariants, cardVariants } from "../../../lib/animations/variants";

interface ExperienceTabProps {
  experiences: ExperienceItem[];
}

const ExperienceTab: React.FC<ExperienceTabProps> = ({ experiences }) => {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-4"
      aria-label="Experience Timeline"
    >
      <motion.div
        variants={cardVariants}
        className="flex items-center justify-between"
      >
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Experience
        </h2>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          Timeline
        </span>
      </motion.div>

      <motion.div variants={containerVariants} className="relative pl-6 sm:pl-8">
        <div className="pointer-events-none absolute left-[7px] top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-800" />

        {experiences.length === 0 ? (
          <motion.p
            variants={cardVariants}
            className="text-sm text-gray-500 dark:text-gray-400 italic"
          >
            No experience entries yet.
          </motion.p>
        ) : (
          <ol className="space-y-6">
            {experiences.map((item, index) => (
              <motion.li
                key={item.id}
                variants={cardVariants}
                className="relative"
              >
                <span className="absolute -left-6 sm:-left-8 top-2 h-3.5 w-3.5 rounded-full border-2 border-[#FFDB14] bg-white dark:bg-gray-950" />

                <article className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm p-4 sm:p-5 shadow-[0_4px_18px_rgba(15,23,42,0.04)]">
                  <header className="mb-3 space-y-1">
                    <time className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {item.period}
                    </time>
                    <h3 className="text-base sm:text-[17px] font-semibold text-gray-900 dark:text-gray-100 leading-snug">
                      {item.role}
                    </h3>
                    <span className="text-[#fff] bg-[#238cfc] pl-2 pr-2 rounded">
                      {item.company}
                    </span>
                  </header>

                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-start">
                    <div className="space-y-2">
                      <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 line-clamp-3">
                        {item.description}
                      </p>

                      <ul className="flex flex-wrap gap-1.5" aria-label={`${item.role} technologies`}>
                        {(item.stack || []).map((tag) => (
                          <li
                            key={`${item.id}-${tag}`}
                            className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="hidden sm:block w-20 h-14 lg:w-24 lg:h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 shrink-0">
                      <Image
                        src={item.thumbnail || "/avatar.png"}
                        alt={`${item.role} preview`}
                        width={192}
                        height={128}
                        className="h-full w-full object-cover opacity-80"
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  </div>
                </article>
              </motion.li>
            ))}
          </ol>
        )}
      </motion.div>
    </motion.section>
  );
};

export default ExperienceTab;
