# Cleanup and Performance Optimization Report

This document outlines the changes made to make the portfolio application "lite and fast" while maintaining scalability and core features.

## 1. Removed Bloated Dependencies
- **CodeMirror (@uiw/react-codemirror, @codemirror/*):** Removed the heavy code editor library. For a portfolio, a full editor is overkill. Replaced with simple, light syntax highlighting or standard pre/code blocks.
- **KaTeX:** Removed math rendering support as it wasn't actively used in the content and adds significant bundle size.
- **Cal.com (@calcom/embed-react):** Removed the booking embed dependency. Replaced the modal-based scheduling with a direct link to the Cal.com page, eliminating a heavy third-party script and improving initial load speed.
- **Next-Cloudinary:** Removed unused Cloudinary integration as images were either local or direct URLs.

## 2. CSS & Animation Optimizations
- **Global Transition Removal:** Removed the `* { transition: ... }` rule in `globals.css` and `layout.tsx`. This is a critical performance fix as it prevents the browser from calculating transitions for every single element on the page, significantly reducing CPU usage during scrolls and interactions.
- **Improved Theme Transitions:** Specifically targeted core components (body, nav, buttons) for transitions instead of a global blanket rule.
- **Framer Motion Tuning:** Reduced the complexity of animation variants and staggered children to ensure smoother frame rates on lower-end devices.
- **User Select Restore:** Removed `user-select: none` from the root to improve accessibility and user experience.

## 3. Architecture & Data consolidation
- **Single Source of Truth:** Consolidated `GRIND_COUNTER_CARDS` and stats. These are now purely dynamic (fetched from Firebase/APIs) with minimal placeholders, preventing bundle bloat from duplicated hardcoded data.
- **Type Cleanup:** Removed `katex-auto-render.d.ts` and other unused type definitions.
- **Clean Constants:** Stripped all commented-out legacy code from `lib/constants.ts`.

## 4. Unused Code Removal
- Removed commented-out blocks in `lib/constants.ts`.
- Removed unused imports and types.
