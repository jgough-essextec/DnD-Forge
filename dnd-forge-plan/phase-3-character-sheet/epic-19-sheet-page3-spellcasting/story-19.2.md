# Story 19.2 — Cantrips Section

> **Epic 19: Character Sheet — Page 3 (Spellcasting)** | **Phase 3: Character Sheet & Management** (Weeks 5-6)

## Description
As a spellcaster, I need to see my cantrips listed at the top of the spell page.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard — guided and freeform modes)
- **Cantrips**: Level 0 spells that can be cast unlimited times (no spell slots). Each class has a maximum number of cantrips known based on class and level
- **Cantrip Display**: Each cantrip shows name, casting time icon, range, and brief description preview. Clicking expands to full spell detail
- **SpellDetailCard**: Reusable component from Phase 2 that shows full spell information
- **Edit Mode**: Add/remove cantrips with validation against maximum cantrips known for the class/level
- **Cantrips Known by Class (Level 1)**: Wizard 3, Cleric 3, Bard 2, Druid 2, Sorcerer 4, Warlock 2

## Tasks
- [ ] **T19.2.1** — Create `components/character/page3/CantripList.tsx` — a section labeled "Cantrips" with all known cantrips listed. Each cantrip shows: name, casting time icon, range, and a brief description preview
- [ ] **T19.2.2** — Clicking a cantrip name expands to show the full spell detail card (reuse `SpellDetailCard` from Phase 2)
- [ ] **T19.2.3** — **Edit mode:** "Add Cantrip" button opens the spell browser filtered to cantrips for the class. "Remove" button on each cantrip. Validate against the maximum cantrips known for class/level

## Acceptance Criteria
- Cantrips section displays at the top of the spell page with a "Cantrips" label
- Each cantrip shows name, casting time icon, range, and brief description preview
- Clicking a cantrip expands to show the full spell detail card
- Edit mode provides "Add Cantrip" button that opens spell browser filtered to class cantrips
- Edit mode provides "Remove" button on each cantrip
- Adding cantrips validates against the maximum cantrips known for the class/level
- Cantrip list reflects the character's chosen cantrips from the creation wizard

## Dependencies
- Story 19.1 (Spellcasting Header) — cantrips section is part of the spellcasting page
- Phase 1 SRD spell data for cantrip details
- Phase 2 SpellDetailCard component for expanded spell view
- Phase 2 spell browser for the "Add Cantrip" picker
- Epic 20 view/edit mode toggle system

## Notes
- Cantrips are always available (no spell slots needed) — they're the most frequently used spells
- The maximum cantrips known varies by class and level — validation must use the correct table
- Some cantrips are attack cantrips (e.g., Fire Bolt, Sacred Flame) and also appear in the Attacks section on Page 1
- Cantrips can scale with character level (e.g., Fire Bolt does 1d10 at level 1, 2d10 at level 5) — show the current damage in the description
