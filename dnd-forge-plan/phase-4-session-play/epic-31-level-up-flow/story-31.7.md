# Story 31.7 — Level Up Review & Apply

> **Epic 31: Level Up Flow** | **Phase 4: Session Play Features** (Weeks 7-8)

## Description

As a player, I need to see a summary of all level-up changes before confirming, and have the character sheet update to reflect the new level. The review screen consolidates every change made during the level-up wizard into a single view, allows the player to confirm or cancel, and on confirmation commits all changes via API (PUT /api/characters/:id) with a full recalculation of derived stats.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard), Phase 3 (character sheet 3-page display, gallery, import/export, view/edit mode with auto-save)

### Level Up Review Summary Categories

The review screen shows all changes organized by category:

**Always Present:**
- **Level:** [old] -> [new] (e.g., "Level 4 -> Level 5")
- **HP Max:** [old] -> [new] with method note (e.g., "HP Max: 28 -> 35 (rolled d10: 5 + CON +2 = 7)")

**Conditional (shown only if applicable):**
- **Proficiency Bonus:** [old] -> [new] (e.g., "+2 -> +3" at levels 5, 9, 13, 17)
- **Ability Scores:** any changes from ASI (e.g., "STR: 16 -> 18, DEX: 14 -> 15")
- **Feat:** name and summary (e.g., "Alert: +5 initiative, can't be surprised")
- **Subclass:** name (e.g., "Chosen: Champion (Martial Archetype)")
- **New Features:** list of feature names with brief descriptions
- **Spell Slots:** before/after table for each level (only for casters)
- **New Spells:** list of newly learned/added spell names
- **Swapped Spell:** old spell name -> new spell name
- **New Cantrips:** list of new cantrip names
- **Cantrip Damage:** scaling update (e.g., "Fire Bolt: 1d10 -> 2d10")
- **Scaling Features:** updated values (e.g., "Sneak Attack: 2d6 -> 3d6")

### Apply Process
1. Take a pre-level-up snapshot (named "Before Level [old] -> [new]") for undo safety
2. Commit all changes to the character object
3. Run the full Phase 1 calculation engine to recalculate ALL derived stats
4. Save via PUT /api/characters/:id using React Query mutation (Phase 3 auto-save system)
5. Update the character gallery card with the new level
6. Show a celebration message: "Welcome to Level [N]!"

### Cancel Process
1. Discard all level-up state (no changes applied)
2. Return to the character sheet at the current level
3. Confirmation dialog: "Discard all level-up choices?" with Cancel/Discard buttons

### XP vs Milestone
- **XP-based:** Auto-update XP display (XP remains, just threshold displayed differently)
- **Milestone-based:** Allow the DM/player to simply click "Level Up" without XP tracking

## Tasks

- [ ] **T31.7.1** — Create `components/levelup/LevelUpReview.tsx` — a summary screen showing all changes made during the level-up wizard:
  - Level: [old] -> [new]
  - HP Max: [old] -> [new] (rolled/average: [result])
  - Proficiency Bonus: [old] -> [new] (if changed)
  - Ability Scores: any ASI changes
  - Feat: name (if selected)
  - Subclass: name (if selected)
  - New Features: list of feature names
  - Spell Slots: before/after table (if caster)
  - New Spells: list of new spell names (if caster)
  - Swapped Spell: old -> new (if applicable)
- [ ] **T31.7.2** — "Apply Level Up" button: commits all changes to the character via PUT /api/characters/:id using React Query mutation. Runs the full calculation engine to recalculate all derived stats. Shows a success celebration: "Welcome to Level [N]!"
- [ ] **T31.7.3** — "Cancel Level Up" button: discards all level-up state and returns to the character sheet at the current level. Confirmation dialog: "Discard all level-up choices?"
- [ ] **T31.7.4** — Update the character gallery card to show the new level immediately after applying
- [ ] **T31.7.5** — If XP-based progression: auto-update XP display. If milestone-based: allow the DM to simply click "Level Up" without XP considerations

## Acceptance Criteria

1. Review screen shows all changes organized by category
2. Level change displays prominently: "[old] -> [new]"
3. HP Max change shows the method used (roll result or average value)
4. Proficiency bonus change shown only at levels 5, 9, 13, 17
5. ASI changes show specific ability score modifications
6. Feat name and effects shown if a feat was selected
7. Subclass name shown if selected during this level-up
8. New features listed by name
9. Spell slot before/after table shown for casters
10. New spells and swapped spells listed for casters
11. "Apply Level Up" commits all changes and runs full recalculation
12. Success celebration message displays after applying
13. "Cancel Level Up" discards all changes with confirmation dialog
14. Character gallery card updates immediately to show new level
15. XP-based and milestone-based progression both supported

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should aggregate all level-up changes into a structured summary object`
- `should correctly categorize conditional changes (ASI shown only if ASI level, spells shown only if caster)`
- `should create a named pre-level-up snapshot for undo safety`
- `should calculate full derived stat recalculation after all changes are committed`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should display level change prominently: "Level 4 -> Level 5"`
- `should show HP Max change with method note: "HP Max: 28 -> 35 (rolled d10: 5 + CON +2 = 7)"`
- `should display proficiency bonus change only at levels 5, 9, 13, 17`
- `should show ASI changes with specific ability scores`
- `should show feat name and effects if a feat was selected`
- `should list new features by name`
- `should show spell slot before/after table for casters`
- `should display "Welcome to Level [N]!" celebration message on apply`
- `should show confirmation dialog "Discard all level-up choices?" on cancel`
- `should update gallery card to show new level after applying`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should complete full level-up wizard, review all changes on summary screen, apply, and see celebration message`
- `should cancel level-up at review screen, confirm discard, and verify no changes were applied`
- `should apply level-up and verify character gallery card shows updated level`
- `should verify XP-based progression displays correctly after level-up`

### Test Dependencies
- Mock level-up state with changes from all previous steps (HP, features, ASI, subclass, spells)
- Mock Phase 1 calculation engine for full recalculation
- MSW (Mock Service Worker) to mock PUT /api/characters/:id for persistence (Phase 3 auto-save system)
- Mock Phase 3 undo/snapshot system
- Mock Phase 3 character gallery for card update verification

## Identified Gaps

- **Error Handling**: No specification for API save failure during apply; no rollback mechanism if recalculation fails; no specification for what happens if the snapshot creation fails
- **Edge Cases**: Milestone vs XP-based progression display difference not fully specified in tasks; celebration message/animation details not specified (confetti mentioned in notes but not tasks)
- **Accessibility**: Celebration message should be ARIA-announced; cancel confirmation dialog needs focus trapping; summary screen should be navigable by keyboard
- **Performance**: Full recalculation time after level-up apply not specified; gallery card update should be near-instant

## Dependencies

- Stories 31.1-31.6 (all previous level-up wizard steps provide the data to summarize)
- Phase 1 calculation engine (for full stat recalculation)
- Phase 3 auto-save system (for API persistence via React Query mutation)
- Phase 3 character gallery (for card update)
- Phase 3 undo/snapshot system (for pre-level-up backup)

## Notes

- The pre-level-up snapshot is critical for safety -- use the Phase 3 undo system to create a named snapshot
- The snapshot should persist until the next level-up, accessible from settings
- The celebration message is a positive UX touch -- consider confetti animation or a level-up sound effect
- The full recalculation after apply ensures all derived stats are consistent (no stale data)
- Gallery card update ensures the character list immediately reflects the new level
