"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { oneDark } from "@codemirror/theme-one-dark";
import {
  ContentItem,
  Note,
  ActivityLog,
  DashboardTab,
  PortfolioSettings,
  TabType,
  CloudinaryImage,
} from "../../../lib/types";
import {
  saveContent,
  subscribeToContent,
  deleteContent,
  updateContent,
  saveNote,
  subscribeToNotes,
  deleteNote,
  updateNote,
  subscribeToLogs,
  logActivity,
  subscribeToPortfolioSettings,
  updatePortfolioSettings,
  subscribeToMedia,
  saveMediaRef,
  deleteMediaRef,
} from "../../../lib/firebase";
import {
  sanitizeExternalUrl,
  sanitizePlainText,
  sanitizeRichHtml,
} from "../../../lib/sanitize";
import { ThemeProvider, useTheme } from "../../../lib/context/ThemeContext";
import ThemeToggle from "../../../components/client/ThemeToggle";

interface DashboardProps {
  onLogout: () => void;
}

const TAB_ORDER: TabType[] = [
  "certificates",
  "projects",
  "activity",
  "grind",
  "skillset",
];

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>("notepad");

  // Content Management State
  const getDefaultDate = () =>
    new Date().toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    date: getDefaultDate(),
    description: "",
    imageUrl: "",
    type: "project" as "project" | "activity",
    tags: [] as string[],
    links: {
      github: "",
      website: "",
      twitter: "",
      youtube: "",
      linkedin: "",
    },
  });

  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [tagsInput, setTagsInput] = useState("");
  const editorRef = useRef<any>(null);
  const noteEditorRef = useRef<any>(null);

  // Notes State
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteForm, setNoteForm] = useState({
    title: "",
    content: "",
    tags: [] as string[],
  });

  // Logs State
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Media State
  const [media, setMedia] = useState<CloudinaryImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const cloudinaryUploadPreset = "portfolio_preset";
  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dqhwfya3u";

  const [portfolioSettings, setPortfolioSettings] =
    useState<PortfolioSettings | null>(null);
  const [usernameForm, setUsernameForm] = useState({
    codeforces: "",
    github: "",
  });
  const [homeForm, setHomeForm] = useState({
    quote: "",
    quoteAuthor: "",
    summary: "",
    email: "",
    location: "",
    education: "",
    status: "",
    techStack: "",
    featuredProjectIds: "",
  });
  const [grindCardsEditor, setGrindCardsEditor] = useState("[]");
  const [grindRatingsEditor, setGrindRatingsEditor] = useState("[]");
  const [grindGithubEditor, setGrindGithubEditor] = useState("[]");
  const [skillsetEditor, setSkillsetEditor] = useState("[]");
  const { isDarkMode } = useTheme();

  const [githubTokenInput, setGithubTokenInput] = useState("");
  const [codespaceCode, setCodespaceCode] = useState(
    "// Start coding...\n",
  );
  const [githubUser, setGithubUser] = useState<{ login: string } | null>(null);
  const [repoList, setRepoList] = useState<
    Array<{ id: number; name: string; full_name: string; private: boolean }>
  >([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [repoEntries, setRepoEntries] = useState<
    Array<{
      name: string;
      path: string;
      type: "file" | "dir";
    }>
  >([]);
  const [repoPath, setRepoPath] = useState("");
  const [repoNameInput, setRepoNameInput] = useState("");
  const [repoVisibility, setRepoVisibility] = useState<
    "public" | "private"
  >("public");
  const [filePathInput, setFilePathInput] = useState("README.md");
  const [commitMessage, setCommitMessage] = useState(
    "Update via Codespace",
  );
  const [codespaceBusy, setCodespaceBusy] = useState(false);

  useEffect(() => {
    const unsubscribeContent = subscribeToContent(setItems);
    const unsubscribeNotes = subscribeToNotes(setNotes);
    const unsubscribeLogs = subscribeToLogs(setLogs);
    const unsubscribeMedia = subscribeToMedia(setMedia);
    const unsubscribeSettings = subscribeToPortfolioSettings((settings) => {
      setPortfolioSettings(settings);
      setUsernameForm(settings.grindUsernames);
      
      if (settings.homeSettings) {
        setHomeForm({
          quote: settings.homeSettings.quote || "",
          quoteAuthor: settings.homeSettings.quoteAuthor || "",
          summary: settings.homeSettings.summary || "",
          email: settings.homeSettings.email || "",
          location: settings.homeSettings.location || "",
          education: settings.homeSettings.education || "",
          status: settings.homeSettings.status || "",
          techStack: settings.homeSettings.techStack?.join(", ") || "",
          featuredProjectIds: settings.homeSettings.featuredProjectIds?.join(", ") || "",
        });
      }
      
      // Only set editor if it's currently focused or we're initializing
      // Note: Typing in textarea causes a re-render, but we want to avoid 
      // resetting the editor while user is typing.
      if (document.activeElement?.tagName !== "TEXTAREA") {
        setGrindCardsEditor(JSON.stringify(settings.grindCards, null, 2));
        setGrindRatingsEditor(JSON.stringify(settings.grindRatings, null, 2));
        setGrindGithubEditor(JSON.stringify(settings.grindGithubStats, null, 2));
        setSkillsetEditor(JSON.stringify(settings.skillsetGroups, null, 2));
      }
    });

    // Log dashboard view
    logActivity("view", "auth", "dashboard", "Admin Dashboard");

    return () => {
      unsubscribeContent();
      unsubscribeNotes();
      unsubscribeLogs();
      unsubscribeMedia();
      unsubscribeSettings();
    };
  }, []);

  useEffect(() => {
    const savedToken = portfolioSettings?.githubToken?.trim();
    if (!savedToken) {
      setGithubUser(null);
      return;
    }

    fetchGithubUser(savedToken).catch(() => {
      setGithubUser(null);
    });
  }, [portfolioSettings?.githubToken]);

  useEffect(() => {
    if (!selectedRepo) {
      setRepoEntries([]);
      setRepoPath("");
      return;
    }

    loadRepoEntries("").catch(() => {
      setRepoEntries([]);
    });
  }, [selectedRepo]);

  const tabs = [
    {
      id: "notepad" as DashboardTab,
      label: "Personal Notepad",
      icon: "fas fa-sticky-note",
    },
    {
      id: "publish-project" as DashboardTab,
      label: "Publish Project",
      icon: "fas fa-code",
    },
    {
      id: "publish-activity" as DashboardTab,
      label: "Publish Activity",
      icon: "fas fa-calendar",
    },
    {
      id: "manage-content" as DashboardTab,
      label: "Manage Content",
      icon: "fas fa-edit",
    },
    {
      id: "media" as DashboardTab,
      label: "Upload Images",
      icon: "fas fa-image",
    },
    {
      id: "codespace" as DashboardTab,
      label: "Codespace",
      icon: "fas fa-terminal",
    },
    {
      id: "portfolio-config" as DashboardTab,
      label: "Portfolio Config",
      icon: "fas fa-sliders-h",
    },
    {
      id: "logs" as DashboardTab,
      label: "View Portfolio Logs",
      icon: "fas fa-history",
    },
    {
      id: "logout" as DashboardTab,
      label: "Log out",
      icon: "fas fa-sign-out-alt",
    },
  ];

  const handleTabClick = async (tabId: DashboardTab) => {
    if (tabId === "logout") {
      await logActivity("logout", "auth", "dashboard", "Admin Dashboard");
      onLogout();
      return;
    }
    setActiveTab(tabId);
    if (tabId === "publish-project") {
      setFormData((prev) => ({ ...prev, type: "project" }));
    } else if (tabId === "publish-activity") {
      setFormData((prev) => ({ ...prev, type: "activity" }));
    }
  };

  // Content Management Functions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      title: sanitizePlainText(formData.title),
      date: sanitizePlainText(formData.date),
      description: sanitizeRichHtml(formData.description),
      imageUrl:
        sanitizeExternalUrl(formData.imageUrl) ||
        `https://picsum.photos/seed/${Date.now()}/800/600`,
      tags: formData.tags
        .map((tag) => sanitizePlainText(tag))
        .filter((tag) => tag.length > 0),
      links: {
        github: sanitizeExternalUrl(formData.links.github),
        website: sanitizeExternalUrl(formData.links.website),
        twitter: sanitizeExternalUrl(formData.links.twitter),
        youtube: sanitizeExternalUrl(formData.links.youtube),
        linkedin: sanitizeExternalUrl(formData.links.linkedin),
      },
    };

    setIsLoading(true);
    try {
      if (editingId) {
        await updateContent(editingId, payload);
        setMessage({ text: "Post updated!", type: "success" });
      } else {
        await saveContent(payload);
        setMessage({ text: "Post published!", type: "success" });
      }
      resetForm();
    } catch (err) {
      setMessage({ text: "Error saving post.", type: "error" });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 4000);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      date: getDefaultDate(),
      description: "",
      imageUrl: "",
      type: activeTab === "publish-project" ? "project" : "activity",
      tags: [],
      links: {
        github: "",
        website: "",
        twitter: "",
        youtube: "",
        linkedin: "",
      },
    });
    setTagsInput("");
    setEditingId(null);
  };

  const handleEdit = (item: ContentItem) => {
    setFormData({
      title: item.title,
      slug: item.slug || "",
      date: item.date,
      description: item.description,
      imageUrl: item.imageUrl,
      type: item.type,
      tags: item.tags || [],
      links: {
        github: item.links?.github || "",
        website: item.links?.website || "",
        twitter: item.links?.twitter || "",
        youtube: item.links?.youtube || "",
        linkedin: item.links?.linkedin || "",
      },
    });
    setTagsInput((item.tags || []).join(", "));
    setEditingId(item.id);
    setActiveTab(
      item.type === "project" ? "publish-project" : "publish-activity",
    );
  };

  const handleDelete = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item && window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteContent(id, item.type, item.title);
        setMessage({ text: "Post deleted.", type: "success" });
      } catch (err) {
        setMessage({ text: "Error deleting post.", type: "error" });
      }
    }
  };

  // Media Functions
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
      setMessage({
        text: "Cloudinary config missing. Check dashboard code.",
        type: "error",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryUploadPreset);

    try {
      // console.log("Starting upload to:", `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`);
      // console.log("Using preset:", cloudinaryUploadPreset);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await res.json();
      // console.log("Cloudinary response:", data);

      if (data.secure_url) {
        await saveMediaRef({
          url: data.secure_url,
          publicId: data.public_id,
          name: file.name,
          createdAt: new Date().toISOString(),
        });
        setMessage({ text: "Image uploaded successfully!", type: "success" });
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (err: any) {
      setMessage({
        text: `Upload failed: ${err.message}`,
        type: "error",
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 4000);
    }
  };

  const handleDeleteMedia = async (image: CloudinaryImage) => {
    if (window.confirm(`Delete "${image.name}" from your records?`)) {
      try {
        await deleteMediaRef(image.id);
        setMessage({ text: "Image reference removed.", type: "success" });
      } catch (err) {
        setMessage({ text: "Error removing reference.", type: "error" });
      }
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage({ text: "Link copied to clipboard!", type: "success" });
    setTimeout(() => setMessage({ text: "", type: "" }), 2000);
  };

  // Notes Functions
  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setNoteForm({
      title: note.title,
      content: note.content,
      tags: note.tags || [],
    });
    setIsEditingNote(false);
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setNoteForm({
      title: "",
      content: "",
      tags: [],
    });
    setIsEditingNote(true);
  };

  const handleSaveNote = async () => {
    if (!noteForm.title.trim()) return;

    const payload = {
      title: sanitizePlainText(noteForm.title),
      content: sanitizeRichHtml(noteForm.content),
      tags: (noteForm.tags || [])
        .map((tag) => sanitizePlainText(tag))
        .filter((tag) => tag.length > 0),
    };

    try {
      if (selectedNote) {
        await updateNote(selectedNote.id, payload);
        setMessage({ text: "Note updated!", type: "success" });
      } else {
        await saveNote(payload);
        setMessage({ text: "Note saved!", type: "success" });
      }
      setIsEditingNote(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (err) {
      setMessage({ text: "Error saving note.", type: "error" });
    }
  };

  const handleDeleteNote = async (note: Note) => {
    if (window.confirm(`Are you sure you want to delete "${note.title}"?`)) {
      try {
        await deleteNote(note.id, note.title);
        setSelectedNote(null);
        setNoteForm({ title: "", content: "", tags: [] });
        setMessage({ text: "Note deleted.", type: "success" });
      } catch (err) {
        setMessage({ text: "Error deleting note.", type: "error" });
      }
    }
  };

  const insertTag = (tag: string) => {
    const view = editorRef.current?.view;
    if (!view) return;

    const selection = view.state.selection.main;
    const start = selection.from;
    const end = selection.to;
    const selectedText = view.state.sliceDoc(start, end);

    let replacement = "";
    if (tag === "img") {
      const url = prompt("Enter Image URL:");
      if (url)
        replacement = `<img src="${url}" class="my-6 rounded-2xl w-full shadow-md border border-gray-100 dark:border-gray-800" />`;
    } else if (tag === "b") {
      replacement = `<b>${selectedText || "bold text"}</b>`;
    } else if (tag === "i") {
      replacement = `<i>${selectedText || "italic text"}</i>`;
    } else if (tag === "link") {
      const url = prompt("Enter Link URL:");
      if (url)
        replacement = `<a href="${url}" class="text-blue-500 font-bold underline" target="_blank">${selectedText || "Link Text"}</a>`;
    } else if (tag === "h2") {
      replacement = `<h2 class="text-2xl font-extrabold text-gray-900 dark:text-white">${selectedText || "Subheading"}</h2>`;
    } else if (tag === "h3") {
      replacement = `<h3 class="text-xl font-bold text-gray-900 dark:text-white">${selectedText || "Heading 3"}</h3>`;
    } else if (tag === "code-inline") {
      replacement = `<code class="bg-gray-100 dark:bg-gray-800 rounded-md text-sm font-mono text-gray-700 dark:text-gray-200">${selectedText || "code"}</code>`;
    } else if (tag === "code-block") {
      const language = prompt(
        "Enter programming language (e.g., javascript, python, html):",
      );
      replacement = `<pre class="bg-gray-900 text-gray-100 rounded-xl overflow-x-auto shadow-md"><code class="language-${language || "text"}">${selectedText || "// Your code here\nconsole.log('Hello World!');"}</code></pre>`;
    } else if (tag === "iframe") {
      const url = prompt("Enter iframe URL (YouTube, CodePen, etc.):");
      if (url) {
        replacement = `<iframe src="${url}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="width:100%;height:auto;aspect-ratio:16 / 9"></iframe>`;
      }
    } else if (tag === "quote") {
      replacement = `<blockquote class="border-l-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/30 italic text-gray-700 dark:text-gray-300 rounded-r-lg">${selectedText || "Insert your quote here"}</blockquote>`;
    } else if (tag === "latex-inline") {
      replacement = `\\(${selectedText || "a^2+b^2=c^2"}\\)`;
    } else if (tag === "latex-block") {
      replacement = `\\[\n${selectedText || "\\int_0^1 x^2\\,dx = \\frac{1}{3}"}\n\\]`;
    } else if (tag === "list") {
      replacement = `<ul class="list-disc space-y-1">\n  <li>${selectedText || "List item 1"}</li>\n  <li>List item 2</li>\n  <li>List item 3</li>\n</ul>`;
    } else if (tag === "table") {
      replacement = `<div class="overflow-x-auto my-5 rounded-xl border border-gray-200 dark:border-gray-700">
  <table class="min-w-full bg-white dark:bg-gray-800">
    <thead class="bg-gray-50 dark:bg-gray-700/70">
      <tr>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Header 1</th>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Header 2</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
      <tr>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">Data 1</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">Data 2</td>
      </tr>
    </tbody>
  </table>
</div>`;
    } else if (tag === "divider") {
      replacement = `<hr class="my-6 border-t border-gray-200 dark:border-gray-700" />`;
    } else if (tag === "alert") {
      const type =
        prompt("Enter alert type (success, warning, error, info):") || "info";
      const colors = {
        success:
          "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300",
        warning:
          "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-300",
        error:
          "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300",
        info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300",
      };
      replacement = `<div class="p-4 my-4 border rounded-lg ${colors[type as keyof typeof colors] || colors.info}">${selectedText || "Alert message here"}</div>`;
    }

    if (replacement) {
      view.dispatch({
        changes: { from: start, to: end, insert: replacement },
        selection: { anchor: start + replacement.length },
      });
      view.focus();
    }
  };

  const insertNoteTag = (tag: string) => {
    const view = noteEditorRef.current?.view;
    if (!view) return;

    const selection = view.state.selection.main;
    const start = selection.from;
    const end = selection.to;
    const selectedText = view.state.sliceDoc(start, end);

    let replacement = "";
    if (tag === "img") {
      const url = prompt("Enter Image URL:");
      if (url)
        replacement = `<img src="${url}" class="my-5 rounded-2xl w-full shadow-md border border-gray-100 dark:border-gray-800" />`;
    } else if (tag === "b") {
      replacement = `<b>${selectedText || "bold text"}</b>`;
    } else if (tag === "i") {
      replacement = `<i>${selectedText || "italic text"}</i>`;
    } else if (tag === "link") {
      const url = prompt("Enter Link URL:");
      if (url)
        replacement = `<a href="${url}" class="text-blue-500 font-bold underline" target="_blank">${selectedText || "Link Text"}</a>`;
    } else if (tag === "h2") {
      replacement = `<h2 class="text-2xl font-extrabold mt-7 mb-3 text-gray-900 dark:text-white">${selectedText || "Heading 2"}</h2>`;
    } else if (tag === "h3") {
      replacement = `<h3 class="text-lg font-bold mt-5 mb-2 text-gray-900 dark:text-white">${selectedText || "Heading 3"}</h3>`;
    } else if (tag === "code-inline") {
      replacement = `<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-md text-sm font-mono text-gray-700 dark:text-gray-200">${selectedText || "code"}</code>`;
    } else if (tag === "code-block") {
      const language = prompt(
        "Enter programming language (e.g., javascript, python, html):",
      );
      replacement = `<pre class="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto my-5 shadow-md"><code class="language-${language || "text"}">${selectedText || "// Your code here\nconsole.log('Hello World!');"}</code></pre>`;
    } else if (tag === "iframe") {
      const url = prompt("Enter iframe URL (YouTube, CodePen, etc.):");
      if (url) {
        replacement = `<iframe src="${url}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="width:100%;height:auto;aspect-ratio:16 / 9"></iframe>`;
      }
    } else if (tag === "list") {
      replacement = `<ul class="list-disc pl-6 my-4 space-y-1">\n  <li>${selectedText || "List item 1"}</li>\n  <li>List item 2</li>\n  <li>List item 3</li>\n</ul>`;
    } else if (tag === "latex-inline") {
      replacement = `\\(${selectedText || "a^2+b^2=c^2"}\\)`;
    } else if (tag === "latex-block") {
      replacement = `\\[\n${selectedText || "\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}"}\n\\]`;
    }

    if (replacement) {
      view.dispatch({
        changes: { from: start, to: end, insert: replacement },
        selection: { anchor: start + replacement.length },
      });
      view.focus();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "login":
        return "text-green-600 bg-green-50 dark:text-green-200 dark:bg-green-900/30";
      case "logout":
        return "text-orange-600 bg-orange-50 dark:text-orange-200 dark:bg-orange-900/30";
      case "create":
        return "text-blue-600 bg-blue-50 dark:text-blue-200 dark:bg-blue-900/30";
      case "edit":
        return "text-yellow-600 bg-yellow-50 dark:text-yellow-200 dark:bg-yellow-900/30";
      case "delete":
        return "text-red-600 bg-red-50 dark:text-red-200 dark:bg-red-900/30";
      case "view":
        return "text-purple-600 bg-purple-50 dark:text-purple-200 dark:bg-purple-900/30";
      default:
        return "text-gray-600 bg-gray-50 dark:text-gray-200 dark:bg-gray-800";
    }
  };

  const saveHomeSettings = async () => {
    try {
      if (!portfolioSettings) return;
      await updatePortfolioSettings({
        ...portfolioSettings,
        homeSettings: {
          ...homeForm,
          techStack: homeForm.techStack.split(",").map(t => t.trim()).filter(Boolean),
          featuredProjectIds: homeForm.featuredProjectIds.split(",").map(t => t.trim()).filter(Boolean),
        },
      });
      setMessage({ text: "Home settings updated!", type: "success" });
      logActivity("edit", "auth", "home-settings", "Updated Home Tab Settings");
    } catch (error) {
      setMessage({ text: "Failed to update home settings", type: "error" });
    }
  };

  const saveUsernames = async () => {
    try {
      await updatePortfolioSettings({ grindUsernames: usernameForm });
      setMessage({ text: "Grind usernames updated.", type: "success" });
    } catch {
      setMessage({ text: "Failed to save usernames.", type: "error" });
    }
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const toggleTabVisibility = async (tab: TabType) => {
    if (!portfolioSettings) {
      return;
    }

    const nextVisibility = {
      ...portfolioSettings.tabVisibility,
      [tab]: !portfolioSettings.tabVisibility[tab],
    };

    if (!Object.values(nextVisibility).some(Boolean)) {
      setMessage({
        text: "At least one tab must stay visible.",
        type: "error",
      });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return;
    }

    try {
      await updatePortfolioSettings({ tabVisibility: nextVisibility });
      setMessage({ text: "Tab visibility updated.", type: "success" });
    } catch {
      setMessage({ text: "Failed to update tab visibility.", type: "error" });
    }
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const saveJsonEditors = async () => {
    try {
      const grindCards = JSON.parse(grindCardsEditor);
      const grindRatings = JSON.parse(grindRatingsEditor);
      const grindGithubStats = JSON.parse(grindGithubEditor);
      const skillsetGroups = JSON.parse(skillsetEditor);

      await updatePortfolioSettings({
        grindCards,
        grindRatings,
        grindGithubStats,
        skillsetGroups,
      });
      setMessage({
        text: "Grind and skillset content saved.",
        type: "success",
      });
    } catch {
      setMessage({
        text: "Invalid JSON. Please fix the format.",
        type: "error",
      });
    }
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const getGithubToken = () =>
    portfolioSettings?.githubToken?.trim() || githubTokenInput.trim();

  const encodeBase64 = (value: string) =>
    typeof window === "undefined"
      ? ""
      : btoa(unescape(encodeURIComponent(value)));

  const decodeBase64 = (value: string) =>
    typeof window === "undefined"
      ? ""
      : decodeURIComponent(escape(atob(value)));

  const safeRepoPath = (path: string) =>
    path
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");

  const fetchGithubUser = async (token: string) => {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch GitHub user");
    }

    const data = (await response.json()) as { login: string };
    setGithubUser({ login: data.login });
    return data.login;
  };

  const handleSaveGithubToken = async () => {
    const token = githubTokenInput.trim();
    if (!token) {
      setMessage({ text: "Enter a GitHub token first.", type: "error" });
      return;
    }

    await updatePortfolioSettings({ githubToken: token });
    setGithubTokenInput("");
    setMessage({ text: "GitHub token saved.", type: "success" });
  };

  const loadRepoEntries = async (path: string) => {
    const token = getGithubToken();
    if (!token || !selectedRepo) {
      return;
    }

    const normalizedPath = path.trim();
    setCodespaceBusy(true);
    try {
      const response = await fetch(
        `https://api.github.com/repos/${selectedRepo}/contents/${safeRepoPath(normalizedPath)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load repo contents");
      }

      const data = (await response.json()) as Array<{
        name: string;
        path: string;
        type: "file" | "dir";
      }>;

      setRepoEntries(data);
      setRepoPath(normalizedPath);
    } catch (error) {
      setMessage({ text: "Failed to load repo files.", type: "error" });
    } finally {
      setCodespaceBusy(false);
    }
  };

  const loadFileByPath = async (path: string, notify = true) => {
    const token = getGithubToken();
    if (!token || !selectedRepo) {
      setMessage({ text: "Select a repo and token first.", type: "error" });
      return;
    }

    const normalizedPath = path.trim();
    if (!normalizedPath) {
      setMessage({ text: "Enter a file path.", type: "error" });
      return;
    }

    setCodespaceBusy(true);
    try {
      const response = await fetch(
        `https://api.github.com/repos/${selectedRepo}/contents/${safeRepoPath(normalizedPath)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load file");
      }

      const data = (await response.json()) as { content?: string };
      if (data.content) {
        setCodespaceCode(decodeBase64(data.content));
        setFilePathInput(normalizedPath);
        if (notify) {
          setMessage({ text: "File loaded.", type: "success" });
        }
      }
    } catch (error) {
      setMessage({ text: "Failed to load file.", type: "error" });
    } finally {
      setCodespaceBusy(false);
    }
  };

  const handleClearGithubToken = async () => {
    await updatePortfolioSettings({ githubToken: "" });
    setGithubUser(null);
    setRepoList([]);
    setSelectedRepo("");
    setMessage({ text: "GitHub token cleared.", type: "success" });
  };

  const handleLoadRepos = async () => {
    const token = getGithubToken();
    if (!token) {
      setMessage({ text: "Add a GitHub token to load repos.", type: "error" });
      return;
    }

    setCodespaceBusy(true);
    try {
      const response = await fetch(
        "https://api.github.com/user/repos?per_page=100&sort=updated",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load repos");
      }

      const data = (await response.json()) as Array<{
        id: number;
        name: string;
        full_name: string;
        private: boolean;
      }>;
      setRepoList(data);
      if (!selectedRepo && data.length > 0) {
        setSelectedRepo(data[0].full_name);
      }
      setMessage({ text: "Repos loaded.", type: "success" });
    } catch (error) {
      setMessage({ text: "Failed to load repos.", type: "error" });
    } finally {
      setCodespaceBusy(false);
    }
  };

  const handleCreateRepo = async () => {
    const token = getGithubToken();
    if (!token) {
      setMessage({ text: "Add a GitHub token first.", type: "error" });
      return;
    }

    const name = repoNameInput.trim();
    if (!name) {
      setMessage({ text: "Enter a repository name.", type: "error" });
      return;
    }

    setCodespaceBusy(true);
    try {
      const response = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          private: repoVisibility === "private",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create repo");
      }

      const data = (await response.json()) as { full_name: string };
      setRepoNameInput("");
      setSelectedRepo(data.full_name);
      await handleLoadRepos();
      setMessage({ text: "Repository created.", type: "success" });
    } catch (error) {
      setMessage({ text: "Failed to create repo.", type: "error" });
    } finally {
      setCodespaceBusy(false);
    }
  };

  const handleLoadFile = async () => {
    await loadFileByPath(filePathInput.trim());
  };

  const handleSaveFile = async () => {
    const token = getGithubToken();
    if (!token || !selectedRepo) {
      setMessage({ text: "Select a repo and token first.", type: "error" });
      return;
    }

    const path = filePathInput.trim();
    if (!path) {
      setMessage({ text: "Enter a file path.", type: "error" });
      return;
    }

    setCodespaceBusy(true);
    try {
      let sha: string | undefined;
      const existingResponse = await fetch(
        `https://api.github.com/repos/${selectedRepo}/contents/${safeRepoPath(path)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
          },
        },
      );

      if (existingResponse.ok) {
        const existingData = (await existingResponse.json()) as { sha?: string };
        sha = existingData.sha;
      }

      const response = await fetch(
        `https://api.github.com/repos/${selectedRepo}/contents/${safeRepoPath(path)}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: commitMessage.trim() || "Update via Codespace",
            content: encodeBase64(codespaceCode),
            ...(sha ? { sha } : {}),
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to save file");
      }

      setMessage({ text: "File saved to GitHub.", type: "success" });
    } catch (error) {
      setMessage({ text: "Failed to save file.", type: "error" });
    } finally {
      setCodespaceBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 flex flex-col transition-colors">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 flex items-center sticky top-0 z-50 shadow-sm dark:bg-gray-950 dark:border-gray-800/50 dark:backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#FFDB14] rounded-lg flex items-center justify-center font-black text-base text-gray-900 shadow-md ring-2 ring-yellow-400/20">
            B
          </div>
          <span className="sr-only">Studio Admin</span>
        </div>

        <div className="flex-1 mx-4 md:mx-8 overflow-hidden">
          <div className="flex flex-wrap items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-bold whitespace-nowrap rounded-md border transition-all ${
                  activeTab === tab.id
                    ? "bg-[#FFDB14] text-gray-900 border-yellow-400 shadow-[0_0_15px_rgba(255,219,20,0.3)] dark:text-gray-900 dark:bg-[#FFDB14] dark:border-yellow-300 dark:shadow-[0_0_20px_rgba(255,219,20,0.4)]"
                    : "border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-200 dark:text-gray-500 dark:hover:text-gray-200 dark:hover:border-gray-700"
                } ${tab.id === "logout" ? "ml-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300" : ""}`}
              >
                <i className={tab.icon}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
        </div>
      </nav>

      {message.text && (
        <div
          className={`mx-6 md:mx-12 mt-4 px-6 py-3 rounded-2xl text-xs font-black ${
            message.type === "success"
              ? "bg-green-50 text-green-600 border border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700"
              : "bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700"
          }`}
        >
          <i className="fas fa-info-circle mr-2"></i> {message.text}
        </div>
      )}

      {/* Personal Notepad Tab */}
      {activeTab === "notepad" && (
        <div className="flex-1 p-3">
          <div className="w-[100%] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-[90vh]">
              {/* Notes List */}
              <div className="bg-white shadow-lg border border-gray-100 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center dark:border-gray-800">
                  <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">
                    All Notes
                  </h2>
                  <button
                    onClick={handleNewNote}
                    className="bg-[#FFDB14] text-gray-900 px-4 py-2 rounded-lg font-bold text-xs hover:bg-yellow-400 transition-all"
                  >
                    <i className="fas fa-plus mr-2"></i>New Note
                  </button>
                </div>
                <div className="overflow-y-auto h-full p-4 space-y-3">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => handleNoteClick(note)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        selectedNote?.id === note.id
                          ? "bg-yellow-50 border-[#FFDB14] dark:bg-yellow-500/15"
                          : "bg-gray-50 border-gray-200 hover:bg-white dark:bg-gray-900/60 dark:border-gray-800 dark:hover:bg-gray-800"
                      }`}
                    >
                      <h3 className="font-black text-gray-900 mb-2 truncate dark:text-gray-100">
                        {note.title}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2 dark:text-gray-400">
                        {formatTimestamp(note.updatedAt)}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-3 dark:text-gray-300">
                        {note.content.substring(0, 100)}...
                      </p>
                    </div>
                  ))}
                  {notes.length === 0 && (
                    <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                      <i className="fas fa-sticky-note text-3xl mb-4 opacity-50"></i>
                      <p className="font-bold">No notes yet</p>
                      <p className="text-xs">Click "New Note" to start</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Note Editor */}
              <div className="lg:col-span-2 bg-white shadow-lg border border-gray-100 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center dark:border-gray-800">
                  <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">
                    {selectedNote
                      ? isEditingNote
                        ? "Edit Note"
                        : selectedNote.title
                      : "New Note"}
                  </h2>
                  <div className="flex gap-2">
                    {selectedNote && !isEditingNote ? (
                      // View mode: show Edit and Delete buttons
                      <>
                        <button
                          onClick={() => setIsEditingNote(true)}
                          className="bg-white text-blue-600 px-4 py-2 rounded-lg border border-blue-200 font-bold text-xs hover:bg-blue-50 transition-all shadow-sm dark:bg-gray-900 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-gray-800"
                        >
                          <i className="fas fa-edit mr-2"></i>Edit
                        </button>
                        <button
                          onClick={() => handleDeleteNote(selectedNote)}
                          className="bg-white text-red-600 px-4 py-2 rounded-lg border border-red-200 font-bold text-xs hover:bg-red-50 transition-all shadow-sm dark:bg-gray-900 dark:text-red-300 dark:border-red-700 dark:hover:bg-gray-800"
                        >
                          <i className="fas fa-trash mr-2"></i>Delete
                        </button>
                      </>
                    ) : (
                      // Edit mode: show Save and Cancel buttons (for both editing existing note or creating new note)
                      <>
                        <button
                          onClick={handleSaveNote}
                          disabled={!noteForm.title.trim()}
                          className="bg-[#FFDB14] text-gray-900 px-4 py-2 rounded-lg font-bold text-xs hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                          <i className="fas fa-save mr-2"></i>Save
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingNote(false);
                            if (!selectedNote) {
                              setNoteForm({ title: "", content: "", tags: [] });
                            } else {
                              // Reset to the original note content when canceling edit
                              setNoteForm({
                                title: selectedNote.title,
                                content: selectedNote.content,
                                tags: selectedNote.tags || [],
                              });
                            }
                          }}
                          className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-200 font-bold text-xs hover:bg-gray-50 transition-all shadow-sm dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                          <i className="fas fa-times mr-2"></i>Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-6 h-full">
                  {isEditingNote || !selectedNote ? (
                    <>
                      <input
                        type="text"
                        placeholder="Note title..."
                        value={noteForm.title}
                        onChange={(e) =>
                          setNoteForm((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="w-full text-2xl font-black border-none outline-none mb-6 text-gray-900 placeholder:text-gray-300 dark:text-gray-100 dark:placeholder:text-gray-600 bg-transparent"
                      />

                      {/* Enhanced Content Editor for Notes */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-4">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] dark:text-gray-500">
                            Note Content
                          </label>
                          <div className="flex flex-wrap gap-1 p-1 bg-gray-50 rounded-lg border border-gray-100 dark:bg-gray-900/60 dark:border-gray-700">
                            {/* Text Formatting */}
                            <button
                              type="button"
                              onClick={() => insertNoteTag("h2")}
                              className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-white rounded-md text-[11px] font-black shadow-sm text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                              title="Heading 2"
                            >
                              H2
                            </button>
                            <button
                              type="button"
                              onClick={() => insertNoteTag("h3")}
                              className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-white rounded-md text-[11px] font-black shadow-sm text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                              title="Heading 3"
                            >
                              H3
                            </button>
                            <button
                              type="button"
                              onClick={() => insertNoteTag("b")}
                              className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-white rounded-md text-[11px] font-black shadow-sm text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                              title="Bold"
                            >
                              B
                            </button>
                            <button
                              type="button"
                              onClick={() => insertNoteTag("i")}
                              className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-white rounded-md text-[11px] italic font-serif shadow-sm text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                              title="Italic"
                            >
                              I
                            </button>

                            {/* Code and Embeds */}
                            <button
                              type="button"
                              onClick={() => insertNoteTag("code-inline")}
                              className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-white rounded-md text-[11px] shadow-sm text-gray-700 font-mono dark:text-gray-200 dark:hover:bg-gray-800"
                              title="Inline Code"
                            >
                              &lt;/&gt;
                            </button>
                            <button
                              type="button"
                              onClick={() => insertNoteTag("code-block")}
                              className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-white rounded-md text-[11px] shadow-sm text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                              title="Code Block"
                            >
                              <i className="fas fa-code"></i>
                            </button>
                            <button
                              type="button"
                              onClick={() => insertNoteTag("latex-inline")}
                              className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-white rounded-md text-[10px] shadow-sm text-gray-700 font-black dark:text-gray-200 dark:hover:bg-gray-800"
                              title="Inline LaTeX"
                            >
                              fx
                            </button>
                            <button
                              type="button"
                              onClick={() => insertNoteTag("latex-block")}
                              className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-white rounded-md text-[10px] shadow-sm text-gray-700 font-black dark:text-gray-200 dark:hover:bg-gray-800"
                              title="Block LaTeX"
                            >
                              Σ
                            </button>
                            <button
                              type="button"
                              onClick={() => insertNoteTag("iframe")}
                              className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-white rounded-md text-[11px] shadow-sm text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                              title="Embed (iframe)"
                            >
                              <i className="fas fa-window-maximize"></i>
                            </button>

                            {/* Media and Links */}
                            <button
                              type="button"
                              onClick={() => insertNoteTag("link")}
                              className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-white rounded-md text-[11px] shadow-sm text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                              title="Link"
                            >
                              <i className="fas fa-link"></i>
                            </button>
                            <button
                              type="button"
                              onClick={() => insertNoteTag("img")}
                              className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-white rounded-md text-[11px] shadow-sm text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                              title="Image"
                            >
                              <i className="fas fa-image"></i>
                            </button>

                            {/* Layout Elements */}
                            <button
                              type="button"
                              onClick={() => insertNoteTag("list")}
                              className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-white rounded-md text-[11px] shadow-sm text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                              title="List"
                            >
                              <i className="fas fa-list"></i>
                            </button>
                          </div>
                        </div>
                      </div>

                      <CodeMirror
                        ref={noteEditorRef}
                        value={noteForm.content}
                        height="calc(100vh - 450px)"
                        theme={isDarkMode ? oneDark : "light"}
                        extensions={[html()]}
                        onChange={(value) =>
                          setNoteForm((prev) => ({
                            ...prev,
                            content: value,
                          }))
                        }
                        className="border border-gray-200 rounded-2xl overflow-hidden focus-within:border-[#FFDB14] transition-all bg-white dark:bg-gray-900 dark:border-gray-800"
                      />
                    </>
                  ) : selectedNote ? (
                    <>
                      <h1 className="text-2xl font-black text-gray-900 mb-6 dark:text-gray-100">
                        {selectedNote.title}
                      </h1>
                      <div className="prose prose-lg max-w-none rich-content">
                        <div
                          className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed dark:text-gray-300"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeRichHtml(selectedNote.content),
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                      <div className="text-center">
                        <i className="fas fa-sticky-note text-4xl mb-4 opacity-50"></i>
                        <p className="font-bold">
                          Select a note to view or create a new one
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Publish Project/Activity Tabs */}
      {(activeTab === "publish-project" ||
        activeTab === "publish-activity") && (
        <div className="flex-1 p-0">
          <div className="w-[100%] mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-0">
              {/* Content Form */}
              <div className="xl:col-span-2 bg-white shadow-lg border border-gray-100 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
                <div className="p-8 md:p-14 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 dark:border-gray-800">
                  <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter capitalize dark:text-gray-100">
                      {editingId
                        ? `Updating ${formData.type}`
                        : `New ${formData.type}`}
                    </h1>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 dark:text-gray-500">
                      Create and manage your {formData.type} posts
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="p-8 md:p-14 space-y-10"
                >
                  <div className="space-y-8">
                    <input
                      type="text"
                      placeholder={`Enter a compelling ${formData.type} title...`}
                      className="w-full text-4xl md:text-6xl font-black border-none outline-none focus:ring-0 bg-transparent text-gray-900 placeholder:text-gray-100 tracking-tight dark:text-gray-100 dark:placeholder:text-gray-700"
                      value={formData.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setFormData((p) => ({
                          ...p,
                          title,
                          slug: editingId
                            ? p.slug
                            : title
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/(^-|-$)/g, ""),
                        }));
                      }}
                      required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3 dark:text-gray-500">
                          URL Slug (Lowercase, no spaces)
                        </label>
                        <input
                          type="text"
                          placeholder="my-awesome-project"
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-[#FFDB14] transition-all font-black text-gray-900 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 dark:focus:bg-gray-900"
                          value={formData.slug}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              slug: e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]+/g, ""),
                            }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3 dark:text-gray-500">
                          Published Date (Display)
                        </label>
                        <input
                          type="text"
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-[#FFDB14] transition-all font-black text-gray-900 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 dark:focus:bg-gray-900"
                          value={formData.date}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, date: e.target.value }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3 dark:text-gray-500">
                          Cover Image URL
                        </label>
                        <input
                          type="text"
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-[#FFDB14] transition-all font-black text-gray-900 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 dark:focus:bg-gray-900"
                          value={formData.imageUrl}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              imageUrl: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3 dark:text-gray-500">
                        Technology Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="React, TypeScript, Node.js, MongoDB, etc."
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-[#FFDB14] transition-all font-black text-gray-900 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 dark:focus:bg-gray-900"
                        value={tagsInput}
                        onChange={(e) => {
                          const value = e.target.value;
                          setTagsInput(value);
                          const tagsArray = value
                            .split(",")
                            .map((tag) => tag.trim())
                            .filter((tag) => tag.length > 0);
                          setFormData((p) => ({ ...p, tags: tagsArray }));
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3 dark:text-gray-500">
                        Project Links
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 focus-within:border-[#FFDB14] dark:bg-gray-900 dark:border-gray-800">
                          <i className="fab fa-github text-gray-400 dark:text-gray-500"></i>
                          <input
                            type="text"
                            placeholder="GitHub URL"
                            className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100"
                            value={formData.links.github}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                links: { ...p.links, github: e.target.value },
                              }))
                            }
                          />
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 focus-within:border-[#FFDB14] dark:bg-gray-900 dark:border-gray-800">
                          <i className="fas fa-globe text-gray-400 dark:text-gray-500"></i>
                          <input
                            type="text"
                            placeholder="Website URL"
                            className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100"
                            value={formData.links.website}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                links: { ...p.links, website: e.target.value },
                              }))
                            }
                          />
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 focus-within:border-[#FFDB14] dark:bg-gray-900 dark:border-gray-800">
                          <i className="fab fa-twitter text-gray-400 dark:text-gray-500"></i>
                          <input
                            type="text"
                            placeholder="Twitter URL"
                            className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100"
                            value={formData.links.twitter}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                links: { ...p.links, twitter: e.target.value },
                              }))
                            }
                          />
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 focus-within:border-[#FFDB14] dark:bg-gray-900 dark:border-gray-800">
                          <i className="fab fa-youtube text-gray-400 dark:text-gray-500"></i>
                          <input
                            type="text"
                            placeholder="YouTube URL"
                            className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100"
                            value={formData.links.youtube}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                links: { ...p.links, youtube: e.target.value },
                              }))
                            }
                          />
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 focus-within:border-[#FFDB14] dark:bg-gray-900 dark:border-gray-800">
                          <i className="fab fa-linkedin text-gray-400 dark:text-gray-500"></i>
                          <input
                            type="text"
                            placeholder="LinkedIn URL"
                            className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100"
                            value={formData.links.linkedin}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                links: { ...p.links, linkedin: e.target.value },
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4 px-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] dark:text-gray-500">
                          Content Description
                        </label>
                        <div className="flex flex-wrap gap-1 p-1 bg-gray-50 rounded-lg border border-gray-100 max-w-2xl dark:bg-gray-900/60 dark:border-gray-700">
                          {/* Text Formatting */}
                          <button
                            type="button"
                            onClick={() => insertTag("h2")}
                            className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-white rounded-md text-[11px] font-black shadow-sm text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                            title="Heading 2"
                          >
                            H2
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTag("h3")}
                            className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-white rounded-md text-[11px] font-black shadow-sm text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                            title="Heading 3"
                          >
                            H3
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTag("b")}
                            className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-white rounded-md text-[11px] font-black shadow-sm text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                            title="Bold"
                          >
                            B
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTag("i")}
                            className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-white rounded-md text-[11px] italic font-serif shadow-sm text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                            title="Italic"
                          >
                            I
                          </button>

                          {/* Divider */}
                          <div className="w-px h-5 bg-gray-300 self-center mx-1 dark:bg-gray-700"></div>

                          {/* Code and Embeds */}
                          <button
                            type="button"
                            onClick={() => insertTag("code-inline")}
                            className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-white rounded-md text-[11px] shadow-sm text-gray-700 font-mono dark:text-gray-200 dark:hover:bg-gray-800"
                            title="Inline Code"
                          >
                            &lt;/&gt;
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTag("code-block")}
                            className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-white rounded-md text-[11px] shadow-sm text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                            title="Code Block"
                          >
                            <i className="fas fa-code"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTag("latex-inline")}
                            className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-white rounded-md text-[10px] shadow-sm text-gray-700 font-black dark:text-gray-200 dark:hover:bg-gray-800"
                            title="Inline LaTeX"
                          >
                            fx
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTag("latex-block")}
                            className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-white rounded-md text-[10px] shadow-sm text-gray-700 font-black dark:text-gray-200 dark:hover:bg-gray-800"
                            title="Block LaTeX"
                          >
                            Σ
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTag("iframe")}
                            className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-white rounded-md text-[11px] shadow-sm text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                            title="Embed (iframe)"
                          >
                            <i className="fas fa-window-maximize"></i>
                          </button>

                          {/* Divider */}
                          <div className="w-px h-5 bg-gray-300 self-center mx-1 dark:bg-gray-700"></div>

                          {/* Media and Links */}
                          <button
                            type="button"
                            onClick={() => insertTag("link")}
                            className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-white rounded-md text-[11px] shadow-sm text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                            title="Link"
                          >
                            <i className="fas fa-link"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTag("img")}
                            className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-white rounded-md text-[11px] shadow-sm text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                            title="Image"
                          >
                            <i className="fas fa-image"></i>
                          </button>

                          {/* Divider */}
                          <div className="w-px h-5 bg-gray-300 self-center mx-1 dark:bg-gray-700"></div>

                          {/* Layout Elements */}
                          <button
                            type="button"
                            onClick={() => insertTag("quote")}
                            className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-white rounded-md text-[11px] shadow-sm text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                            title="Quote"
                          >
                            <i className="fas fa-quote-left"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTag("list")}
                            className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-white rounded-md text-[11px] shadow-sm text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                            title="List"
                          >
                            <i className="fas fa-list"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTag("table")}
                            className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-white rounded-md text-[11px] shadow-sm text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                            title="Table"
                          >
                            <i className="fas fa-table"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTag("alert")}
                            className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-white rounded-md text-[11px] shadow-sm text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                            title="Alert Box"
                          >
                            <i className="fas fa-exclamation-triangle"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTag("divider")}
                            className="w-7 h-7 sm:w-8 sm:h-8 hover:bg-white rounded-md text-[11px] shadow-sm text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                            title="Divider"
                          >
                            <i className="fas fa-minus"></i>
                          </button>
                        </div>
                      </div>
                     
                      <CodeMirror
                        ref={editorRef}
                        value={formData.description}
                        height="400px"
                        theme={isDarkMode ? oneDark : "light"}
                        extensions={[html()]}
                        onChange={(value) =>
                          setFormData((p) => ({
                            ...p,
                            description: value,
                          }))
                        }
                        className="border border-gray-100 rounded-[2px] overflow-hidden focus-within:border-[#FFDB14] transition-all dark:bg-gray-900 dark:border-gray-800"
                      />
                    </div>
                  </div>

                  <div className="pt-10 border-t border-gray-50 flex gap-4 dark:border-gray-800">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gray-900 text-white px-10 py-4 rounded-lg font-black text-sm uppercase tracking-widest hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 disabled:opacity-50 shadow-sm dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
                    >
                      {isLoading
                        ? "WORKING..."
                        : editingId
                          ? `UPDATE ${formData.type.toUpperCase()}`
                          : `PUBLISH ${formData.type.toUpperCase()}`}
                      {!isLoading && (
                        <i
                          className={`fas ${editingId ? "fa-check" : "fa-paper-plane"} text-[10px]`}
                        ></i>
                      )}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-8 py-4 rounded-lg border border-gray-200 font-black text-xs uppercase tracking-widest text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        Discard Changes
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Preview Panel */}
              <div className="bg-white shadow-lg border border-gray-100 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                  <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">
                    Live Preview
                  </h2>
                  <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                    How your {formData.type} will look
                  </p>
                </div>
                <div className="p-6 max-h-[600px] overflow-y-auto">
                  {formData.imageUrl && (
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-2xl mb-4"
                    />
                  )}
                  <h3 className="text-xl font-black text-gray-900 mb-2 dark:text-gray-100">
                    {formData.title || `Sample ${formData.type} title`}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3 dark:text-gray-400">
                    {formData.date}
                  </p>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-bold dark:bg-gray-800 dark:text-gray-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div
                    className="prose prose-sm max-w-none text-gray-700 rich-content dark:text-gray-300"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeRichHtml(
                        formData.description ||
                          `Sample ${formData.type} description...`,
                      ),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Content Tab */}
      {activeTab === "manage-content" && (
        <div className="flex-1 p-6 md:p-12">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-gray-900 tracking-tighter dark:text-gray-100">
                Manage Published Content
              </h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg font-bold text-xs shadow-sm hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800">
                  <i className="fas fa-filter mr-2"></i>All ({items.length})
                </button>
              </div>
            </div>

            <div className="grid gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between group hover:shadow-xl transition-all border-l-4 border-l-transparent hover:border-l-[#FFDB14] dark:bg-gray-900 dark:border-gray-800"
                >
                  <div className="flex items-center gap-6 min-w-0 flex-1">
                    <img
                      src={item.imageUrl}
                      className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 shadow-md"
                      alt=""
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-black text-lg text-gray-900 truncate dark:text-gray-100">
                        {item.title}
                      </h4>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 dark:text-gray-500">
                        {item.date} •{" "}
                        <span
                          className={`${item.type === "project" ? "text-blue-500" : "text-green-500"}`}
                        >
                          {item.type}
                        </span>{" "}
                        • {item.views || 0} Views • {item.likes || 0} Likes
                      </p>
                      {item.tags && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] rounded-lg font-bold dark:bg-gray-800 dark:text-gray-300"
                            >
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] rounded-lg font-bold dark:bg-gray-800 dark:text-gray-300">
                              +{item.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(item)}
                      className="w-10 h-10 rounded-lg bg-white border border-blue-200 text-blue-600 flex items-center justify-center hover:bg-blue-50 transition-colors shadow-sm dark:bg-gray-900 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-gray-800"
                      title="Edit"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-10 h-10 rounded-lg bg-white border border-red-200 text-red-600 flex items-center justify-center hover:bg-red-50 transition-colors shadow-sm dark:bg-gray-900 dark:text-red-300 dark:border-red-700 dark:hover:bg-gray-800"
                      title="Delete"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest bg-white rounded-[2.5rem] border border-dashed border-gray-200 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-500">
                  <i className="fas fa-ghost text-4xl mb-4 opacity-20"></i>
                  <p>No content published yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "codespace" && (
        <div className="flex-1 p-3">
          <div className="w-[100%] mx-auto space-y-6">
           

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-0">
              <div className="xl:col-span-1 bg-white shadow-lg border border-gray-100 p-6 space-y-6 dark:bg-gray-900 dark:border-gray-800">
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                    GitHub Access
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Store a GitHub token to create repos and push code.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] dark:text-gray-500">
                    Personal Access Token
                  </label>
                  <input
                    type="password"
                    value={githubTokenInput}
                    onChange={(event) => setGithubTokenInput(event.target.value)}
                    placeholder={
                      portfolioSettings?.githubToken
                        ? "Token saved"
                        : "ghp_..."
                    }
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:border-[#FFDB14] text-sm text-gray-900 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 dark:focus:bg-gray-900"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleSaveGithubToken}
                      disabled={codespaceBusy}
                      className="bg-[#FFDB14] text-gray-900 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-yellow-400 transition-all shadow-sm disabled:opacity-50"
                    >
                      Save Token
                    </button>
                    {portfolioSettings?.githubToken && (
                      <button
                        type="button"
                        onClick={handleClearGithubToken}
                        disabled={codespaceBusy}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-black uppercase tracking-wider text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        Clear Token
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-4 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-gray-900 dark:text-gray-100">
                      Repositories
                    </h4>
                    <button
                      type="button"
                      onClick={handleLoadRepos}
                      disabled={codespaceBusy || !getGithubToken()}
                      className="px-3 py-1 rounded-md border border-gray-200 text-[10px] font-black uppercase tracking-wider text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Load Repos
                    </button>
                  </div>

                  <select
                    value={selectedRepo}
                    onChange={(event) => setSelectedRepo(event.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 text-sm text-gray-900 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100"
                  >
                    <option value="">Select a repo</option>
                    {repoList.map((repo) => (
                      <option key={repo.id} value={repo.full_name}>
                        {repo.full_name} {repo.private ? "(private)" : ""}
                      </option>
                    ))}
                  </select>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] dark:text-gray-500">
                      Create Repository
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={repoNameInput}
                        onChange={(event) => setRepoNameInput(event.target.value)}
                        placeholder="new-repo"
                        className="flex-1 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 text-sm text-gray-900 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100"
                      />
                      <select
                        value={repoVisibility}
                        onChange={(event) =>
                          setRepoVisibility(
                            event.target.value as "public" | "private",
                          )
                        }
                        className="px-2 py-2 rounded-lg bg-gray-50 border border-gray-100 text-xs font-bold text-gray-600 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200"
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleCreateRepo}
                      disabled={codespaceBusy || !getGithubToken()}
                      className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-black transition-all shadow-sm disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
                    >
                      Create Repo
                    </button>
                  </div>
                </div>
              </div>

              <div className="xl:col-span-2 bg-white shadow-lg border border-gray-100 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1.2fr_auto] gap-3 items-end">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2 dark:text-gray-500">
                        File Path
                      </label>
                      <input
                        type="text"
                        value={filePathInput}
                        onChange={(event) => setFilePathInput(event.target.value)}
                        placeholder="README.md"
                        className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 text-sm text-gray-900 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2 dark:text-gray-500">
                        Commit Message
                      </label>
                      <input
                        type="text"
                        value={commitMessage}
                        onChange={(event) => setCommitMessage(event.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 text-sm text-gray-900 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleLoadFile}
                        disabled={codespaceBusy || !getGithubToken() || !selectedRepo}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-black uppercase tracking-wider text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        Load File
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveFile}
                        disabled={codespaceBusy || !getGithubToken() || !selectedRepo}
                        className="bg-[#FFDB14] text-gray-900 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-yellow-400 transition-all shadow-sm disabled:opacity-50"
                      >
                        Save File
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] p-4">
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 space-y-3 dark:bg-gray-900 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">
                          Files
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {repoPath || "/"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => loadRepoEntries("")}
                          disabled={codespaceBusy || !selectedRepo}
                          className="px-2 py-1 rounded-md border border-gray-200 text-[10px] font-black uppercase tracking-wider text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          Root
                        </button>
                        {repoPath && (
                          <button
                            type="button"
                            onClick={() =>
                              loadRepoEntries(
                                repoPath.split("/").slice(0, -1).join("/"),
                              )
                            }
                            disabled={codespaceBusy}
                            className="px-2 py-1 rounded-md border border-gray-200 text-[10px] font-black uppercase tracking-wider text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            Up
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-[420px] overflow-y-auto space-y-1">
                      {repoEntries
                        .slice()
                        .sort((a, b) =>
                          a.type === b.type
                            ? a.name.localeCompare(b.name)
                            : a.type === "dir"
                              ? -1
                              : 1,
                        )
                        .map((entry) => (
                          <button
                            key={entry.path}
                            type="button"
                            onClick={() => {
                              if (entry.type === "dir") {
                                loadRepoEntries(entry.path);
                              } else {
                                loadFileByPath(entry.path, true);
                              }
                            }}
                            className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-white transition-all dark:text-gray-200 dark:hover:bg-gray-800"
                          >
                            <i
                              className={`fas ${
                                entry.type === "dir" ? "fa-folder" : "fa-file"
                              } text-[10px] text-gray-400 dark:text-gray-500`}
                            ></i>
                            <span className="truncate">{entry.name}</span>
                          </button>
                        ))}
                      {repoEntries.length === 0 && (
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {selectedRepo
                            ? "No files yet. Create a file to start."
                            : "Select a repo to browse files."}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <CodeMirror
                      value={codespaceCode}
                      height="520px"
                      extensions={[javascript({ typescript: true })]}
                      theme={isDarkMode ? oneDark : "light"}
                      onChange={(value) => setCodespaceCode(value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "portfolio-config" && (
        <div className="flex-1 p-6 md:p-12">
          <div className="max-w-7xl mx-auto space-y-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tighter dark:text-gray-100">
              Portfolio Config
            </h2>

            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 space-y-4 dark:bg-gray-900 dark:border-gray-800">
              <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                Home Tab Content
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Customize your status, summary, and contact info displayed on your Home tab.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider dark:text-gray-400">
                    Current Status
                  </label>
                  <input
                    value={homeForm.status}
                    onChange={(e) => setHomeForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:border-[#FFDB14] dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100"
                    placeholder="What are you doing now?"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider dark:text-gray-400">
                    Summary / About
                  </label>
                  <textarea
                    value={homeForm.summary}
                    onChange={(e) => setHomeForm(prev => ({ ...prev, summary: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:border-[#FFDB14] dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 min-h-[100px]"
                    placeholder="Brief intro for your home page"
                  />
                </div>
                {[
                  { key: "email", label: "Email Address" },
                  { key: "location", label: "Location" },
                  { key: "education", label: "Education / University" },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider dark:text-gray-400">
                      {field.label}
                    </label>
                    <input
                      value={homeForm[field.key as keyof typeof homeForm]}
                      onChange={(e) => setHomeForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:border-[#FFDB14] dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100"
                      placeholder={`Enter ${field.label}`}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider dark:text-gray-400">
                    Tech Stack (Comma Separated)
                  </label>
                  <input
                    value={homeForm.techStack}
                    onChange={(e) => setHomeForm(prev => ({ ...prev, techStack: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:border-[#FFDB14] dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100"
                    placeholder="e.g. Next.js, React, Python"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider dark:text-gray-400">
                    Featured Project IDs (Comma Separated)
                  </label>
                  <input
                    value={homeForm.featuredProjectIds}
                    onChange={(e) => setHomeForm(prev => ({ ...prev, featuredProjectIds: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:border-[#FFDB14] dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100"
                    placeholder="Project IDs from content management"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={saveHomeSettings}
                className="bg-[#FFDB14] text-gray-900 px-8 py-3 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-yellow-400 transition-all shadow-sm"
              >
                Save Home Content
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 space-y-4 dark:bg-gray-900 dark:border-gray-800">
                <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                  Grind Usernames (Realtime Sync)
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Use platform usernames so the Grind tab auto-syncs in
                  realtime.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key: "codeforces", label: "Codeforces" },
                    { key: "github", label: "GitHub" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider dark:text-gray-400">
                        {field.label}
                      </label>
                      <input
                        value={
                          usernameForm[field.key as keyof typeof usernameForm]
                        }
                        onChange={(e) =>
                          setUsernameForm((prev) => ({
                            ...prev,
                            [field.key]: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:border-[#FFDB14] dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 dark:focus:bg-gray-900"
                        placeholder={`Enter ${field.label} username`}
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={saveUsernames}
                  className="bg-[#FFDB14] text-gray-900 px-5 py-3 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-yellow-400 transition-all shadow-sm"
                >
                  Save Usernames
                </button>
              </div>

              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 space-y-4 dark:bg-gray-900 dark:border-gray-800">
                <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                  Tab Buttons Visibility
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hide or unhide portfolio tab buttons from the dashboard.
                </p>

                <div className="space-y-2">
                  {TAB_ORDER.map((tab) => {
                    const enabled =
                      portfolioSettings?.tabVisibility?.[tab] ?? true;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => toggleTabVisibility(tab)}
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-white flex items-center justify-between dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        <span className="text-sm font-bold capitalize text-gray-900 dark:text-gray-100">
                          {tab}
                        </span>
                        <span
                          className={`text-xs font-black px-3 py-1 rounded-full ${enabled ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200"}`}
                        >
                          {enabled ? "Visible" : "Hidden"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 space-y-4 dark:bg-gray-900 dark:border-gray-800">
              <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                Grind and Skillset Content Editor
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Edit JSON and save. This updates Grind cards/stats and Skillset
                content in realtime.
              </p>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider dark:text-gray-400">
                    Grind Cards JSON
                  </label>
                  <textarea
                    value={grindCardsEditor}
                    onChange={(e) => setGrindCardsEditor(e.target.value)}
                    className="w-full h-56 p-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:border-[#FFDB14] font-mono text-xs dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200 dark:focus:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider dark:text-gray-400">
                    Grind Ratings JSON
                  </label>
                  <textarea
                    value={grindRatingsEditor}
                    onChange={(e) => setGrindRatingsEditor(e.target.value)}
                    className="w-full h-56 p-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:border-[#FFDB14] font-mono text-xs dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200 dark:focus:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider dark:text-gray-400">
                    GitHub Stats JSON
                  </label>
                  <textarea
                    value={grindGithubEditor}
                    onChange={(e) => setGrindGithubEditor(e.target.value)}
                    className="w-full h-56 p-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:border-[#FFDB14] font-mono text-xs dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200 dark:focus:bg-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider dark:text-gray-400">
                    Skillset Groups JSON
                  </label>
                  <textarea
                    value={skillsetEditor}
                    onChange={(e) => setSkillsetEditor(e.target.value)}
                    className="w-full h-56 p-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:border-[#FFDB14] font-mono text-xs dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200 dark:focus:bg-gray-900"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={saveJsonEditors}
                className="bg-gray-900 text-white px-6 py-3 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-black transition-all shadow-sm dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
              >
                Save Grind + Skillset Content
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Upload Tab */}
      {activeTab === "media" && (
        <div className="flex-1 p-6 md:p-12 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter dark:text-gray-100">
                  Media Library
                </h1>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 dark:text-gray-500">
                  Upload and manage images via Cloudinary
                </p>
              </div>

              <div className="relative group">
                <input
                  type="file"
                  id="imageUpload"
                  className="hidden"
                  onChange={handleImageUpload}
                  accept="image/*"
                  disabled={isUploading}
                />
                <label
                  htmlFor="imageUpload"
                  className={`flex items-center gap-3 px-8 py-4 bg-[#FFDB14] text-gray-900 rounded-2xl font-black text-sm hover:bg-yellow-400 transition-all cursor-pointer shadow-lg shadow-yellow-500/20 active:scale-95 ${
                    isUploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <i
                    className={`fas ${
                      isUploading ? "fa-circle-notch fa-spin" : "fa-cloud-upload-alt"
                    } text-lg`}
                  ></i>
                  {isUploading ? "Uploading..." : "Upload New Image"}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {media.map((image) => (
                <div
                  key={image.id}
                  className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all dark:bg-gray-900 dark:border-gray-800"
                >
                  <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        onClick={() => copyToClipboard(image.url)}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-900 hover:bg-[#FFDB14] transition-colors"
                        title="Copy Link"
                      >
                        <i className="fas fa-link"></i>
                      </button>
                      <button
                        onClick={() => window.open(image.url, "_blank")}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-900 hover:bg-[#FFDB14] transition-colors"
                        title="View Fullsize"
                      >
                        <i className="fas fa-external-link-alt"></i>
                      </button>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="font-bold text-sm text-gray-900 truncate dark:text-gray-100">
                      {image.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-gray-400 uppercase dark:text-gray-500">
                        {new Date(image.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDeleteMedia(image)}
                        className="text-red-500 hover:text-red-600 transition-colors p-2"
                        title="Delete Reference"
                      >
                        <i className="fas fa-trash-alt text-xs"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {media.length === 0 && !isUploading && (
                <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 dark:bg-gray-900/40 dark:border-gray-800">
                  <i className="fas fa-images text-4xl text-gray-200 mb-4 block"></i>
                  <p className="text-gray-400 font-bold">No images uploaded yet</p>
                  <p className="text-xs text-gray-400">
                    Your media library is empty. Start by uploading an image.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Logs Tab */}
      {activeTab === "logs" && (
        <div className="flex-1 p-6 md:p-12">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-gray-900 tracking-tighter dark:text-gray-100">
                Portfolio Activity Logs
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total activities: {logs.length}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100 dark:bg-gray-900/60 dark:border-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Action
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Entity
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {logs.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-900/70"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getActionColor(log.action)}`}
                          >
                            <i
                              className={`fas ${
                                log.action === "login"
                                  ? "fa-sign-in-alt"
                                  : log.action === "logout"
                                    ? "fa-sign-out-alt"
                                    : log.action === "create"
                                      ? "fa-plus"
                                      : log.action === "edit"
                                        ? "fa-edit"
                                        : log.action === "delete"
                                          ? "fa-trash"
                                          : "fa-eye"
                              } mr-2`}
                            ></i>
                            {log.action.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-gray-900 capitalize dark:text-gray-100">
                            {log.entity}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700 truncate max-w-xs block dark:text-gray-300">
                            {log.entityTitle || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatTimestamp(log.timestamp)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {logs.length === 0 && (
                  <div className="p-20 text-center text-gray-400 dark:text-gray-500">
                    <i className="fas fa-history text-4xl mb-4 opacity-20"></i>
                    <p className="font-bold">No activity logs yet</p>
                    <p className="text-xs">
                      Actions will appear here as you use the dashboard
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// This is a simplified version with authentication logic
const DashboardPage: React.FC = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", {
      method: "POST",
    });
    router.push("/admin/login");
  };

  return (
    <ThemeProvider>
      <Dashboard onLogout={handleLogout} />
    </ThemeProvider>
  );
};

export default DashboardPage;
