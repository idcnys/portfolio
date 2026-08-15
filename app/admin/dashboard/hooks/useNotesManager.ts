"use client";

import { useState } from "react";
import { Note } from "../../../../lib/types";
import {
  saveNote,
  deleteNote,
  updateNote,
} from "../../../../lib/firebase";
import {
  sanitizePlainText,
  sanitizeRichHtml,
} from "../../../../lib/sanitize";

type SetMessage = (msg: { text: string; type: string }) => void;

export function useNotesManager(setMessage: SetMessage) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteForm, setNoteForm] = useState({
    title: "",
    content: "",
    tags: [] as string[],
  });

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setNoteForm({
      title: note.title,
      content: note.content,
      tags: note.tags || [],
    });
    setIsEditingNote(false);
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setNoteForm({
      title: "",
      content: "",
      tags: [],
    });
    setIsEditingNote(true);
  };

  const handleSaveNote = async () => {
    if (!noteForm.title.trim()) return;

    const payload = {
      title: sanitizePlainText(noteForm.title),
      content: sanitizeRichHtml(noteForm.content),
      tags: (noteForm.tags || [])
        .map((tag) => sanitizePlainText(tag))
        .filter((tag) => tag.length > 0),
    };

    try {
      if (selectedNote) {
        await updateNote(selectedNote.id, payload);
        setMessage({ text: "Note updated!", type: "success" });
      } else {
        await saveNote(payload);
        setMessage({ text: "Note saved!", type: "success" });
      }
      setIsEditingNote(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (err) {
      setMessage({ text: "Error saving note.", type: "error" });
    }
  };

  const handleDeleteNote = async (note: Note) => {
    if (window.confirm(`Are you sure you want to delete "${note.title}"?`)) {
      try {
        await deleteNote(note.id, note.title);
        setSelectedNote(null);
        setNoteForm({ title: "", content: "", tags: [] });
        setMessage({ text: "Note deleted.", type: "success" });
      } catch (err) {
        setMessage({ text: "Error deleting note.", type: "error" });
      }
    }
  };

  return {
    notes,
    setNotes,
    selectedNote,
    setSelectedNote,
    isEditingNote,
    setIsEditingNote,
    noteForm,
    setNoteForm,
    handleNoteClick,
    handleNewNote,
    handleSaveNote,
    handleDeleteNote,
  };
}
