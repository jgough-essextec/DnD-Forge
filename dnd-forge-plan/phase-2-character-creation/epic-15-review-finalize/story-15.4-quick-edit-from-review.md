# Story 15.4 — Quick Edit from Review

> **Epic 15: Review & Finalize Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a player reviewing my character, I need to make last-minute tweaks without navigating all the way back through the wizard. This story adds inline edit icons on each section of the character preview, a quick-edit modal that renders the appropriate step component, and inline character name editing.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, Dexie.js database layer, Zustand stores, dice engine
- **Quick Edit Approach**: Each section of the character preview (ability scores, equipment, spells, background, etc.) has an edit icon. Clicking it opens a modal that renders the corresponding wizard step component. Saving within the modal updates the wizard store and immediately recalculates the preview
- **Modal Component**: QuickEditModal wraps any step component in a dialog overlay. The step component works the same as in the wizard flow but renders in a modal context
- **Inline Name Edit**: The character name in the review header is directly editable — clicking it turns it into an inline text input
- **Recalculation on Edit**: After any edit, the calculation engine re-runs to update all derived stats in the preview (e.g., changing ability scores recalculates modifiers, AC, HP, attack bonuses, spell save DC)

## Tasks

- [ ] **T15.4.1** — Add inline edit icons on each section of the character preview. Clicking the edit icon on the ability score section opens a modal with the ability score interface. Clicking edit on equipment opens the equipment modal, etc.
- [ ] **T15.4.2** — Create `components/wizard/review/QuickEditModal.tsx` — a modal wrapper that renders the appropriate step component in a dialog. On save within the modal, the preview immediately updates with recalculated stats
- [ ] **T15.4.3** — Character name should be directly editable in the review header (inline text edit on click)

## Acceptance Criteria

- Each section of the character preview has an edit icon (pencil or similar)
- Clicking an edit icon opens a modal with the corresponding wizard step component
- The modal step component works the same as in the wizard flow (same data, same interactions)
- Saving changes within the modal updates the wizard store and immediately recalculates the preview
- Character name is directly editable in the review header via inline text editing
- After any edit, all derived stats are recalculated and the preview updates

## Dependencies

- **Depends on:** Story 15.1 (character preview — edit icons are added to the preview sections), All step component stories (9-14 — modal renders these components), Phase 1 calculation engine (for recalculation after edits)
- **Blocks:** Nothing — this is an enhancement to the review flow

## Notes

- The QuickEditModal should be large enough to comfortably render step components (at least 80% of viewport height on desktop, full screen on mobile)
- The modal should have "Save Changes" and "Cancel" buttons. "Cancel" discards changes and closes the modal; "Save Changes" persists to the wizard store and closes the modal
- After saving changes in the modal, the review should smoothly update — consider a brief animation or highlight on the changed sections
- Edit sections should map to wizard steps:
  - Race/subrace section -> Race Step (Step 1)
  - Class/subclass section -> Class Step (Step 2)
  - Ability scores section -> Ability Score Step (Step 3)
  - Background/personality section -> Background Step (Step 4)
  - Equipment section -> Equipment Step (Step 5)
  - Spellcasting section -> Spellcasting Step (Step 6)
- Cascade effects: editing race may affect ability scores (racial bonuses) and skills (overlap). The modal should warn if changes cascade to other sections
- Inline name editing should be simple: click name -> text input appears -> press Enter or click away to save
