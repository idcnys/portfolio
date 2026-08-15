"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ContentItem } from "../types";
import { subscribeToContent, getContentOnce } from "../firebase";

interface ContentContextType {
  projects: ContentItem[];
  activities: ContentItem[];
  isLoading: boolean;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getContentOnce();
        if (!mounted) return;
        setItems(data);
      } catch (e) {
        // fallback to empty
        if (!mounted) return;
        setItems([]);
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const projects = items.filter((item) => item.type === "project");
  const activities = items.filter((item) => item.type === "activity");

  return (
    <ContentContext.Provider value={{ projects, activities, isLoading }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
};
