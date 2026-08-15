"use client";

import React from "react";
import Image from "next/image";
import { ContentItem } from "../../../lib/types";
import { stripHtmlTags } from "../../../lib/utils/portfolio-helpers";

interface ProjectListCardProps {
  item: ContentItem;
  onReadMore: () => void;
}

const ProjectListCard: React.FC<ProjectListCardProps> = ({
  item,
  onReadMore,
}) => {
  return (
    <div
      onClick={onReadMore}
      className="p-4 rounded-lg border border-gray-100 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm shadow-[0_5px_18px_rgba(15,23,42,0.04)] cursor-pointer hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 relative rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.date}</p>
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">
            {item.title}
          </h3>
          <div
            className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1"
          >
            {stripHtmlTags(item.description)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectListCard;
