# Portfolio Web Application - Architecture Analysis

## Overview
This is a **Next.js 15 portfolio application** with TypeScript, featuring real-time data management via Firebase, admin dashboard, theme switching, and comprehensive content management. The app is deployed on Cloudflare Workers via OpenNext.

**Tech Stack:**
- Framework: Next.js 15 with Edge runtime
- State Management: React Context API (Content, Theme)
- Database: Firebase Realtime Database
- Styling: Tailwind CSS + Framer Motion animations
- Auth: JWT-based sessions with captcha-protected login
- Deployment: Cloudflare Workers (OpenNext)

---

## 1. Main Pages and Their Purposes

### Public Pages

| Page | File | Purpose |
|------|------|---------|
| **Home/Portfolio** | `app/page.tsx` | Entry point wrapped with `ContentProvider`. Renders the main portfolio view with `PortfolioClient` component |
| **Projects** | `app/projects/page.tsx` | Dedicated projects showcase page using same `PortfolioClient` component with content filtering |
| **Share/Detail Page** | `app/projects/[share]/page.tsx` | Dynamic route for shared project details; accepts query params to display specific content |

### Admin Pages

| Page | File | Purpose |
|------|------|---------|
| **Admin Login** | `app/admin/login/page.tsx` | Protected login form with CAPTCHA verification; requires valid credentials + captcha answer |
| **Admin Dashboard** | `app/admin/dashboard/page.tsx` | Full CMS for managing content, notes, activity logs, and portfolio settings |

### Key Page Features

- **Home Page:** Provides content context to all child components; displays portfolio tabs (certificates, projects, activity, grind stats, skillset)
- **Content Filter:** Projects/activities filtered in `ContentContext` based on `type` field
- **Lazy Loading:** Uses loading states during Firebase subscription initialization
- **Theme Support:** All pages wrapped with `ThemeProvider` for dark/light mode persistence

---

## 2. API Routes and Their Functions

All routes implement server-side validation and use environment variables for secrets.

### Authentication Routes

#### `POST /api/admin/login`
- **Purpose:** Authenticate admin with username, password, and captcha verification
- **Flow:**
  1. Validates captcha token against user's answer using JWT verification
  2. Compares provided credentials with `ADMIN_USERNAME` and `ADMIN_PASSWORD` env vars
  3. Creates JWT session token with 8-hour TTL
  4. Sets `admin_session` HttpOnly cookie
- **Response:** `{ token }` or error message
- **Security:** Requires captcha-validated token first

#### `POST /api/admin/logout`
- **Purpose:** Clear admin session cookie
- **Flow:** Clears `admin_session` cookie with `maxAge: 0`
- **Response:** `{ ok: true }`

#### `GET /api/admin/captcha`
- **Purpose:** Generate random math captcha for login protection
- **Flow:**
  1. Generates two random numbers (1-10) and operator (+, -, *)
  2. Calculates correct answer
  3. Creates JWT token with answer embedded (5-minute TTL)
  4. Returns question and token to client
- **Response:** `{ question: "5 + 3 = ?", token }`
- **Security:** Answer is never exposed; only hashed in JWT token

---

## 3. Context Setup for State Management

### ContentContext (`lib/context/ContentContext.tsx`)

**State Structure:**
```typescript
{
  projects: ContentItem[]      // Filtered items with type === "project"
  activities: ContentItem[]    // Filtered items with type === "activity"
  isLoading: boolean           // True during Firebase subscription setup
}
```

**Setup Process:**
1. On mount, subscribes to Firebase content collection
2. Receives all items and splits into projects/activities
3. Provides unsubscribe cleanup function
4. Exposes `useContent()` hook for consumer components

**Typical Usage:**
```typescript
const { projects, activities, isLoading } = useContent();
```

**Consumer Components:**
- `PortfolioClient`: Uses for tab display
- `Dashboard`: Uses for content listing in admin panel

---

### ThemeContext (`lib/context/ThemeContext.tsx`)

**State Structure:**
```typescript
{
  isDarkMode: boolean          // Current theme state
  toggleTheme: (origin?) => void // Theme toggle with ripple animation
  mounted: boolean             // Client hydration flag
  isTransitioning: boolean     // Animation state flag
}
```

**Setup Process:**
1. On mount, checks localStorage for saved theme preference
2. Falls back to system preference via `prefers-color-scheme` media query
3. Applies theme class to HTML root element
4. Persists choice to localStorage

**Theme Transition Animation:**
- Ripple overlay expands from toggle button origin point
- CSS transition: 0.75s ease on background-color and color
- Prevents theme toggles during animation with `isTransitioning` flag

**Consumer Components:**
- `ThemeToggle`: Triggers toggle from button origin point
- `PortfolioClient`: Respects isDarkMode for conditional rendering
- Global CSS: `html.dark` class applies dark mode styles

---

## 4. Authentication/Security Mechanisms

### Session Management (`lib/security/session.ts`)

**JWT Token Configuration:**

| Token Type | Algorithm | TTL | Subject |
|-----------|-----------|-----|---------|
| Admin Session | HS256 | 8 hours | "admin" |
| Captcha | HS256 | 5 minutes | "captcha" |

**Admin Session Flow:**
1. User solves captcha on login page
2. `GET /api/admin/captcha` generates question + JWT with answer
3. User submits username/password + captcha answer + JWT token
4. `POST /api/admin/login` verifies JWT answer, checks credentials
5. If valid, creates 8-hour admin session JWT
6. Sets HttpOnly cookie (secure in prod, lax sameSite)

**Captcha Verification:**
- Client sends JWT token + user's answer to login endpoint
- Server uses `verifyCaptchaToken(token, userAnswer)` to verify
- Validates JWT signature and checks embedded answer matches user input
- Prevents brute force and bot attacks

---

### Middleware Protection (`middleware.ts`)

**Route Protection Rules:**
```
GET /admin/* → Redirects to /admin/login if not authenticated
GET /admin/login → Redirects to /admin/dashboard if already authenticated
```

**Execution Flow:**
1. Extracts `admin_session` cookie from request
2. Verifies JWT token with `verifyAdminSessionToken(token)`
3. Allows/redirects based on route and authentication status
4. Uses edge runtime for performance

---

### Security Best Practices

| Practice | Implementation |
|----------|----------------|
| **HttpOnly Cookies** | Session stored in HttpOnly, Secure, SameSite=Lax |
| **CAPTCHA Protection** | Math captcha token-verified before login attempt |
| **Environment Secrets** | Uses `ADMIN_SESSION_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` |
| **Activity Logging** | All admin actions logged with timestamp, user-agent, entity info |
| **HTML Sanitization** | `sanitizeRichHtml()` used for user-generated content |
| **URL Sanitization** | `sanitizeExternalUrl()` validates external links |

---

## 5. Key Components and Their Roles

### Layout & Structure

| Component | File | Role |
|-----------|------|------|
| **RootLayout** | `app/layout.tsx` | Sets metadata, applies global styles, wraps with `ThemeProvider` |
| **ProfileInfo** | `components/server/ProfileInfo.tsx` | Server component rendering profile header with avatar, bio, action buttons |
| **PortfolioClient** | `components/PortfolioClient.tsx` | Main client component orchestrating tab switching and content display |

### Client Components

| Component | File | Purpose |
|-----------|------|---------|
| **TabSwitcher** | `components/client/TabSwitcher.tsx` | Animated tab navigation with slide transitions between tabs |
| **ThemeToggle** | `components/client/ThemeToggle.tsx` | Theme switch button with ripple animation and icon animation |
| **ActionButtons** | `components/client/ActionButtons.tsx` | CTA buttons: "Schedule Talk" (Cal.com integration), "Download Resume" |
| **SocialLinks** | `components/client/SocialLinks.tsx` | Social media icon links (LinkedIn, GitHub, Twitter, Facebook, Email) |
| **AppearingTextAnimation** | `components/client/AppearingTextAnimation.tsx` | Text fade-in animation utility component |
| **CustomContextMenu** | `components/client/CustomContextMenu.tsx` | Right-click context menu for content interactions |

### Admin Components

**Dashboard** (`app/admin/dashboard/page.tsx`) includes:
- **Content Management Tab:** CRUD operations for projects/activities with rich text editor
- **Notes Tab:** Create/edit/delete personal notes with tags
- **Activity Logs Tab:** View timestamped admin actions
- **Portfolio Settings Tab:** Manage grind counter statistics, usernames, skillset groups
- **CodeMirror Editor:** Syntax-highlighted code blocks with language support (JS, Python, HTML, CSS, Markdown)

---

## 6. Data Flow and Firebase Integration

### Firebase Setup (`lib/firebase.ts`)

**Database Structure:**
```
sucon-ba7b1 (Firebase Project)
├── content/                    # All projects and activities
├── activity_logs/             # Admin action audit trail
├── portfolio_settings/        # Global portfolio configuration
├── certificates/              # (Optional, may be stored in constants)
└── notes/                     # Admin notes (if used)
```

**Firebase Configuration:**
- Project ID: `sucon-ba7b1`
- Realtime Database URL: `https://sucon-ba7b1-default-rtdb.firebaseio.com`
- Public API Key embedded in client (Firebase accepts public keys)

---

### Content Data Flow

#### Public Data Flow (Browsing)

```
User visits app
    ↓
ContentProvider mounted
    ↓
subscribeToContent() → Firebase listener on /content
    ↓
Receive all items from database
    ↓
Filter into projects[] and activities[]
    ↓
PortfolioClient receives context
    ↓
Renders tabs with filtered data
```

**Real-time Updates:** Listener continues monitoring `/content` path; any changes trigger callback immediately

#### Admin Data Flow (Managing Content)

```
Admin submits form
    ↓
saveContent(item) / updateContent(id, item) / deleteContent(id)
    ↓
Firebase database write operation
    ↓
logActivity(action, entity, entityId, title) → Add audit log
    ↓
Firebase listener detects change
    ↓
ContentContext updates → Component re-renders
```

**Example: Create Project**
1. Admin fills form: title, date, description, imageUrl, type, tags, links
2. `saveContent()` pushes new document to `/content`
3. Firebase auto-generates UUID key
4. Activity logged: `{ action: "create", entity: "project", entityTitle: "..." }`
5. Dashboard subscription receives update
6. UI refreshes with new item in list

---

### Portfolio Settings Flow

```
Dashboard loads
    ↓
subscribeToPortfolioSettings() → Firebase listener on /portfolio_settings
    ↓
Receive settings object with grind stats, usernames, skillsets
    ↓
If settings don't exist → Create with defaultPortfolioSettings
    ↓
Merge incoming data with defaults (preserves unset values)
    ↓
Provide to PortfolioClient via prop
    ↓
Admin can updatePortfolioSettings()
    ↓
Firebase write → logActivity() → Listener triggers
```

**Default Settings Include:**
- Grind counter cards (Codeforces, GitHub stats)
- Grind ratings (max ratings, rankings)
- GitHub stats
- Skillset groups (frameworks, languages, tools, environment)
- Tab visibility toggles

---

### Activity Logging Flow

```
Admin action triggered (login, create, edit, delete, view)
    ↓
logActivity(action, entity, entityId, entityTitle) called
    ↓
Creates timestamp and captures userAgent
    ↓
Pushes to /activity_logs in Firebase
    ↓
Cleanup: If random < 0.1, run cleanupOldLogs() async
    ↓
cleanupOldLogs() keeps latest 30 logs, deletes older ones
    ↓
Dashboard subscription updates
    ↓
Activity table re-renders with new entry
```

**Logged Events:**
- `{ action: "login", entity: "auth", timestamp, userAgent }`
- `{ action: "create", entity: "project", entityId, entityTitle }`
- `{ action: "view", entity: "auth" }` (for failed logins)

---

### Engagement Metrics Flow

```
User views project card
    ↓
incrementViews(projectId) called
    ↓
Firebase: views[projectId] += 1
    ↓
Listener detects change
    ↓
ContentContext updates projects[]
    ↓
Card re-renders with new view count

User clicks like button
    ↓
incrementLikes(projectId) called
    ↓
Firebase: likes[projectId] += 1
    ↓
Similar update flow
```

---

## 7. State Management Summary

### Global State Sources

| State | Provider | Scope | Persistence |
|-------|----------|-------|-------------|
| **Theme** | ThemeContext | App-wide | localStorage |
| **Content** | ContentContext | All pages | Firebase (real-time) |
| **Portfolio Settings** | Props from dashboard | Dashboard only | Firebase |

### Component Local State

- **PortfolioClient:** `activeTab`, `projectViewMode`, `showBackButton`
- **Dashboard:** Form fields, editing state, messages/errors
- **ThemeProvider:** `isDarkMode`, `isTransitioning`, `ripple` animation state

---

## 8. File Organization

```
app/
├── page.tsx                      # Home page (Public)
├── projects/
│   ├── page.tsx                 # Projects listing
│   └── [share]/page.tsx         # Dynamic project detail
├── admin/
│   ├── login/page.tsx           # Login form with captcha
│   └── dashboard/page.tsx       # CMS dashboard
└── api/admin/
    ├── login/route.ts           # Auth endpoint
    ├── logout/route.ts          # Session clear
    └── captcha/route.ts         # Math captcha generation

lib/
├── firebase.ts                   # Firebase config + CRUD operations
├── context/
│   ├── ContentContext.tsx        # Content state management
│   └── ThemeContext.tsx          # Theme state management
├── security/
│   └── session.ts               # JWT token creation/verification
├── types.ts                      # TypeScript interfaces
├── constants.ts                 # Default data (certificates)
└── sanitize.ts                  # Security sanitization functions

components/
├── PortfolioClient.tsx           # Main portfolio renderer
├── server/
│   └── ProfileInfo.tsx           # Server-rendered profile header
└── client/
    ├── TabSwitcher.tsx           # Tab navigation
    ├── ThemeToggle.tsx           # Theme switch button
    ├── ActionButtons.tsx         # CTA buttons
    ├── SocialLinks.tsx           # Social icons
    ├── AppearingTextAnimation.tsx # Text animation
    └── CustomContextMenu.tsx      # Context menu
```

---

## 9. Key Data Types

```typescript
// Content
interface ContentItem {
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
  links?: { github?, website?, twitter?, youtube?, linkedin? };
}

// Admin
interface ActivityLog {
  id: string;
  action: "login" | "logout" | "create" | "edit" | "delete" | "view";
  entity: "project" | "activity" | "note" | "auth";
  entityId?: string;
  entityTitle?: string;
  timestamp: string;
  userAgent?: string;
}

// Portfolio Settings
interface PortfolioSettings {
  githubToken: string;
  grindUsernames: { codeforces, github };
  grindCards: GrindCounterCard[];
  grindRatings: GrindStatRow[];
  grindGithubStats: GrindStatRow[];
  skillsetGroups: SkillsetGroup[];
  tabVisibility: { certificates, projects, activity, grind, skillset };
}
```

---

## 10. Deployment & Environment

**Hosting:** Cloudflare Workers (via OpenNext adapter)
**Build:** `open-next build` → Cloudflare worker bundle
**Environment Variables Required:**
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- Firebase config (public, hardcoded)

**Analytics:** Vercel Analytics enabled

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Page: Home / Projects / Admin                │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │  ThemeProvider (Context)                       │ │  │
│  │  │  ├─ isDarkMode                                 │ │  │
│  │  │  └─ toggleTheme()                              │ │  │
│  │  │                                                │ │  │
│  │  │  ContentProvider (Context)                     │ │  │
│  │  │  ├─ projects[]                                 │ │  │
│  │  │  ├─ activities[]                               │ │  │
│  │  │  └─ isLoading                                  │ │  │
│  │  │      ↓ (useContent hook)                       │ │  │
│  │  │  PortfolioClient / Dashboard                   │ │  │
│  │  │  ├─ TabSwitcher                                │ │  │
│  │  │  ├─ Content Cards (projects/activities)        │ │  │
│  │  │  └─ Admin Forms (dashboard only)               │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTP/WebSocket
         ┌─────────────┼─────────────────┐
         │             │                 │
    ┌────▼──┐   ┌─────▼────┐    ┌──────▼─────┐
    │ POST   │   │ GET      │    │ GET        │
    │ /login │   │ /captcha │    │ /logout    │
    │        │   │          │    │            │
    └────┬──┘   └─────┬────┘    └──────┬─────┘
         │             │                │
    API Routes (Next.js Edge Runtime)
         │             │                │
    ┌────▼───────────┐ └────────┬──────┘
    │ Verify:        │          │
    │ ✓ Captcha JWT  │   Generate:    
    │ ✓ Username     │   ✓ Random numbers
    │ ✓ Password     │   ✓ Captcha JWT token
    │                │
    │ Create:        │
    │ ✓ Session JWT  │
    │ ✓ HttpOnly     │
    │   Cookie       │
    └────┬───────────┘
         │
         └────────────────┬──────────────────────────┐
                          │                          │
                    ┌─────▼─────────┐        ┌──────▼──────┐
                    │               │        │              │
              ┌─────▼──────────┐    │   ┌────▼─────────┐   │
              │ subscribeToX() │    │   │ Firebase SDK │   │
              │ Real-time      │    │   │ Database     │   │
              │ listeners      │    │   │              │   │
              └─────┬──────────┘    │   └────┬─────────┘   │
                    │               │        │              │
              ┌─────▼──────────┐    │   ┌────▼─────────┐   │
              │ /content       │    │   │ /activity    │   │
              │ /portfolio     │    │   │ _logs        │   │
              │ _settings      │    │   │              │   │
              │ /activity_logs │    │   │ (Realtime    │   │
              │                │    │   │ Database)    │   │
              └─────┬──────────┘    │   └──────────────┘   │
                    │               │                      │
                    └───────┬───────┘                      │
                            │                             │
                      ┌─────▼─────────────────────────────┘
                      │
                 Context Updated
                      │
                Component Re-renders
                      │
              Display Updated Data
```

---

## Summary: Key Patterns

1. **Real-time Subscriptions:** All data uses Firebase `onValue()` listeners for instant updates
2. **Context Caching:** Theme and content cached in React Context to avoid prop drilling
3. **Conditional Rendering:** Admin features behind JWT middleware; public pages always accessible
4. **Activity Trail:** Every admin action logged automatically for audit purposes
5. **Settings Merging:** Portfolio settings merge incoming data with defaults to handle partial updates
6. **Animations:** Framer Motion used for all transitions (tabs, theme toggle, component entrance)
7. **Security First:** Captcha → JWT login flow prevents brute force; HttpOnly cookies store sessions
