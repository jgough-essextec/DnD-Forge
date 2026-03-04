# Story 27.3 — Compact HP Widget (Session Play)

> **Epic 27: HP Tracker** | **Phase 4: Session Play Features** (Weeks 7-8)

## Description

As a player on mobile during a session, I need a compact HP tracker visible without scrolling through the full character sheet. The compact HP widget is a sticky floating element at the bottom of the mobile character sheet that shows HP, AC, and provides quick damage/heal tap targets -- always visible regardless of which page or section of the character sheet is being viewed.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard), Phase 3 (character sheet 3-page display, gallery, import/export, view/edit mode with auto-save)

### Widget Design
The compact HP widget is designed for at-the-table mobile play where the player needs to:
1. See current HP at a glance without scrolling
2. Quickly apply damage or healing with minimal taps
3. See AC for reference when the DM asks
4. Monitor temp HP if present

### Widget Layout
- **Position:** Sticky floating at the bottom of the mobile character sheet view, above the dice roller FAB
- **Full display:** Current HP / Max HP (large text), temp HP badge (if nonzero), AC badge, shield icon (take damage), heart icon (heal)
- **Minimized display:** Thin bar showing just "HP: 25/35 | AC: 16"
- **Collapse/expand:** Swipe down to minimize, swipe up to expand

### Persistence Across Tabs
The widget must remain visible when the user switches between character sheet tabs (Core Stats, Backstory, Spells). It is a floating overlay, not part of any specific tab's content.

## Tasks

- [ ] **T27.3.1** — Create `components/session/CompactHPWidget.tsx` — a sticky floating widget at the bottom of the mobile character sheet view (above the FAB). Shows: current HP / max HP in large text, temp HP badge (if nonzero), AC badge, and two large tap targets: shield icon (take damage) and heart icon (heal)
- [ ] **T27.3.2** — The compact widget triggers the same damage/heal modal as the full HP block
- [ ] **T27.3.3** — Widget is collapsible: swipe down to minimize to a thin bar showing just "HP: 25/35 | AC: 16"
- [ ] **T27.3.4** — The widget persists across tab changes within the character sheet (stays visible whether on Core Stats, Backstory, or Spells tab)

## Acceptance Criteria

1. Compact HP widget is a sticky floating element at the bottom of the mobile character sheet view
2. Widget displays: current HP / max HP in large text, temp HP badge (if nonzero), AC badge
3. Shield icon tap target opens the Take Damage tab of the damage/heal modal
4. Heart icon tap target opens the Heal tab of the damage/heal modal
5. Widget uses the same damage/heal logic as the full HP block (Story 27.1)
6. Widget is collapsible via swipe down to a minimal "HP: 25/35 | AC: 16" bar
7. Swipe up on the minimal bar expands back to the full widget
8. Widget persists across character sheet tab changes (Core Stats, Backstory, Spells)
9. Widget is positioned above the dice roller FAB (no overlap)

## Dependencies

- Story 27.1 (Damage & Healing Input) for the shared damage/heal modal and logic
- Story 27.2 (Temporary HP) for temp HP display
- Phase 3 character sheet tab layout

## Notes

- This widget is the most-used UI element during actual play sessions on mobile
- The widget must not overlap with the dice roller FAB button (Story 26.1)
- On desktop viewports, this widget may be unnecessary since the full HP block is visible -- consider showing it only on mobile/small tablets
- This widget is also integrated into the Session Compact View (Epic 32, Story 32.1)
