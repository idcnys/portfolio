import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  push,
  onValue,
  set,
  remove,
  update,
  increment,
} from "firebase/database";
import { ContentItem, Note, ActivityLog } from "./types";

const firebaseConfig = {
  apiKey: "AIzaSyDWbrWygn6H5MKWpQ6oBFNPf2QjdOxkaiQ",
  authDomain: "sucon-ba7b1.firebaseapp.com",
  databaseURL: "https://sucon-ba7b1-default-rtdb.firebaseio.com",
  projectId: "sucon-ba7b1",
  storageBucket: "sucon-ba7b1.firebasestorage.app",
  messagingSenderId: "134806617816",
  appId: "1:134806617816:web:2a9efdf8ed58beba7961ad",
  measurementId: "G-FRDFSSDRWW",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// Activity Logging Functions
export const logActivity = async (
  action: ActivityLog["action"],
  entity: ActivityLog["entity"],
  entityId?: string,
  entityTitle?: string,
) => {
  const logsRef = ref(db, "activity_logs");
  const newRef = push(logsRef);
  await set(newRef, {
    id: newRef.key,
    action,
    entity,
    entityId: entityId || "",
    entityTitle: entityTitle || "",
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "",
    ipAddress: "Hidden for privacy",
  });
};

export const subscribeToLogs = (callback: (logs: ActivityLog[]) => void) => {
  const logsRef = ref(db, "activity_logs");
  return onValue(logsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const logs = Object.keys(data).map((key) => ({
        ...data[key],
        id: key,
      }));
      callback(logs.reverse()); // Newest first
    } else {
      callback([]);
    }
  });
};

// Content Functions (Enhanced with Logging)
export const saveContent = async (item: Omit<ContentItem, "id">) => {
  const contentRef = ref(db, "content");
  const newRef = push(contentRef);
  await set(newRef, {
    ...item,
    id: newRef.key,
    likes: 0,
    views: 0,
    createdAt: new Date().toISOString(),
  });

  // Log the action
  await logActivity("create", item.type, newRef.key, item.title);
};

export const updateContent = async (
  id: string,
  item: Omit<ContentItem, "id">,
) => {
  const itemRef = ref(db, `content/${id}`);
  await update(itemRef, item);

  // Log the action
  await logActivity("edit", item.type, id, item.title);
};

export const deleteContent = async (
  id: string,
  type: "project" | "activity",
  title: string,
) => {
  const itemRef = ref(db, `content/${id}`);
  await remove(itemRef);

  // Log the action
  await logActivity("delete", type, id, title);
};

export const incrementViews = async (id: string) => {
  const itemRef = ref(db, `content/${id}`);
  await update(itemRef, {
    views: increment(1),
  });
};

export const incrementLikes = async (id: string) => {
  const itemRef = ref(db, `content/${id}`);
  await update(itemRef, {
    likes: increment(1),
  });
};

export const subscribeToContent = (
  callback: (items: ContentItem[]) => void,
) => {
  const contentRef = ref(db, "content");
  return onValue(contentRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const items = Object.keys(data).map((key) => ({
        ...data[key],
        id: key,
      }));
      callback(items.reverse()); // Newest first
    } else {
      callback([]);
    }
  });
};

// Notes Functions
export const saveNote = async (
  note: Omit<Note, "id" | "createdAt" | "updatedAt">,
) => {
  const notesRef = ref(db, "notes");
  const newRef = push(notesRef);
  await set(newRef, {
    ...note,
    id: newRef.key,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Log the action
  await logActivity("create", "note", newRef.key, note.title);
};

export const updateNote = async (
  id: string,
  note: Omit<Note, "id" | "createdAt" | "updatedAt">,
) => {
  const noteRef = ref(db, `notes/${id}`);
  await update(noteRef, {
    ...note,
    updatedAt: new Date().toISOString(),
  });

  // Log the action
  await logActivity("edit", "note", id, note.title);
};

export const deleteNote = async (id: string, title: string) => {
  const noteRef = ref(db, `notes/${id}`);
  await remove(noteRef);

  // Log the action
  await logActivity("delete", "note", id, title);
};

export const subscribeToNotes = (callback: (notes: Note[]) => void) => {
  const notesRef = ref(db, "notes");
  return onValue(notesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const notes = Object.keys(data).map((key) => ({
        ...data[key],
        id: key,
      }));
      callback(notes.reverse()); // Newest first
    } else {
      callback([]);
    }
  });
};
