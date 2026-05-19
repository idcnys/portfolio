export interface ContentItem {
  id: string;
  slug: string;
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

export interface GrindUsernames {
  codeforces: string;
  cses: string;
  leetcode: string;
  tryhackme: string;
  github: string;
}

export interface GrindCounterCard {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  tone: "primary" | "danger" | "success" | "info";
}

export interface GrindStatRow {
  id: string;
  label: string;
  value: string;
}

export interface SkillBadge {
  label: string;
  url: string;
}

export interface SkillsetGroup {
  id: string;
  title: string;
  subtitle: string;
  badges: SkillBadge[];
}

export interface TabVisibilityConfig {
  certificates: boolean;
  projects: boolean;
  activity: boolean;
  grind: boolean;
  skillset: boolean;
}

export interface PortfolioSettings {
  grindUsernames: GrindUsernames;
  grindCards: GrindCounterCard[];
  grindRatings: GrindStatRow[];
  grindGithubStats: GrindStatRow[];
  skillsetGroups: SkillsetGroup[];
  tabVisibility: TabVisibilityConfig;
  githubToken?: string;
}

export type DashboardTab =
  | "notepad"
  | "publish-project"
  | "publish-activity"
  | "manage-content"
  | "codespace"
  | "portfolio-config"
  | "logs"
  | "logout";
