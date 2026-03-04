# Epic 25: Routing & Navigation

> **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Goal
Wire up all Phase 3 pages into the React Router route structure and build the app's navigation chrome — top bar, side navigation, and page transitions.

## Stories

| Story | Title | Description |
|-------|-------|-------------|
| 25.1 | Route Structure | All Phase 3 pages properly routed with clean URLs and navigation |
| 25.2 | Top Navigation Bar | Consistent navigation bar with breadcrumbs and key actions |
| 25.3 | Settings & Preferences | Settings page for user preferences, data management, and accessibility |

## Key Components
- `pages/HomePage.tsx` — gallery route (`/`)
- `pages/SharedCharacterView.tsx` — shared view route (`/share/:token`)
- `pages/SettingsPage.tsx` — settings route
- `components/layout/TopNav.tsx` — fixed top navigation bar

## Routes
| Route | Page | Description |
|-------|------|-------------|
| `/` | Home (Character Gallery) | Main entry point |
| `/character/new` | Creation Wizard | Phase 2 (already exists) |
| `/character/:id` | Character Sheet View | Default tab: Core Stats |
| `/character/:id/edit` | Character Sheet Edit | Or query param `?mode=edit` |
| `/share/:token` | Shared Character View | Read-only (public, no auth required) |
| `/login` | Login Page | Authentication entry point |
| `/import` | Import Character | Modal overlay or dedicated page |

## Dependencies
- Phase 2: Creation wizard routes (already exist)
- Epic 17-19: Character sheet pages (route targets)
- Epic 21: Gallery page (home route)
- Epic 22: Import/share routes

## Notes
- Scaffold routes early, flesh out as pages are built
- Page transitions: slide-in from right (deeper), slide-in from left (back) using framer-motion
- Browser back button works intuitively: sheet to gallery, edit mode to view mode
- 404 handling for non-existent character IDs
- Breadcrumbs dynamically update based on current route
- Mobile: hamburger menu with slide-out drawer
- Settings stored via Django REST API user preferences endpoint; authenticated routes protected by login redirect

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 25.1 — Route Structure | 2 | 8 | 3 | 13 |
| 25.2 — Top Navigation Bar | 0 | 11 | 2 | 13 |
| 25.3 — Settings & Preferences | 3 | 16 | 2 | 21 |
| **Totals** | **5** | **35** | **7** | **47** |

### Key Gaps Found
- **Accessibility**: Missing ARIA labels for navigation bar, breadcrumbs, hamburger menu, and settings form controls. No keyboard navigation for mobile drawer. No focus management on page transitions
- **Error Handling**: Missing specification for corrupted URL parameters, API preferences write failure, authentication redirect errors, and settings loading failure
- **Edge Cases**: Very long character names in breadcrumbs (truncation), deep linking behavior, "Export All Data" with very large databases
- **Loading/Empty States**: No settings loading state while preferences are fetched from the API
