# Story 15.4 — Quick Edit from Review

> **Epic 15: Review & Finalize Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a player reviewing my character, I need to make last-minute tweaks without navigating all the way back through the wizard. This story adds inline edit icons on each section of the character preview, a quick-edit modal that renders the appropriate step component, and inline character name editing.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, React Query API layer, Zustand stores (UI state), dice engine
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

## Testing Requirements

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should display an edit icon on each section of the character preview`
- `should open a modal with the corresponding wizard step component when edit icon is clicked`
- `should render the modal step component with the same data and interactions as the wizard flow`
- `should update wizard store and immediately recalculate derived stats when Save Changes is clicked in modal`
- `should discard changes and close the modal when Cancel is clicked`
- `should make character name directly editable in the review header via inline text editing`
- `should recalculate all derived stats after any edit and update the preview`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should click edit on ability scores section, change a score in the modal, save, and see updated modifiers in preview`
- `should edit character name inline in the review header and see it updated`
- `should click edit on equipment, change armor, and see AC recalculated in the preview`

### Test Dependencies
- Mock all step components (9-14) for modal rendering
- Mock Phase 1 calculation engine for recalculation on edit
- Mock wizard store for state updates from modal edits
- Complete character preview state fixture

## Identified Gaps

- **Error Handling**: No specification for what happens if a cascade effect from editing one section invalidates another section
- **Accessibility**: No keyboard focus management for modal open/close; no ARIA labels for edit icons or inline name editing
- **Mobile/Responsive**: Modal is specified as 80% viewport on desktop, full screen on mobile, but no detail on scroll behavior within the modal
- **Edge Cases**: Editing race in the modal may cascade to ability scores, skills, and spells; the cascade warning behavior inside the modal is not specified

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
