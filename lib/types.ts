
export interface ContentItem {
  id: string;
  title: string;
  date: string;
  description: string;
  imageUrl: string;
  type: 'project' | 'activity';
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

export type TabType = 'certificates' | 'projects' | 'activity';
