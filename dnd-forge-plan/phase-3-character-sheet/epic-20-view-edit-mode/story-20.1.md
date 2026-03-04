# Story 20.1 — Mode Toggle & Visual Differentiation

> **Epic 20: View / Edit Mode Toggle System** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a player, I need a clear way to switch between reading my character sheet and editing it, with obvious visual cues for which mode I'm in.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **View Mode vs. Edit Mode (Gap S6)**: Two distinct UX paradigms:
  - View mode: clean typography, no visible form controls, optimal information density, parchment-like backgrounds, click-to-roll on skills/saves/attacks
  - Edit mode: smart form, every value becomes interactive, inline validation, visible calculation engine, subtle field borders/highlights
- **Transition**: Must be seamless — maintain scroll position, no jarring full re-render, 200ms cross-fade
- **Mode Toggle**: Prominent button in top-right corner with eye icon (View) and pencil icon (Edit)
- **Keyboard Shortcuts**: Ctrl+E / Cmd+E to toggle, Escape to exit edit mode (with save prompt)
- **First-Time Help**: Dismissable banner explaining edit mode on first use

## Tasks
- [ ] **T20.1.1** — Create `components/character/ModeToggle.tsx` — a prominent toggle button in the top-right corner of the character sheet header. States: "View" (eye icon) and "Edit" (pencil icon). Current mode shown with active styling
- [ ] **T20.1.2** — **View mode styling:** clean text rendering, no visible form borders, parchment-like backgrounds on text blocks, proficiency dots are static, numbers are plain text. Optimize for readability and information density
- [ ] **T20.1.3** — **Edit mode styling:** all editable fields gain a subtle bottom border or background highlight (bg-surface tint). Hover states on all interactive elements. Edit icons appear next to sections. A persistent "Unsaved changes" indicator shows in the header if changes exist
- [ ] **T20.1.4** — Mode transition animation: cross-fade (200ms) between view and edit states. Preserve scroll position during the transition
- [ ] **T20.1.5** — Keyboard shortcut: `Ctrl+E` / `Cmd+E` toggles between modes. `Escape` exits edit mode (with a save prompt if there are unsaved changes)
- [ ] **T20.1.6** — When entering edit mode, show a brief help banner (dismissable, only first time): "You're now editing. Changes auto-save. Click any value to modify it."

## Acceptance Criteria
- Mode toggle button displays in the top-right corner with appropriate icon (eye/pencil)
- Current mode is clearly indicated with active styling
- View mode renders clean text with no visible form controls
- Edit mode shows field borders, hover states, and edit icons
- "Unsaved changes" indicator appears in the header during edit mode when changes exist
- Mode transition uses a 200ms cross-fade and preserves scroll position
- Ctrl+E / Cmd+E keyboard shortcut toggles between modes
- Escape key exits edit mode with a save prompt if unsaved changes exist
- First-time help banner appears when entering edit mode (dismissable, shown only once)

## Dependencies
- Phase 1 state management (Zustand) for mode state
- Phase 2 character data in IndexedDB

## Notes
- This is a foundational story for the entire character sheet — all other sheet components depend on the mode toggle system
- The mode state should be managed at the CharacterSheet level and passed down via context or props
- Some fields are always editable regardless of mode: current HP, spell slot tracking, currency
- The URL can optionally reflect the mode: `/character/:id` for view, `/character/:id/edit` for edit (or `?mode=edit`)
- Gap S6 emphasizes that these are two distinct UX paradigms — the visual difference must be immediately obvious
