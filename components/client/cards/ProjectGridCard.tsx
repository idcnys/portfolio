"use client";

import React from "react";
import Image from "next/image";
import { ContentItem } from "../../../lib/types";
import { stripHtmlTags } from "../../../lib/utils/portfolio-helpers";

interface ProjectGridCardProps {
  item: ContentItem;
  onReadMore: () => void;
}

const ProjectGridCard: React.FC<ProjectGridCardProps> = ({
  item,
  onReadMore,
}) => {
  return (
    <div
      onClick={onReadMore}
      className="rounded-lg border border-gray-100 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm shadow-[0_5px_18px_rgba(15,23,42,0.04)] overflow-hidden cursor-pointer hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
    >
      <div className="w-full h-40 relative">
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.date}</p>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-1">
          {item.title}
        </h3>
        <div
          className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-2"
        >
          {stripHtmlTags(item.description)}
        </div>
      </div>
    </div>
  );
};

export default ProjectGridCard;
