# Story 32.1 — Compact Session Mode

> **Epic 32: Session Play Compact View** | **Phase 4: Session Play Features** (Weeks 7-8)

## Description

As a player using my phone at the table, I need a streamlined view that shows my key stats, attacks, and spell slots without scrolling through the full character sheet. The compact session mode is a single-screen layout optimized for at-the-table play, with all key information visible and all values interactive (tap to roll, tap to expend, tap to damage/heal).

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard), Phase 3 (character sheet 3-page display, gallery, import/export, view/edit mode with auto-save)

### Session Mode Layout (Top to Bottom)

The compact session view fits on a single mobile screen (~640px viewport) with the following sections:

**1. Top Strip (compact header)**
- Character name (truncated if long)
- Level and class (e.g., "Lv 5 Fighter")
- AC badge (large, tappable)
- Speed badge (e.g., "30 ft")

**2. HP Bar (full width, large)**
- Current HP / Max HP in large text with color gradient
  - Green: >50% HP
  - Yellow: 25-50% HP
  - Red: <25% HP
  - Gray: 0 HP
- Temp HP overlay (blue tint) if present
- Tap to open damage/heal modal (same as Story 27.1)

**3. Quick Actions Row (four large icon buttons)**
- **Roll d20:** Opens dice panel with a quick d20 roll
- **Short Rest:** Opens Short Rest modal (Story 30.1)
- **Long Rest:** Opens Long Rest modal (Story 30.2)
- **Conditions:** Opens condition add/remove dropdown (Story 29.2)

**4. Attacks Section (card per weapon/cantrip)**
- Each attack shows: weapon/cantrip name, attack bonus (e.g., "+7"), damage expression (e.g., "1d8+4")
- Tap to roll attack + auto-chain to damage (Story 26.5)
- Compact card layout, maximum 4 visible with scroll for more

**5. Spell Slots Strip (compact horizontal)**
- All slot levels in a single row
- Each slot is a small filled/empty circle
- Tap to expend (Story 28.1)
- Cantrip list as text below

**6. Key Abilities (pinned skills and saves)**
- Player-selected "pinned" skills and saves (up to 8 per character, configured via a settings modal, stored in character data)
- Default: class primary skills + Perception + Stealth + Athletics
- Each shows: skill name, modifier (large, tappable to roll), proficiency dot
- Grouped by ability score with ability abbreviation as section header

**7. Conditions Strip**
- Active condition badges (same as Story 29.1)
- Compact display, scrollable horizontally

**8. Features with Uses**
- Compact list of limited-use features with usage counters (filled/empty circles)
- From Story 30.3

### Activation
- Auto-activates when viewport is <=640px AND in view mode
- Manual toggle via "Session Mode" button in the character sheet header
- "Full Sheet" toggle at the bottom returns to the complete character sheet

### Interactivity
Every value is interactive:
- Tap a skill -> roll 1d20 + modifier
- Tap a spell slot circle -> expend/recover
- Tap an attack -> roll attack + damage
- Tap HP bar -> open damage/heal modal
- Long-press any stat -> show computation breakdown tooltip

## Tasks

- [ ] **T32.1.1** — Create `components/session/SessionView.tsx` — a compact single-screen layout accessible via a "Session Mode" toggle in the character sheet header (or auto-activated when the viewport is <=640px and in view mode)
- [ ] **T32.1.2** — Session view layout (top to bottom):
  - **Top strip:** Character name, level, class. AC and Speed badges
  - **HP bar:** large, spanning full width. Current HP / Max HP with color gradient. Temp HP overlay. Tap to open damage/heal modal
  - **Quick Actions row:** four large icon buttons — Roll d20, Short Rest, Long Rest, Conditions
  - **Attacks section:** card per weapon/cantrip showing name, attack bonus, and damage. Tap to roll attack + damage
  - **Spell Slots strip:** compact horizontal display of all slot levels. Tap a slot to expend. Shows cantrip list as text
  - **Key abilities:** most-used skills and saves (customizable: player picks their "pinned" skills/saves, default to class primary + Perception + Stealth + Athletics)
  - **Conditions strip:** active condition badges (same as full sheet)
  - **Features with uses:** compact list of limited-use features with usage counters
- [ ] **T32.1.3** — All values are interactive: tap a skill to roll, tap a spell slot to expend, tap an attack to roll, tap HP to damage/heal
- [ ] **T32.1.4** — "Full Sheet" toggle at the bottom: switches back to the complete character sheet view
- [ ] **T32.1.5** — Long-press on any stat opens a tooltip with the computation breakdown (same tooltips as the full sheet)

## Acceptance Criteria

1. Session view is a single-screen compact layout optimized for mobile (640px)
2. All 8 layout sections are present: header, HP bar, quick actions, attacks, spell slots, key abilities, conditions, features
3. Auto-activates on viewports <=640px in view mode
4. Manual toggle via "Session Mode" button in character sheet header
5. HP bar is full-width with color gradient and tap-to-damage/heal functionality
6. Quick action buttons open the correct modals (dice, short rest, long rest, conditions)
7. Attacks are tappable to roll attack + damage
8. Spell slot circles are tappable to expend/recover
9. Pinned skills/saves are tappable to roll
10. Condition badges display active conditions
11. Feature usage counters show remaining/expended uses
12. "Full Sheet" toggle returns to the complete character sheet
13. Long-press on any stat shows computation breakdown tooltip
14. All information fits on a single screen without scrolling (for typical characters)

## Dependencies

- Epic 26 (Dice Roller) for roll integration
- Epic 27 (HP Tracker) for HP bar and damage/heal modal
- Epic 28 (Spell Slot Tracker) for spell slot expend/recover
- Epic 29 (Conditions Tracker) for condition badges
- Epic 30 (Rest Automation) for short/long rest modals and feature usage counters
- Story 32.2 (Pinned Skills) for customizable key abilities
- Phase 3 character sheet components

## Notes

- This view is the culmination of all Phase 4 features -- it integrates every preceding epic
- Fitting everything on a single screen is a design challenge -- prioritize the most-used elements
- The auto-activation on mobile is important because mobile players shouldn't have to know about session mode
- Consider using a bottom sheet pattern for sections that need more space (e.g., attacks list)
- The session view should feel fast and responsive -- no animations that slow down interaction during combat
