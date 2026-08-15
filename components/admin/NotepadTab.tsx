"use client";

import React, { useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { oneDark } from "@codemirror/theme-one-dark";
import { Note } from "../../lib/types";
import { sanitizeRichHtml } from "../../lib/sanitize";
import { useTheme } from "../../lib/context/ThemeContext";
import { insertTagIntoEditor } from "../../lib/utils/richtag-helpers";
import RichTextToolbar from "./RichTextToolbar";
import {
  Plus,
  FileText,
  Edit as EditIcon,
  Trash2 as TrashIcon,
  Save,
  X,
} from "lucide-react";

interface NotepadTabProps {
  notes: Note[];
  selectedNote: Note | null;
  isEditingNote: boolean;
  noteForm: { title: string; content: string; tags: string[] };
  onSelectNote: (note: Note) => void;
  onNewNote: () => void;
  onSaveNote: () => void;
  onDeleteNote: (note: Note) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onUpdateNoteForm: (updates: Partial<{ title: string; content: string; tags: string[] }>) => void;
  formatTimestamp: (ts: string) => string;
}

const NotepadTab: React.FC<NotepadTabProps> = ({
  notes,
  selectedNote,
  isEditingNote,
  noteForm,
  onSelectNote,
  onNewNote,
  onSaveNote,
  onDeleteNote,
  onStartEdit,
  onCancelEdit,
  onUpdateNoteForm,
  formatTimestamp,
}) => {
  const noteEditorRef = useRef<any>(null);
  const { isDarkMode } = useTheme();

  const insertNoteTag = (tag: string) => {
    insertTagIntoEditor(noteEditorRef.current?.view, tag, "note");
  };

  return (
    <div className="flex-1 p-3">
      <div className="w-[100%] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-[90vh]">
          {/* Notes List */}
          <div className="bg-white shadow-lg border border-gray-100 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center dark:border-gray-800">
              <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">
                All Notes
              </h2>
              <button
                onClick={onNewNote}
                className="bg-[#FFDB14] text-gray-900 px-4 py-2 rounded-lg font-bold text-xs hover:bg-yellow-400 transition-all"
              >
                <Plus className="w-4 h-4 mr-2 inline" />New Note
              </button>
            </div>
            <div className="overflow-y-auto h-full p-4 space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => onSelectNote(note)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedNote?.id === note.id
                      ? "bg-yellow-50 border-[#FFDB14] dark:bg-yellow-500/15"
                      : "bg-gray-50 border-gray-200 hover:bg-white dark:bg-gray-900/60 dark:border-gray-800 dark:hover:bg-gray-800"
                  }`}
                >
                  <h3 className="font-black text-gray-900 mb-2 truncate dark:text-gray-100">
                    {note.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 dark:text-gray-400">
                    {formatTimestamp(note.updatedAt)}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-3 dark:text-gray-300">
                    {note.content.substring(0, 100)}...
                  </p>
                </div>
              ))}
              {notes.length === 0 && (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                  <FileText className="w-10 h-10 mb-4 opacity-50 mx-auto" />
                  <p className="font-bold">No notes yet</p>
                  <p className="text-xs">Click &quot;New Note&quot; to start</p>
                </div>
              )}
            </div>
          </div>

          {/* Note Editor */}
          <div className="lg:col-span-2 bg-white shadow-lg border border-gray-100 overflow-hidden dark:bg-gray-900 dark:border-gray-800">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center dark:border-gray-800">
              <h2 className="text-xl font-black text-gray-900 dark:text-gray-100">
                {selectedNote
                  ? isEditingNote
                    ? "Edit Note"
                    : selectedNote.title
                  : "New Note"}
              </h2>
              <div className="flex gap-2">
                {selectedNote && !isEditingNote ? (
                  <>
                    <button
                      onClick={onStartEdit}
                      className="bg-white text-blue-600 px-4 py-2 rounded-lg border border-blue-200 font-bold text-xs hover:bg-blue-50 transition-all shadow-sm dark:bg-gray-900 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-gray-800"
                    >
                      <EditIcon className="w-4 h-4 mr-2 inline" />Edit
                    </button>
                    <button
                      onClick={() => onDeleteNote(selectedNote)}
                      className="bg-white text-red-600 px-4 py-2 rounded-lg border border-red-200 font-bold text-xs hover:bg-red-50 transition-all shadow-sm dark:bg-gray-900 dark:text-red-300 dark:border-red-700 dark:hover:bg-gray-800"
                    >
                      <TrashIcon className="w-4 h-4 mr-2 inline" />Delete
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={onSaveNote}
                      disabled={!noteForm.title.trim()}
                      className="bg-[#FFDB14] text-gray-900 px-4 py-2 rounded-lg font-bold text-xs hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      <Save className="w-4 h-4 mr-2 inline" />Save
                    </button>
                    <button
                      onClick={onCancelEdit}
                      className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-200 font-bold text-xs hover:bg-gray-50 transition-all shadow-sm dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                      <X className="w-4 h-4 mr-2 inline" />Cancel
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
                      onUpdateNoteForm({ title: e.target.value })
                    }
                    className="w-full text-2xl font-black border-none outline-none mb-6 text-gray-900 placeholder:text-gray-300 dark:text-gray-100 dark:placeholder:text-gray-600 bg-transparent"
                  />

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-[10px] font-black text-gray-400 tracking-[0.3em] dark:text-gray-500">
                        Note Content
                      </label>
                      <RichTextToolbar onInsert={insertNoteTag} variant="note" />
                    </div>
                  </div>

                  <CodeMirror
                    ref={noteEditorRef}
                    value={noteForm.content}
                    height="calc(100vh - 450px)"
                    theme={isDarkMode ? oneDark : "light"}
                    extensions={[html()]}
                    onChange={(value) =>
                      onUpdateNoteForm({ content: value })
                    }
                    className="border border-gray-200 rounded-2xl overflow-hidden focus-within:border-[#FFDB14] transition-all bg-white dark:bg-gray-900 dark:border-gray-800"
                  />
                </>
              ) : selectedNote ? (
                <>
                  <h1 className="text-2xl font-black text-gray-900 mb-6 dark:text-gray-100">
                    {selectedNote.title}
                  </h1>
                  <div
                    className="prose prose-lg max-w-none text-gray-700 rich-content dark:text-gray-300"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeRichHtml(selectedNote.content),
                    }}
                  />
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotepadTab;
