"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ContentItem } from "../types";
import { subscribeToContent } from "../firebase";

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
    const unsubscribe = subscribeToContent((data) => {
      setItems(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
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
