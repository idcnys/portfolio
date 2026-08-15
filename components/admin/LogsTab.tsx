"use client";

import React from "react";
import { History, LogIn, LogOut, Plus, Pencil as EditIcon, Trash as TrashIcon, Eye } from "lucide-react";
import { ActivityLog } from "../../lib/types";

interface LogsTabProps {
  logs: ActivityLog[];
  formatTimestamp: (ts: string) => string;
  getActionColor: (action: string) => string;
}

const LogsTab: React.FC<LogsTabProps> = ({ logs, formatTimestamp, getActionColor }) => {
  return (
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
                        {log.action === "login" && <LogIn className="w-3 h-3 mr-2" />}
                        {log.action === "logout" && <LogOut className="w-3 h-3 mr-2" />}
                        {log.action === "create" && <Plus className="w-3 h-3 mr-2" />}
                        {log.action === "edit" && <EditIcon className="w-3 h-3 mr-2" />}
                        {log.action === "delete" && <TrashIcon className="w-3 h-3 mr-2" />}
                        {log.action === "view" && <Eye className="w-3 h-3 mr-2" />}
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
                <History className="w-10 h-10 mb-4 opacity-20 mx-auto" />
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
  );
};

export default LogsTab;
