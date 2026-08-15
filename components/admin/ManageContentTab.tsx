"use client";

import React from "react";
import { ContentItem } from "../../lib/types";
import {
  Edit as EditIcon,
  Trash2 as TrashIcon,
  Filter,
} from "lucide-react";

interface ManageContentTabProps {
  items: ContentItem[];
  onEdit: (item: ContentItem) => void;
  onDelete: (id: string) => void;
}

const ManageContentTab: React.FC<ManageContentTabProps> = ({
  items,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="flex-1 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter dark:text-gray-100">
            Manage Published Content
          </h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg font-bold text-xs shadow-sm hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800">
              <Filter className="w-4 h-4 mr-2 inline" />All ({items.length})
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
                  <p className="text-[10px] font-black text-gray-400 tracking-wide tracking-widest mt-1 dark:text-gray-500">
                    {item.date} •{" "}
                    <span
                      className={`${item.type === "project" ? "text-blue-500" : "text-green-500"}`}
                    >
                      {item.type}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <button
                  onClick={() => onEdit(item)}
                  className="p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40"
                >
                  <EditIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/40"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
              <p className="text-gray-400 font-bold">No content published yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageContentTab;
