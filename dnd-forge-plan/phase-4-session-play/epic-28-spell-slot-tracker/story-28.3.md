# Story 28.3 — Arcane Recovery (Wizard)

> **Epic 28: Spell Slot Tracker** | **Phase 4: Session Play Features** (Weeks 7-8)

## Description

As a Wizard, I can recover some spell slots once per day during a short rest using Arcane Recovery. This feature allows Wizards to regain a limited number of expended spell slots by choosing which specific slots to recover, with a total level budget constraint. The feature must be tracked for daily usage and integrated with the short rest flow.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard), Phase 3 (character sheet 3-page display, gallery, import/export, view/edit mode with auto-save)

### D&D 5e Arcane Recovery Rules (Complete)

**Feature Description:**
Arcane Recovery is a 1st-level Wizard feature that allows the Wizard to recover expended spell slots once per day during a short rest.

**Recovery Budget:**
- Total spell slot levels recovered cannot exceed **ceil(Wizard level / 2)**
- Example: A 5th-level Wizard can recover up to 3 levels worth of slots (ceil(5/2) = 3)
  - Could recover: one 3rd-level slot, or one 2nd + one 1st, or three 1st-level slots
- No recovered slot can be **6th level or higher**

**Usage Restriction:**
- Can be used **once per day** (resets on long rest)
- Must be used during a short rest (cannot be used independently)

**Examples by Wizard Level:**
| Wizard Level | Recovery Budget | Max Single Slot | Example Recoveries |
|-------------|----------------|-----------------|-------------------|
| 1 | 1 level | 1st | One 1st-level slot |
| 2 | 1 level | 1st | One 1st-level slot |
| 3 | 2 levels | 2nd | One 2nd-level, or two 1st-level |
| 4 | 2 levels | 2nd | One 2nd-level, or two 1st-level |
| 5 | 3 levels | 3rd | One 3rd-level, one 2nd+1st, or three 1st |
| 10 | 5 levels | 5th | One 5th, one 3rd+2nd, etc. |
| 15 | 8 levels | 5th | Various combinations up to 8 levels total |
| 20 | 10 levels | 5th | Various combinations up to 10 levels total |

**Key Constraints:**
- Only recovers slots that have been expended (can't "overcap" slots)
- The player chooses which specific slots to recover
- No slot of 6th level or higher can be recovered through Arcane Recovery
- Resets on long rest (the "used today" flag clears)

## Tasks

- [ ] **T28.3.1** — Detect Wizard class and add an "Arcane Recovery" button to the spell page. Label: "Arcane Recovery (1/day, during Short Rest)"
- [ ] **T28.3.2** — On click, open a modal: "Choose spell slots to recover. Total slot levels recovered cannot exceed [ceil(Wizard level / 2)]. No slot can be 6th level or higher." Show a selection interface where the player picks specific slots to recover
- [ ] **T28.3.3** — Track whether Arcane Recovery has been used today with a checkbox. Reset on long rest
- [ ] **T28.3.4** — During the short rest automation, prompt: "Use Arcane Recovery?" if it hasn't been used yet

## Acceptance Criteria

1. Wizard characters see an "Arcane Recovery (1/day, during Short Rest)" button on the spell page
2. Clicking the button opens a modal showing the recovery budget and slot selection interface
3. Recovery budget correctly calculates as ceil(Wizard level / 2)
4. No slot of 6th level or higher can be selected for recovery
5. Total selected slot levels cannot exceed the recovery budget
6. Only expended slots can be selected for recovery
7. Daily usage is tracked with a visible checkbox; used state prevents reuse
8. Long rest resets the "used today" flag
9. Short rest flow prompts to use Arcane Recovery if not yet used today

## Dependencies

- Story 28.1 (Spell Slot Expend & Recover UI) for spell slot state management
- Epic 30, Story 30.1 (Short Rest Flow) for the short rest automation prompt
- Epic 30, Story 30.2 (Long Rest Flow) for daily usage reset

## Notes

- The selection interface should show remaining budget dynamically as the player selects slots
- Consider showing "Budget remaining: X levels" that updates with each selection
- For multiclass Wizard characters, use the Wizard class level (not total character level) for the recovery budget
- This feature is unique to Wizards -- no other class has Arcane Recovery
