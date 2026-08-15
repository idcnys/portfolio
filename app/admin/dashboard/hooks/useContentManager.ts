"use client";

import { useState } from "react";
import { ContentItem } from "../../../../lib/types";
import {
  saveContent,
  deleteContent,
  updateContent,
} from "../../../../lib/firebase";
import {
  sanitizeExternalUrl,
  sanitizePlainText,
  sanitizeRichHtml,
} from "../../../../lib/sanitize";

type SetMessage = (msg: { text: string; type: string }) => void;

const getDefaultDate = () =>
  new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export function useContentManager(setMessage: SetMessage) {
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
  const [tagsInput, setTagsInput] = useState("");

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
      type: formData.type,
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

  return {
    formData,
    setFormData,
    items,
    setItems,
    isLoading,
    editingId,
    setEditingId,
    tagsInput,
    setTagsInput,
    handleSubmit,
    resetForm,
    handleEdit,
    handleDelete,
  };
}
