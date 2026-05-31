"use client";

import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ContentItem, TabType } from "../lib/types";
import { incrementLikes } from "../lib/firebase";
import { sanitizeRichHtml } from "../lib/sanitize";

const CODE_BLOCK_REGEX = /<pre[^>]*>\s*<code([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/gi;

const decodeHtmlEntities = (value: string): string => {
  if (typeof window === "undefined") return value;
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
};

const extractLanguage = (codeAttributes: string): string | undefined => {
  const languageMatch =
    codeAttributes.match(/language-([a-z0-9#+-]+)/i) ||
    codeAttributes.match(/lang(?:uage)?-["']?([a-z0-9#+-]+)/i);
  return languageMatch?.[1]?.toLowerCase();
};

type DescriptionBlock = { type: "html"; content: string } | { type: "code"; code: string; language?: string };

const splitDescriptionBlocks = (description: string): DescriptionBlock[] => {
  const blocks: DescriptionBlock[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null = null;

  while ((match = CODE_BLOCK_REGEX.exec(description)) !== null) {
    const [fullMatch, codeAttributes, codeContent] = match;
    const htmlBefore = description.slice(lastIndex, match.index);

    if (htmlBefore.trim()) {
      blocks.push({ type: "html", content: htmlBefore });
    }

    blocks.push({ type: "code", code: decodeHtmlEntities(codeContent), language: extractLanguage(codeAttributes) });
    lastIndex = match.index + fullMatch.length;
  }

  const htmlAfter = description.slice(lastIndex);
  if (htmlAfter.trim()) blocks.push({ type: "html", content: htmlAfter });
  if (blocks.length === 0) blocks.push({ type: "html", content: description });
  return blocks;
};

const CodeSnippetViewer: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-950 p-4">
      <pre className="text-sm font-mono text-gray-100 overflow-x-auto">
        <code className={language ? `language-${language}` : ""}>{code}</code>
      </pre>
    </div>
  );
};

const calculateReadTime = (text: string): number => {
  const wordsPerMinute = 200;
  const plainText = text.replace(/<[^>]*>?/gm, "");
  const wordCount = plainText.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

const DetailView: React.FC<{ item: ContentItem; activeTab: TabType }> = ({ item, activeTab }) => {
  const descriptionContainerRef = useRef<HTMLDivElement>(null);
  const descriptionBlocks = useMemo(() => splitDescriptionBlocks(item.description || ""), [item.description]);
  const [likes, setLikes] = useState(item.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [copyToast, setCopyToast] = useState<string | null>(null);

  const handleLike = async () => {
    if (!hasLiked) {
      try {
        await incrementLikes(item.id);
        setLikes((prev) => prev + 1);
        setHasLiked(true);
      } catch {}
    }
  };

  const handleShare = async () => {
    const shareUrl = new URL(window.location.origin);
    const baseUrl = activeTab === "activity" ? "/activity" : "/projects";
    shareUrl.pathname = `${baseUrl}/share=${encodeURIComponent(item.id)}`;
    shareUrl.searchParams.set("view", activeTab);

    try {
      await navigator.clipboard.writeText(shareUrl.toString());
      setCopyToast("Link copied");
      window.setTimeout(() => setCopyToast(null), 1800);
    } catch {
      setCopyToast("Copy failed");
      window.setTimeout(() => setCopyToast(null), 1800);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
      <AnimatePresence>
        {copyToast && (
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.16 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full px-4 py-2 text-xs font-semibold bg-white text-gray-800 shadow-[0_10px_30px_rgba(15,23,42,0.14)] dark:bg-gray-900 dark:text-gray-100">
            {copyToast}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }} className="p-4 md:p-6">
        <div className="mb-6">
          <motion.span initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="text-sm text-gray-500 dark:text-gray-300 font-normal mb-2 block">
            {item.date}
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
            {item.title}
          </motion.h1>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="flex flex-wrap gap-2 mb-6">
            {item.tags && item.tags.length > 0 ? item.tags.map((tag, index) => (
              <motion.span key={index} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9 + index * 0.1 }} whileHover={{ scale: 1.02 }} className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 font-medium">
                {tag}
              </motion.span>
            )) : (
              <span className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600 rounded-lg border border-gray-200 dark:border-gray-800 italic">no tags</span>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }} className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-6">
            <span className="flex items-center gap-2"><span>{calculateReadTime(item.description)} min read</span></span>
            <span className="flex items-center gap-2"><span>{item.views || 0} views</span></span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} ref={descriptionContainerRef} className="space-y-4">
            {descriptionBlocks.map((block, index) => block.type === "code" ? (
              <CodeSnippetViewer key={`code-${index}`} code={block.code} language={block.language} />
            ) : (
              <div key={`html-${index}`} className="prose prose-lg dark:prose-invert max-w-none leading-[1.75] rich-content" dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(block.content.replace(/\n/g, "")) }} />
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }} className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button onClick={handleLike} className={`group flex items-center gap-2 transition-colors ${hasLiked ? "text-pink-600" : "text-gray-500 hover:text-pink-600"}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${hasLiked ? "" : "group-hover:bg-pink-50 dark:group-hover:bg-pink-900/20"}`}>
                    <svg className={`w-5 h-5 ${hasLiked ? "fill-current" : ""}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <span className={`text-sm ${hasLiked ? "font-bold" : ""}`}>{likes}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button className={`group flex items-center gap-2 transition-colors text-gray-500`}>
                  <span className={`text-sm`}>{item.views || 0} Views</span>
                </button>

                {item.type === "project" && (
                  <button onClick={handleShare} className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 6l-4-4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DetailView;
