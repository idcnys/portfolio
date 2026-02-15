"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ContentItem, TabType } from "../lib/types";
import { INITIAL_CERTIFICATES } from "../lib/constants";
import { incrementLikes, incrementViews } from "../lib/firebase";
import { useTheme } from "../lib/context/ThemeContext";
import { useContent } from "../lib/context/ContentContext";
import ProfileInfo from "./server/ProfileInfo";
import TabSwitcher from "./client/TabSwitcher";
import CustomContextMenu from "./client/CustomContextMenu";

const calculateReadTime = (text: string): number => {
  const wordsPerMinute = 200;
  const plainText = text.replace(/<[^>]*>?/gm, "");
  const wordCount = plainText.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

// Animation variants
const pageVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.15,
    },
  },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      duration: 0.1
    }
  }
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
    scale: 0.98
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const certificateVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    rotate: -2
  },
  show: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.2,
      ease: [0.68, -0.55, 0.265, 1.55]
    }
  },
  hover: {
    scale: 1.05,
    rotate: 1,
    boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
    transition: {
      duration: 0.15
    }
  }
};

const PortfolioClient: React.FC = () => {
  const { projects, activities, isLoading } = useContent();
  const { isTransitioning } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>("certificates");
  const [viewingDetail, setViewingDetail] = useState<ContentItem | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(
    null,
  );

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setViewingDetail(null);
  };

  const handleOpenDetail = (item: ContentItem) => {
    setViewingDetail(item);
    incrementViews(item.id);
    const scroller = document.querySelector(".md\\:overflow-y-auto");
    if (scroller) scroller.scrollTo({ top: 0, behavior: "smooth" });
  };

  const ShimmerCard = () => (
    <motion.div
      variants={cardVariants}
      className="flex flex-col sm:flex-row gap-6 p-4 rounded border border-gray-100 dark:border-gray-800"
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

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen md:h-screen bg-gray-100 dark:bg-gray-950 flex flex-col md:flex-row p-0 md:p-0 gap-0 max-w-screen transition-colors duration-300 md:overflow-hidden"
    >
      <CustomContextMenu />
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full md:w-[380px] h-auto md:h-full flex flex-col gap-4 md:overflow-y-hidden custom-scrollbar pr-0 md:pr-0"
      >
        <ProfileInfo />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex-1 h-auto md:h-full flex flex-col min-w-0 bg-white dark:bg-gray-900 rounded shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden"
      >
        <TabSwitcher
          activeTab={activeTab}
          onTabChange={handleTabChange}
          viewingDetail={!!viewingDetail}
        />

        <div className="flex-1 h-auto md:overflow-y-auto custom-scrollbar relative">
          <AnimatePresence mode="wait">
            {viewingDetail ? (
              <motion.div
                key="detail"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <DetailView
                  item={viewingDetail}
                  onBack={() => setViewingDetail(null)}
                />
              </motion.div>
            ) : selectedCertificate ? (
              <motion.div
                key="certificate-detail"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <CertificateDetailView
                  imageUrl={selectedCertificate}
                  onBack={() => setSelectedCertificate(null)}
                />
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="p-4 md:p-6"
              >
                {activeTab === "certificates" && (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                  >
                    <motion.div
                      variants={cardVariants}
                      className="flex items-center justify-between mb-6"
                    >
                      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        Certificates & Achievements
                      </h2>
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-300">
                        {INITIAL_CERTIFICATES.length} Total
                      </span>
                    </motion.div>
                    <motion.div
                      variants={containerVariants}
                      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
                    >
                      {INITIAL_CERTIFICATES.map((cert, index) => (
                        <motion.div
                          key={cert.id}
                          variants={certificateVariants}
                          whileHover="hover"
                          whileTap={{ scale: 0.95 }}
                          className="overflow-hidden rounded border border-gray-100 dark:border-gray-800 group cursor-pointer bg-gray-50 dark:bg-gray-800 transition-colors hover:border-[#FFDB14]"
                          onClick={() => setSelectedCertificate(cert.imageUrl)}
                        >
                          <motion.img
                            src={cert.imageUrl}
                            alt="Certificate"
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.3 }}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}

                {(activeTab === "projects" || activeTab === "activity") && (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
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
                        {
                          (activeTab === "projects" ? projects : activities)
                            .length
                        }{" "}
                        Items
                      </span>
                    </motion.div>

                    {isLoading
                      ? Array(3)
                          .fill(0)
                          .map((_, i) => <ShimmerCard key={i} />)
                      : (activeTab === "projects" ? projects : activities).map(
                          (item, index) => (
                            <motion.div
                              key={item.id}
                              variants={cardVariants}
                              custom={index}
                            >
                              <ContentCard
                                item={item}
                                onReadMore={() => handleOpenDetail(item)}
                              />
                            </motion.div>
                          ),
                        )}

                    {!isLoading &&
                      (activeTab === "projects" ? projects : activities)
                        .length === 0 && (
                        <motion.div
                          variants={cardVariants}
                          className="py-20 text-center"
                        >
                          <motion.i
                            className="fas fa-folder-open text-4xl text-gray-200 dark:text-gray-800 mb-4"
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 3,
                            }}
                          />
                          <p className="text-gray-400 dark:text-gray-600 font-medium">
                            No {activeTab} added yet.
                          </p>
                        </motion.div>
                      )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
        }
        .shimmer {
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .dark .shimmer {
          background: linear-gradient(
            90deg,
            #374151 25%,
            #4b5563 50%,
            #374151 75%
          );
          background-size: 200% 100%;
        }
      `}</style>

      {/* Footer Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.6, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="fixed bottom-4 left-4 hidden md:block z-30"
      >
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            Copyright <span className="text-red-500">&copy;</span> bitto.
          </p>
        </div>
      </motion.div>

      {/* Mobile Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="block md:hidden w-full bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-3"
      >
        <p className="text-center text-xs text-gray-600 dark:text-gray-400 font-medium">
          Copyright <span className="text-red-500">&copy;</span> bitto.
        </p>
      </motion.div>
    </motion.div>
  );
};

const CertificateDetailView: React.FC<{
  imageUrl: string;
  onBack: () => void;
}> = ({ imageUrl, onBack }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="h-full flex flex-col"
    >
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05, duration: 0.2 }}
        className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 md:px-6 py-4 z-20"
      >
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          whileHover={{ x: -5, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.i
            className="fas fa-arrow-left"
            animate={{ x: [0, -3, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2 }}
          />
          <span className="font-medium">Back</span>
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.25, ease: "easeOut" }}
        className="flex-1 p-4 md:p-6 flex items-center justify-center"
      >
        <div className="w-full max-w-4xl">
          <motion.img
            src={imageUrl}
            alt="Certificate"
            className="w-full h-auto rounded-lg shadow-lg"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

const DetailView: React.FC<{
  item: ContentItem;
  onBack: () => void;
}> = ({ item, onBack }) => {
  const [likes, setLikes] = useState(item.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);

  const handleLike = async () => {
    if (!hasLiked) {
      try {
        await incrementLikes(item.id);
        setLikes((prev) => prev + 1);
        setHasLiked(true);
      } catch (error) {
        console.error("Error liking item:", error);
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text:
            item.description.replace(/<[^>]*>?/gm, "").substring(0, 100) +
            "...",
          url: window.location.href,
        });
      } catch (error) {
        console.log("Sharing cancelled or failed");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 md:px-6 py-4 z-20"
      >
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          whileHover={{ x: -5, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.i
            className="fas fa-arrow-left"
            animate={{ x: [0, -3, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2 }}
          />
          <span className="font-medium">Back</span>
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="p-4 md:p-6"
      >
        <div className="mb-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="rounded-xl overflow-hidden mb-6 bg-gray-100 dark:bg-gray-800"
            whileHover={{ scale: 1.02 }}
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-64 md:h-80 object-cover"
            />
          </motion.div>
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-gray-500 dark:text-gray-300 font-normal mb-2 block"
          >
            {item.date}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight"
          >
            {item.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap gap-2 mb-6"
          >
            {item.tags && item.tags.length > 0 ? (
              item.tags.map((tag, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 font-medium"
                >
                  {tag}
                </motion.span>
              ))
            ) : (
              <span className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600 rounded-lg border border-gray-200 dark:border-gray-800 italic">
                no tags
              </span>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-6"
          >
            <span className="flex items-center gap-2">
              <i className="far fa-clock"></i>
              <span>{calculateReadTime(item.description)} min read</span>
            </span>
            <span className="flex items-center gap-2">
              <i className="far fa-eye"></i>
              <span>{item.views || 0} views</span>
            </span>
          </motion.div>

          {item.links && Object.keys(item.links).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="flex gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <i className="fas fa-link text-gray-500 dark:text-gray-400"></i>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Links:
                </span>
              </div>
              <div className="flex gap-3">
                {item.links.github && (
                  <a
                    href={item.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    <img
                      src="/icons/icons8-github-50.svg"
                      alt="GitHub"
                      className="w-6 h-6"
                    />
                  </a>
                )}
                {item.links.website && (
                  <a
                    href={item.links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    <i className="fas fa-globe text-lg"></i>
                  </a>
                )}
                {item.links.twitter && (
                  <a
                    href={item.links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    <img
                      src="/icons/icons8-twitter-bird.svg"
                      alt="Twitter"
                      className="w-6 h-6"
                    />
                  </a>
                )}
                {item.links.youtube && (
                  <a
                    href={item.links.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    <img
                      src="/icons/icons8-youtube-50.svg"
                      alt="YouTube"
                      className="w-6 h-6"
                    />
                  </a>
                )}
                {item.links.linkedin && (
                  <a
                    href={item.links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    <img
                      src="/icons/icons8-linkedin-50.svg"
                      alt="LinkedIn"
                      className="w-6 h-6"
                    />
                  </a>
                )}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="prose prose-lg dark:prose-invert max-w-none leading-[1.8]"
            dangerouslySetInnerHTML={{
              __html: item.description.replace(/\n/g, "<br/>"),
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button
                  onClick={handleLike}
                  className={`group flex items-center gap-2 transition-colors ${
                    hasLiked
                      ? "text-pink-600"
                      : "text-gray-500 hover:text-pink-600"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      hasLiked
                        ? ""
                        : "group-hover:bg-pink-50 dark:group-hover:bg-pink-900/20"
                    }`}
                  >
                    <i
                      className={`${hasLiked ? "fas" : "far"} fa-heart text-lg`}
                    ></i>
                  </div>
                  <span className={`text-sm ${hasLiked ? "font-bold" : ""}`}>
                    {likes}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className={`group flex items-center gap-2 transition-colors text-gray-500`}
                >
                  <span className={`text-sm`}>{item.views || 0} Views</span>
                </button>

                <button
                  onClick={handleShare}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all"
                >
                  <i className="fas fa-share"></i>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ContentCard: React.FC<{ item: ContentItem; onReadMore: () => void }> = ({
  item,
  onReadMore,
}) => {
  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      className="flex flex-col sm:flex-row gap-4 p-5 rounded-xl border-2 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all bg-white dark:bg-gray-900 cursor-pointer"
      onClick={onReadMore}
    >
      <div className="flex-1 flex flex-col justify-between min-w-0 order-2 sm:order-1">
        <div>
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs text-gray-500 dark:text-gray-300 font-normal mb-2 block"
          >
            {item.date}
          </motion.span>
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 leading-tight"
          >
            {item.title}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed line-clamp-2"
          >
            {item.description.replace(/<[^>]*>?/gm, "")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-1.5 mb-3"
          >
            {item.tags && item.tags.length > 0 ? (
              item.tags.map((tag, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-700"
                >
                  {tag}
                </motion.span>
              ))
            ) : (
              <span className="px-2 py-0.5 text-xs bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600 rounded border border-gray-200 dark:border-gray-800 italic">
                no tags
              </span>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-300 mb-3"
          >
            <span className="flex items-center gap-1">
              <motion.i
                className="far fa-heart text-xs"
                whileHover={{ scale: 1.2, color: "#e91e63" }}
              />{" "}
              {item.likes || 0}
            </span>
            <span className="flex items-center gap-1">
              <motion.i
                className="far fa-clock text-xs"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
              />{" "}
              {calculateReadTime(item.description)} min
            </span>
          </motion.div>
        </div>

        {item.links && Object.keys(item.links).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-3 mt-2"
          >
            {item.links.github && (
              <motion.a
                href={item.links.github}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src="/icons/icons8-github-50.svg"
                  alt="GitHub"
                  className="w-6 h-6"
                />
              </motion.a>
            )}
            {item.links.website && (
              <motion.a
                href={item.links.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <i className="fas fa-globe text-lg"></i>
              </motion.a>
            )}
            {item.links.twitter && (
              <motion.a
                href={item.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src="/icons/icons8-twitter-bird.svg"
                  alt="Twitter"
                  className="w-6 h-6"
                />
              </motion.a>
            )}
            {item.links.youtube && (
              <motion.a
                href={item.links.youtube}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src="/icons/icons8-youtube-50.svg"
                  alt="YouTube"
                  className="w-6 h-6"
                />
              </motion.a>
            )}
            {item.links.linkedin && (
              <motion.a
                href={item.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src="/icons/icons8-linkedin-50.svg"
                  alt="LinkedIn"
                  className="w-6 h-6"
                />
              </motion.a>
            )}
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.05 }}
        className="w-full sm:w-48 h-32 sm:h-auto flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 order-1 sm:order-2"
      >
        <motion.img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  );
};

export default PortfolioClient;
