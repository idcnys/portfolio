import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  push,
  onValue,
  set,
  remove,
  update,
  increment,
} from "firebase/database";
import { ContentItem, Note, ActivityLog, PortfolioSettings, CloudinaryImage } from "./types";

const firebaseConfig = {
  apiKey: "AIzaSyDWbrWygn6H5MKWpQ6oBFNPf2QjdOxkaiQ",
  authDomain: "sucon-ba7b1.firebaseapp.com",
  databaseURL: "https://sucon-ba7b1-default-rtdb.firebaseio.com",
  projectId: "sucon-ba7b1",
  storageBucket: "sucon-ba7b1.firebasestorage.app",
  messagingSenderId: "134806617816",
  appId: "1:134806617816:web:2a9efdf8ed58beba7961ad",
  measurementId: "G-FRDFSSDRWW",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

const defaultPortfolioSettings: PortfolioSettings = {
  githubToken: "",
  grindUsernames: {
    codeforces: "",
    github: "",
  },
  grindCards: [
    {
      id: "cf-solved",
      title: "Codeforces",
      value: "N/A",
      subtitle: "All-time solved",
      icon: "Code2",
      tone: "primary",
    },
    {
      id: "total-solved",
      title: "Total",
      value: "N/A",
      subtitle: "Problems solved",
      icon: "Trophy",
      tone: "info",
    },
  ],
  grindRatings: [
    { id: "cf-max", label: "Codeforces Max Rating", value: "N/A" },
  ],
  grindGithubStats: [
    { id: "gh-contrib", label: "Followers", value: "N/A" },
    { id: "gh-current", label: "Recent Activity", value: "N/A" },
    { id: "gh-repos", label: "Public Repositories", value: "N/A" },
  ],
  skillsetGroups: [
    {
      id: "interests",
      title: "Fields of Interest",
      subtitle: "Domains I actively explore and build in",
      badges: [
        {
          label: "AI",
          url: "https://img.shields.io/badge/Artificial%20Intelligence-111827?style=flat-square&logo=openai&logoColor=white",
        },
        {
          label: "Cyber Security",
          url: "https://img.shields.io/badge/Cyber%20Security-991B1B?style=flat-square&logo=hackthebox&logoColor=white",
        },
        {
          label: "Machine Learning",
          url: "https://img.shields.io/badge/Machine%20Learning-1D4ED8?style=flat-square&logo=tensorflow&logoColor=white",
        },
        {
          label: "Competitive Programming",
          url: "https://img.shields.io/badge/Competitive%20Programming-14532D?style=flat-square&logo=codeforces&logoColor=white",
        },
      ],
    },
    {
      id: "working-tech",
      title: "Working Technologies",
      subtitle: "Frameworks and platforms I use in production work",
      badges: [
        {
          label: "Next.js",
          url: "https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white",
        },
        {
          label: "React",
          url: "https://img.shields.io/badge/React-0F172A?style=flat-square&logo=react&logoColor=61DAFB",
        },
        {
          label: "Firebase",
          url: "https://img.shields.io/badge/Firebase-78350F?style=flat-square&logo=firebase&logoColor=FFCA28",
        },
        {
          label: "Node.js",
          url: "https://img.shields.io/badge/Node.js-166534?style=flat-square&logo=nodedotjs&logoColor=white",
        },
        {
          label: "Tailwind CSS",
          url: "https://img.shields.io/badge/Tailwind%20CSS-0E7490?style=flat-square&logo=tailwindcss&logoColor=white",
        },
        {
          label: "Framer Motion",
          url: "https://img.shields.io/badge/Framer%20Motion-701A75?style=flat-square&logo=framer&logoColor=white",
        },
      ],
    },
    {
      id: "languages",
      title: "Programming Languages",
      subtitle: "Languages I use for DSA, backend, and web apps",
      badges: [
        {
          label: "C++",
          url: "https://img.shields.io/badge/C%2B%2B-1D4ED8?style=flat-square&logo=cplusplus&logoColor=white",
        },
        {
          label: "Python",
          url: "https://img.shields.io/badge/Python-1E3A8A?style=flat-square&logo=python&logoColor=FACC15",
        },
        {
          label: "TypeScript",
          url: "https://img.shields.io/badge/TypeScript-1E40AF?style=flat-square&logo=typescript&logoColor=white",
        },
        {
          label: "JavaScript",
          url: "https://img.shields.io/badge/JavaScript-713F12?style=flat-square&logo=javascript&logoColor=FDE047",
        },
        {
          label: "SQL",
          url: "https://img.shields.io/badge/SQL-0F766E?style=flat-square&logo=postgresql&logoColor=white",
        },
        {
          label: "Bash",
          url: "https://img.shields.io/badge/Bash-111827?style=flat-square&logo=gnubash&logoColor=white",
        },
      ],
    },
    {
      id: "environment-tools",
      title: "Environment and Tools",
      subtitle: "Daily setup for development, collaboration, and deployment",
      badges: [
        {
          label: "Linux",
          url: "https://img.shields.io/badge/Linux-0F172A?style=flat-square&logo=linux&logoColor=FACC15",
        },
        {
          label: "VS Code",
          url: "https://img.shields.io/badge/VS%20Code-1E3A8A?style=flat-square&logo=visualstudiocode&logoColor=white",
        },
        {
          label: "Git",
          url: "https://img.shields.io/badge/Git-7C2D12?style=flat-square&logo=git&logoColor=white",
        },
        {
          label: "GitHub",
          url: "https://img.shields.io/badge/GitHub-111827?style=flat-square&logo=github&logoColor=white",
        },
        {
          label: "Docker",
          url: "https://img.shields.io/badge/Docker-1E40AF?style=flat-square&logo=docker&logoColor=white",
        },
        {
          label: "Vercel",
          url: "https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white",
        },
      ],
    },
  ],
  tabVisibility: {
    home: true,
    certificates: true,
    projects: true,
    activity: true,
    grind: true,
    skillset: true,
  },
};

const mergePortfolioSettings = (incoming: Partial<PortfolioSettings> | null | undefined): PortfolioSettings => {
  return {
    ...defaultPortfolioSettings,
    ...incoming,
    githubToken: incoming?.githubToken ?? defaultPortfolioSettings.githubToken,
    grindUsernames: {
      ...defaultPortfolioSettings.grindUsernames,
      ...(incoming?.grindUsernames || {}),
    },
    tabVisibility: {
      ...defaultPortfolioSettings.tabVisibility,
      ...(incoming?.tabVisibility || {}),
    },
    grindCards:
      incoming?.grindCards && incoming.grindCards.length > 0
        ? incoming.grindCards
        : defaultPortfolioSettings.grindCards,
    grindRatings:
      incoming?.grindRatings && incoming.grindRatings.length > 0
        ? incoming.grindRatings
        : defaultPortfolioSettings.grindRatings,
    grindGithubStats:
      incoming?.grindGithubStats && incoming.grindGithubStats.length > 0
        ? incoming.grindGithubStats
        : defaultPortfolioSettings.grindGithubStats,
    skillsetGroups:
      incoming?.skillsetGroups && incoming.skillsetGroups.length > 0
        ? incoming.skillsetGroups
        : defaultPortfolioSettings.skillsetGroups,
  };
};

export const subscribeToPortfolioSettings = (
  callback: (settings: PortfolioSettings) => void,
) => {
  const settingsRef = ref(db, "portfolio_settings");
  return onValue(settingsRef, async (snapshot) => {
    const data = snapshot.val() as Partial<PortfolioSettings> | null;
    if (!data) {
      await set(settingsRef, defaultPortfolioSettings);
      callback(defaultPortfolioSettings);
      return;
    }
    callback(mergePortfolioSettings(data));
  });
};

// Media Functions (Cloudinary Image Tracking)
export const saveMediaRef = async (image: Omit<CloudinaryImage, "id">) => {
  const mediaRef = ref(db, "media");
  const newRef = push(mediaRef);
  await set(newRef, {
    ...image,
    id: newRef.key,
  });
};

export const deleteMediaRef = async (id: string) => {
  const imageRef = ref(db, `media/${id}`);
  await remove(imageRef);
};

export const subscribeToMedia = (
  callback: (images: CloudinaryImage[]) => void,
) => {
  const mediaRef = ref(db, "media");
  return onValue(mediaRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const images = Object.keys(data).map((key) => ({
        ...data[key],
        id: key,
      }));
      callback(images.reverse());
    } else {
      callback([]);
    }
  });
};

export const updatePortfolioSettings = async (
  settings: Partial<PortfolioSettings>,
) => {
  const settingsRef = ref(db, "portfolio_settings");
  await update(settingsRef, settings);
  await logActivity("edit", "auth", "portfolio_settings", "Portfolio Settings");
};

// Activity Logging Functions
export const logActivity = async (
  action: ActivityLog["action"],
  entity: ActivityLog["entity"],
  entityId?: string,
  entityTitle?: string,
) => {
  const logsRef = ref(db, "activity_logs");
  const newRef = push(logsRef);
  await set(newRef, {
    id: newRef.key,
    action,
    entity,
    entityId: entityId || "",
    entityTitle: entityTitle || "",
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "",
    ipAddress: "Hidden for privacy",
  });

  // Cleanup old logs periodically (every 10th log to avoid excessive cleanup calls)
  if (Math.random() < 0.1) {
    // Run cleanup asynchronously without blocking the log creation
    cleanupOldLogs().catch(console.error);
  }
};

export const subscribeToLogs = (callback: (logs: ActivityLog[]) => void) => {
  const logsRef = ref(db, "activity_logs");
  return onValue(logsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const logs = Object.keys(data).map((key) => ({
        ...data[key],
        id: key,
      }));
      // Sort by timestamp and keep only latest 30
      const sortedLogs = logs
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )
        .slice(0, 30);
      callback(sortedLogs);
    } else {
      callback([]);
    }
  });
};

// Cleanup function to keep only latest 30 logs in database
export const cleanupOldLogs = async () => {
  try {
    const logsRef = ref(db, "activity_logs");
    const { get } = await import("firebase/database");
    const snapshot = await get(logsRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      const logs = Object.keys(data).map((key) => ({
        ...data[key],
        id: key,
      }));

      // Sort by timestamp and identify logs to delete (keep latest 30)
      const sortedLogs = logs.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      if (sortedLogs.length > 30) {
        const logsToDelete = sortedLogs.slice(30); // Get logs beyond the latest 30

        // Delete old logs
        for (const log of logsToDelete) {
          const logRef = ref(db, `activity_logs/${log.id}`);
          await remove(logRef);
        }

        // console.log(`Cleaned up ${logsToDelete.length} old activity logs`);
      }
    }
  } catch (error) {
    // console.error("Error cleaning up old logs:", error);
  }
};

// Content Functions (Enhanced with Logging)
export const saveContent = async (item: Omit<ContentItem, "id">) => {
  const contentRef = ref(db, "content");
  const newRef = push(contentRef);
  await set(newRef, {
    ...item,
    id: newRef.key,
    likes: 0,
    views: 0,
    createdAt: new Date().toISOString(),
  });

  // Log the action
  await logActivity("create", item.type, newRef.key, item.title);
};

export const updateContent = async (
  id: string,
  item: Omit<ContentItem, "id">,
) => {
  const itemRef = ref(db, `content/${id}`);
  await update(itemRef, item);

  // Log the action
  await logActivity("edit", item.type, id, item.title);
};

export const deleteContent = async (
  id: string,
  type: "project" | "activity",
  title: string,
) => {
  const itemRef = ref(db, `content/${id}`);
  await remove(itemRef);

  // Log the action
  await logActivity("delete", type, id, title);
};

export const incrementViews = async (id: string) => {
  const itemRef = ref(db, `content/${id}`);
  await update(itemRef, {
    views: increment(1),
  });
};

export const incrementLikes = async (id: string) => {
  const itemRef = ref(db, `content/${id}`);
  await update(itemRef, {
    likes: increment(1),
  });
};

export const subscribeToContent = (
  callback: (items: ContentItem[]) => void,
) => {
  const contentRef = ref(db, "content");
  return onValue(contentRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const items = Object.keys(data).map((key) => ({
        ...data[key],
        id: key,
      }));
      callback(items.reverse()); // Newest first
    } else {
      callback([]);
    }
  });
};

// Notes Functions
export const saveNote = async (
  note: Omit<Note, "id" | "createdAt" | "updatedAt">,
) => {
  const notesRef = ref(db, "notes");
  const newRef = push(notesRef);
  await set(newRef, {
    ...note,
    id: newRef.key,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Log the action
  await logActivity("create", "note", newRef.key, note.title);
};

export const updateNote = async (
  id: string,
  note: Omit<Note, "id" | "createdAt" | "updatedAt">,
) => {
  const noteRef = ref(db, `notes/${id}`);
  await update(noteRef, {
    ...note,
    updatedAt: new Date().toISOString(),
  });

  // Log the action
  await logActivity("edit", "note", id, note.title);
};

export const deleteNote = async (id: string, title: string) => {
  const noteRef = ref(db, `notes/${id}`);
  await remove(noteRef);

  // Log the action
  await logActivity("delete", "note", id, title);
};

export const subscribeToNotes = (callback: (notes: Note[]) => void) => {
  const notesRef = ref(db, "notes");
  return onValue(notesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const notes = Object.keys(data).map((key) => ({
        ...data[key],
        id: key,
      }));
      callback(notes.reverse()); // Newest first
    } else {
      callback([]);
    }
  });
};
