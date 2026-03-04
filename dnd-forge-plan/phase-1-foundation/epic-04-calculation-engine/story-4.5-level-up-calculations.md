# Story 4.5 — Level Up Calculations

> **Epic 4: Calculation Engine** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need functions to determine what a character gains at each new level.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Level up gains**: When a character levels up, they receive multiple benefits that vary by class and level:
  - **HP increase**: Roll the class hit die + CON modifier, OR take the average (floor(die/2)+1) + CON modifier. Minimum 1. First level always takes maximum die
  - **New class features**: Specific features unlocked at the new level (from class feature progression table)
  - **Subclass selection**: Some levels are subclass selection levels (varies by class: Cleric/Sorcerer/Warlock at 1, Druid/Wizard at 2, most others at 3)
  - **ASI/Feat level**: Most classes at 4, 8, 12, 16, 19. Fighter also at 6, 14. Rogue also at 10. At these levels, the character can either increase ability scores (+2 to one or +1 to two) or take a feat (if allowed by house rules)
  - **New spell slots**: May gain new or higher spell slots (from spell slot progression)
  - **New cantrips**: May learn additional cantrips (from class cantrip table)
  - **New spells known**: For known casters (Bard, Ranger, Sorcerer), may learn new spells (from class table). Can also swap one known spell for another
  - **New prepared spell capacity**: For prepared casters (Cleric, Druid, Paladin, Wizard), capacity increases with level
  - **Proficiency bonus change**: Changes at levels 5, 9, 13, 17 (affects all proficient skills, saves, attacks)
- **XP thresholds**: Each level requires cumulative XP. Level 1=0, 2=300, 3=900, 4=2700, 5=6500, 6=14000, 7=23000, 8=34000, 9=48000, 10=64000, 11=85000, 12=100000, 13=120000, 14=140000, 15=165000, 16=195000, 17=225000, 18=265000, 19=305000, 20=355000
- **Average HP roll**: floor(hit die / 2) + 1. So d6 = 4, d8 = 5, d10 = 6, d12 = 7. This is the "safe" option that players often prefer
- **LevelUpResult type**: The return type of `getLevelUpGains()` should contain all the information the level-up UI needs to present choices and apply the level

## Tasks
- [ ] **T4.5.1** — Implement `getLevelUpGains(character: Character, newLevel: number): LevelUpResult` returning:
  - HP increase options (roll die or take average)
  - New class features unlocked at this level
  - Whether this is a subclass selection level
  - Whether this is an ASI/feat level
  - New spell slots gained
  - New spells known/cantrips (for known casters)
  - New prepared spell capacity (for prepared casters)
  - Proficiency bonus change (if any)
- [ ] **T4.5.2** — Implement `getXPForLevel(level: number): number` — lookup from XP threshold table
- [ ] **T4.5.3** — Implement `getLevelForXP(xp: number): number` — reverse lookup
- [ ] **T4.5.4** — Implement `getAverageHPRoll(hitDie: HitDie): number` — `Math.floor(hitDie / 2) + 1`
- [ ] **T4.5.5** — Write unit tests: Fighter level 3->4 gains ASI + new features, Wizard level 2->3 gains School subclass, Cleric level 1->2 gains Channel Divinity + new spell slots, XP<->level roundtrip for all 20 levels

## Acceptance Criteria
- `getLevelUpGains()` correctly identifies all gains for a character leveling up in any class at any level
- Subclass selection levels are correctly identified per class (Cleric/Sorcerer/Warlock at 1, Druid/Wizard at 2, others at 3)
- ASI/feat levels are correct for standard (4,8,12,16,19), Fighter (4,6,8,12,14,16,19), and Rogue (4,8,10,12,16,19) schedules
- `getXPForLevel()` returns correct thresholds for all 20 levels
- `getLevelForXP()` correctly determines level from any XP value (including values between thresholds)
- `getAverageHPRoll()` returns correct averages for all hit die types (d6=4, d8=5, d10=6, d12=7)
- Unit tests verify level-up gains for specific class/level combinations

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should return ASI/feat flag for Fighter leveling to 4 via getLevelUpGains`
- `should return subclass selection for Wizard leveling to 2 via getLevelUpGains`
- `should return Channel Divinity feature for Cleric leveling to 2 via getLevelUpGains`
- `should return new spell slots for Wizard leveling from 2 to 3 via getLevelUpGains`
- `should return proficiency bonus change for character leveling to 5 via getLevelUpGains`
- `should return correct XP threshold 0 for level 1, 300 for level 2, 355000 for level 20 via getXPForLevel`
- `should return level 5 for 7000 XP via getLevelForXP`
- `should return level 1 for 0 XP via getLevelForXP`
- `should return average HP 4 for d6, 5 for d8, 6 for d10, 7 for d12 via getAverageHPRoll`
- `should correctly roundtrip XP-to-level for all 20 levels`

### Test Dependencies
- Character type fixtures with various class/level configurations
- Class data from Story 3.2 for feature progression lookup
- XP threshold table from Story 3.7

## Identified Gaps

- **Edge Cases**: getLevelUpGains for multiclass does not specify which class level is being gained; function signature may need classId parameter
- **Edge Cases**: First level in a multiclass gives limited proficiencies, not full first-level benefits; this distinction is mentioned in notes but not in test cases
- **Edge Cases**: getLevelForXP with XP between thresholds (e.g., 500 XP) should return level 1, not level 2

## Dependencies
- **Depends on:** Story 2.3 (HitDie, Class, Feature types), Story 2.8 (Character type), Story 3.2 (class data with feature progression, ASI levels, subclass levels), Story 3.7 (XP threshold table), Story 4.4 (spell slot calculations for new slots gained)
- **Blocks:** Epic 6 Store layer (level-up flow uses these calculations), Phase 3 (Level Up UI)

## Notes
- `getLevelForXP()` should return the highest level the character qualifies for. For example, 7000 XP = level 5 (threshold is 6500), not level 6 (threshold is 14000)
- When multiclassing, the character chooses which class to gain a level in. `getLevelUpGains()` should take the character and the target class, then calculate gains based on the new level in THAT class (not total level)
- Proficiency bonus is based on total character level (sum of all class levels), not individual class level. A Fighter 3/Wizard 2 has proficiency +3 (total level 5)
- Some class features gained on level-up require choices (e.g., new spells known, fighting style selection, expertise skills). The `LevelUpResult` should indicate what choices are needed
- First level in a multiclass does NOT get the full first-level benefits. When multiclassing into a new class, you get a limited set of proficiencies (defined per class in the multiclass rules), not the full first-level proficiency list
