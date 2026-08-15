# Bitto Saha — Portfolio

A personal portfolio and blog built with **Next.js 16** (App Router), featuring animated tab navigation, a full admin CMS with rich-text editing, and Firebase-backed content management.

🔗 **Live:** [bitto.is-a.dev](https://bitto.is-a.dev)

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

---

## ✨ Features

### Client
- **Animated tab navigation** — Home, Experience, Projects, Certificates, Skillset, Grind
- **Framer Motion** transitions with matrix rain background
- **Dark/Light theme** toggle with system preference detection
- **Custom context menu** with social links
- **Shareable pages** for individual projects and activities
- **Responsive** across all breakpoints

### Admin Dashboard
- **Content CMS** — publish, edit, and manage blog posts with rich HTML
- **CodeMirror editor** with toolbar for headings, code blocks, images, iframes, LaTeX
- **Notes** — personal notepad with rich-text support
- **Media manager** — upload/organize assets via Cloudinary
- **Codespace** — embed and manage code snippets
- **Experience & Portfolio config** editors
- **Activity logs** viewer
- JWT-based auth with captcha protection

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, Framer Motion |
| Icons | Lucide React |
| Backend/Data | Firebase (Firestore) |
| Media Storage | Cloudinary |
| Code Editor | CodeMirror 6 (`@uiw/react-codemirror`) |
| Auth | JWT via `jose`, custom captcha |
| Sanitization | `sanitize-html` |
| Analytics | Vercel Analytics |
| Deployment | Vercel |

---

## 📁 Project Structure

```
app/
├── page.tsx                  # Main portfolio (client)
├── projects/[share]/         # Shareable project pages
├── activity/[share]/         # Shareable activity pages
├── admin/
│   ├── login/                # Admin login
│   └── dashboard/            # Admin CMS (9 tab components + 6 hooks)
└── api/admin/                # Auth & captcha routes

components/
├── client/
│   ├── tabs/                 # HomeTab, ExperienceTab, ProjectsTab, etc.
│   ├── cards/                # Content & project cards
│   └── icons/                # Shared SVG icon components
└── admin/                    # NotepadTab, PublishContentTab, MediaTab, etc.

lib/
├── firebase.ts               # Firebase config & helpers
├── sanitize.ts               # HTML sanitization
├── security/                 # JWT session management
├── context/                  # Theme context
├── data/                     # Static portfolio data
└── utils/                    # Shared helpers (rich-tag insertion, etc.)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Firebase project (Firestore)
- A Cloudinary account (for media uploads)

### Setup

```bash
git clone https://github.com/idcnys/bittosaha-portfolio.git
cd bittosaha-portfolio
npm install
```

Copy the example env and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD` | Admin login password |
| `ADMIN_SESSION_SECRET` | Secret for JWT signing |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLOUDINARY_URL` | Full Cloudinary connection URL |

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📄 License

[MIT](LICENSE) © Bitto Saha

---

## 🙏 Acknowledgments

- Design inspiration from modern developer portfolios
- [is-a.dev](https://is-a.dev) for the free subdomain
- [Vercel](https://vercel.com) for hosting

---

<p align="center">
  Built with ☕ by <a href="https://github.com/idcnys">Bitto Saha</a>
</p>
