# Frontend Architecture — NIRNAY

## 1. Overview & Directory Structure

The NIRNAY web application is built with **Next.js 16.3.5** using the App Router, **React 19.2.8**, and **TailwindCSS ^4.0**.

```
apps/web/src/
  ├── app/                  # Next.js App Router routes & pages
  │   ├── app/              # Authenticated workspace shell
  │   │   ├── admin/        # Admin management pages
  │   │   ├── challenges/   # Challenge intake & passport detail
  │   │   ├── commitments/  # Institutional commitment portal
  │   │   ├── evaluation/   # Jury evaluation workspace
  │   │   ├── hei-matching/ # HEI capability directory & matching
  │   │   ├── outcomes/     # Outcome assessment page
  │   │   ├── pilots/       # Pilot execution tracking
  │   │   ├── qualification/# Problem Qualification Gate
  │   │   ├── readiness/    # Pilot Readiness Gate
  │   │   └── review/       # Nodal Review Queue
  │   ├── challenges/       # Public challenge directory
  │   ├── demo/             # Golden Jury Mode launchpad
  │   ├── login/            # Login page
  │   └── register/         # User registration page
  ├── components/           # UI components
  │   ├── guidance/         # Guided Mission Mode components
  │   ├── AppShell.tsx      # Main layout shell with responsive topbar
  │   ├── LanguageSwitcher.tsx
  │   ├── FloatingLanguageWidget.tsx
  │   └── NirnayLogo.tsx    # Multi-fallback logo component
  └── lib/                  # Utilities, context, API client
      ├── api.ts            # API client wrapper with demo fallback
      ├── auth-context.tsx  # Authentication & session provider
      ├── language-context.tsx # Multilingual translation engine (8 languages)
      └── guidance/         # Guided Mission Mode registry & storage
```

---

## 2. Key Architecture Features

### A. Responsive Header & Navigation Shell
- `AppShell.tsx` provides a unified, responsive top header bar across all authenticated pages.
- Dynamically hides longer labels on smaller desktop viewports (`1024px` to `1280px`) while preserving action controls (`Guided Mode`, `Language Switcher`, `Jury Evaluation`, `Sign Out`).
- Prevents line-wrapping and element overlap across all screen sizes.

### B. Multilingual Translation Engine
- Client-side `LanguageProvider` (`lib/language-context.tsx`) supporting 8 Indian languages: English (`EN`), Hindi (`HI`), Tamil (`TA`), Telugu (`TE`), Marathi (`MR`), Gujarati (`GU`), Bengali (`BN`), and Kannada (`KN`).
- Non-colliding `FloatingLanguageWidget` fixed at `bottom-5 right-5` for global accessibility.

### C. Guided Mission Mode Engine
- Modular components (`GuidedModeButton`, `GuidedModePanel`, `GuidanceOverlay`, `MissionNavigator`, `PageContext`, `WhyStageDialog`, `GuidanceWelcome`).
- Viewport-relative target measurement (`getBoundingClientRect()`) for spotlight ring highlights.
- Supports `👁️ View Page` mode to temporarily hide the dark overlay for full-page interaction.
