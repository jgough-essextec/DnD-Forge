# Epic 43: Progressive Web App (PWA)

> **Phase 6: Polish & Export** | Weeks 11-12

## Goal

Make the app installable on any device (desktop, mobile) with full offline functionality. All features must work without an internet connection after the initial load, since the app is local-first with IndexedDB storage.

## Stories

| Story | Title | Tasks | Focus |
|-------|-------|-------|-------|
| 43.1 | Service Worker & Offline Caching | 5 | vite-plugin-pwa setup, caching strategy, offline verification, SRD pre-caching, update flow |
| 43.2 | Web App Manifest | 5 | Manifest configuration, app icons, iOS meta tags, splash screens, install prompt |
| 43.3 | Offline UX Indicators | 4 | Network status badge, data safety messaging, feature availability, first-time offline experience |

## Technical Approach

- **vite-plugin-pwa:** Configures service worker with Workbox strategies
- **Pre-cache Strategy:** App shell + SRD data files pre-cached on install for full offline support
- **Runtime Caching:** CacheFirst for SRD Tier 2/3/4 data, NetworkFirst ready for future sync features
- **Update Flow:** Prompt-based (never auto-reload mid-session), non-intrusive toast notification
- **Install Prompt:** Custom banner using beforeinstallprompt event, dismissable

## Dependencies

- Epic 42 (Performance) should be complete first — don't cache bloated bundles
- Story 43.3 depends on Story 43.1 (service worker must work before offline UX)

## Key Deliverables

- Service worker with full offline caching (all assets + SRD data)
- Web app manifest with proper icons (192x192, 512x512, 180x180, favicons, maskable)
- iOS-specific meta tags for Apple web app support
- Custom install prompt component
- Network status indicator (online/offline badge)
- "Changes saved locally" reassurance messaging
- First-time cache completion tracking
