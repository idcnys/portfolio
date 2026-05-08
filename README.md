# Portfolio Web Application

A modern, interactive personal portfolio built with **Next.js 15**, **Firebase**, and **Cloudflare Workers**. Features a CMS-enabled admin dashboard, real-time content updates, secure authentication, and advanced animations.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Features](#features)
- [Project Structure](#project-structure)
- [Data Flow](#data-flow)
- [Security](#security)
- [Installation & Setup](#installation--setup)
- [Development](#development)
- [Deployment](#deployment)

---

## Overview

This is a full-stack portfolio application with:
- **Public-facing portfolio** showcasing projects and activities
- **Admin CMS dashboard** for managing content, settings, and activity logs
- **Real-time synchronization** across all connected clients using Firebase Realtime Database
- **Secure authentication** with Math CAPTCHA protection and JWT-based sessions
- **Edge deployment** on Cloudflare Workers for global performance
- **Advanced UI/UX** with animations, dark mode, and responsive design

---

## Tech Stack

### Frontend
- **Framework:** Next.js 15 (React 19)
- **Styling:** Tailwind CSS v4 + PostCSS
- **Animations:** Framer Motion
- **Code Editor:** CodeMirror 6 (for code display in portfolio)
- **Math Rendering:** KaTeX
- **UI Components:** Custom React components with TypeScript

### Backend
- **Runtime:** Node.js (v22+ recommended)
- **Server Logic:** Next.js API Routes (RSC & Server Functions)
- **Database:** Firebase Realtime Database
- **Authentication:** JWT (jose library) + Math CAPTCHA
- **Middleware:** Next.js middleware for route protection

### Deployment & Infrastructure
- **Edge Computing:** Cloudflare Workers (via OpenNext adapter)
- **Build Tool:** Next.js with OpenNextJS/Cloudflare adapter
- **Analytics:** Vercel Analytics
- **Scheduling:** Cal.com embed for availability
- **Databases:** Firebase (primary data) + Cloudflare KV (if needed)

### Development Tools
- **Language:** TypeScript
- **Linting:** ESLint (with Next.js config)
- **Package Manager:** npm
- **Dev Tools:** Wrangler (Cloudflare CLI)

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT SIDE                              │
├─────────────────────────────────────────────────────────────┤
│  Browser                                                     │
│  ├─ App Components (Client)                                 │
│  │  ├─ Portfolio Display (projects, activities)             │
│  │  ├─ Admin Dashboard (with auth gates)                    │
│  │  ├─ Theme Toggle (dark/light mode)                       │
│  │  └─ Animations & UI Components                           │
│  │                                                           │
│  └─ Context Providers                                       │
│     ├─ ContentContext (Firebase subscriptions)              │
│     ├─ ThemeContext (dark mode state)                       │
│     └─ Session Management (from auth cookies)               │
│                                                           │
├─────────────────────────────────────────────────────────────┤
│                   NEXT.JS SERVER SIDE                        │
├─────────────────────────────────────────────────────────────┤
│  Middleware (middleware.ts)                                  │
│  ├─ Route Protection (/admin/* requires session)            │
│  ├─ Session Validation                                      │
│  └─ Auth Flow Control                                       │
│                                                           │
│  API Routes (app/api/)                                      │
│  ├─ POST /api/admin/login (CAPTCHA verification)            │
│  ├─ POST /api/admin/logout (session cleanup)                │
│  ├─ GET  /api/admin/captcha (Math CAPTCHA generation)       │
│  └─ Auth verification & JWT creation                        │
│                                                           │
│  Server Components (app/)                                   │
│  ├─ Layout (root metadata & providers)                      │
│  └─ ProfileInfo (server-side data fetching)                 │
│                                                           │
├─────────────────────────────────────────────────────────────┤
│                    FIREBASE REALTIME DB                      │
├─────────────────────────────────────────────────────────────┤
│  /content/                                                   │
│  ├─ projects/[id]/ (title, description, links, etc.)        │
│  └─ activities/[id]/ (type, date, description)              │
│                                                           │
│  /portfolio_settings/                                       │
│  ├─ theme (default light/dark mode)                         │
│  ├─ hero_text                                               │
│  ├─ social_links                                            │
│  └─ other portfolio config                                  │
│                                                           │
│  /activity_logs/[timestamp]/ (audit trail for admin)        │
│  ├─ action_type (create, update, delete)                    │
│  ├─ admin_id                                                │
│  └─ details (what was changed)                              │
│                                                           │
├─────────────────────────────────────────────────────────────┤
│                 CLOUDFLARE WORKERS (EDGE)                    │
├─────────────────────────────────────────────────────────────┤
│  OpenNextJS Adapter                                          │
│  ├─ Handles static assets & cache                           │
│  ├─ Routes requests to Next.js                              │
│  ├─ KV Storage for edge data                                │
│  └─ Global CDN distribution                                 │
└─────────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
┌────────────────────────────────────┐
│   User visits /admin/login          │
└────────────────────────────────────┘
                ↓
┌────────────────────────────────────┐
│  1. GET /api/admin/captcha          │
│     Returns: Math problem + JWT(5m) │
└────────────────────────────────────┘
                ↓
┌────────────────────────────────────┐
│  2. User solves CAPTCHA             │
│     (verification step)             │
└────────────────────────────────────┘
                ↓
┌────────────────────────────────────┐
│  3. POST /api/admin/login           │
│     - Verify CAPTCHA JWT            │
│     - Validate credentials          │
│     - Create session JWT (8 hours)  │
│     - Set HttpOnly cookie           │
└────────────────────────────────────┘
                ↓
┌────────────────────────────────────┐
│  4. Middleware validates session    │
│     on every /admin/* request       │
└────────────────────────────────────┘
                ↓
┌────────────────────────────────────┐
│  5. Access admin dashboard          │
│     (real-time content updates)     │
└────────────────────────────────────┘
```

### Data Flow Pattern

#### Reading Data (Public & Admin)
```
1. Component mounts
   ↓
2. ContentContext subscribes to Firebase listeners
   - /content/projects
   - /content/activities
   - /portfolio_settings
   ↓
3. Firebase sends real-time updates
   ↓
4. Context state updates
   ↓
5. Components re-render with latest data
```

#### Writing Data (Admin Only)
```
1. Admin submits form in dashboard
   ↓
2. Server action/API call to Firebase SDK
   ↓
3. Database write (projects, activities, settings)
   ↓
4. Auto-generate activity log entry
   ↓
5. ContentContext listeners trigger
   ↓
6. All clients see update in real-time
```

#### Engagement Updates (Views/Likes)
```
1. User interacts with project/activity
   ↓
2. Client-side increment counter
   ↓
3. Firebase update (non-blocking)
   ↓
4. Realtime listeners notify all clients
   ↓
5. Global state update (if important projects)
```

---

## Features

### Public Portfolio
- **Responsive Design:** Mobile-first, works on all devices
- **Dark/Light Mode:** Theme preference persisted with smooth transitions
- **Real-time Updates:** Content changes instantly across all viewers
- **Animations:** Smooth Framer Motion transitions & appearing text effects
- **Project Showcase:** Display projects with descriptions, links, engagement metrics
- **Activity Timeline:** Show recent activities, skills, achievements
- **Contact Integration:** Cal.com embedded scheduling
- **Security Headers:** CSP, HSTS, X-Frame-Options, etc.

### Admin Dashboard
- **Secure Login:** Math CAPTCHA + JWT authentication
- **Content Management:** Create/edit/delete projects and activities
- **Settings Management:** Update theme, hero text, social links
- **Activity Logs:** View audit trail of all admin actions
- **Real-time Sync:** Changes propagate instantly
- **Analytics:** Vercel Analytics integration

### Technical Features
- **Edge Deployment:** Cloudflare Workers for sub-100ms global latency
- **Secure Authentication:** JWT tokens, HttpOnly cookies, CAPTCHA
- **Global Database:** Firebase Realtime DB with low-latency updates
- **TypeScript:** Full type safety across the stack
- **SEO Optimized:** Server-side rendering, meta tags, structured data
- **Analytics:** Vercel Analytics for user insights
- **Performance:** Code splitting, image optimization, caching

---

## Project Structure

```
.
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Home page (portfolio display)
│   ├── layout.tsx                # Root layout with providers
│   ├── globals.css               # Global styles
│   ├── loading.tsx               # Loading skeleton
│   ├── not-found.tsx             # 404 page
│   ├── admin/
│   │   ├── dashboard/            # Admin CMS dashboard (protected)
│   │   │   └── page.tsx
│   │   └── login/                # Admin login page
│   │       └── page.tsx
│   ├── api/
│   │   └── admin/
│   │       ├── captcha/          # CAPTCHA generation
│   │       │   └── route.ts
│   │       ├── login/            # Authentication endpoint
│   │       │   └── route.ts
│   │       └── logout/           # Logout endpoint
│   │           └── route.ts
│   └── projects/
│       ├── page.tsx              # Projects list page
│       └── [share]/
│           └── page.tsx          # Dynamic shared project page
│
├── components/                   # Reusable React components
│   ├── PortfolioClient.tsx       # Main portfolio component
│   ├── client/                   # Client-side components
│   │   ├── ActionButtons.tsx     # Like/share buttons
│   │   ├── AppearingTextAnimation.tsx # Text animations
│   │   ├── CustomContextMenu.tsx # Right-click menu
│   │   ├── SocialLinks.tsx       # Social media links
│   │   ├── TabSwitcher.tsx       # Tab navigation
│   │   └── ThemeToggle.tsx       # Dark mode toggle
│   └── server/
│       └── ProfileInfo.tsx       # Server component for profile data
│
├── lib/                          # Utility functions & configs
│   ├── constants.ts              # App-wide constants
│   ├── firebase.ts               # Firebase SDK setup & helpers
│   ├── sanitize.ts               # HTML sanitization for security
│   ├── types.ts                  # TypeScript interfaces
│   ├── context/
│   │   ├── ContentContext.tsx    # Firebase data context
│   │   └── ThemeContext.tsx      # Theme state context
│   └── security/
│       └── session.ts            # JWT & session management
│
├── public/                       # Static assets
│   ├── icons/                    # Icon files
│   └── certificates/             # Certificate images
│
├── middleware.ts                 # Route protection & auth
├── next.config.js                # Next.js configuration
├── open-next.config.ts           # OpenNext/Cloudflare config
├── wrangler.jsonc                # Cloudflare Workers config
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind CSS config
├── postcss.config.mjs            # PostCSS config
├── eslint.config.mjs             # ESLint config
└── package.json                  # Dependencies & scripts
```

---

## Data Flow

### 1. **Initial Page Load (Public)**

```
User opens portfolio
   ↓
Next.js renders app/page.tsx
   ↓
Layout mounts ContentContext & ThemeContext providers
   ↓
PortfolioClient component mounts
   ↓
ContentContext sets up Firebase listeners:
   - projects collection
   - activities collection
   - portfolio_settings
   ↓
Firebase subscription fires:
   - Fetches initial data snapshot
   - Sets up real-time listeners
   ↓
Components re-render with data
   ↓
Portfolio page displays with animations
```

### 2. **Admin Login Flow**

```
POST /api/admin/captcha (get math problem)
   ↓
User solves CAPTCHA
   ↓
POST /api/admin/login with credentials + CAPTCHA answer
   ↓
Server validates:
   1. CAPTCHA JWT not expired
   2. CAPTCHA answer is correct
   3. Admin credentials match Firebase config
   ↓
On success:
   - Create session JWT (8 hour expiry)
   - Set HttpOnly, secure, same-site cookie
   - Return redirect to /admin/dashboard
   ↓
Middleware validates session cookie on /admin/* routes
   ↓
Access granted to dashboard
```

### 3. **Content Update Flow (Admin)**

```
Admin clicks "Save" on content form
   ↓
Form data sent to Firebase (via SDK)
   ↓
Database write triggers:
   - Update /content/projects/[id]
   - Create audit log in /activity_logs/[timestamp]
   ↓
Firebase listeners on all clients trigger
   ↓
ContentContext updates state
   ↓
All connected clients see new content in real-time
   ↓
UI re-renders with updated data
```

### 4. **Theme Preference Flow**

```
User toggles dark mode
   ↓
ThemeContext state updates
   ↓
localStorage updated with preference
   ↓
Tailwind dark class applied to html element
   ↓
CSS immediately transitions to dark colors
   ↓
On next visit:
   - localStorage value restored from browser
   - Theme applied before paint (no flash)
```

---

## Security

### Authentication
- **Math CAPTCHA:** Prevents automated attacks (5-minute JWT)
- **JWT Sessions:** 8-hour expiry with HttpOnly cookies
- **Middleware Protection:** All admin routes validated server-side
- **Credential Validation:** Admin credentials stored securely

### Data Protection
- **HTML Sanitization:** `sanitize-html` library prevents XSS
- **Content Security Policy (CSP):** Restricts script execution to trusted sources
- **HTTPS Only:** Secure cookies and transport
- **X-Frame-Options:** Prevents clickjacking

### Network Security
- **Strict-Transport-Security (HSTS):** Enforce HTTPS
- **X-Content-Type-Options:** Prevent MIME sniffing
- **Referrer-Policy:** Limit referrer information
- **Permissions-Policy:** Disable unnecessary APIs (camera, microphone, geolocation)

### Database Rules (Firebase)
- Public read access to `/content/` (portfolio data)
- Public read access to `/portfolio_settings/`
- Admin-only write access to all paths
- Activity logs are append-only (audit trail)

---

## Installation & Setup

### Prerequisites
- Node.js v22+ (or v20.19.4 with engine-strict warning)
- npm v9+
- Firebase project with Realtime Database
- Cloudflare account (for deployment)

### 1. Clone & Install

```bash
git clone <your-repo>
cd portfolioweb
npm install
```

### 2. Environment Variables

Create `.env.local`:

```env
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Admin Credentials (for login)
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# Vercel Analytics (optional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
```

### 3. Firebase Setup

1. Create a Realtime Database
2. Set database rules:

```json
{
  "rules": {
    "content": {
      ".read": true,
      ".write": "auth != null"
    },
    "portfolio_settings": {
      ".read": true,
      ".write": "auth != null"
    },
    "activity_logs": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

3. Add initial data structure (optional):

```json
{
  "content": {
    "projects": {},
    "activities": {}
  },
  "portfolio_settings": {
    "theme": "light",
    "hero_text": "Welcome to my portfolio"
  },
  "activity_logs": {}
}
```

### 4. Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Development

### Available Scripts

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Preview Cloudflare deployment locally
npm run preview

# Deploy to Cloudflare
npm run deploy
```

### Key Development Patterns

#### Using ContentContext

```typescript
import { ContentContext } from '@/lib/context/ContentContext';

export function MyComponent() {
  const { projects, activities, settings } = useContext(ContentContext);
  
  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>{project.title}</div>
      ))}
    </div>
  );
}
```

#### Using ThemeContext

```typescript
import { ThemeContext } from '@/lib/context/ThemeContext';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  
  return (
    <button onClick={toggleTheme}>
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}
```

#### Protected API Routes

```typescript
// app/api/admin/protected/route.ts
import { validateSession } from '@/lib/security/session';

export async function POST(request: Request) {
  const session = await validateSession(request);
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Admin-only logic here
  return Response.json({ success: true });
}
```

#### Firebase Write with Audit Logging

```typescript
import { getDatabase, ref, set, push } from 'firebase/database';

async function updateProject(projectId: string, data: any) {
  const db = getDatabase();
  
  // Update project
  await set(ref(db, `content/projects/${projectId}`), data);
  
  // Log activity
  await push(ref(db, 'activity_logs'), {
    timestamp: new Date().toISOString(),
    action: 'UPDATE_PROJECT',
    projectId,
    adminId: 'current-user',
    details: data
  });
}
```

---

## Deployment

### Deploy to Cloudflare Workers

```bash
npm run deploy
```

### Configuration

Edit `wrangler.jsonc` for Cloudflare settings:

```json
{
  "name": "portfolio",
  "main": "server/index.js",
  "site": {
    "bucket": ".next/standalone/public"
  },
  "env": {
    "production": {
      "routes": [
        {
          "pattern": "yoursite.com/*",
          "zone_name": "yoursite.com"
        }
      ]
    }
  }
}
```

### Performance Metrics (Typical)

- **LCP:** ~1.2s (Largest Contentful Paint)
- **FID:** ~50ms (First Input Delay)
- **CLS:** <0.1 (Cumulative Layout Shift)
- **TTFB:** ~200ms (Time To First Byte) - sub-100ms with Cloudflare edge

---

## 🛠️ Troubleshooting

### Node.js Version Issues

If you see `EBADENGINE` warnings:

```bash
# Upgrade Node.js to v22
nvm install 22
nvm use 22

# Or suppress warnings (not recommended)
echo "engine-strict=false" >> .npmrc
```

### Firebase Connection Issues

- Verify `.env.local` has correct credentials
- Check Firebase Realtime Database rules
- Ensure database is not in "locked" mode

### Admin Login Problems

- Clear browser cookies
- Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD` env vars
- Check `JWT_SECRET` is set and has enough entropy

### Deployment Failures

- Run `npm run build` locally to test
- Check `wrangler.jsonc` configuration
- Verify Cloudflare account permissions

---

## 📄 License

Private project - All rights reserved

---

## 📧 Contact

For questions or issues, refer to the admin dashboard activity logs for debugging.
