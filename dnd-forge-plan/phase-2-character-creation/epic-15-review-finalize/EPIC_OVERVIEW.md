# Epic 15: Review & Finalize Step
> **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Summary

A comprehensive review screen that shows the complete character sheet with all computed values, highlights any validation issues, and enables the player to save the character to the database. Provides a 3-page character sheet preview (core stats, backstory/details, spellcasting), a validation summary with fix links, save/assembly with celebration animation, and quick-edit modals for last-minute tweaks.

## Stories

| # | Story | Tasks | Description |
|---|-------|-------|-------------|
| 15.1 | Character Sheet Preview | 6 | Full 3-page character sheet preview with all derived stats computed by the calculation engine, dark fantasy styling |
| 15.2 | Validation Summary | 4 | Full character validation with errors/warnings/info, fix links back to relevant steps, save button gating |
| 15.3 | Save & Character Assembly | 6 | Character assembly from wizard state, IndexedDB save, success celebration, save-and-create-another, error handling |
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
- Dexie.js `createCharacter()` for IndexedDB persistence
- Success celebration animation (confetti or themed splash)
- Dark fantasy styling (parchment textures, Cinzel headings)

## Dependencies

- **Depends on:** ALL previous Epics (8-14, 16) — this step integrates all wizard state and must render the complete character; Phase 1 calculation engine for all derived stats; Phase 1 database layer for save
- **Blocks:** Nothing — this is the final step in the Phase 2 wizard
