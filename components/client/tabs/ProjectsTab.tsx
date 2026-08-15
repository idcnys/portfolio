"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Copy,
  Layers,
  LayoutGrid,
  FolderOpen,
} from "lucide-react";
import { ContentItem } from "../../../lib/types";
import { ProjectViewMode } from "../../../lib/utils/portfolio-helpers";
import { containerVariants, cardVariants } from "../../../lib/animations/variants";
import ContentCard from "../cards/ContentCard";
import ProjectListCard from "../cards/ProjectListCard";
import ProjectGridCard from "../cards/ProjectGridCard";
import ShimmerCard from "../ShimmerCard";

interface ProjectsTabProps {
  activeTab: "projects" | "activity";
  isLoading: boolean;
  isHydrated: boolean;
  filteredProjects: ContentItem[];
  activities: ContentItem[];
  paginatedProjects: ContentItem[];
  paginatedActivities: ContentItem[];
  projectSearchQuery: string;
  setProjectSearchQuery: (q: string) => void;
  projectViewMode: ProjectViewMode;
  setProjectViewMode: (m: ProjectViewMode) => void;
  hasAnimatedProjectsTab: boolean;
  hasAnimatedActivityTab: boolean;
  onOpenDetail: (item: ContentItem) => void;
  onLoadMoreProjects: () => void;
  onLoadMoreActivities: () => void;
  hasMoreProjects: boolean;
  hasMoreActivities: boolean;
}

const ProjectsTab: React.FC<ProjectsTabProps> = ({
  activeTab,
  isLoading,
  isHydrated,
  filteredProjects,
  activities,
  paginatedProjects,
  paginatedActivities,
  projectSearchQuery,
  setProjectSearchQuery,
  projectViewMode,
  setProjectViewMode,
  hasAnimatedProjectsTab,
  hasAnimatedActivityTab,
  onOpenDetail,
  onLoadMoreProjects,
  onLoadMoreActivities,
  hasMoreProjects,
  hasMoreActivities,
}) => {
  return (
    <motion.div
      variants={containerVariants}
      initial={
        activeTab === "projects" && hasAnimatedProjectsTab
          ? false
          : "hidden"
      }
      animate="show"
      className="space-y-4"
    >
      <motion.div
        variants={cardVariants}
        className="flex items-center justify-between mb-4"
      >
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 capitalize">
          {activeTab}
        </h2>
        <span className="text-xs font-bold text-gray-500 dark:text-gray-300">
          {activeTab === "projects"
            ? filteredProjects.length
            : activities.length}{" "}
          Items
        </span>
      </motion.div>

      {activeTab === "projects" && (
        <motion.div
          variants={cardVariants}
          className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-2"
        >
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              type="text"
              value={projectSearchQuery}
              onChange={(e) => setProjectSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#FFDB14]/40 focus:border-[#FFDB14]"
            />
          </div>

          <div className="inline-flex rounded-lg bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 p-1 self-start md:self-auto">
            {([
              { mode: "card", icon: Copy, label: "Card" },
              { mode: "list", icon: Layers, label: "List" },
              { mode: "grid", icon: LayoutGrid, label: "Grid" },
            ] as {
              mode: ProjectViewMode;
              icon: React.ComponentType<{ className?: string }>;
              label: string;
            }[]).map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                type="button"
                onClick={() => setProjectViewMode(mode)}
                className={`px-3 h-8 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  projectViewMode === mode
                    ? "bg-[#FFDB14] text-gray-900"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {(isLoading || !isHydrated) &&
         ((activeTab === "projects" && filteredProjects.length === 0) ||
          (activeTab === "activity" && activities.length === 0)) ? (
          <motion.div
            key="shimmer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <ShimmerCard key={i} />
              ))}
          </motion.div>
        ) : activeTab === "projects" ? (
          <motion.div
            key="projects-content"
            variants={containerVariants}
            initial={hasAnimatedProjectsTab ? "show" : "hidden"}
            animate="show"
            exit={{ opacity: 0, x: -10 }}
            className="w-full"
          >
            {projectViewMode === "grid" ? (
              <motion.div
                variants={containerVariants}
                initial={hasAnimatedProjectsTab ? "show" : "hidden"}
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {paginatedProjects.map((item) => (
                  <motion.div key={item.id} variants={cardVariants}>
                    <ProjectGridCard
                      item={item}
                      onReadMore={() => onOpenDetail(item)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : projectViewMode === "list" ? (
              <motion.div
                variants={containerVariants}
                initial={hasAnimatedProjectsTab ? "show" : "hidden"}
                animate="show"
                className="space-y-4"
              >
                {paginatedProjects.map((item) => (
                  <motion.div key={item.id} variants={cardVariants}>
                    <ProjectListCard
                      item={item}
                      onReadMore={() => onOpenDetail(item)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial={hasAnimatedProjectsTab ? "show" : "hidden"}
                animate="show"
                className="space-y-4"
              >
                {paginatedProjects.map((item) => (
                  <motion.div key={item.id} variants={cardVariants}>
                    <ContentCard
                      item={item}
                      onReadMore={() => onOpenDetail(item)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {paginatedProjects.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <FolderOpen className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  {projectSearchQuery
                    ? "No matching projects found."
                    : "No projects added yet."}
                </p>
              </motion.div>
            )}

            {hasMoreProjects && paginatedProjects.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center pt-4"
              >
                <button
                  type="button"
                  onClick={onLoadMoreProjects}
                  className="px-6 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Load More
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="activity-content"
            variants={containerVariants}
            initial={hasAnimatedActivityTab ? "show" : "hidden"}
            animate="show"
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4 w-full"
          >
            {paginatedActivities.map((item) => (
              <motion.div key={item.id} variants={cardVariants}>
                <ContentCard
                  item={item}
                  onReadMore={() => onOpenDetail(item)}
                />
              </motion.div>
            ))}

            {paginatedActivities.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <motion.div
                  className="flex justify-center mb-4"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                >
                  <FolderOpen className="w-10 h-10 text-gray-200 dark:text-gray-800" />
                </motion.div>
                <p className="text-gray-400 dark:text-gray-600 font-medium">
                  No activities added yet.
                </p>
              </motion.div>
            )}

            {hasMoreActivities && paginatedActivities.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center pt-4"
              >
                <button
                  type="button"
                  onClick={onLoadMoreActivities}
                  className="px-6 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Load More
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProjectsTab;
