"use client";

import { useState } from "react";
import {
  PortfolioSettings,
  TabType,
} from "../../../../lib/types";
import {
  updatePortfolioSettings,
  logActivity,
} from "../../../../lib/firebase";

type SetMessage = (msg: { text: string; type: string }) => void;

export function usePortfolioConfigManager(setMessage: SetMessage) {
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

  const handleSettingsSubscription = (settings: PortfolioSettings) => {
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
        featuredProjectIds:
          settings.homeSettings.featuredProjectIds?.join(", ") || "",
      });
    }

    if (document.activeElement?.tagName !== "TEXTAREA") {
      setGrindCardsEditor(JSON.stringify(settings.grindCards, null, 2));
      setGrindRatingsEditor(JSON.stringify(settings.grindRatings, null, 2));
      setGrindGithubEditor(
        JSON.stringify(settings.grindGithubStats, null, 2)
      );
      setSkillsetEditor(JSON.stringify(settings.skillsetGroups, null, 2));
    }
  };

  const saveHomeSettings = async () => {
    try {
      if (!portfolioSettings) return;
      await updatePortfolioSettings({
        ...portfolioSettings,
        homeSettings: {
          ...homeForm,
          techStack: homeForm.techStack
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          featuredProjectIds: homeForm.featuredProjectIds
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
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
    if (!portfolioSettings) return;

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

  return {
    portfolioSettings,
    setPortfolioSettings,
    handleSettingsSubscription,
    usernameForm,
    setUsernameForm,
    homeForm,
    setHomeForm,
    grindCardsEditor,
    setGrindCardsEditor,
    grindRatingsEditor,
    setGrindRatingsEditor,
    grindGithubEditor,
    setGrindGithubEditor,
    skillsetEditor,
    setSkillsetEditor,
    saveHomeSettings,
    saveUsernames,
    toggleTabVisibility,
    saveJsonEditors,
  };
}
