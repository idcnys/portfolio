
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, set, remove, update, increment } from "firebase/database";
import { ContentItem } from "./types";

const firebaseConfig = {
  apiKey: "AIzaSyDWbrWygn6H5MKWpQ6oBFNPf2QjdOxkaiQ",
  authDomain: "sucon-ba7b1.firebaseapp.com",
  databaseURL: "https://sucon-ba7b1-default-rtdb.firebaseio.com",
  projectId: "sucon-ba7b1",
  storageBucket: "sucon-ba7b1.firebasestorage.app",
  messagingSenderId: "134806617816",
  appId: "1:134806617816:web:2a9efdf8ed58beba7961ad",
  measurementId: "G-FRDFSSDRWW"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export const saveContent = async (item: Omit<ContentItem, 'id'>) => {
  const contentRef = ref(db, 'content');
  const newRef = push(contentRef);
  await set(newRef, {
    ...item,
    id: newRef.key,
    likes: 0,
    views: 0,
    createdAt: new Date().toISOString()
  });
};

export const updateContent = async (id: string, item: Omit<ContentItem, 'id'>) => {
  const itemRef = ref(db, `content/${id}`);
  await update(itemRef, item);
};

export const deleteContent = async (id: string) => {
  const itemRef = ref(db, `content/${id}`);
  await remove(itemRef);
};

export const incrementViews = async (id: string) => {
  const itemRef = ref(db, `content/${id}`);
  await update(itemRef, {
    views: increment(1)
  });
};

export const incrementLikes = async (id: string) => {
  const itemRef = ref(db, `content/${id}`);
  await update(itemRef, {
    likes: increment(1)
  });
};

export const subscribeToContent = (callback: (items: ContentItem[]) => void) => {
  const contentRef = ref(db, 'content');
  return onValue(contentRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const items = Object.keys(data).map(key => ({
        ...data[key],
        id: key
      }));
      callback(items.reverse()); // Newest first
    } else {
      callback([]);
    }
  });
};
