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
  duration?: string;
  topics?: string;
  issuer?: string;
  onlineUrl?:string;
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

export type TabType = "home" | "certificates" | "experience" | "projects" | "activity" | "grind" | "skillset";

export interface GrindUsernames {
  codeforces: string;
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

export interface ExperienceItem {
  id: string;
  period: string;
  role: string;
  company: string;
  description: string;
  stack: string[];
  thumbnail?: string;
  latest?: boolean;
}

export interface TabVisibilityConfig {
  home: boolean;
  certificates: boolean;
  experience: boolean;
  projects: boolean;
  activity: boolean;
  grind: boolean;
  skillset: boolean;
}

export interface HomeSettings {
  quote: string;
  quoteAuthor: string;
  summary: string;
  email: string;
  location: string;
  education: string;
  status: string;
  featuredProjectIds: string[];
  techStack: string[];
}

export interface PortfolioSettings {
  grindUsernames: GrindUsernames;
  grindCards: GrindCounterCard[];
  grindRatings: GrindStatRow[];
  grindGithubStats: GrindStatRow[];
  skillsetGroups: SkillsetGroup[];
  experiences: ExperienceItem[];
  tabVisibility: TabVisibilityConfig;
  homeSettings?: HomeSettings;
  githubToken?: string;
}

export type DashboardTab =
  | "notepad"
  | "publish-project"
  | "publish-activity"
  | "manage-content"
  | "manage-experience"
  | "media"
  | "codespace"
  | "portfolio-config"
  | "logs"
  | "logout";

export interface CloudinaryImage {
  id: string;
  url: string;
  publicId: string;
  createdAt: string;
  name: string;
}
