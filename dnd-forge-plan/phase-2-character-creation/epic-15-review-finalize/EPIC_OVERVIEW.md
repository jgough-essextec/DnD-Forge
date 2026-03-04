# Epic 15: Review & Finalize Step
> **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Summary

A comprehensive review screen that shows the complete character sheet with all computed values, highlights any validation issues, and enables the player to save the character to the database. Provides a 3-page character sheet preview (core stats, backstory/details, spellcasting), a validation summary with fix links, save/assembly with celebration animation, and quick-edit modals for last-minute tweaks.

## Stories

| # | Story | Tasks | Description |
|---|-------|-------|-------------|
| 15.1 | Character Sheet Preview | 6 | Full 3-page character sheet preview with all derived stats computed by the calculation engine, dark fantasy styling |
| 15.2 | Validation Summary | 4 | Full character validation with errors/warnings/info, fix links back to relevant steps, save button gating |
| 15.3 | Save & Character Assembly | 6 | Character assembly from wizard state, save via Django REST API, success celebration, save-and-create-another, error handling |
| 15.4 | Quick Edit from Review | 3 | Inline edit icons on preview sections, quick-edit modal wrapper, inline name editing |

## Technical Scope

- **ReviewStep.tsx** — Step 7 container using calculation engine for all derived stats
- **CharacterPreview.tsx** — Read-only 3-page character sheet preview
- Page 1: Core stats (abilities, saves, skills, AC, HP, attacks, spellcasting summary, personality)
- Page 2: Backstory & details (appearance, backstory, allies, equipment, currency)
- Page 3: Spellcasting (class, ability, DC, attack bonus, cantrips, spell slots, spell list)
- **QuickEditModal.tsx** — Modal wrapper rendering step components for inline editing
- Full `validateCharacter()` integration with errors, warnings, and info messages
- Character assembly via wizard store `finalize()` method
- React Query mutation calling Django REST API `POST /api/characters/` for persistence to PostgreSQL
- Success celebration animation (confetti or themed splash)
- Dark fantasy styling (parchment textures, Cinzel headings)

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 15.1 — Character Sheet Preview | 7 | 6 | 3 | 16 |
| 15.2 — Validation Summary | 4 | 8 | 2 | 14 |
| 15.3 — Save & Character Assembly | 5 | 6 | 3 | 14 |
| 15.4 — Quick Edit from Review | 0 | 7 | 3 | 10 |

### Key Gaps Found
- Missing error handling for incomplete wizard state on review entry and validateCharacter() crashes
- No loading state while calculation engine computes all derived stats
- ARIA live regions not specified for validation announcements; keyboard focus management for modals and Fix links not addressed
- JSON export fallback format/mechanism on API save failure not specified
- API error handling (network failures, server errors, validation errors) incomplete
- No render time targets for derived stat computation
- Quick-edit cascade effects (editing race invalidates ability scores) not specified for modal context
- 3-page layout navigation (tabs vs. scroll) for mobile not formalized

## Dependencies

- **Depends on:** ALL previous Epics (8-14, 16) — this step integrates all wizard state and must render the complete character; Phase 1 calculation engine for all derived stats; Phase 1 Django REST API layer for save
- **Blocks:** Nothing — this is the final step in the Phase 2 wizard
