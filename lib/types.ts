export interface ContentItem {
  id: string;
  title: string;
  date: string;
  description: string;
  imageUrl: string;
  type: "project" | "activity";
  likes?: number;
  views?: number;
  createdAt?: string;
  tags?: string[];
  links?: {
    github?: string;
    website?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
  };
}

export interface Certificate {
  id: string;
  imageUrl: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface ActivityLog {
  id: string;
  action: "login" | "logout" | "create" | "edit" | "delete" | "view";
  entity: "project" | "activity" | "note" | "auth";
  entityId?: string;
  entityTitle?: string;
  timestamp: string;
  userAgent?: string;
  ipAddress?: string;
}

export type TabType = "certificates" | "projects" | "activity" | "grind" | "skillset";
export type DashboardTab =
  | "notepad"
  | "publish-project"
  | "publish-activity"
  | "manage-content"
  | "logs"
  | "logout";
