# Story 35.6 — End Encounter & XP Distribution

> **Epic 35: Initiative & Combat Tracker** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a DM, when combat ends, I need to distribute XP to the party and log the encounter results.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence. DM role is local (no authentication), campaigns are local data with join codes as local import mechanism.
- **Prior Phases Available**: Phase 1-4 (full character creation, sheet display, session play features including dice roller, HP tracker, spell slots, conditions, rest, level up)

This story handles the encounter end flow — summarizing results, calculating and distributing XP, and saving the encounter to campaign history.

**Encounter data model:**
```typescript
interface Encounter {
  id: string;
  campaignId: string;
  sessionId?: string;        // Link to session note
  combatants: Combatant[];
  currentTurnIndex: number;
  roundNumber: number;
  isActive: boolean;
  xpBudget?: number;         // Total XP from monsters
  notes: string;
  createdAt: Date;
}
```

**End encounter flow:**
1. "End Encounter" button in combat tracker header
2. Summary modal shows: rounds elapsed, monsters defeated (with CR and XP value each), total XP earned, party members present
3. DM can adjust total XP manually (for story XP, bonus XP, etc.)
4. XP is divided equally among all player characters in the encounter
5. DM can exclude characters from the split (e.g., character who fled or joined late)
6. Alternative: "Milestone Level Up" toggle — levels up all or selected characters by 1 level, triggering the Phase 4 level-up flow

**XP calculation uses the SRD CR-to-XP mapping:**
| CR | XP | CR | XP |
|----|-----|----|----|
| 0 | 10 | 5 | 1,800 |
| 1/8 | 25 | 6 | 2,300 |
| 1/4 | 50 | 7 | 2,900 |
| 1/2 | 100 | 8 | 3,900 |
| 1 | 200 | 9 | 5,000 |
| 2 | 450 | 10 | 5,900 |
| 3 | 700 | ... | ... |
| 4 | 1,100 | 20 | 25,000 |

**"Apply & Save" button:**
- Adds XP to each character's `experiencePoints` field
- Checks if any character crosses a level threshold
- Triggers level-up prompts for characters that leveled up
- Saves the encounter to campaign encounter history
- Links encounter to a session note (optional)

## Tasks

- [ ] **T35.6.1** — "End Encounter" button in the combat tracker header. Opens a summary modal showing: rounds elapsed, monsters defeated (with CR and XP value each), total XP earned, party members present
- [ ] **T35.6.2** — **XP calculation:** auto-calculate total XP from defeated monsters (using SRD CR-to-XP mapping). Show individual monster XP and the sum. DM can adjust the total manually (for story XP, bonus XP, etc.)
- [ ] **T35.6.3** — **XP distribution:** divide total XP equally among all player characters in the encounter. Show per-character XP: "[Name]: +[N] XP (total: [M] XP)." Option to exclude characters from the split (e.g., a character who fled or joined late)
- [ ] **T35.6.4** — **Milestone option:** instead of XP, toggle "Milestone Level Up" which levels up all (or selected) characters by 1 level. Triggers the Phase 4 level-up flow for each character
- [ ] **T35.6.5** — "Apply & Save" button: adds XP to each character's `experiencePoints`, checks if any character crosses a level threshold, and triggers level-up prompts if they do. Save the encounter to the campaign's encounter history
- [ ] **T35.6.6** — Encounter log: save a summary of the encounter (combatants, outcome, rounds, XP awarded) to the campaign's session notes or as a standalone encounter record viewable from the "Encounters" tab

## Acceptance Criteria

- "End Encounter" button opens summary modal from combat tracker
- Summary shows rounds elapsed, defeated monsters with CR and XP, total XP, and party members
- XP auto-calculates from defeated monsters using SRD CR-to-XP mapping
- DM can manually adjust total XP
- XP splits equally among player characters with per-character preview
- Characters can be excluded from the XP split
- "Milestone Level Up" toggle offers level-up instead of XP
- Milestone triggers Phase 4 level-up flow for selected characters
- "Apply & Save" persists XP to characters and encounter to campaign history
- Level threshold crossings are detected with level-up prompts
- Encounter summary is saved and viewable from the Encounters tab
- Encounter can be linked to a session note

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should calculate total XP from defeated monsters using SRD CR-to-XP mapping`
- `should divide XP equally among all player characters in the encounter`
- `should exclude specified characters from the XP split calculation`
- `should detect level threshold crossings for characters receiving XP`
- `should correctly map CR values (including fractional CRs 1/8, 1/4, 1/2) to XP values`
- `should allow manual XP total adjustment by the DM`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should open summary modal from "End Encounter" button in combat tracker`
- `should display rounds elapsed, defeated monsters with CR and XP, total XP, and party members`
- `should show per-character XP preview with current, added, and new total`
- `should highlight characters crossing level thresholds: "[Name] will advance to Level [N]!"`
- `should allow excluding characters from XP split via checkboxes`
- `should toggle "Milestone Level Up" to level up characters instead of awarding XP`
- `should trigger Phase 4 level-up flow for milestone level-ups`
- `should persist XP and encounter summary on "Apply & Save" click`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should end an encounter, distribute XP to party, and verify XP persists on character records`
- `should end an encounter with milestone toggle, level up all characters, and verify level changes`
- `should save encounter summary and verify it appears in the Encounters tab`

### Test Dependencies
- SRD CR-to-XP mapping data
- Mock encounter with defeated monsters at various CRs
- Character fixtures near level thresholds for level-up detection
- Mock Phase 4 level-up flow
- Mock session log for encounter-to-session linking

## Identified Gaps

- **Error Handling**: No specification for handling partial "Apply & Save" failure (XP applied to some characters but not others)
- **Edge Cases**: Behavior when no monsters were defeated (0 XP encounter); behavior when all characters are excluded from XP split; level 20 characters receiving XP (no further level-ups)
- **Dependency Issues**: Shared XP application logic between this story and Story 37.1 not explicitly defined as a shared utility

## Dependencies

- Story 35.3 — Combat tracker main view ("End Encounter" button)
- Story 35.4 — HP/condition management (determines defeated monsters)
- Epic 33 Story 33.1 — Encounter data model, campaign store
- Epic 36 Story 36.2 — Session log (for encounter-to-session linking)
- Epic 37 Story 37.1 — XP award system (shared XP application logic)
- Phase 4 Epic 31 — Level-up flow (triggered by milestone or XP threshold)
- Phase 1 — SRD CR-to-XP mapping data

## Notes

- Monsters that were removed mid-combat with "Remove & Log XP" (from Story 35.3) should appear in the defeated monsters list with their XP pre-logged.
- The encounter log provides a historical record of all combat encounters. This is valuable for session recaps and for tracking campaign progression over time.
- The milestone toggle in the end encounter flow is a convenience — the full milestone system is in Epic 37 Story 37.2.
