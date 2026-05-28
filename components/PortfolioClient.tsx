"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ContentItem, TabType, PortfolioSettings, GrindCounterCard, GrindStatRow, SkillsetGroup, SkillBadge } from "../lib/types";
import { INITIAL_CERTIFICATES } from "../lib/constants";
import { incrementLikes, incrementViews, subscribeToPortfolioSettings } from "../lib/firebase";
import { sanitizeRichHtml } from "../lib/sanitize";
import { useTheme } from "../lib/context/ThemeContext";
import { useContent } from "../lib/context/ContentContext";
import ProfileInfo from "./server/ProfileInfo";
import TabSwitcher from "./client/TabSwitcher";
import CustomContextMenu from "./client/CustomContextMenu";
import AppearingTextAnimation from "./client/AppearingTextAnimation";
import ActionButtons from "./client/ActionButtons";

type DescriptionBlock =
  | { type: "html"; content: string }

  | { type: "code"; code: string; language?: string };

type ProjectViewMode = "card" | "list" | "grid";

const GRIND_COUNTER_CARDS: GrindCounterCard[] = []; // Initialized as empty, fetched from Firebase 

const GRIND_RATING_STATS: GrindStatRow[] = [];

const GRIND_GITHUB_STATS: GrindStatRow[] = [
  { id: "gh-contrib", label: "Followers", value: "N/A" },
  { id: "gh-current", label: "Recent Activity", value: "N/A" },
  { id: "gh-repos", label: "Public Repositories", value: "N/A" },
];

const COUNTER_TONE_CLASSES: Record<GrindCounterCard["tone"], string> = {
  primary: "from-blue-500 to-blue-600",
  danger: "from-rose-500 to-red-600",
  success: "from-emerald-500 to-green-600",
  info: "from-cyan-500 to-sky-600",
};

const SKILLSET_GROUPS: SkillsetGroup[] = [
  {
    id: "interests",
    title: "Fields of Interest",
    subtitle: "Domains I actively explore and build in",
    badges: [
      { label: "AI", url: "https://img.shields.io/badge/Artificial%20Intelligence-111827?style=flat-square&logo=openai&logoColor=white" },
      { label: "Cyber Security", url: "https://img.shields.io/badge/Cyber%20Security-991B1B?style=flat-square&logo=hackthebox&logoColor=white" },
      { label: "Machine Learning", url: "https://img.shields.io/badge/Machine%20Learning-1D4ED8?style=flat-square&logo=tensorflow&logoColor=white" },
      { label: "Competitive Programming", url: "https://img.shields.io/badge/Competitive%20Programming-14532D?style=flat-square&logo=codeforces&logoColor=white" },
    ],
  },
  {
    id: "working-tech",
    title: "Working Technologies",
    subtitle: "Frameworks and platforms I use in production work",
    badges: [
      { label: "Next.js", url: "https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" },
      { label: "React", url: "https://img.shields.io/badge/React-0F172A?style=flat-square&logo=react&logoColor=61DAFB" },
      { label: "Firebase", url: "https://img.shields.io/badge/Firebase-78350F?style=flat-square&logo=firebase&logoColor=FFCA28" },
      { label: "Node.js", url: "https://img.shields.io/badge/Node.js-166534?style=flat-square&logo=nodedotjs&logoColor=white" },
      { label: "Tailwind CSS", url: "https://img.shields.io/badge/Tailwind%20CSS-0E7490?style=flat-square&logo=tailwindcss&logoColor=white" },
      { label: "Framer Motion", url: "https://img.shields.io/badge/Framer%20Motion-701A75?style=flat-square&logo=framer&logoColor=white" },
    ],
  },
  {
    id: "languages",
    title: "Programming Languages",
    subtitle: "Languages I use for DSA, backend, and web apps",
    badges: [
      { label: "C++", url: "https://img.shields.io/badge/C%2B%2B-1D4ED8?style=flat-square&logo=cplusplus&logoColor=white" },
      { label: "Python", url: "https://img.shields.io/badge/Python-1E3A8A?style=flat-square&logo=python&logoColor=FACC15" },
      { label: "TypeScript", url: "https://img.shields.io/badge/TypeScript-1E40AF?style=flat-square&logo=typescript&logoColor=white" },
      { label: "JavaScript", url: "https://img.shields.io/badge/JavaScript-713F12?style=flat-square&logo=javascript&logoColor=FDE047" },
      { label: "SQL", url: "https://img.shields.io/badge/SQL-0F766E?style=flat-square&logo=postgresql&logoColor=white" },
      { label: "Bash", url: "https://img.shields.io/badge/Bash-111827?style=flat-square&logo=gnubash&logoColor=white" },
    ],
  },
  {
    id: "environment-tools",
    title: "Environment and Tools",
    subtitle: "Daily setup for development, collaboration, and deployment",
    badges: [
      { label: "Linux", url: "https://img.shields.io/badge/Linux-0F172A?style=flat-square&logo=linux&logoColor=FACC15" },
      { label: "VS Code", url: "https://img.shields.io/badge/VS%20Code-1E3A8A?style=flat-square&logo=visualstudiocode&logoColor=white" },
      { label: "Git", url: "https://img.shields.io/badge/Git-7C2D12?style=flat-square&logo=git&logoColor=white" },
      { label: "GitHub", url: "https://img.shields.io/badge/GitHub-111827?style=flat-square&logo=github&logoColor=white" },
      { label: "Docker", url: "https://img.shields.io/badge/Docker-1E40AF?style=flat-square&logo=docker&logoColor=white" },
      { label: "Vercel", url: "https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white" },
    ],
  },
];

const EDUCATION_DATA = [
  {
    year: "2025 - Present",
    degree: "Bachelor's in CSE",
    institution: "Rajshahi University Of Engineering & Technology, Rajshahi",
  },
  {
    year: "2022 - 2024",
    degree: "Higher Secondary Certificate (HSC)",
    institution: "Rajshahi College, Rajshahi",
  },
  {
    year: "2022",
    degree: "Senior School Certificate (SSC)",
    institution: "Dhunat Govt. N. U. Pilot Model High School, Bogura",
  },
];


const CODE_BLOCK_REGEX =
  /<pre[^>]*>\s*<code([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/gi;

const decodeHtmlEntities = (value: string): string => {
  if (typeof window === "undefined") {
    return value;
  }

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

    blocks.push({
      type: "code",
      code: decodeHtmlEntities(codeContent),
      language: extractLanguage(codeAttributes),
    });

    lastIndex = match.index + fullMatch.length;
  }

  const htmlAfter = description.slice(lastIndex);
  if (htmlAfter.trim()) {
    blocks.push({ type: "html", content: htmlAfter });
  }

  if (blocks.length === 0) {
    blocks.push({ type: "html", content: description });
  }

  return blocks;
};

const CodeSnippetViewer: React.FC<{ code: string; language?: string }> = ({
  code,
  language,
}) => {
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

const stripHtmlTags = (value: string): string => value.replace(/<[^>]*>?/gm, "");

const formatNumber = (value: number | null | undefined): string => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0";
  }
  return value.toLocaleString();
};

const toCompact = (value: number | null | undefined): string => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0";
  }
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
};

const fetchJson = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed request: ${response.status}`);
  }
  return response.json();
};

const VIEWED_ITEMS_STORAGE_KEY = "portfolio_unique_viewed_items_v1";

const incrementViewsIfUnique = async (itemId: string): Promise<void> => {
  if (typeof window === "undefined") {
    await incrementViews(itemId);
    return;
  }

  try {
    const rawViewed = window.localStorage.getItem(VIEWED_ITEMS_STORAGE_KEY);
    const viewedItems = rawViewed
      ? (JSON.parse(rawViewed) as Record<string, true>)
      : {};

    if (viewedItems[itemId]) {
      return;
    }

    viewedItems[itemId] = true;
    window.localStorage.setItem(
      VIEWED_ITEMS_STORAGE_KEY,
      JSON.stringify(viewedItems),
    );
    await incrementViews(itemId);
  } catch {
    // If localStorage is unavailable, fall back to server increment.
    await incrementViews(itemId);
  }
};

// Animation variants
const pageVariants: Variants = {
  initial: { opacity: 0, y: 5 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -5,
    transition: {
      duration: 0.2,
      ease: "easeIn",
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

const avatarVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.68, -0.55, 0.265, 1.55],
    },
  },
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
    scale: 1.02,
    rotate: 0,
    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
    transition: {
      duration: 0.15
    }
  }
};

const PortfolioClient: React.FC = () => {
  const { projects, activities, isLoading } = useContent();
  const { isTransitioning } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [viewingDetail, setViewingDetail] = useState<ContentItem | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(
    null,
  );
  const [hasAnimatedProjectsTab, setHasAnimatedProjectsTab] = useState(false);
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  const [projectViewMode, setProjectViewMode] = useState<ProjectViewMode>("card");
  const [portfolioSettings, setPortfolioSettings] =
    useState<PortfolioSettings | null>(null);
  const [isTabConfigLoading, setIsTabConfigLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [hasEntranceAnimated, setHasEntranceAnimated] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    const animatedStatus = sessionStorage.getItem("portfolio_entrance_animated");
    if (animatedStatus === "true") {
      setHasEntranceAnimated(true);
    } else {
      // Record entrance after a short delay so user sees animation at least once
      const timer = setTimeout(() => {
        sessionStorage.setItem("portfolio_entrance_animated", "true");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const effectivelyAnimated = isHydrated && hasEntranceAnimated;

  const [grindCards, setGrindCards] = useState<GrindCounterCard[]>(
    GRIND_COUNTER_CARDS,
  );
  const [grindRatings, setGrindRatings] = useState<GrindStatRow[]>(
    GRIND_RATING_STATS,
  );
  const [grindGithubStats, setGrindGithubStats] = useState<GrindStatRow[]>(
    GRIND_GITHUB_STATS,
  );
  const isDetailView = !!viewingDetail || !!selectedCertificate;

  useEffect(() => {
    const unsubscribe = subscribeToPortfolioSettings((settings) => {
      setPortfolioSettings(settings);
      setGrindCards(settings.grindCards);
      setGrindRatings(settings.grindRatings);
      setGrindGithubStats(settings.grindGithubStats);
      setIsTabConfigLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const visibleTabs = useMemo<TabType[]>(() => {
    const order: TabType[] = ["home", "certificates", "projects", "activity", "grind", "skillset"];
    const visibility = portfolioSettings?.tabVisibility;
    if (!visibility) {
      return order;
    }

    const filtered = order.filter((tab) => tab === "home" || visibility[tab as keyof typeof visibility]);
    return filtered.length > 0 ? filtered : ["home"];
  }, [portfolioSettings]);

  useEffect(() => {
    if (!visibleTabs.includes(activeTab)) {
      setActiveTab(visibleTabs[0]);
      setViewingDetail(null);
      setSelectedCertificate(null);
    }
  }, [activeTab, visibleTabs]);

  useEffect(() => {
    const usernames = portfolioSettings?.grindUsernames;
    if (!usernames) {
      return;
    }

    const updateCard = (id: string, value: string, subtitle?: string) => {
      setGrindCards((prev) =>
        prev.map((card) =>
          card.id === id
            ? {
                ...card,
                value,
                subtitle: subtitle || card.subtitle,
              }
            : card,
        ),
      );
    };

    const updateRating = (id: string, value: string) => {
      setGrindRatings((prev) =>
        prev.map((item) => (item.id === id ? { ...item, value } : item)),
      );
    };

    const updateGithub = (id: string, value: string) => {
      setGrindGithubStats((prev) =>
        prev.map((item) => (item.id === id ? { ...item, value } : item)),
      );
    };

    const tasks: Promise<unknown>[] = [];

    if (usernames.codeforces.trim()) {
      const handle = usernames.codeforces.trim();
      tasks.push(
        (async () => {
          try {
            const [info, status] = await Promise.all([
              fetchJson(
                `https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`,
              ),
              fetchJson(
                `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=1000`,
              ),
            ]);

            const profile = info?.result?.[0] || {};
            const submissions = Array.isArray(status?.result) ? status.result : [];
            const solved = new Set(
              submissions
                .filter((s: { verdict?: string }) => s.verdict === "OK")
                .map((s: { problem?: { contestId?: number; index?: string } }) =>
                  `${s.problem?.contestId || "x"}-${s.problem?.index || "x"}`,
                ),
            ).size;

            updateCard("cf-solved", formatNumber(solved), "All-time solved");
            if (profile.maxRating) {
              updateRating("cf-max", String(profile.maxRating));
            }
          } catch {}
        })(),
      );
    }

    if (usernames.github.trim()) {
      const handle = usernames.github.trim();
      tasks.push(
        (async () => {
          try {
            const user = await fetchJson(
              `https://api.github.com/users/${encodeURIComponent(handle)}`,
            );
            updateGithub("gh-repos", formatNumber(user?.public_repos));

            const events = await fetchJson(
              `https://api.github.com/users/${encodeURIComponent(handle)}/events/public?per_page=100`,
            );
            if (Array.isArray(events)) {
              updateGithub("gh-current", `${events.length} recent events`);
            }

            if (typeof user?.followers === "number") {
              updateGithub("gh-contrib", formatNumber(user.followers));
            }
          } catch {}
        })(),
      );
    }

    Promise.allSettled(tasks).then(() => {
      setGrindCards((prev) => {
        const cfStr = prev.find((card) => card.id === "cf-solved")?.value || "";
        
        const cf = cfStr === "N/A" ? 0 : Number(cfStr.replace(/,/g, ""));
        
        const total = cf;
        const totalValue = total > 0 ? formatNumber(total) : "N/A";

        return prev.map((card) =>
          card.id === "total-solved"
            ? { ...card, value: totalValue, subtitle: "Problems solved" }
            : card,
        );
      });
    });
  }, [portfolioSettings?.grindUsernames]);

  const filteredProjects = useMemo(() => {
    const query = projectSearchQuery.trim().toLowerCase();
    if (!query) return projects;

    return projects.filter((item) => {
      const haystack = [
        item.title,
        stripHtmlTags(item.description),
        item.tags?.join(" ") || "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [projects, projectSearchQuery]);

  const contentByTab = useMemo<Record<TabType, ContentItem[]>>(
    () => ({
      home: [],
      certificates: [],
      projects,
      activity: activities,
      grind: [],
      skillset: [],
    }),
    [projects, activities],
  );

  useEffect(() => {
    const sharePathPrefix = "/projects/";
    let deepLinkSlug = null;
    
    if (pathname.startsWith(sharePathPrefix)) {
      const parts = pathname.slice(sharePathPrefix.length).split("/");
      if (parts[0] && parts[0] !== "share=") {
         deepLinkSlug = decodeURIComponent(parts[0]);
      } else if (parts[0] === "share=") {
         deepLinkSlug = decodeURIComponent(pathname.slice(sharePathPrefix.length + 6));
      }
    }

    const deepLinkItemId = searchParams.get("share") || deepLinkSlug;
    const deepLinkView = searchParams.get("view")?.toLowerCase();

    if (!deepLinkItemId && !deepLinkView) {
      if (viewingDetail) setViewingDetail(null);
      return;
    }

    const allowedTabs: TabType[] = [
      "home",
      "certificates",
      "projects",
      "activity",
      "grind",
      "skillset",
    ];

    const requestedTab: TabType =
      deepLinkView && allowedTabs.includes(deepLinkView as TabType)
        ? (deepLinkView as TabType)
        : "projects";

    if (!visibleTabs.includes(requestedTab)) {
      return;
    }

    queueMicrotask(() => {
      setActiveTab((prev) => (prev === requestedTab ? prev : requestedTab));
    });

    if (!deepLinkItemId) {
      return;
    }

    // Try finding by slug first, then ID
    const source = [...projects, ...activities];
    const matchedItem = source.find((item) => item.slug === deepLinkItemId || item.id === deepLinkItemId);
    
    if (!matchedItem) {
      return;
    }

    queueMicrotask(() => {
      setViewingDetail((prev) => (prev?.id === matchedItem.id ? prev : matchedItem));
      incrementViewsIfUnique(matchedItem.id);
    });
  }, [
    projects,
    activities,
    pathname,
    searchParams,
    visibleTabs,
  ]);

  useEffect(() => {
    if (activeTab === "projects" && !hasAnimatedProjectsTab) {
      setHasAnimatedProjectsTab(true);
    }
  }, [activeTab, hasAnimatedProjectsTab]);

  const handleBack = () => {
    if (viewingDetail) {
      setViewingDetail(null);

      const hasSlugInPath = pathname.startsWith("/projects/") && pathname !== "/projects";
      const hasShareInQuery = searchParams.has("share");
      
      if (hasSlugInPath || hasShareInQuery) {
        const viewValue = searchParams.get("view") || activeTab;
        // Navigation is handled internally by state, router.push is just for URL sync
        window.history.replaceState(null, "", `/projects?view=${encodeURIComponent(viewValue)}`);
      }

      return;
    }
    if (selectedCertificate) {
      setSelectedCertificate(null);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setViewingDetail(null);
  };

  const handleOpenDetail = (item: ContentItem) => {
    const slug = item.slug || item.id;
    setViewingDetail(item);
    // Silent URL update to prevent route change flash/reload
    window.history.pushState(null, "", `/projects/${slug}`);
    incrementViewsIfUnique(item.id);

    // Scroll to top
    const mainContentArea = document.querySelector(".md\\:overflow-y-auto");
    if (mainContentArea) {
      mainContentArea.scrollTo({ top: 0, behavior: "instant" });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  const featuredProjects = useMemo(() => {
    const ids = portfolioSettings?.homeSettings?.featuredProjectIds || [];
    return projects.filter(p => ids.includes(p.id)).slice(0, 2);
  }, [projects, portfolioSettings?.homeSettings?.featuredProjectIds]);

  const ShimmerCard = () => (
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

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen md:h-screen bg-gray-100 dark:bg-gray-950 flex flex-col md:flex-row p-2 md:p-3 lg:p-4 max-w-screen transition-colors duration-300 md:overflow-hidden relative"
    >
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#FFDB14]/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-600/5" />
      </div>
      <CustomContextMenu />
      <motion.div
        initial={!effectivelyAnimated ? { opacity: 0, x: -50 } : false}
        animate={{ 
          opacity: activeTab === "home" ? 0 : 1, 
          x: activeTab === "home" ? -40 : 0,
          pointerEvents: activeTab === "home" ? "none" : "auto",
          // Use height: 0 on mobile to prevent empty space when hidden
          height: activeTab === "home" ? "0px" : "auto",
          // On desktop, we want h-full
          transitionEnd: {
            height: activeTab === "home" ? "0px" : "auto"
          }
        }}
        transition={{ 
          duration: 0.4, 
          ease: [0.23, 1, 0.32, 1] // Decelerate ease
        }}
        className={`w-full md:w-[380px] md:h-full flex flex-col md:overflow-y-hidden custom-scrollbar pr-0 md:pr-0 ${isDetailView || activeTab === "home" ? "hidden md:flex" : "flex"} flex-shrink-0 z-10`}
      >
        <ProfileInfo forceStatic={effectivelyAnimated} />
      </motion.div>

      <motion.div
        initial={!effectivelyAnimated ? { opacity: 0, x: 50 } : false}
        animate={{ 
          opacity: 1, 
          x: 0,
        }}
        transition={{ 
          duration: 0.4, 
          ease: [0.23, 1, 0.32, 1] 
        }}
        className={`flex-1 h-auto md:h-full flex flex-col min-w-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-xl md:rounded-l-none shadow-[0_12px_34px_rgba(15,23,42,0.07)] border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-500 ease-[0.23,1,0.32,1] ${
          activeTab === "home" ? "md:-ml-[380px]" : "ml-0"
        }`}
      >
        <TabSwitcher
          activeTab={activeTab}
          onTabChange={handleTabChange}
          showBackButton={isDetailView}
          onBack={handleBack}
          visibleTabs={visibleTabs}
          isLoading={isTabConfigLoading}
        />

        <div className="flex-1 h-auto md:overflow-y-auto custom-scrollbar relative">
          <AnimatePresence mode="popLayout" initial={false}>
            {viewingDetail ? (
              <motion.div
                key="detail"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full"
              >
                <DetailView
                  item={viewingDetail}
                  activeTab={activeTab}
                />
              </motion.div>
            ) : selectedCertificate ? (
              <motion.div
                key="certificate-detail"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full"
              >
                <CertificateDetailView
                  imageUrl={selectedCertificate}
                />
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                variants={pageVariants}
                initial={effectivelyAnimated ? "animate" : "initial"}
                animate="animate"
                exit="exit"
                className="p-4 md:p-6 w-full"
              >
                {activeTab === "home" && (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="-mx-4 md:-mx-6 -mt-4 md:-mt-6 relative"
                  >
                    {/* Hero Section */}
                    <section className="sticky top-0 min-h-screen flex flex-col justify-center py-20 px-4 bg-gray-100 dark:bg-gray-950 z-[1]">
                      <div className="max-w-4xl mx-auto text-center space-y-8">
                        <motion.div
                          variants={avatarVariants}
                          className="w-40 h-40 md:w-56 md:h-56 mx-auto rounded-full overflow-hidden border-4 border-amber-600 dark:border-[#FFDB14] shadow-2xl relative"
                          whileHover={{ scale: 1.05, rotate: 2 }}
                        >
                          <Image
                            src="/avatar.png"
                            alt="Bitto Saha"
                            fill
                            className="object-cover"
                            priority
                          />
                        </motion.div>
                        
                        <div className="space-y-4">
                          <motion.h1 
                            variants={cardVariants}
                            className="text-4xl md:text-6xl font-black text-gray-900 dark:text-gray-100 tracking-tight"
                          >
                            Bitto Saha
                          </motion.h1>
                          <motion.div 
                            variants={cardVariants}
                            className="text-xl md:text-2xl font-medium text-amber-600 dark:text-[#FFDB14]"
                          >
                            <AppearingTextAnimation forceStatic={true} className="justify-center" />
                          </motion.div>
                        </div>

                        <motion.div variants={cardVariants} className="flex justify-center">
                          <ActionButtons forceStatic={true} />
                        </motion.div>
                      </div>
                    </section>

                    {/* About & Tech Stack Section */}
                    <section className="sticky top-0 min-h-screen flex flex-col items-stretch bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 z-[2] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_-20px_50px_rgba(0,0,0,0.3)] overflow-hidden">
                      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
                        {/* About Side */}
                        <motion.div 
                          variants={cardVariants}
                          className="flex flex-col justify-center p-8 md:p-12 lg:p-20 space-y-8 bg-gray-50/50 dark:bg-gray-800/10"
                        >
                          <div className="space-y-4">
                            <h2 className="text-2xl text-amber-600 dark:text-[#FFDB14] font-playwrite">About Me</h2>
                            <p className="text-2xl md:text-3xl lg:text-4xl text-gray-900 dark:text-gray-100 font-bold leading-tight">
                              {portfolioSettings?.homeSettings?.summary || "I'm a Computer Science student at RUET. I love turning ideas into real products and have a deep interest in Artificial Intelligence and Cyber Security."}
                            </p>
                          </div>
                          <div className="w-16 h-1 bg-amber-600 dark:bg-[#FFDB14] rounded-full" />
                        </motion.div>

                        {/* Tech Stack Side */}
                        <motion.div 
                          variants={cardVariants}
                          className="flex flex-col justify-center p-8 md:p-12 lg:p-20 space-y-10 bg-gray-50 dark:bg-gray-950"
                        >
                           <h2 className="text-2xl text-amber-600 dark:text-[#FFDB14] font-playwrite">Skillset</h2>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                              {SKILLSET_GROUPS.map(group => (
                                <div key={group.id} className="space-y-3">
                                  <h3 className="text-xs font-black text-amber-600 dark:text-[#FFDB14] uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2">{group.title}</h3>
                                  <div className="flex flex-wrap gap-2">
                                    {group.badges.map(badge => (
                                      <span key={badge.label} className="px-2.5 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 shadow-sm">
                                        {badge.label}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                           </div>
                        </motion.div>
                      </div>
                    </section>

                    {/* Education Section */}
                    <section className="sticky top-0 min-h-screen flex flex-col justify-center py-12 px-4 bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 z-[3] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_-20px_50px_rgba(0,0,0,0.3)]">
                      <div className="max-w-4xl mx-auto w-full space-y-12">
                        <motion.h3 
                          variants={cardVariants}
                          className="text-2xl text-center text-amber-600 dark:text-[#FFDB14] font-playwrite mb-4"
                        >
                          Education Journey
                        </motion.h3>
                        
                        <div className="relative max-w-3xl mx-auto">
                          {/* Vertical Line */}
                          <div className="absolute left-[80px] md:left-[120px] top-0 bottom-0 w-[2px] bg-[#000]/30 dark:bg-[#FFDB14]/30" />
                          
                          <div className="space-y-0 relative">
                            {EDUCATION_DATA.map((item, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="relative flex group"
                              >
                                {/* Year Label (Left) */}
                                <div className="w-[80px] md:w-[120px] pt-6 pr-6 text-right shrink-0">
                                  <span className="text-[11px] md:text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
                                    {item.year}
                                  </span>
                                </div>

                                {/* Dot */}
                                <div className="absolute left-[80px] md:left-[120px] top-7 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-amber-600 dark:border-[#FFDB14] bg-gray-950 dark:bg-gray-950 z-10 transition-transform group-hover:scale-125" />

                                {/* Content (Right) */}
                                <div className={`flex-1 pt-6 pb-10 pl-8 md:pl-12 ${index !== EDUCATION_DATA.length - 1 ? 'border-b border-dashed border-gray-800 dark:border-gray-800' : ''}`}>
                                  <h4 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
                                    {item.degree}
                                  </h4>
                                  <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium">
                                    {item.institution}
                                  </p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Connect Section */}
                    <section className="sticky top-0 min-h-screen flex flex-col justify-center py-20 px-4 bg-gray-50 dark:bg-gray-950 border-t border-[#FFDB14]/20 z-[4] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_-20px_50px_rgba(0,0,0,0.3)]">
                      <div className="max-w-4xl mx-auto text-center space-y-12">
                        <div className="space-y-4">
                          <h2 className="text-2xl text-amber-600 dark:text-[#FFDB14] font-playwrite">Let's Connect</h2>
                          <p className="text-3xl md:text-5xl font-black text-gray-900 dark:text-gray-100 italic">
                            Hire me for your next <span className="text-amber-600 dark:text-[#FFDB14]">Big transformation</span>
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4">
                          {[
                            { icon: "fa-github", label: "GitHub", url: "https://github.com/bittosaha" },
                            { icon: "fa-linkedin", label: "LinkedIn", url: "https://linkedin.com/in/bittosaha" },
                            { icon: "fa-twitter", label: "Twitter", url: "https://twitter.com/bittosaha" },
                            { icon: "fa-instagram", label: "Instagram", url: "https://instagram.com/bittosaha" },
                          ].map((social) => (
                            <motion.a
                              key={social.label}
                              href={social.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              whileHover={{ y: -5, scale: 1.05 }}
                              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 text-sm font-bold text-gray-800 dark:text-gray-200 transition-all hover:border-[#FFDB14]"
                            >
                              <i className={`fab ${social.icon} text-[#FFDB14] text-lg`}></i>
                              {social.label}
                            </motion.a>
                          ))}
                        </div>
                      </div>
                    </section>
                  </motion.div>
                )}




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
                            whileHover={{ scale: 1.03 }}
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
                          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
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
                            { mode: "card", icon: "fa-clone", label: "Card" },
                            { mode: "list", icon: "fa-list", label: "List" },
                            { mode: "grid", icon: "fa-grip", label: "Grid" },
                          ] as {
                            mode: ProjectViewMode;
                            icon: string;
                            label: string;
                          }[]).map(({ mode, icon, label }) => (
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
                              <i className={`fas ${icon} text-[10px]`}></i>
                              {label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {isLoading
                      ? Array(3)
                          .fill(0)
                          .map((_, i) => <ShimmerCard key={i} />)
                      : activeTab === "projects"
                        ? projectViewMode === "grid"
                          ? (
                            <motion.div
                              variants={containerVariants}
                              className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                              {filteredProjects.map((item, index) => (
                                <motion.div key={item.id} variants={cardVariants} custom={index}>
                                  <ProjectGridCard
                                    item={item}
                                    onReadMore={() => handleOpenDetail(item)}
                                  />
                                </motion.div>
                              ))}
                            </motion.div>
                          )
                          : projectViewMode === "list"
                            ? (
                              filteredProjects.map((item, index) => (
                                <motion.div
                                  key={item.id}
                                  variants={cardVariants}
                                  custom={index}
                                >
                                  <ProjectListCard
                                    item={item}
                                    onReadMore={() => handleOpenDetail(item)}
                                  />
                                </motion.div>
                              ))
                            )
                            : (
                              filteredProjects.map((item, index) => (
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
                              ))
                            )
                        : activities.map((item, index) => (
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
                          ))}

                    {!isLoading &&
                      (activeTab === "projects"
                        ? filteredProjects.length === 0
                        : activities.length === 0) && (
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
                            {activeTab === "projects" && projectSearchQuery
                              ? "No matching projects found."
                              : `No ${activeTab} added yet.`}
                          </p>
                        </motion.div>
                      )}
                  </motion.div>
                )}

                {activeTab === "grind" && (
                  <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5">
                    <motion.div variants={cardVariants} className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        Grind Dashboard
                      </h2>
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Competitive Snapshot
                      </span>
                    </motion.div>

                    <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                      {grindCards.map((card) => (
                        <motion.div key={card.id} variants={cardVariants}>
                          <div
                            className={`relative overflow-hidden rounded-xl p-4 min-h-[116px] text-white shadow-md bg-gradient-to-br ${COUNTER_TONE_CLASSES[card.tone]}`}
                          >
                            <i className={`fas ${card.icon} absolute left-3 top-3 text-4xl opacity-25`}></i>
                            <div className="relative z-10 pl-12">
                              <p className="text-xs uppercase tracking-wide font-semibold text-white/80">
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
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-4">
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
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-4">
                          GitHub Contributions
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {grindGithubStats.map((item) => (
                            <div
                              key={item.id}
                              className="rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/70 px-3 py-3"
                            >
                              <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                                {item.label}
                              </p>
                              <p className="text-lg font-black text-gray-900 dark:text-gray-100">{item.value}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}

                {activeTab === "skillset" && (
                  <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5">
                    <motion.div variants={cardVariants} className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        Skillset Matrix
                      </h2>
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Shields.io Badges
                      </span>
                    </motion.div>

                    <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {(portfolioSettings?.skillsetGroups || SKILLSET_GROUPS).map((group) => (
                        <motion.div
                          key={group.id}
                          variants={cardVariants}
                          className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-[0_6px_20px_rgba(15,23,42,0.05)]"
                        >
                          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-2">
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
                                />
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
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
        className="fixed bottom-1 left-4 hidden md:block z-30"
      >
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg px-3 py-0 shadow-sm">
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            <i className="far fa-copyright text-red-500 mr-1"></i>
            Bitto Saha
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
          <i className="far fa-copyright text-red-500 mr-1"></i>
          Bitto Saha
        </p>
      </motion.div>
    </motion.div>
  );
};

const CertificateDetailView: React.FC<{
  imageUrl: string;
}> = ({ imageUrl }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="h-full flex flex-col"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.25, ease: "easeOut" }}
        className="flex-1 p-4 md:p-6 flex items-center justify-center"
      >
        <div className="w-full max-w-4xl">
          <motion.div
            className="w-full h-auto min-h-[400px] relative rounded-lg shadow-lg overflow-hidden"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={imageUrl}
              alt="Certificate"
              layout="responsive"
              width={1600}
              height={1200}
              className="w-full h-auto rounded-lg"
              loading="lazy"
            />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const DetailView: React.FC<{
  item: ContentItem;
  activeTab: TabType;
}> = ({ item, activeTab }) => {
  const descriptionContainerRef = useRef<HTMLDivElement>(null);
  const descriptionBlocks = useMemo(
    () => splitDescriptionBlocks(item.description || ""),
    [item.description],
  );
  const [likes, setLikes] = useState(item.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [copyToast, setCopyToast] = useState<string | null>(null);

  const handleLike = async () => {
    if (!hasLiked) {
      try {
        await incrementLikes(item.id);
        setLikes((prev) => prev + 1);
        setHasLiked(true);
      } catch (error) {
        // Silent error
      }
    }
  };

  const handleShare = async () => {
    const shareUrl = new URL(window.location.origin);
    shareUrl.pathname = `/projects/share=${encodeURIComponent(item.id)}`;
    shareUrl.searchParams.set("view", activeTab);

    try {
      await navigator.clipboard.writeText(shareUrl.toString());
      setCopyToast("Link copied");
      window.setTimeout(() => setCopyToast(null), 1800);
    } catch (error) {
      setCopyToast("Copy failed");
      window.setTimeout(() => setCopyToast(null), 1800);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative"
    >
      <AnimatePresence>
        {copyToast && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full px-4 py-2 text-xs font-semibold bg-white text-gray-800 shadow-[0_10px_30px_rgba(15,23,42,0.14)] dark:bg-gray-900 dark:text-gray-100"
          >
            {copyToast}
          </motion.div>
        )}
      </AnimatePresence>

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
            whileHover={{ scale: 1.01 }}
          >
            
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
                  whileHover={{ scale: 1.02 }}
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
              className={`flex gap-3 mb-6 p-4 rounded-lg border border-gray-100 dark:border-gray-700 ${
                item.type === "project" ? "bg-transparent" : "bg-gray-50 dark:bg-gray-800"
              }`}
              style={
                item.type === "project"
                  ? { borderColor: "transparent" }
                  : undefined
              }
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
                    <Image
                      src="/icons/icons8-github-50.svg"
                      alt="GitHub"
                      width={24}
                      height={24}
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
                    <Image
                      src="/icons/icons8-twitter-bird.svg"
                      alt="Twitter"
                      width={24}
                      height={24}
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
                    <Image
                      src="/icons/icons8-youtube-50.svg"
                      alt="YouTube"
                      width={24}
                      height={24}
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
                    <Image
                      src="/icons/icons8-linkedin-50.svg"
                      alt="LinkedIn"
                      width={24}
                      height={24}
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
            ref={descriptionContainerRef}
            className="space-y-4"
          >
            {descriptionBlocks.map((block, index) =>
              block.type === "code" ? (
                <CodeSnippetViewer
                  key={`code-${index}`}
                  code={block.code}
                  language={block.language}
                />
              ) : (
                <div
                  key={`html-${index}`}
                  className="prose prose-lg dark:prose-invert max-w-none leading-[1.75] rich-content"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeRichHtml(
                      block.content.replace(/\n/g, ""),
                    ),
                  }}
                />
              ),
            )}
          </motion.div>

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

                {item.type === "project" && (
                  <button
                    onClick={handleShare}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all"
                  >
                    <i className="fas fa-share"></i>
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

const ContentCard: React.FC<{ item: ContentItem; onReadMore: () => void }> = ({
  item,
  onReadMore,
}) => {
  return (
    <motion.div
      whileHover={{
        scale: 1.01,
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      className="flex flex-col sm:flex-row gap-0 p-0 rounded-lg border-2 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm shadow-[0_6px_22px_rgba(15,23,42,0.05)] cursor-pointer overflow-hidden"
      onClick={onReadMore}
    >
      <div className="flex-1 flex flex-col justify-between min-w-0 order-2 sm:order-1 p-5">
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
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed line-clamp-2"
          >
            {stripHtmlTags(item.description)}
          </motion.div>

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
                  whileHover={{ scale: 1.02 }}
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
                whileHover={{ scale: 1.05, color: "#e91e63" }}
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
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src="/icons/icons8-github-50.svg"
                  alt="GitHub"
                  width={24}
                  height={24}
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
                whileHover={{ scale: 1.03, y: -1 }}
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
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src="/icons/icons8-twitter-bird.svg"
                  alt="Twitter"
                  width={24}
                  height={24}
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
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src="/icons/icons8-youtube-50.svg"
                  alt="YouTube"
                  width={24}
                  height={24}
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
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src="/icons/icons8-linkedin-50.svg"
                  alt="LinkedIn"
                  width={24}
                  height={24}
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
        whileHover={{ scale: 1.02 }}
        className="w-full sm:w-48 h-32 sm:h-auto flex-shrink-0 relative overflow-hidden bg-gray-100 dark:bg-gray-800 order-1 sm:order-2 rounded-none"
      >
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          className="object-cover"
        />
      </motion.div>
    </motion.div>
  );
};

const ProjectListCard: React.FC<{ item: ContentItem; onReadMore: () => void }> = ({
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

const ProjectGridCard: React.FC<{ item: ContentItem; onReadMore: () => void }> = ({
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

export default PortfolioClient;

