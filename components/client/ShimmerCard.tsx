"use client";

import React from "react";
import { motion } from "framer-motion";
import { cardVariants } from "../../lib/animations/variants";

const ShimmerCard: React.FC = () => (
  <motion.div
    variants={cardVariants}
    className="flex flex-col sm:flex-row gap-6 p-4 rounded border border-gray-100 dark:border-gray-800 shadow-[0_4px_18px_rgba(15,23,42,0.04)]"
  >
    <div className="w-full sm:w-32 h-32 flex-shrink-0 rounded shimmer"></div>
    <div className="flex-1 space-y-2">
      <div className="h-6 w-3/4 shimmer rounded"></div>
      <div className="h-4 w-1/4 shimmer rounded"></div>
      <div className="h-4 w-full shimmer rounded"></div>
      <div className="h-4 w-full shimmer rounded"></div>
    </div>
  </motion.div>
);

export default ShimmerCard;
