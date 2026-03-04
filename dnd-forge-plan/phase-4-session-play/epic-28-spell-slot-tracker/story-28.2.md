# Story 28.2 — Warlock Pact Magic Slots

> **Epic 28: Spell Slot Tracker** | **Phase 4: Session Play Features** (Weeks 7-8)

## Description

As a Warlock, my spell slots work differently -- they all recover on short rest and are always cast at my highest available level. The Warlock's Pact Magic system is fundamentally different from standard spellcasting and must be tracked separately with distinct visual styling, especially for multiclass characters who have both Pact Magic slots and standard spell slots.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard), Phase 3 (character sheet 3-page display, gallery, import/export, view/edit mode with auto-save)

### D&D 5e Warlock Pact Magic System (Complete)

**Key Differences from Standard Spellcasting:**
1. **Fewer slots, faster recovery:** Warlocks have very few spell slots (1-4 depending on level) but they all recover on a **short rest**, not just long rest
2. **All slots at highest level:** All Warlock spell slots are the same level. A 5th-level Warlock has 2 slots, both 3rd level. There's no mix of 1st and 2nd level slots
3. **Short rest recovery:** This makes Warlocks more effective in campaigns with frequent short rests

**Pact Magic Slot Progression:**
| Warlock Level | Slot Count | Slot Level |
|--------------|------------|------------|
| 1 | 1 | 1st |
| 2 | 2 | 1st |
| 3 | 2 | 2nd |
| 4 | 2 | 2nd |
| 5 | 2 | 3rd |
| 6 | 2 | 3rd |
| 7 | 2 | 4th |
| 8 | 2 | 4th |
| 9 | 2 | 5th |
| 10 | 2 | 5th |
| 11 | 3 | 5th |
| 12-16 | 3 | 5th |
| 17 | 4 | 5th |
| 18-20 | 4 | 5th |

Note: Warlock spell slots never exceed 5th level. Higher-level spells (6th-9th) are gained through the Mystic Arcanum feature (1/day each, not using Pact Magic slots).

**Multiclass Warlock Rules:**
- Pact Magic slots are tracked **completely separately** from standard spell slots
- A Warlock 5 / Wizard 5 has:
  - Pact Magic: 2 x 3rd level slots (short rest recovery)
  - Standard: 4/3/2 slots (1st/2nd/3rd, long rest recovery)
- Pact Magic slots can be used to cast standard spells and vice versa, but recovery is independent
- On short rest: only Pact Magic slots recover
- On long rest: both standard and Pact Magic slots recover

### Visual Design
- Pact Magic section uses **purple accent** color (distinct from the standard blue spell slot section)
- Label: "Pact Magic Slots (Short Rest Recovery)"
- Display format: "2 x Level 3 Slots" instead of individual level sections

## Tasks

- [ ] **T28.2.1** — Detect Warlock class and render Pact Magic slots in a separate, distinctly styled section (different color -- purple accent instead of blue). Label: "Pact Magic Slots (Short Rest Recovery)"
- [ ] **T28.2.2** — Pact Magic slots are always at the same level: display "2 x Level [N] Slots" rather than individual level sections. For example, at Warlock level 5: "2 x 3rd Level Slots"
- [ ] **T28.2.3** — When the short rest automation runs, Pact Magic slots recover to full. Regular spell slots (if multiclassed) do not recover on short rest
- [ ] **T28.2.4** — If the character is multiclassed (Warlock + another caster), show Pact Magic slots separately from the standard spell slot table, with a clear visual divider and label

## Acceptance Criteria

1. Warlock characters show Pact Magic slots in a distinct purple-accented section
2. Section is labeled "Pact Magic Slots (Short Rest Recovery)"
3. Slots display as "N x Level M Slots" (all at the same level)
4. Pact Magic slots recover to full on short rest
5. Standard spell slots (if multiclassed) do NOT recover on short rest
6. Multiclass Warlock/caster shows Pact Magic slots visually separated from standard spell slots
7. Pact Magic slot progression matches the Warlock level table
8. Clickable circles for expend/recover work the same as standard slots

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should detect Warlock class from character data and return Pact Magic slot configuration`
- `should return correct slot count and level for each Warlock level (e.g., Lv5 = 2 slots at 3rd level)`
- `should recover all Pact Magic slots on short rest`
- `should not recover standard spell slots on short rest for multiclass Warlock/caster`
- `should keep Pact Magic slots separate from standard slots in multiclass configuration`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render Pact Magic slots in a distinct purple-accented section`
- `should display "Pact Magic Slots (Short Rest Recovery)" label`
- `should show slot format as "N x Level M Slots" (e.g., "2 x 3rd Level Slots")`
- `should render clickable expend/recover circles matching Story 28.1 pattern`
- `should show Pact Magic slots visually separated from standard spell slots for multiclass characters`
- `should recover all Pact Magic slots when short rest is triggered`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should display Warlock Pact Magic section with correct slot count and level, expend a slot, take short rest, and verify recovery`
- `should show both Pact Magic and standard slots for a multiclass Warlock/Wizard, short rest recovers only Pact Magic`

### Test Dependencies
- Mock Warlock character data at various levels (Lv1, Lv5, Lv11, Lv17)
- Mock multiclass Warlock/Wizard character data
- Mock short rest flow integration
- Phase 1 Warlock Pact Magic table data

## Identified Gaps

- **Error Handling**: No specification for Warlock characters with corrupted or missing Pact Magic data
- **Edge Cases**: Mystic Arcanum (6th-9th level 1/day spells at Warlock levels 11+) tracking is mentioned in notes but not specified in tasks or acceptance criteria
- **Accessibility**: No ARIA labels for the Pact Magic section; purple accent color contrast ratio for accessibility compliance not specified
- **Dependency Issues**: Story depends on Story 30.1 for short rest recovery but also on Story 28.1 for the clickable circle pattern -- circular dependency between Epics 28 and 30 should be noted

## Dependencies

- Story 28.1 (Spell Slot Expend & Recover UI) for clickable circle pattern
- Phase 1 class data (Warlock Pact Magic table)
- Epic 30, Story 30.1 (Short Rest Flow) for short rest recovery integration

## Notes

- Warlock Pact Magic is one of the most common source of confusion for new players -- clear labeling is essential
- The purple accent helps players quickly distinguish Pact Magic from standard slots at a glance
- Mystic Arcanum (6th-9th level Warlock spells, gained at levels 11/13/15/17) are separate from Pact Magic and are 1/day each -- these could be tracked as features, not spell slots
