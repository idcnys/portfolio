"use client";

import React from "react";
import { TabType, TabVisibilityConfig } from "../../lib/types";

interface PortfolioConfigTabProps {
  homeForm: {
    quote: string;
    quoteAuthor: string;
    status: string;
    summary: string;
    email: string;
    location: string;
    education: string;
    techStack: string;
    featuredProjectIds: string;
  };
  setHomeForm: React.Dispatch<React.SetStateAction<PortfolioConfigTabProps["homeForm"]>>;
  saveHomeSettings: () => void;
  usernameForm: { codeforces: string; github: string };
  setUsernameForm: React.Dispatch<React.SetStateAction<{ codeforces: string; github: string }>>;
  saveUsernames: () => void;
  tabOrder: TabType[];
  tabVisibility: TabVisibilityConfig | undefined;
  toggleTabVisibility: (tab: TabType) => void;
  grindCardsEditor: string;
  setGrindCardsEditor: (v: string) => void;
  grindRatingsEditor: string;
  setGrindRatingsEditor: (v: string) => void;
  grindGithubEditor: string;
  setGrindGithubEditor: (v: string) => void;
  skillsetEditor: string;
  setSkillsetEditor: (v: string) => void;
  saveGrindAndSkillset: () => void;
}

const PortfolioConfigTab: React.FC<PortfolioConfigTabProps> = ({
  homeForm,
  setHomeForm,
  saveHomeSettings,
  usernameForm,
  setUsernameForm,
  saveUsernames,
  tabOrder,
  tabVisibility,
  toggleTabVisibility,
  grindCardsEditor,
  setGrindCardsEditor,
  grindRatingsEditor,
  setGrindRatingsEditor,
  grindGithubEditor,
  setGrindGithubEditor,
  skillsetEditor,
  setSkillsetEditor,
  saveGrindAndSkillset,
}) => {
  return (
    <div className="flex-1 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-6">
        <h2 className="text-2xl font-black text-gray-900 tracking-tighter dark:text-gray-100">
          Portfolio Config
        </h2>

        {/* Home Tab Content */}
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
          {/* Grind Usernames */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 space-y-4 dark:bg-gray-900 dark:border-gray-800">
            <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
              Grind Usernames (Realtime Sync)
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Use platform usernames so the Grind tab auto-syncs in realtime.
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
                    value={usernameForm[field.key as keyof typeof usernameForm]}
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

          {/* Tab Visibility */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 space-y-4 dark:bg-gray-900 dark:border-gray-800">
            <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
              Tab Buttons Visibility
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Hide or unhide portfolio tab buttons from the dashboard.
            </p>

            <div className="space-y-2">
              {tabOrder.map((tab) => {
                const enabled = tabVisibility?.[tab] ?? true;
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

        {/* Grind and Skillset JSON Editor */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 space-y-4 dark:bg-gray-900 dark:border-gray-800">
          <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
            Grind and Skillset Content Editor
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Edit JSON and save. This updates Grind cards/stats and Skillset content in realtime.
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
            onClick={saveGrindAndSkillset}
            className="bg-[#FFDB14] text-gray-900 px-8 py-3 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-yellow-400 transition-all shadow-sm"
          >
            Save Grind & Skillset Config
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioConfigTab;
