import { incrementViews } from "../firebase";

export type DescriptionBlock =
  | { type: "html"; content: string }
  | { type: "code"; code: string; language?: string };

export type ProjectViewMode = "card" | "list" | "grid";

export const CODE_BLOCK_REGEX =
  /<pre[^>]*>\s*<code([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/gi;

export const decodeHtmlEntities = (value: string): string => {
  if (typeof window === "undefined") {
    return value;
  }

  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
};

export const getRelativeTime = (isoString: string | undefined): string => {
  if (!isoString) return "Just now";
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const extractLanguage = (codeAttributes: string): string | undefined => {
  const languageMatch =
    codeAttributes.match(/language-([a-z0-9#+-]+)/i) ||
    codeAttributes.match(/lang(?:uage)?-["']?([a-z0-9#+-]+)/i);
  return languageMatch?.[1]?.toLowerCase();
};

export const splitDescriptionBlocks = (description: string): DescriptionBlock[] => {
  const blocks: DescriptionBlock[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null = null;

  // Reset regex state since it has the global flag
  CODE_BLOCK_REGEX.lastIndex = 0;

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

export const calculateReadTime = (text: string): number => {
  const wordsPerMinute = 200;
  const plainText = text.replace(/<[^>]*>?/gm, "");
  const wordCount = plainText.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

export const stripHtmlTags = (value: string): string => value.replace(/<[^>]*>?/gm, "");

export const formatNumber = (value: number | null | undefined): string => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0";
  }
  return value.toLocaleString();
};

export const toCompact = (value: number | null | undefined): string => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0";
  }
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
};

export const fetchJson = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed request: ${response.status}`);
  }
  return response.json();
};

export const VIEWED_ITEMS_STORAGE_KEY = "portfolio_unique_viewed_items_v1";

export const incrementViewsIfUnique = async (itemId: string): Promise<void> => {
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
