# Story 31.2 — HP Increase Step

> **Epic 31: Level Up Flow** | **Phase 4: Session Play Features** (Weeks 7-8)

## Description

As a player leveling up, I need to increase my hit point maximum by rolling my hit die or taking the average. This step handles the HP increase calculation with both options, applies the CON modifier correctly, enforces a minimum of 1 HP gained, and handles the edge case of retroactive CON adjustments when the CON modifier changes at this level (due to ASI).

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard), Phase 3 (character sheet 3-page display, gallery, import/export, view/edit mode with auto-save)

### D&D 5e HP Increase on Level Up (Complete)

**Formula:** HP gained = Hit Die roll (or average) + CON modifier

**Hit Die by Class:**
| Class | Hit Die | Average (ceil) |
|-------|---------|---------------|
| Barbarian | d12 | 7 |
| Bard | d8 | 5 |
| Cleric | d8 | 5 |
| Druid | d8 | 5 |
| Fighter | d10 | 6 |
| Monk | d8 | 5 |
| Paladin | d10 | 6 |
| Ranger | d10 | 6 |
| Rogue | d8 | 5 |
| Sorcerer | d6 | 4 |
| Warlock | d8 | 5 |
| Wizard | d6 | 4 |

**Roll Option:**
- Player rolls 1 hit die of their class type
- Add CON modifier to the result
- Minimum total HP gained is 1 (even with negative CON modifier)
- Example: Wizard rolls d6 (gets 2) + CON -1 = 1 HP gained (minimum 1)

**Average Option (recommended for consistent progression):**
- Use the fixed average: ceil(die_max / 2) + CON modifier
- Example: Fighter d10 average = 6 + CON mod
- This is the option recommended in the PHB for consistent progression

**Minimum HP Gained:**
- The minimum HP gained per level is always 1, even if CON modifier is very negative
- This prevents the degenerate case of gaining 0 or losing HP on level up

**Retroactive CON Adjustment:**
If the character's CON modifier changes at this level (typically from an ASI that increased CON), the HP increase should be applied retroactively:
- Each previous level also gains the CON modifier difference
- Example: Character at level 7 increases CON from 14 (+2) to 16 (+3). The +1 difference applies to all 7 previous levels = +7 HP retroactively, plus the new level's HP uses the new +3 modifier
- This is the standard RAW (Rules As Written) interpretation

### Level 1 HP (First Level Exception)
At level 1, characters take the **maximum** value of their hit die + CON modifier (no rolling). This is handled during character creation (Phase 2), not during level-up. The level-up flow starts at level 2+.

## Tasks

- [ ] **T31.2.1** — Create `components/levelup/HPIncreaseStep.tsx` — two options: "Roll" and "Take Average"
- [ ] **T31.2.2** — **Roll option:** display the class hit die (e.g., "d10 for Fighter"). Click "Roll" to animate a single die roll using the dice engine. Show: "Rolled: [result] + CON Mod ([N]) = [total] HP gained." Minimum HP gained is 1 (even with negative CON). Add the total to max HP
- [ ] **T31.2.3** — **Average option:** show the fixed average value: "Average: [ceil(die/2)] + CON Mod ([N]) = [total] HP gained." E.g., Fighter d10: 6 + CON mod. No randomness. Add to max HP
- [ ] **T31.2.4** — Display the HP change: "HP Max: [old] -> [new]"
- [ ] **T31.2.5** — If CON modifier changed since last level (due to ASI at this level), recalculate retroactively: each previous level also gains the CON mod difference. Show: "Retroactive CON increase: +[N] HP from [M] previous levels"

## Acceptance Criteria

1. HP Increase step presents two clear options: "Roll" and "Take Average"
2. Roll option displays the correct hit die for the class and animates the roll
3. Roll result shows: die result + CON mod = total HP gained
4. Average option shows the fixed value: ceil(die/2) + CON mod
5. Minimum HP gained is always 1 (enforced even with negative CON)
6. HP max change displays clearly: "HP Max: [old] -> [new]"
7. Retroactive CON adjustment is calculated when CON modifier changes at this level
8. Retroactive adjustment applies the CON mod difference to all previous levels
9. Both retroactive and current-level HP changes are shown clearly

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should calculate HP gain from roll: die result + CON modifier with minimum 1 HP`
- `should calculate HP gain from average: ceil(die_max/2) + CON modifier with minimum 1 HP`
- `should enforce minimum 1 HP gained even with negative CON modifier (e.g., d6 roll 1 + CON -2 = 1, not -1)`
- `should return correct hit die type for each class (e.g., Fighter=d10, Wizard=d6, Barbarian=d12)`
- `should calculate retroactive CON adjustment: (new modifier - old modifier) * previous levels`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render HPIncreaseStep with "Roll" and "Take Average" options`
- `should display the correct class hit die (e.g., "d10 for Fighter")`
- `should animate die roll and show result "Rolled: [result] + CON Mod ([N]) = [total] HP gained"`
- `should show average value with no randomness: "Average: 6 + CON Mod (+2) = 8 HP gained"`
- `should display HP Max change: "HP Max: [old] -> [new]"`
- `should show retroactive CON increase message when CON modifier changes at this level`
- `should enforce minimum 1 HP gained in the display`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should roll for HP increase, see animated die roll with result, and verify HP max updated`
- `should take average HP increase and verify correct fixed value applied`
- `should increase CON via ASI, see retroactive HP adjustment for all previous levels`

### Test Dependencies
- Mock character data with known level, class, CON modifier, current HP max
- Mock dice engine for controlled hit die roll results
- Mock dice animation component from Epic 26
- Phase 1 class data for hit die types
- Mock ASI data for retroactive CON adjustment scenario

## Identified Gaps

- **Error Handling**: No specification for what happens if the roll button is clicked multiple times (should only allow one roll); no undo for HP roll choice
- **Edge Cases**: Multiclass HP increase uses the class gaining the new level's hit die -- not explicitly validated in acceptance criteria; order of operations between ASI step and HP step affects retroactive adjustment
- **Accessibility**: No ARIA announcement for die roll result; roll vs average choice should be keyboard navigable; screen reader should announce HP max change
- **Performance**: Dice animation on level up should use "Dramatic" speed per notes -- but this is configurable and not enforced

## Dependencies

- Story 31.1 (Level Up Entry & Overview) for the wizard container
- Epic 26 (Dice Roller) for hit die roll animation
- Phase 1 class data (hit die types)
- Story 31.5 (ASI/Feat) for CON modifier changes (retroactive adjustment applies after ASI)

## Notes

- The retroactive CON adjustment is a common source of confusion -- the UI must explain it clearly
- If the ASI step (Story 31.5) comes before the HP step in the wizard, the HP step should use the new CON modifier and show the retroactive adjustment. If ASI comes after, the HP step should note that CON may change and recalculate
- The roll animation provides a fun moment during level-up -- consider making it dramatic (use the "Dramatic" animation speed)
- For multiclass characters, the hit die type is determined by the class gaining the new level
