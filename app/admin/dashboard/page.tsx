"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ContentItem,
  Note,
  ActivityLog,
  DashboardTab,
  PortfolioSettings,
  TabType,
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
} from "../../../lib/firebase";
import { ThemeProvider } from "../../../lib/context/ThemeContext";

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
  const router = useRouter();
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);

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

  const [portfolioSettings, setPortfolioSettings] =
    useState<PortfolioSettings | null>(null);
  const [usernameForm, setUsernameForm] = useState({
    codeforces: "",
    cses: "",
    leetcode: "",
    tryhackme: "",
    github: "",
  });
  const [grindCardsEditor, setGrindCardsEditor] = useState("[]");
  const [grindRatingsEditor, setGrindRatingsEditor] = useState("[]");
  const [grindGithubEditor, setGrindGithubEditor] = useState("[]");
  const [skillsetEditor, setSkillsetEditor] = useState("[]");

  useEffect(() => {
    const unsubscribeContent = subscribeToContent(setItems);
    const unsubscribeNotes = subscribeToNotes(setNotes);
    const unsubscribeLogs = subscribeToLogs(setLogs);
    const unsubscribeSettings = subscribeToPortfolioSettings((settings) => {
      setPortfolioSettings(settings);
      setUsernameForm(settings.grindUsernames);
      setGrindCardsEditor(JSON.stringify(settings.grindCards, null, 2));
      setGrindRatingsEditor(JSON.stringify(settings.grindRatings, null, 2));
      setGrindGithubEditor(JSON.stringify(settings.grindGithubStats, null, 2));
      setSkillsetEditor(JSON.stringify(settings.skillsetGroups, null, 2));
    });

    // Log dashboard view
    logActivity("view", "auth", "dashboard", "Admin Dashboard");

    return () => {
      unsubscribeContent();
      unsubscribeNotes();
      unsubscribeLogs();
      unsubscribeSettings();
    };
  }, []);

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
    if (!formData.imageUrl) {
      formData.imageUrl = `https://picsum.photos/seed/${Date.now()}/800/600`;
    }

    setIsLoading(true);
    try {
      if (editingId) {
        await updateContent(editingId, formData);
        setMessage({ text: "Post updated!", type: "success" });
      } else {
        await saveContent(formData);
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

    try {
      if (selectedNote) {
        await updateNote(selectedNote.id, noteForm);
        setMessage({ text: "Note updated!", type: "success" });
      } else {
        await saveNote(noteForm);
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
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let replacement = "";
    if (tag === "img") {
      const url = prompt("Enter Image URL:");
      if (url)
        replacement = `<img src="${url}" class="my-10 rounded-3xl w-full shadow-lg border border-gray-100 dark:border-gray-800" />`;
    } else if (tag === "b") {
      replacement = `<b>${selectedText || "bold text"}</b>`;
    } else if (tag === "i") {
      replacement = `<i>${selectedText || "italic text"}</i>`;
    } else if (tag === "link") {
      const url = prompt("Enter Link URL:");
      if (url)
        replacement = `<a href="${url}" class="text-blue-500 font-bold underline" target="_blank">${selectedText || "Link Text"}</a>`;
    } else if (tag === "h2") {
      replacement = `<h2 class="text-3xl font-black mt-12 mb-6 text-gray-900 dark:text-white">${selectedText || "Subheading"}</h2>`;
    } else if (tag === "h3") {
      replacement = `<h3 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">${selectedText || "Heading 3"}</h3>`;
    } else if (tag === "code-inline") {
      replacement = `<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-red-600 dark:text-red-400">${selectedText || "code"}</code>`;
    } else if (tag === "code-block") {
      const language = prompt(
        "Enter programming language (e.g., javascript, python, html):",
      );
      replacement = `<pre class="bg-gray-900 text-gray-100 p-6 rounded-2xl overflow-x-auto my-8 shadow-lg"><code class="language-${language || "text"}">${selectedText || "// Your code here\nconsole.log('Hello World!');"}</code></pre>`;
    } else if (tag === "iframe") {
      const url = prompt("Enter iframe URL (YouTube, CodePen, etc.):");
      if (url) {
        const width = prompt("Enter width (or press Enter for responsive):");
        const height =
          prompt("Enter height (or press Enter for 400px):") || "400";
        if (width) {
          replacement = `<iframe src="${url}" width="${width}" height="${height}" frameborder="0" allowfullscreen class="my-8 rounded-2xl shadow-lg"></iframe>`;
        } else {
          replacement = `<div class="relative w-full my-8"><iframe src="${url}" class="w-full rounded-2xl shadow-lg" style="height: ${height}px;" frameborder="0" allowfullscreen></iframe></div>`;
        }
      }
    } else if (tag === "quote") {
      replacement = `<blockquote class="border-l-4 border-blue-500 pl-6 py-4 my-8 bg-blue-50 dark:bg-blue-900/20 italic text-gray-700 dark:text-gray-300">${selectedText || "Insert your quote here"}</blockquote>`;
    } else if (tag === "list") {
      replacement = `<ul class="list-disc pl-6 my-6 space-y-2">\n  <li>${selectedText || "List item 1"}</li>\n  <li>List item 2</li>\n  <li>List item 3</li>\n</ul>`;
    } else if (tag === "table") {
      replacement = `<div class="overflow-x-auto my-8">
  <table class="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
    <thead class="bg-gray-50 dark:bg-gray-700">
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
      replacement = `<hr class="my-12 border-t-2 border-gray-200 dark:border-gray-700" />`;
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
      replacement = `<div class="p-4 my-6 border rounded-lg ${colors[type as keyof typeof colors] || colors.info}">${selectedText || "Alert message here"}</div>`;
    }

    if (replacement) {
      const newValue =
        text.substring(0, start) + replacement + text.substring(end);
      setFormData({ ...formData, description: newValue });

      // Update cursor position after insertion
      setTimeout(() => {
        if (textarea) {
          const newCursorPos = start + replacement.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
          textarea.focus();
        }
      }, 0);
    }
  };

  const insertNoteTag = (tag: string) => {
    const textarea = noteTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let replacement = "";
    if (tag === "img") {
      const url = prompt("Enter Image URL:");
      if (url)
        replacement = `<img src="${url}" class="my-8 rounded-2xl w-full shadow-lg border border-gray-100 dark:border-gray-800" />`;
    } else if (tag === "b") {
      replacement = `<b>${selectedText || "bold text"}</b>`;
    } else if (tag === "i") {
      replacement = `<i>${selectedText || "italic text"}</i>`;
    } else if (tag === "link") {
      const url = prompt("Enter Link URL:");
      if (url)
        replacement = `<a href="${url}" class="text-blue-500 font-bold underline" target="_blank">${selectedText || "Link Text"}</a>`;
    } else if (tag === "h2") {
      replacement = `<h2 class="text-2xl font-black mt-8 mb-4 text-gray-900 dark:text-white">${selectedText || "Heading 2"}</h2>`;
    } else if (tag === "h3") {
      replacement = `<h3 class="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">${selectedText || "Heading 3"}</h3>`;
    } else if (tag === "code-inline") {
      replacement = `<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-red-600 dark:text-red-400">${selectedText || "code"}</code>`;
    } else if (tag === "code-block") {
      const language = prompt(
        "Enter programming language (e.g., javascript, python, html):",
      );
      replacement = `<pre class="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto my-6 shadow-lg"><code class="language-${language || "text"}">${selectedText || "// Your code here\nconsole.log('Hello World!');"}</code></pre>`;
    } else if (tag === "iframe") {
      const url = prompt("Enter iframe URL (YouTube, CodePen, etc.):");
      if (url) {
        const height =
          prompt("Enter height (or press Enter for 300px):") || "300";
        replacement = `<div class="relative w-full my-6"><iframe src="${url}" class="w-full rounded-xl shadow-lg" style="height: ${height}px;" frameborder="0" allowfullscreen></iframe></div>`;
      }
    } else if (tag === "list") {
      replacement = `<ul class="list-disc pl-6 my-4 space-y-1">\n  <li>${selectedText || "List item 1"}</li>\n  <li>List item 2</li>\n  <li>List item 3</li>\n</ul>`;
    }

    if (replacement) {
      const newValue =
        text.substring(0, start) + replacement + text.substring(end);
      setNoteForm((prev) => ({ ...prev, content: newValue }));

      // Update cursor position after insertion
      setTimeout(() => {
        if (textarea) {
          const newCursorPos = start + replacement.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
          textarea.focus();
        }
      }, 0);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "login":
        return "text-green-600 bg-green-50";
      case "logout":
        return "text-orange-600 bg-orange-50";
      case "create":
        return "text-blue-600 bg-blue-50";
      case "edit":
        return "text-yellow-600 bg-yellow-50";
      case "delete":
        return "text-red-600 bg-red-50";
      case "view":
        return "text-purple-600 bg-purple-50";
      default:
        return "text-gray-600 bg-gray-50";
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
      setMessage({ text: "At least one tab must stay visible.", type: "error" });
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
      setMessage({ text: "Grind and skillset content saved.", type: "success" });
    } catch {
      setMessage({ text: "Invalid JSON. Please fix the format.", type: "error" });
    }
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col transition-colors">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 md:px-12 py-5 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#FFDB14] rounded-xl flex items-center justify-center font-black text-lg text-gray-900 shadow-md ring-4 ring-yellow-400/20">
            B
          </div>
          <span className="text-2xl font-black text-gray-900 hidden sm:inline tracking-tight">
            Studio Admin
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 transition-all"
          >
            Site Preview
          </Link>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 md:px-12">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-[#FFDB14] text-gray-900 bg-yellow-50"
                  : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
              } ${tab.id === "logout" ? "ml-auto text-red-500 hover:text-red-600" : ""}`}
            >
              <i className={tab.icon}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {message.text && (
        <div
          className={`mx-6 md:mx-12 mt-4 px-6 py-3 rounded-2xl text-xs font-black ${
            message.type === "success"
              ? "bg-green-50 text-green-600 border border-green-200"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}
        >
          <i className="fas fa-info-circle mr-2"></i> {message.text}
        </div>
      )}

      {/* Personal Notepad Tab */}
      {activeTab === "notepad" && (
        <div className="flex-1 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
              {/* Notes List */}
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-xl font-black text-gray-900">
                    All Notes
                  </h2>
                  <button
                    onClick={handleNewNote}
                    className="bg-[#FFDB14] text-gray-900 px-4 py-2 rounded-xl font-bold text-xs hover:bg-yellow-400 transition-all"
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
                          ? "bg-yellow-50 border-[#FFDB14]"
                          : "bg-gray-50 border-gray-200 hover:bg-white"
                      }`}
                    >
                      <h3 className="font-black text-gray-900 mb-2 truncate">
                        {note.title}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">
                        {formatTimestamp(note.updatedAt)}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {note.content.substring(0, 100)}...
                      </p>
                    </div>
                  ))}
                  {notes.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <i className="fas fa-sticky-note text-3xl mb-4 opacity-50"></i>
                      <p className="font-bold">No notes yet</p>
                      <p className="text-xs">Click "New Note" to start</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Note Editor */}
              <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-xl font-black text-gray-900">
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
                          className="bg-blue-500 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-blue-600 transition-all shadow-lg"
                        >
                          <i className="fas fa-edit mr-2"></i>Edit
                        </button>
                        <button
                          onClick={() => handleDeleteNote(selectedNote)}
                          className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-red-600 transition-all shadow-lg"
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
                          className="bg-[#FFDB14] text-gray-900 px-4 py-2 rounded-xl font-bold text-xs hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
                          className="bg-gray-700 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-gray-800 transition-all shadow-lg"
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
                        className="w-full text-2xl font-black border-none outline-none mb-6 text-gray-900 placeholder:text-gray-300"
                      />

                      {/* Enhanced Content Editor for Notes */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-4">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                            Note Content
                          </label>
                          <div className="flex flex-wrap gap-1 p-1 bg-gray-50 rounded-xl border border-gray-100">
                            {/* Text Formatting */}
                            <button
                              type="button"
                              onClick={() => insertNoteTag("h2")}
                              className="w-8 h-8 hover:bg-white rounded-lg text-xs font-black shadow-sm text-gray-700"
                              title="Heading 2"
                            >
                              H2
                            </button>
                            <button
                              type="button"
                              onClick={() => insertNoteTag("h3")}
                              className="w-8 h-8 hover:bg-white rounded-lg text-xs font-black shadow-sm text-gray-700"
                              title="Heading 3"
                            >
                              H3
                            </button>
                            <button
                              type="button"
                              onClick={() => insertNoteTag("b")}
                              className="w-8 h-8 hover:bg-white rounded-lg text-xs font-black shadow-sm text-gray-700"
                              title="Bold"
                            >
                              B
                            </button>
                            <button
                              type="button"
                              onClick={() => insertNoteTag("i")}
                              className="w-8 h-8 hover:bg-white rounded-lg text-xs italic font-serif shadow-sm text-gray-700"
                              title="Italic"
                            >
                              I
                            </button>

                            {/* Code and Embeds */}
                            <button
                              type="button"
                              onClick={() => insertNoteTag("code-inline")}
                              className="w-8 h-8 hover:bg-white rounded-lg text-xs shadow-sm text-gray-700 font-mono"
                              title="Inline Code"
                            >
                              &lt;/&gt;
                            </button>
                            <button
                              type="button"
                              onClick={() => insertNoteTag("code-block")}
                              className="w-8 h-8 hover:bg-white rounded-lg text-xs shadow-sm text-gray-700"
                              title="Code Block"
                            >
                              <i className="fas fa-code"></i>
                            </button>
                            <button
                              type="button"
                              onClick={() => insertNoteTag("iframe")}
                              className="w-8 h-8 hover:bg-white rounded-lg text-xs shadow-sm text-gray-700"
                              title="Embed (iframe)"
                            >
                              <i className="fas fa-window-maximize"></i>
                            </button>

                            {/* Media and Links */}
                            <button
                              type="button"
                              onClick={() => insertNoteTag("link")}
                              className="w-8 h-8 hover:bg-white rounded-lg text-xs shadow-sm text-gray-700"
                              title="Link"
                            >
                              <i className="fas fa-link"></i>
                            </button>
                            <button
                              type="button"
                              onClick={() => insertNoteTag("img")}
                              className="w-8 h-8 hover:bg-white rounded-lg text-xs shadow-sm text-gray-700"
                              title="Image"
                            >
                              <i className="fas fa-image"></i>
                            </button>

                            {/* Layout Elements */}
                            <button
                              type="button"
                              onClick={() => insertNoteTag("list")}
                              className="w-8 h-8 hover:bg-white rounded-lg text-xs shadow-sm text-gray-700"
                              title="List"
                            >
                              <i className="fas fa-list"></i>
                            </button>
                          </div>
                        </div>
                      </div>

                      <textarea
                        ref={noteTextareaRef}
                        placeholder="Start writing your note..."
                        value={noteForm.content}
                        onChange={(e) =>
                          setNoteForm((prev) => ({
                            ...prev,
                            content: e.target.value,
                          }))
                        }
                        className="w-full h-[calc(100%-180px)] border border-gray-200 rounded-2xl p-4 outline-none resize-none text-gray-700 text-lg leading-relaxed focus:border-[#FFDB14] transition-all"
                      />
                    </>
                  ) : selectedNote ? (
                    <>
                      <h1 className="text-2xl font-black text-gray-900 mb-6">
                        {selectedNote.title}
                      </h1>
                      <div className="prose prose-lg max-w-none">
                        <div
                          className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: selectedNote.content,
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
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
        <div className="flex-1 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Content Form */}
              <div className="xl:col-span-2 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-8 md:p-14 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter capitalize">
                      {editingId
                        ? `Updating ${formData.type}`
                        : `New ${formData.type}`}
                    </h1>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">
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
                      className="w-full text-4xl md:text-6xl font-black border-none outline-none focus:ring-0 bg-transparent text-gray-900 placeholder:text-gray-100 tracking-tight"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, title: e.target.value }))
                      }
                      required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3">
                          Published Date (Display)
                        </label>
                        <input
                          type="text"
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-[#FFDB14] transition-all font-black text-gray-900"
                          value={formData.date}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, date: e.target.value }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3">
                          Cover Image URL
                        </label>
                        <input
                          type="text"
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-[#FFDB14] transition-all font-black text-gray-900"
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
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3">
                        Technology Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="React, TypeScript, Node.js, MongoDB, etc."
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-[#FFDB14] transition-all font-black text-gray-900"
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
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3">
                        Project Links
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 focus-within:border-[#FFDB14]">
                          <i className="fab fa-github text-gray-400"></i>
                          <input
                            type="text"
                            placeholder="GitHub URL"
                            className="flex-1 bg-transparent outline-none text-sm text-gray-900"
                            value={formData.links.github}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                links: { ...p.links, github: e.target.value },
                              }))
                            }
                          />
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 focus-within:border-[#FFDB14]">
                          <i className="fas fa-globe text-gray-400"></i>
                          <input
                            type="text"
                            placeholder="Website URL"
                            className="flex-1 bg-transparent outline-none text-sm text-gray-900"
                            value={formData.links.website}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                links: { ...p.links, website: e.target.value },
                              }))
                            }
                          />
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 focus-within:border-[#FFDB14]">
                          <i className="fab fa-twitter text-gray-400"></i>
                          <input
                            type="text"
                            placeholder="Twitter URL"
                            className="flex-1 bg-transparent outline-none text-sm text-gray-900"
                            value={formData.links.twitter}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                links: { ...p.links, twitter: e.target.value },
                              }))
                            }
                          />
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 focus-within:border-[#FFDB14]">
                          <i className="fab fa-youtube text-gray-400"></i>
                          <input
                            type="text"
                            placeholder="YouTube URL"
                            className="flex-1 bg-transparent outline-none text-sm text-gray-900"
                            value={formData.links.youtube}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                links: { ...p.links, youtube: e.target.value },
                              }))
                            }
                          />
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 focus-within:border-[#FFDB14]">
                          <i className="fab fa-linkedin text-gray-400"></i>
                          <input
                            type="text"
                            placeholder="LinkedIn URL"
                            className="flex-1 bg-transparent outline-none text-sm text-gray-900"
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
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                          Content Description
                        </label>
                        <div className="flex flex-wrap gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100 max-w-2xl">
                          {/* Text Formatting */}
                          <button
                            type="button"
                            onClick={() => insertTag("h2")}
                            className="w-9 h-9 hover:bg-white rounded-lg text-xs font-black shadow-sm text-gray-700"
                            title="Heading 2"
                          >
                            H2
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTag("h3")}
                            className="w-9 h-9 hover:bg-white rounded-lg text-xs font-black shadow-sm text-gray-700"
                            title="Heading 3"
                          >
                            H3
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTag("b")}
                            className="w-9 h-9 hover:bg-white rounded-lg text-xs font-black shadow-sm text-gray-700"
                            title="Bold"
                          >
                            B
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTag("i")}
                            className="w-9 h-9 hover:bg-white rounded-lg text-xs italic font-serif shadow-sm text-gray-700"
                            title="Italic"
                          >
                            I
                          </button>

                          {/* Divider */}
                          <div className="w-px h-6 bg-gray-300 self-center mx-1"></div>

                          {/* Code and Embeds */}
                          <button
                            type="button"
                            onClick={() => insertTag("code-inline")}
                            className="w-9 h-9 hover:bg-white rounded-lg text-xs shadow-sm text-gray-700 font-mono"
                            title="Inline Code"
                          >
                            &lt;/&gt;
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTag("code-block")}
                            className="w-9 h-9 hover:bg-white rounded-lg text-xs shadow-sm text-gray-700"
                            title="Code Block"
                          >
                            <i className="fas fa-code"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTag("iframe")}
                            className="w-9 h-9 hover:bg-white rounded-lg text-xs shadow-sm text-gray-700"
                            title="Embed (iframe)"
                          >
                            <i className="fas fa-window-maximize"></i>
                          </button>

                          {/* Divider */}
                          <div className="w-px h-6 bg-gray-300 self-center mx-1"></div>

                          {/* Media and Links */}
                          <button
                            type="button"
                            onClick={() => insertTag("link")}
                            className="w-9 h-9 hover:bg-white rounded-lg text-xs shadow-sm text-gray-700"
                            title="Link"
                          >
                            <i className="fas fa-link"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTag("img")}
                            className="w-9 h-9 hover:bg-white rounded-lg text-xs shadow-sm text-gray-700"
                            title="Image"
                          >
                            <i className="fas fa-image"></i>
                          </button>

                          {/* Divider */}
                          <div className="w-px h-6 bg-gray-300 self-center mx-1"></div>

                          {/* Layout Elements */}
                          <button
                            type="button"
                            onClick={() => insertTag("quote")}
                            className="w-9 h-9 hover:bg-white rounded-lg text-xs shadow-sm text-gray-700"
                            title="Quote"
                          >
                            <i className="fas fa-quote-left"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTag("list")}
                            className="w-9 h-9 hover:bg-white rounded-lg text-xs shadow-sm text-gray-700"
                            title="List"
                          >
                            <i className="fas fa-list"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTag("table")}
                            className="w-9 h-9 hover:bg-white rounded-lg text-xs shadow-sm text-gray-700"
                            title="Table"
                          >
                            <i className="fas fa-table"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTag("alert")}
                            className="w-9 h-9 hover:bg-white rounded-lg text-xs shadow-sm text-gray-700"
                            title="Alert Box"
                          >
                            <i className="fas fa-exclamation-triangle"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTag("divider")}
                            className="w-9 h-9 hover:bg-white rounded-lg text-xs shadow-sm text-gray-700"
                            title="Divider"
                          >
                            <i className="fas fa-minus"></i>
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mb-4 px-2">
                        <p>
                          <strong>💡 Pro Tips:</strong>
                        </p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Select text before applying formatting</li>
                          <li>
                            Use code blocks for syntax-highlighted code snippets
                          </li>
                          <li>
                            Embed YouTube videos, CodePen demos, or any iframe
                            content
                          </li>
                          <li>
                            All HTML tags are supported - feel free to add
                            custom styling
                          </li>
                        </ul>
                      </div>
                      <textarea
                        ref={textareaRef}
                        placeholder={`Tell your ${formData.type} story...`}
                        className="w-full h-[400px] px-8 py-8 bg-gray-50 border border-gray-100 rounded-[2rem] outline-none focus:bg-white focus:border-[#FFDB14] transition-all resize-none text-xl leading-relaxed text-gray-700 font-medium font-serif"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-10 border-t border-gray-50 flex gap-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gray-900 text-white px-14 py-6 rounded-full font-black text-sm uppercase tracking-widest hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 disabled:opacity-50 shadow-2xl"
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
                        className="px-10 py-6 rounded-full font-black text-xs uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all underline underline-offset-8"
                      >
                        Discard Changes
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Preview Panel */}
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-black text-gray-900">
                    Live Preview
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
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
                  <h3 className="text-xl font-black text-gray-900 mb-2">
                    {formData.title || `Sample ${formData.type} title`}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">{formData.date}</p>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-bold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html:
                        formData.description ||
                        `Sample ${formData.type} description...`,
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
              <h2 className="text-2xl font-black text-gray-900 tracking-tighter">
                Manage Published Content
              </h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gray-700 text-white rounded-xl font-bold text-xs shadow-lg">
                  <i className="fas fa-filter mr-2"></i>All ({items.length})
                </button>
              </div>
            </div>

            <div className="grid gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between group hover:shadow-xl transition-all border-l-4 border-l-transparent hover:border-l-[#FFDB14]"
                >
                  <div className="flex items-center gap-6 min-w-0 flex-1">
                    <img
                      src={item.imageUrl}
                      className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 shadow-md"
                      alt=""
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-black text-lg text-gray-900 truncate">
                        {item.title}
                      </h4>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
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
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] rounded-lg font-bold"
                            >
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] rounded-lg font-bold">
                              +{item.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(item)}
                      className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                      title="Edit"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                      title="Delete"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                  <i className="fas fa-ghost text-4xl mb-4 opacity-20"></i>
                  <p>No content published yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "portfolio-config" && (
        <div className="flex-1 p-6 md:p-12">
          <div className="max-w-7xl mx-auto space-y-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tighter">
              Portfolio Config
            </h2>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 space-y-4">
                <h3 className="text-lg font-black text-gray-900">
                  Grind Usernames (Realtime Sync)
                </h3>
                <p className="text-sm text-gray-500">
                  Use platform usernames so the Grind tab auto-syncs in realtime.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key: "codeforces", label: "Codeforces" },
                    { key: "cses", label: "CSES" },
                    { key: "leetcode", label: "LeetCode" },
                    { key: "tryhackme", label: "TryHackMe" },
                    { key: "github", label: "GitHub" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                        {field.label}
                      </label>
                      <input
                        value={usernameForm[field.key as keyof typeof usernameForm]}
                        onChange={(e) =>
                          setUsernameForm((prev) => ({
                            ...prev,
                            [field.key]: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:border-[#FFDB14]"
                        placeholder={`Enter ${field.label} username`}
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={saveUsernames}
                  className="bg-[#FFDB14] text-gray-900 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-yellow-400 transition-all shadow-lg"
                >
                  Save Usernames
                </button>
              </div>

              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 space-y-4">
                <h3 className="text-lg font-black text-gray-900">
                  Tab Buttons Visibility
                </h3>
                <p className="text-sm text-gray-500">
                  Hide or unhide portfolio tab buttons from the dashboard.
                </p>

                <div className="space-y-2">
                  {TAB_ORDER.map((tab) => {
                    const enabled = portfolioSettings?.tabVisibility?.[tab] ?? true;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => toggleTabVisibility(tab)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white flex items-center justify-between"
                      >
                        <span className="text-sm font-bold capitalize text-gray-900">
                          {tab}
                        </span>
                        <span
                          className={`text-xs font-black px-3 py-1 rounded-full ${enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {enabled ? "Visible" : "Hidden"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 space-y-4">
              <h3 className="text-lg font-black text-gray-900">
                Grind and Skillset Content Editor
              </h3>
              <p className="text-sm text-gray-500">
                Edit JSON and save. This updates Grind cards/stats and Skillset content in realtime.
              </p>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    Grind Cards JSON
                  </label>
                  <textarea
                    value={grindCardsEditor}
                    onChange={(e) => setGrindCardsEditor(e.target.value)}
                    className="w-full h-56 p-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:border-[#FFDB14] font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    Grind Ratings JSON
                  </label>
                  <textarea
                    value={grindRatingsEditor}
                    onChange={(e) => setGrindRatingsEditor(e.target.value)}
                    className="w-full h-56 p-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:border-[#FFDB14] font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    GitHub Stats JSON
                  </label>
                  <textarea
                    value={grindGithubEditor}
                    onChange={(e) => setGrindGithubEditor(e.target.value)}
                    className="w-full h-56 p-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:border-[#FFDB14] font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    Skillset Groups JSON
                  </label>
                  <textarea
                    value={skillsetEditor}
                    onChange={(e) => setSkillsetEditor(e.target.value)}
                    className="w-full h-56 p-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:border-[#FFDB14] font-mono text-xs"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={saveJsonEditors}
                className="bg-gray-900 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-black transition-all shadow-lg"
              >
                Save Grind + Skillset Content
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Logs Tab */}
      {activeTab === "logs" && (
        <div className="flex-1 p-6 md:p-12">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-gray-900 tracking-tighter">
                Portfolio Activity Logs
              </h2>
              <div className="text-sm text-gray-500">
                Total activities: {logs.length}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                        Entity
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {logs.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-gray-50 transition-colors"
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
                          <span className="text-sm font-bold text-gray-900 capitalize">
                            {log.entity}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700 truncate max-w-xs block">
                            {log.entityTitle || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500">
                            {formatTimestamp(log.timestamp)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {logs.length === 0 && (
                  <div className="p-20 text-center text-gray-400">
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated (you may want to implement proper auth)
    const auth = localStorage.getItem("isAuthenticated");
    if (auth === "true") {
      setIsAuthenticated(true);
    } else {
      router.push("/admin/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    router.push("/");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400">Checking authentication...</div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Dashboard onLogout={handleLogout} />
    </ThemeProvider>
  );
};

export default DashboardPage;
