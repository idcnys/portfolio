"use client";

import { useState } from "react";
import { ExperienceItem, PortfolioSettings } from "../../../../lib/types";
import { updatePortfolioSettings } from "../../../../lib/firebase";
import {
  sanitizePlainText,
  sanitizeExternalUrl,
} from "../../../../lib/sanitize";

type SetMessage = (msg: { text: string; type: string }) => void;

export function useExperienceManager(
  setMessage: SetMessage,
  portfolioSettings: PortfolioSettings | null
) {
  const [experienceForm, setExperienceForm] = useState({
    period: "",
    role: "",
    company: "",
    description: "",
    thumbnail: "",
    latest: false,
  });
  const [experienceStackInput, setExperienceStackInput] = useState("");
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(
    null
  );

  const resetExperienceForm = () => {
    setExperienceForm({
      period: "",
      role: "",
      company: "",
      description: "",
      thumbnail: "",
      latest: false,
    });
    setExperienceStackInput("");
    setEditingExperienceId(null);
  };

  const handleEditExperience = (item: ExperienceItem) => {
    setExperienceForm({
      period: item.period,
      role: item.role,
      company: item.company,
      description: item.description,
      thumbnail: item.thumbnail || "",
      latest: item.latest || false,
    });
    setExperienceStackInput((item.stack || []).join(", "));
    setEditingExperienceId(item.id);
  };

  const saveExperienceItem = async () => {
    if (!portfolioSettings) {
      setMessage({ text: "Settings not loaded yet.", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return;
    }

    const stack = experienceStackInput
      .split(",")
      .map((tag) => sanitizePlainText(tag.trim()))
      .filter(Boolean);

    const nextItem: ExperienceItem = {
      id: editingExperienceId || `exp-${Date.now()}`,
      period: sanitizePlainText(experienceForm.period),
      role: sanitizePlainText(experienceForm.role),
      company: sanitizePlainText(experienceForm.company),
      description: sanitizePlainText(experienceForm.description),
      stack,
      thumbnail:
        sanitizeExternalUrl(experienceForm.thumbnail) ||
        "/certificates/cs50x.png",
      latest: !!experienceForm.latest,
    };

    const existing = portfolioSettings.experiences || [];
    let nextExperiences = editingExperienceId
      ? existing.map((item) =>
          item.id === editingExperienceId ? nextItem : item
        )
      : [nextItem, ...existing];

    if (nextItem.latest) {
      nextExperiences = nextExperiences.map((item) => ({
        ...item,
        latest: item.id === nextItem.id,
      }));
    }

    if (
      nextExperiences.length > 0 &&
      !nextExperiences.some((item) => item.latest)
    ) {
      nextExperiences = [
        { ...nextExperiences[0], latest: true },
        ...nextExperiences.slice(1),
      ];
    }

    try {
      await updatePortfolioSettings({ experiences: nextExperiences });
      setMessage({
        text: editingExperienceId
          ? "Experience updated."
          : "Experience added.",
        type: "success",
      });
      resetExperienceForm();
    } catch {
      setMessage({ text: "Failed to save experience.", type: "error" });
    }
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const deleteExperienceItem = async (id: string) => {
    if (!portfolioSettings) return;

    const existing = portfolioSettings.experiences || [];
    const target = existing.find((item) => item.id === id);
    if (!target) return;

    if (
      !window.confirm(
        `Delete experience: ${target.role} at ${target.company}?`
      )
    ) {
      return;
    }

    let nextExperiences = existing.filter((item) => item.id !== id);
    if (
      nextExperiences.length > 0 &&
      !nextExperiences.some((item) => item.latest)
    ) {
      nextExperiences = [
        { ...nextExperiences[0], latest: true },
        ...nextExperiences.slice(1),
      ];
    }

    try {
      await updatePortfolioSettings({ experiences: nextExperiences });
      if (editingExperienceId === id) {
        resetExperienceForm();
      }
      setMessage({ text: "Experience deleted.", type: "success" });
    } catch {
      setMessage({ text: "Failed to delete experience.", type: "error" });
    }
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const markExperienceAsLatest = async (id: string) => {
    if (!portfolioSettings) return;

    const existing = portfolioSettings.experiences || [];
    if (!existing.some((item) => item.id === id)) return;

    const nextExperiences = existing.map((item) => ({
      ...item,
      latest: item.id === id,
    }));

    try {
      await updatePortfolioSettings({ experiences: nextExperiences });
      setMessage({ text: "Latest experience updated.", type: "success" });
    } catch {
      setMessage({ text: "Failed to update latest flag.", type: "error" });
    }
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  return {
    experienceForm,
    setExperienceForm,
    experienceStackInput,
    setExperienceStackInput,
    editingExperienceId,
    setEditingExperienceId,
    resetExperienceForm,
    handleEditExperience,
    saveExperienceItem,
    deleteExperienceItem,
    markExperienceAsLatest,
  };
}
