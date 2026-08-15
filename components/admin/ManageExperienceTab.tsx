"use client";

import React from "react";
import { ExperienceItem } from "../../lib/types";
import { Ghost } from "lucide-react";

interface ExperienceForm {
  period: string;
  role: string;
  company: string;
  description: string;
  thumbnail: string;
  latest: boolean;
}

interface ManageExperienceTabProps {
  experiences: ExperienceItem[];
  experienceForm: ExperienceForm;
  experienceStackInput: string;
  editingExperienceId: string | null;
  onUpdateForm: (updates: Partial<ExperienceForm>) => void;
  onStackInputChange: (value: string) => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onEdit: (item: ExperienceItem) => void;
  onDelete: (id: string) => void;
  onMarkLatest: (id: string) => void;
}

const ManageExperienceTab: React.FC<ManageExperienceTabProps> = ({
  experiences,
  experienceForm,
  experienceStackInput,
  editingExperienceId,
  onUpdateForm,
  onStackInputChange,
  onSave,
  onCancelEdit,
  onEdit,
  onDelete,
  onMarkLatest,
}) => {
  return (
    <div className="flex-1 p-6 md:p-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 space-y-4 shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">
              {editingExperienceId ? "Edit Experience" : "Add Experience"}
            </h2>
            {editingExperienceId && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Year range (e.g. 2025 - Present)"
              value={experienceForm.period}
              onChange={(event) =>
                onUpdateForm({ period: event.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:border-[#FFDB14] text-sm text-gray-900 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="Role title"
              value={experienceForm.role}
              onChange={(event) =>
                onUpdateForm({ role: event.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:border-[#FFDB14] text-sm text-gray-900 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="Company"
              value={experienceForm.company}
              onChange={(event) =>
                onUpdateForm({ company: event.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:border-[#FFDB14] text-sm text-gray-900 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100"
            />
            <textarea
              placeholder="Short description (2-3 lines)"
              value={experienceForm.description}
              onChange={(event) =>
                onUpdateForm({ description: event.target.value })
              }
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:border-[#FFDB14] text-sm text-gray-900 resize-none dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="Stack tags (comma separated)"
              value={experienceStackInput}
              onChange={(event) => onStackInputChange(event.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:border-[#FFDB14] text-sm text-gray-900 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100"
            />
            <input
              type="text"
              placeholder="Thumbnail URL (optional)"
              value={experienceForm.thumbnail}
              onChange={(event) =>
                onUpdateForm({ thumbnail: event.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:bg-white focus:border-[#FFDB14] text-sm text-gray-900 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100"
            />

            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={experienceForm.latest}
                onChange={(event) =>
                  onUpdateForm({ latest: event.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              Set as latest highlighted role
            </label>
          </div>

          <button
            type="button"
            onClick={onSave}
            className="w-full bg-[#FFDB14] text-gray-900 px-4 py-3 rounded-xl text-xs font-black tracking-wide tracking-wider hover:bg-yellow-400 transition-all shadow-sm"
          >
            {editingExperienceId ? "Update Experience" : "Add Experience"}
          </button>
        </div>

        <div className="xl:col-span-3 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
              Existing Experience Entries
            </h3>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
              {experiences.length} items
            </span>
          </div>

          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            {[...experiences]
              .sort((a, b) => Number(!!b.latest) - Number(!!a.latest))
              .map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-4 ${
                    item.latest
                      ? "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800"
                      : "border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-900"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold tracking-wide tracking-wider text-gray-500 dark:text-gray-400">
                        {item.period}
                      </p>
                      <h4 className="text-base font-bold text-gray-900 dark:text-gray-100">
                        {item.role}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {item.company}
                      </p>
                    </div>
                    {item.latest && (
                      <span className="px-2 py-1 rounded-full text-[10px] font-black tracking-wide tracking-wider bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900">
                        Latest
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(item.stack || []).map((tag) => (
                      <span
                        key={`${item.id}-${tag}`}
                        className="px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-[11px] font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onMarkLatest(item.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Mark Latest
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

            {experiences.length === 0 && (
              <div className="p-12 text-center text-gray-400 font-bold tracking-wide tracking-widest bg-gray-50 rounded-2xl border border-dashed border-gray-200 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-500">
                <Ghost className="w-10 h-10 mb-4 opacity-20 mx-auto" />
                <p>No experience entries yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageExperienceTab;
