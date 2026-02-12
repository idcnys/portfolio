"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ContentItem } from "../../../lib/types";
import {
  saveContent,
  subscribeToContent,
  deleteContent,
  updateContent,
} from "../../../lib/firebase";
import { ThemeProvider } from "../../../lib/context/ThemeContext";

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const router = useRouter();
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

  useEffect(() => {
    const unsubscribe = subscribeToContent(setItems);
    return () => unsubscribe();
  }, []);

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
      type: "project",
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteContent(id);
        setMessage({ text: "Post deleted.", type: "success" });
      } catch (err) {
        setMessage({ text: "Error deleting post.", type: "error" });
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
    }

    if (replacement) {
      const newValue =
        text.substring(0, start) + replacement + text.substring(end);
      setFormData({ ...formData, description: newValue });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col transition-colors pb-32">
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
          <button
            onClick={() => router.push("/")}
            className="bg-red-500 text-white font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg hover:shadow-red-500/20"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="flex-1 p-4 md:p-12 flex flex-col items-center">
        <div className="w-full max-w-5xl space-y-12">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-8 md:p-14 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
                  {editingId ? "Updating Story" : "New Story"}
                </h1>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">
                  Manage your creative portfolio items
                </p>
              </div>

              {message.text && (
                <div
                  className={`px-6 py-3 rounded-2xl text-xs font-black animate-pulse ${
                    message.type === "success"
                      ? "bg-green-50 text-green-600 border border-green-200"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}
                >
                  <i className="fas fa-info-circle mr-2"></i> {message.text}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-8 md:p-14 space-y-10">
              <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit border border-gray-200">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((p) => ({ ...p, type: "project" }))
                  }
                  className={`px-10 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                    formData.type === "project"
                      ? "bg-white text-gray-900 shadow-md"
                      : "text-gray-400"
                  }`}
                >
                  PROJECT
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((p) => ({ ...p, type: "activity" }))
                  }
                  className={`px-10 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                    formData.type === "activity"
                      ? "bg-white text-gray-900 shadow-md"
                      : "text-gray-400"
                  }`}
                >
                  ACTIVITY
                </button>
              </div>

              <div className="space-y-8">
                <input
                  type="text"
                  placeholder="Enter a compelling title..."
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
                        setFormData((p) => ({ ...p, imageUrl: e.target.value }))
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

                      // Update tags array in real-time
                      const tagsArray = value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter((tag) => tag.length > 0);

                      setFormData((p) => ({
                        ...p,
                        tags: tagsArray,
                      }));
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
                      Story Content
                    </label>
                    <div className="flex gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100">
                      <button
                        type="button"
                        onClick={() => insertTag("h2")}
                        className="w-9 h-9 hover:bg-white rounded-lg text-xs font-black shadow-sm text-gray-700"
                        title="Subheading"
                      >
                        H
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
                    </div>
                  </div>
                  <small className="text-gray-500">
                    style="width:100%; aspect-ratio:16/9; height:auto;" fr
                    iframes
                  </small>
                  <textarea
                    ref={textareaRef}
                    placeholder="Tell your story..."
                    className="w-full h-[500px] px-8 py-8 bg-gray-50 border border-gray-100 rounded-[2rem] outline-none focus:bg-white focus:border-[#FFDB14] transition-all resize-none text-xl leading-relaxed text-gray-700 font-medium font-serif"
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
                      ? "UPDATE STORY"
                      : "PUBLISH STORY"}
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

          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 px-4 tracking-tighter">
              Manage Published Content
            </h2>
            <div className="grid gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between group hover:shadow-xl transition-all border-l-4 border-l-transparent hover:border-l-[#FFDB14]"
                >
                  <div className="flex items-center gap-6 min-w-0">
                    <img
                      src={item.imageUrl}
                      className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 shadow-md"
                      alt=""
                    />
                    <div className="min-w-0">
                      <h4 className="font-black text-lg text-gray-900 truncate">
                        {item.title}
                      </h4>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                        {item.date} •{" "}
                        <span className="text-[#FFDB14]">{item.type}</span> •{" "}
                        {item.views || 0} Views
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(item)}
                      className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                      title="Edit"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
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
                  <p>No stories published yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
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
