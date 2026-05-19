"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { html as htmlLang } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { ContentItem, TabType, PortfolioSettings, GrindCounterCard, GrindStatRow, SkillsetGroup, SkillBadge } from "../lib/types";
import { INITIAL_CERTIFICATES } from "../lib/constants";
import { incrementLikes, incrementViews, subscribeToPortfolioSettings } from "../lib/firebase";
import { sanitizeRichHtml } from "../lib/sanitize";
import { useTheme } from "../lib/context/ThemeContext";
import { useContent } from "../lib/context/ContentContext";
import ProfileInfo from "./server/ProfileInfo";
import TabSwitcher from "./client/TabSwitcher";
import CustomContextMenu from "./client/CustomContextMenu";

type DescriptionBlock =
  | { type: "html"; content: string }
  | { type: "code"; code: string; language?: string };

type ProjectViewMode = "card" | "list" | "grid";

const GRIND_COUNTER_CARDS: GrindCounterCard[] = [
  {
    id: "cf-solved",
    title: "Codeforces",
    value: "1240",
    subtitle: "All-time solved",
    icon: "fa-code",
    tone: "primary",
  },
  {
    id: "lc-solved",
    title: "LeetCode",
    value: "865",
    subtitle: "All-time solved",
    icon: "fa-bolt",
    tone: "danger",
  },
  {
    id: "cses-solved",
    title: "CSES",
    value: "292",
    subtitle: "All-time solved",
    icon: "fa-sitemap",
    tone: "success",
  },
  {
    id: "total-solved",
    title: "Total",
    value: "2397",
    subtitle: "Problems solved",
    icon: "fa-trophy",
    tone: "info",
  },
  {
    id: "thm-rooms",
    title: "TryHackMe",
    value: "126",
    subtitle: "Rooms completed",
    icon: "fa-shield-halved",
    tone: "success",
  },
  {
    id: "thm-rank",
    title: "TryHackMe",
    value: "Top 6%",
    subtitle: "Global rank",
    icon: "fa-medal",
    tone: "danger",
  },
  {
    id: "thm-streak",
    title: "TryHackMe",
    value: "29",
    subtitle: "Longest streak",
    icon: "fa-fire",
    tone: "primary",
  },
  {
    id: "thm-badges",
    title: "TryHackMe",
    value: "18",
    subtitle: "Badges earned",
    icon: "fa-award",
    tone: "info",
  },
];

const GRIND_RATING_STATS: GrindStatRow[] = [
  { id: "cf-max", label: "Codeforces Max Rating", value: "1874" },
  { id: "lc-max", label: "LeetCode Contest Rating", value: "2238" },
  { id: "cses-rank", label: "CSES Highest Rank", value: "Top 2.8%" },
];

const GRIND_GITHUB_STATS: GrindStatRow[] = [
  { id: "gh-contrib", label: "Total Contributions", value: "1,946" },
  { id: "gh-streak", label: "Longest Streak", value: "74 days" },
  { id: "gh-current", label: "Current Streak", value: "18 days" },
  { id: "gh-repos", label: "Public Repositories", value: "58" },
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

const getCodeLanguageExtension = (language?: string) => {
  if (!language) {
    return javascript({ jsx: true, typescript: true });
  }

  const lang = language.toLowerCase();

  if (["js", "jsx", "ts", "tsx", "javascript", "typescript"].includes(lang)) {
    return javascript({ jsx: true, typescript: true });
  }

  if (["py", "python"].includes(lang)) {
    return python();
  }

  if (["html", "xml"].includes(lang)) {
    return htmlLang();
  }

  if (["css", "scss", "sass"].includes(lang)) {
    return css();
  }

  if (["md", "markdown"].includes(lang)) {
    return markdown();
  }

  return javascript({ jsx: true, typescript: true });
};

const CodeSnippetViewer: React.FC<{ code: string; language?: string }> = ({
  code,
  language,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <CodeMirror
        value={code}
        editable={false}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
        }}
        theme={isDarkMode ? oneDark : "light"}
        extensions={[getCodeLanguageExtension(language)]}
      />
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

const renderLatex = async (element: HTMLElement | null) => {
  if (!element) {
    return;
  }

  const renderMathInElement = (await import("katex/contrib/auto-render")).default;
  renderMathInElement(element, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "\\[", right: "\\]", display: true },
      { left: "$", right: "$", display: false },
      { left: "\\(", right: "\\)", display: false },
    ],
    throwOnError: false,
  });
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
  const [activeTab, setActiveTab] = useState<TabType>("certificates");
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
    const order: TabType[] = ["certificates", "projects", "activity", "grind", "skillset"];
    const visibility = portfolioSettings?.tabVisibility;
    if (!visibility) {
      return order;
    }

    const filtered = order.filter((tab) => visibility[tab]);
    return filtered.length > 0 ? filtered : ["certificates"];
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

    if (usernames.leetcode.trim()) {
      const handle = usernames.leetcode.trim();
      tasks.push(
        (async () => {
          try {
            const solved = await fetchJson(
              `https://alfa-leetcode-api.onrender.com/${encodeURIComponent(handle)}/solved`,
            );
            const contest = await fetchJson(
              `https://alfa-leetcode-api.onrender.com/${encodeURIComponent(handle)}/contest`,
            );

            if (typeof solved?.solvedProblem === "number") {
              updateCard("lc-solved", formatNumber(solved.solvedProblem), "All-time solved");
            }

            if (contest?.contestRating) {
              updateRating("lc-max", String(Math.round(contest.contestRating)));
            }
          } catch {}
        })(),
      );
    }

    if (usernames.tryhackme.trim()) {
      const handle = usernames.tryhackme.trim();
      tasks.push(
        (async () => {
          try {
            const profile = await fetchJson(
              `https://tryhackme.com/api/v2/public-profile?username=${encodeURIComponent(handle)}`,
            );

            const user = profile?.data || {};
            if (typeof user?.completedRooms === "number") {
              updateCard("thm-rooms", formatNumber(user.completedRooms), "Rooms completed");
            }
            if (typeof user?.bestStreak === "number") {
              updateCard("thm-streak", formatNumber(user.bestStreak), "Longest streak");
            }
            if (typeof user?.badges === "number") {
              updateCard("thm-badges", formatNumber(user.badges), "Badges earned");
            }
            if (user?.ranking) {
              updateCard("thm-rank", `#${formatNumber(user.ranking)}`, "Global rank");
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
              updateGithub("gh-contrib", toCompact(user.followers));
            }
          } catch {}
        })(),
      );
    }

    if (usernames.cses.trim()) {
      const cses = usernames.cses.trim();
      updateCard("cses-solved", cses, "Sync username/manual value");
      updateRating("cses-rank", cses);
    }

    Promise.allSettled(tasks).then(() => {
      setGrindCards((prev) => {
        const cf = Number(prev.find((card) => card.id === "cf-solved")?.value.replace(/,/g, "") || 0);
        const lc = Number(prev.find((card) => card.id === "lc-solved")?.value.replace(/,/g, "") || 0);
        const cses = Number(prev.find((card) => card.id === "cses-solved")?.value.replace(/,/g, "") || 0);
        const total = cf + lc + cses;

        return prev.map((card) =>
          card.id === "total-solved"
            ? { ...card, value: formatNumber(total), subtitle: "Problems solved" }
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
        router.push(`/projects?view=${encodeURIComponent(viewValue)}`, {
          scroll: false,
        });
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
    const scrollValue = window.scrollY;
    router.push(`/projects/${slug}`, { scroll: false });
    // Restore scroll position to avoid jump since we are using { scroll: false }
    setTimeout(() => window.scrollTo(0, scrollValue), 0);
  };

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
      className="min-h-screen md:h-screen bg-gray-100 dark:bg-gray-950 flex flex-col md:flex-row p-0 md:p-0 gap-0 max-w-screen transition-colors duration-300 md:overflow-hidden"
    >
      <CustomContextMenu />
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className={`w-full md:w-[380px] h-auto md:h-full flex flex-col gap-4 md:overflow-y-hidden custom-scrollbar pr-0 md:pr-0 ${isDetailView ? "hidden md:flex" : "flex"}`}
      >
        <ProfileInfo />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex-1 h-auto md:h-full flex flex-col min-w-0 bg-white dark:bg-gray-900 rounded shadow-[0_12px_34px_rgba(15,23,42,0.07)] border border-gray-100 dark:border-gray-800 overflow-hidden"
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
              >
                <CertificateDetailView
                  imageUrl={selectedCertificate}
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
                            className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#FFDB14]/40 focus:border-[#FFDB14]"
                          />
                        </div>

                        <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 self-start md:self-auto">
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
                          <div className="flex flex-wrap gap-2">
                            {group.badges.map((badge: SkillBadge) => (
                              <img
                                key={badge.label}
                                src={badge.url}
                                alt={badge.label}
                                className="h-7"
                                loading="lazy"
                              />
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
          <motion.img
            src={imageUrl}
            alt="Certificate"
            className="w-full h-auto rounded-lg shadow-lg"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          />
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
        console.error("Error liking item:", error);
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
      console.error("Failed to copy share link:", error);
      setCopyToast("Copy failed");
      window.setTimeout(() => setCopyToast(null), 1800);
    }
  };

  useEffect(() => {
    renderLatex(descriptionContainerRef.current);
  }, [descriptionBlocks]);

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
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    renderLatex(previewRef.current);
  }, [item.description]);

  return (
    <motion.div
      whileHover={{
        scale: 1.01,
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      className="flex flex-col sm:flex-row gap-0 p-0 rounded-xl border-2 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all bg-white dark:bg-gray-900 shadow-[0_6px_22px_rgba(15,23,42,0.05)] cursor-pointer overflow-hidden"
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
            ref={previewRef}
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
                whileHover={{ scale: 1.03, y: -1 }}
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
                whileHover={{ scale: 1.03, y: -1 }}
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
        whileHover={{ scale: 1.02 }}
        className="w-full sm:w-48 h-32 sm:h-auto flex-shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-800 order-1 sm:order-2 rounded-none"
      >
        <motion.img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  );
};

const ProjectListCard: React.FC<{ item: ContentItem; onReadMore: () => void }> = ({
  item,
  onReadMore,
}) => {
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    renderLatex(previewRef.current);
  }, [item.description]);

  return (
    <div
      onClick={onReadMore}
      className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-[0_5px_18px_rgba(15,23,42,0.04)] cursor-pointer hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
    >
      <div className="flex items-center gap-4">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.date}</p>
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">
            {item.title}
          </h3>
          <div
            ref={previewRef}
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
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    renderLatex(previewRef.current);
  }, [item.description]);

  return (
    <div
      onClick={onReadMore}
      className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-[0_5px_18px_rgba(15,23,42,0.04)] overflow-hidden cursor-pointer hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
    >
      <img
        src={item.imageUrl}
        alt={item.title}
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.date}</p>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-1">
          {item.title}
        </h3>
        <div
          ref={previewRef}
          className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-2"
        >
          {stripHtmlTags(item.description)}
        </div>
      </div>
    </div>
  );
};

export default PortfolioClient;

