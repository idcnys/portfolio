import React from "react";
import {
  Code2,
  Trophy,
  Award,
  BookOpen,
  Activity,
  Clock,
  Heart,
  Link as LinkIcon,
  Globe,
  Settings,
} from "lucide-react";
import {
  GithubIcon,
  LinkedinIcon,
  TwitterIcon,
  InstagramIcon,
} from "./icons/SocialIcons";

interface DynamicIconProps {
  name: string;
  className?: string;
}

const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className }) => {
  const iconName = name.startsWith("fa-") ? name.substring(3) : name;

  switch (iconName.toLowerCase()) {
    case "code":
    case "code2":
      return <Code2 className={className} />;
    case "trophy":
      return <Trophy className={className} />;
    case "award":
      return <Award className={className} />;
    case "book":
    case "book-open":
      return <BookOpen className={className} />;
    case "activity":
      return <Activity className={className} />;
    case "clock":
      return <Clock className={className} />;
    case "heart":
      return <Heart className={className} />;
    case "link":
      return <LinkIcon className={className} />;
    case "globe":
      return <Globe className={className} />;
    case "github":
      return <GithubIcon className={className} />;
    case "linkedin":
      return <LinkedinIcon className={className} />;
    case "twitter":
      return <TwitterIcon className={className} />;
    case "instagram":
      return <InstagramIcon className={className} />;
    default:
      return <Settings className={className} />;
  }
};

export default DynamicIcon;
