# Story 8.3 — Freeform Creation Mode

> **Epic 8: Wizard Framework & Navigation** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As an experienced player, I need a blank character sheet where I can fill in whatever I want in any order, with auto-calculation of derived stats but no enforced step sequence. This story builds a full editable character sheet as a single scrollable form with collapsible accordion sections, real-time derived stat calculations, non-blocking validation (warnings not errors), quick-fill presets, and the ability to switch to guided mode.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, Dexie.js database layer, Zustand stores, dice engine
- **Freeform Mode**: A parallel creation path to the guided wizard. All sections are visible at once as collapsible accordion sections. The same data picker components (race selector, class selector, spell browser, etc.) are embedded inline as form elements rather than wizard steps
- **Validation Approach**: Warnings (yellow badges) rather than blocking errors. The user can save an incomplete character at any time. The save button shows "Save (3 warnings)" if there are validation issues
- **Derived Stats**: Real-time computation via the Phase 1 calculation engine. A sticky sidebar (desktop) or collapsible panel (mobile) shows live AC, HP, initiative, proficiency bonus, spell save DC, and attack bonuses
- **Quick Fill Presets**: Common character builds that auto-populate multiple sections at once (e.g., "Standard Fighter" fills race=Human, class=Fighter, standard array optimally assigned, background=Soldier)

## Tasks

- [ ] **T8.3.1** — Create `components/wizard/FreeformCreation.tsx` — renders a full editable character sheet as a single scrollable form. Sections correspond to the same groupings as the wizard steps but are all visible at once as collapsible accordion sections: Race & Species, Class & Level, Ability Scores, Background & Personality, Equipment & Inventory, Spellcasting (if applicable), Description & Backstory
- [ ] **T8.3.2** — Each section header shows a completion indicator: green checkmark if all required fields are filled, yellow warning triangle if partially complete, empty circle if not started
- [ ] **T8.3.3** — Embed the same data picker components used in the wizard steps (race selector, class selector, spell browser, etc.) as inline form elements within each section
- [ ] **T8.3.4** — Implement real-time derived stat calculation: as the user fills in fields, a sticky "Computed Stats" sidebar (desktop) or collapsible panel (mobile) shows the live AC, HP, initiative, proficiency bonus, spell save DC, and attack bonuses — all updating as fields change
- [ ] **T8.3.5** — Implement validation as warnings (yellow badges), not blocking errors. The user can save an incomplete character from freeform mode at any time — the save button shows "Save (3 warnings)" if there are validation issues
- [ ] **T8.3.6** — Add a "Switch to Guided Mode" link that opens the wizard at Step 1, pre-populating from any freeform data already entered. Show a confirmation dialog since the freeform layout will be replaced
- [ ] **T8.3.7** — Add a "Quick Fill" dropdown for each section that auto-populates with common presets (e.g., "Standard Fighter" fills race=Human, class=Fighter, standard array assigned optimally, background=Soldier)

## Acceptance Criteria

- Freeform mode renders as a single scrollable page with collapsible accordion sections for each creation category
- All sections are accessible in any order — no enforced step sequence
- Each section header shows a completion indicator (checkmark, warning triangle, or empty circle)
- The same data picker components from the wizard steps are embedded inline within each section
- A sticky "Computed Stats" sidebar (desktop) or collapsible panel (mobile) shows live derived stats that update in real-time as fields change
- Validation issues appear as yellow warning badges, not blocking errors
- An incomplete character can be saved at any time with the save button showing the warning count
- "Switch to Guided Mode" opens the wizard at Step 1 with freeform data pre-populated, after a confirmation dialog
- "Quick Fill" presets auto-populate multiple sections with common character builds

## Dependencies

- **Depends on:** Story 8.1 (Wizard Shell — freeform mode is an alternative path within the wizard), Story 8.2 (Intro Step — freeform is entered from the mode selection), Phase 1 calculation engine (for derived stats), all step component Epics (9-14) for embedded data picker components
- **Blocks:** Story 15.3 (save logic is shared between freeform and guided modes)

## Notes

- Freeform mode reuses the same underlying data picker components as the guided wizard — the difference is layout and flow, not functionality
- The "Computed Stats" sidebar should be performant — debounce recalculations to avoid lag on every keystroke
- Quick Fill presets should be extensible — consider defining them as JSON configuration so new presets can be added easily
- The accordion sections should remember their open/closed state during the session
- Freeform mode persists to the same Zustand wizard store as guided mode, so switching between modes preserves all entered data
- Consider lazy-loading sections that are collapsed to improve initial render performance
- The Spellcasting section should only be visible/expanded if the selected class is a spellcaster at level 1
