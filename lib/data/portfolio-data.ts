import {
  GrindCounterCard,
  GrindStatRow,
  SkillsetGroup,
} from "../types";

export const GRIND_COUNTER_CARDS: GrindCounterCard[] = [];

export const GRIND_RATING_STATS: GrindStatRow[] = [];

export const GRIND_GITHUB_STATS: GrindStatRow[] = [
  { id: "gh-contrib", label: "Followers", value: "N/A" },
  { id: "gh-current", label: "Recent Activity", value: "N/A" },
  { id: "gh-repos", label: "Public Repositories", value: "N/A" },
];

export const COUNTER_TONE_CLASSES: Record<GrindCounterCard["tone"], string> = {
  primary: "from-blue-500 to-blue-600",
  danger: "from-rose-500 to-red-600",
  success: "from-emerald-500 to-green-600",
  info: "from-cyan-500 to-sky-600",
};

export const SKILLSET_GROUPS: SkillsetGroup[] = [
  {
    id: "interests",
    title: "Fields of Interest",
    subtitle: "Domains I actively explore and build in",
    badges: [
      { label: "AI", url: "https://img.shields.io/badge/Artificial%20Intelligence-111827?style=flat-square&logo=openai&logoColor=white" },
      { label: "Cyber Security", url: "https://img.shields.io/badge/Cyber%20Security-991B1B?style=flat-square&logo=hackthebox&logoColor=white" },
      { label: "Machine Learning", url: "https://img.shields.io/badge/Machine%20Learning-1D4ED8?style=flat-square&logo=tensorflow&logoColor=white" },
      { label: "Competitive Programming", url: "https://img.shields.io/badge/Competitive%20Programming-14532D?style=flat-square&logo=codeforces&logoColor=white" },
    ],
  },
  {
    id: "working-tech",
    title: "Working Technologies",
    subtitle: "Frameworks and platforms I use in production work",
    badges: [
      { label: "Next.js", url: "https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" },
      { label: "React", url: "https://img.shields.io/badge/React-0F172A?style=flat-square&logo=react&logoColor=61DAFB" },
      { label: "Firebase", url: "https://img.shields.io/badge/Firebase-78350F?style=flat-square&logo=firebase&logoColor=FFCA28" },
      { label: "Node.js", url: "https://img.shields.io/badge/Node.js-166534?style=flat-square&logo=nodedotjs&logoColor=white" },
      { label: "Tailwind CSS", url: "https://img.shields.io/badge/Tailwind%20CSS-0E7490?style=flat-square&logo=tailwindcss&logoColor=white" },
      { label: "Framer Motion", url: "https://img.shields.io/badge/Framer%20Motion-701A75?style=flat-square&logo=framer&logoColor=white" },
    ],
  },
  {
    id: "languages",
    title: "Programming Languages",
    subtitle: "Languages I use for DSA, backend, and web apps",
    badges: [
      { label: "C++", url: "https://img.shields.io/badge/C%2B%2B-1D4ED8?style=flat-square&logo=cplusplus&logoColor=white" },
      { label: "Python", url: "https://img.shields.io/badge/Python-1E3A8A?style=flat-square&logo=python&logoColor=FACC15" },
      { label: "TypeScript", url: "https://img.shields.io/badge/TypeScript-1E40AF?style=flat-square&logo=typescript&logoColor=white" },
      { label: "JavaScript", url: "https://img.shields.io/badge/JavaScript-713F12?style=flat-square&logo=javascript&logoColor=FDE047" },
      { label: "SQL", url: "https://img.shields.io/badge/SQL-0F766E?style=flat-square&logo=postgresql&logoColor=white" },
      { label: "Bash", url: "https://img.shields.io/badge/Bash-111827?style=flat-square&logo=gnubash&logoColor=white" },
    ],
  },
  {
    id: "environment-tools",
    title: "Environment and Tools",
    subtitle: "Daily setup for development, collaboration, and deployment",
    badges: [
      { label: "Linux", url: "https://img.shields.io/badge/Linux-0F172A?style=flat-square&logo=linux&logoColor=FACC15" },
      { label: "VS Code", url: "https://img.shields.io/badge/VS%20Code-1E3A8A?style=flat-square&logo=visualstudiocode&logoColor=white" },
      { label: "Git", url: "https://img.shields.io/badge/Git-7C2D12?style=flat-square&logo=git&logoColor=white" },
      { label: "GitHub", url: "https://img.shields.io/badge/GitHub-111827?style=flat-square&logo=github&logoColor=white" },
      { label: "Docker", url: "https://img.shields.io/badge/Docker-1E40AF?style=flat-square&logo=docker&logoColor=white" },
      { label: "Vercel", url: "https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white" },
    ],
  },
];

export const EDUCATION_DATA = [
  {
    year: "Present",
    degree: "Bachelor's in CSE",
    result: "...",
    institution: "Rajshahi University Of Engineering & Technology, Rajshahi",
  },
  {
    year: "2024",
    degree: "Higher Secondary Certificate (HSC)",
    result: "GPA 5.00, Board Scholarship",
    institution: "Rajshahi College, Rajshahi",
  },
  {
    year: "2022",
    degree: "Senior School Certificate (SSC)",
    result: "GPA 5.00, Board Scholarship",
    institution: "Dhunat Govt. N. U. Pilot Model High School, Bogura",
  },
];

export const TECH_LOGOS = [
  { name: "React", url: "https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=20232A" },
  { name: "Next.js", url: "https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white" },
  { name: "Firebase", url: "https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=Firebase&logoColor=039BE5" },
  { name: "Cloudinary", url: "https://img.shields.io/badge/Cloudinary-3448C5?style=flat&logo=Cloudinary&logoColor=white" },
  { name: "Tailwind", url: "https://img.shields.io/badge/Tailwind-38B2AC?style=flat&logo=tailwind-css&logoColor=white" },
  { name: "TypeScript", url: "https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white" },
  { name: "Framer", url: "https://img.shields.io/badge/Framer-0055FF?style=flat&logo=framer&logoColor=white" },
  { name: "Node.js", url: "https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white" },
  { name: "Vercel", url: "https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white" },
  { name: "GitHub", url: "https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white" },
  { name: "ESLint", url: "https://img.shields.io/badge/ESLint-4B32C3?style=flat&logo=eslint&logoColor=white" },
  { name: "CodeMirror", url: "https://img.shields.io/badge/CodeMirror-212121?style=flat&logo=codemirror&logoColor=white" },
  { name: "PostCSS", url: "https://img.shields.io/badge/PostCSS-DD3A0A?style=flat&logo=postcss&logoColor=white" },
  { name: "Cal.com", url: "https://img.shields.io/badge/Cal.com-000000?style=flat&logo=caldotcom&logoColor=white" },
  { name: "Shields.io", url: "https://img.shields.io/badge/Shields.io-333333?style=flat&logo=shieldsdotio&logoColor=white" },
  { name: "Icons8", url: "https://img.shields.io/badge/Icons8-1FBAD6?style=flat&logo=icons8&logoColor=white" },
];
