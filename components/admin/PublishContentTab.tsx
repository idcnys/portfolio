"use client";

import React, { useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { oneDark } from "@codemirror/theme-one-dark";
import { sanitizeRichHtml } from "../../lib/sanitize";
import { useTheme } from "../../lib/context/ThemeContext";
import { insertTagIntoEditor } from "../../lib/utils/richtag-helpers";
import { GithubIcon, TwitterIcon, YoutubeIcon, LinkedinIcon } from "../client/icons/SocialIcons";
import RichTextToolbar from "./RichTextToolbar";
import {
  Check,
  Send,
  Globe,
} from "lucide-react";



interface FormData {
  title: string;
  slug: string;
  date: string;
  description: string;
  imageUrl: string;
  type: "project" | "activity";
  tags: string[];
  links: {
    github: string;
    website: string;
    twitter: string;
    youtube: string;
    linkedin: string;
  };
}

interface PublishContentTabProps {
  formData: FormData;
  tagsInput: string;
  editingId: string | null;
  isLoading: boolean;
  onUpdateFormData: (updates: Partial<FormData>) => void;
  onUpdateLinks: (key: string, value: string) => void;
  onTagsInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onResetForm: () => void;
}

const PublishContentTab: React.FC<PublishContentTabProps> = ({
  formData,
  tagsInput,
  editingId,
  isLoading,
  onUpdateFormData,
  onUpdateLinks,
  onTagsInputChange,
  onSubmit,
  onResetForm,
}) => {
  const editorRef = useRef<any>(null);
  const { isDarkMode } = useTheme();

  const insertTag = (tag: string) => {
    insertTagIntoEditor(editorRef.current?.view, tag, "publish");
  };

  return (
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
                <p className="text-gray-400 font-bold tracking-wide text-[10px] tracking-[0.3em] mt-2 dark:text-gray-500">
                  Create and manage your {formData.type} posts
                </p>
              </div>
            </div>

            <form
              onSubmit={onSubmit}
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
                    onUpdateFormData({
                      title,
                      slug: editingId
                        ? formData.slug
                        : title
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/(^-|-$)/g, ""),
                    });
                  }}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 tracking-wide text-[10px] tracking-[0.3em] mb-3 dark:text-gray-500">
                      URL Slug (Lowercase, no spaces)
                    </label>
                    <input
                      type="text"
                      placeholder="my-awesome-project"
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-[#FFDB14] transition-all font-black text-gray-900 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 dark:focus:bg-gray-900"
                      value={formData.slug}
                      onChange={(e) =>
                        onUpdateFormData({
                          slug: e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]+/g, ""),
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 tracking-wide text-[10px] tracking-[0.3em] mb-3 dark:text-gray-500">
                      Published Date (Display)
                    </label>
                    <input
                      type="text"
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-[#FFDB14] transition-all font-black text-gray-900 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 dark:focus:bg-gray-900"
                      value={formData.date}
                      onChange={(e) =>
                        onUpdateFormData({ date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 tracking-wide text-[10px] tracking-[0.3em] mb-3 dark:text-gray-500">
                      Cover Image URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-[#FFDB14] transition-all font-black text-gray-900 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 dark:focus:bg-gray-900"
                      value={formData.imageUrl}
                      onChange={(e) =>
                        onUpdateFormData({ imageUrl: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 tracking-wide text-[10px] tracking-[0.3em] mb-3 dark:text-gray-500">
                    Technology Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="React, TypeScript, Node.js, MongoDB, etc."
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-[#FFDB14] transition-all font-black text-gray-900 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 dark:focus:bg-gray-900"
                    value={tagsInput}
                    onChange={(e) => onTagsInputChange(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 tracking-wide text-[10px] tracking-[0.3em] mb-3 dark:text-gray-500">
                    Project Links
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 focus-within:border-[#FFDB14] dark:bg-gray-900 dark:border-gray-800">
                      <GithubIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        placeholder="GitHub URL"
                        className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100"
                        value={formData.links.github}
                        onChange={(e) => onUpdateLinks("github", e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 focus-within:border-[#FFDB14] dark:bg-gray-900 dark:border-gray-800">
                      <Globe className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        placeholder="Website URL"
                        className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100"
                        value={formData.links.website}
                        onChange={(e) => onUpdateLinks("website", e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 focus-within:border-[#FFDB14] dark:bg-gray-900 dark:border-gray-800">
                      <TwitterIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        placeholder="Twitter URL"
                        className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100"
                        value={formData.links.twitter}
                        onChange={(e) => onUpdateLinks("twitter", e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 focus-within:border-[#FFDB14] dark:bg-gray-900 dark:border-gray-800">
                      <YoutubeIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        placeholder="YouTube URL"
                        className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100"
                        value={formData.links.youtube}
                        onChange={(e) => onUpdateLinks("youtube", e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 focus-within:border-[#FFDB14] dark:bg-gray-900 dark:border-gray-800">
                      <LinkedinIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        placeholder="LinkedIn URL"
                        className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100"
                        value={formData.links.linkedin}
                        onChange={(e) => onUpdateLinks("linkedin", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4 px-2">
                    <label className="block text-[10px] font-black text-gray-400 tracking-wide text-[10px] tracking-[0.3em] dark:text-gray-500">
                      Description / Content
                    </label>
                    <RichTextToolbar onInsert={insertTag} variant="publish" />
                  </div>
                 
                  <CodeMirror
                    ref={editorRef}
                    value={formData.description}
                    height="400px"
                    theme={isDarkMode ? oneDark : "light"}
                    extensions={[html()]}
                    onChange={(value) =>
                      onUpdateFormData({ description: value })
                    }
                    className="border border-gray-100 rounded-[2px] overflow-hidden focus-within:border-[#FFDB14] transition-all dark:bg-gray-900 dark:border-gray-800"
                  />
                </div>
              </div>

              <div className="pt-10 border-t border-gray-50 flex gap-4 dark:border-gray-800">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gray-900 text-white px-10 py-4 rounded-lg font-black text-sm tracking-widest hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 disabled:opacity-50 shadow-sm dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
                >
                  {isLoading
                    ? "WORKING..."
                    : editingId
                      ? `UPDATE ${formData.type.toUpperCase()}`
                      : `PUBLISH ${formData.type.toUpperCase()}`}
                  {!isLoading && (
                    editingId ? <Check className="w-3 h-3" /> : <Send className="w-3 h-3" />
                  )}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={onResetForm}
                    className="px-8 py-4 rounded-lg border border-gray-200 font-black text-xs tracking-widest text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
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
  );
};

export default PublishContentTab;
