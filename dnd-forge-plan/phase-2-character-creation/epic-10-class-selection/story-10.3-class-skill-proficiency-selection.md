# Story 10.3 — Class Skill Proficiency Selection

> **Epic 10: Class Selection Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a player, after choosing my class I need to pick my skill proficiencies from the class's allowed list. This story builds the class skill selector with correct choose counts per class, race skill pre-locking, ability-grouped display for Bard, helper tooltips, and count validation.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, React Query API layer, Zustand stores (UI state), dice engine
- **Class Skill Proficiency Counts**:
  | Class | Skills to Choose | Pool |
  |-------|-----------------|------|
  | Barbarian | 2 | Animal Handling, Athletics, Intimidation, Nature, Perception, Survival |
  | Bard | 3 | Any skill (all 18) |
  | Cleric | 2 | History, Insight, Medicine, Persuasion, Religion |
  | Druid | 2 | Arcana, Animal Handling, Insight, Medicine, Nature, Perception, Religion, Survival |
  | Fighter | 2 | Acrobatics, Animal Handling, Athletics, History, Insight, Intimidation, Perception, Survival |
  | Monk | 2 | Acrobatics, Athletics, History, Insight, Religion, Stealth |
  | Paladin | 2 | Athletics, Insight, Intimidation, Medicine, Persuasion, Religion |
  | Ranger | 3 | Animal Handling, Athletics, Insight, Investigation, Nature, Perception, Stealth, Survival |
  | Rogue | 4 | Acrobatics, Athletics, Deception, Insight, Intimidation, Investigation, Perception, Performance, Persuasion, Sleight of Hand, Stealth |
  | Sorcerer | 2 | Arcana, Deception, Insight, Intimidation, Persuasion, Religion |
  | Warlock | 2 | Arcana, Deception, History, Intimidation, Investigation, Nature, Religion |
  | Wizard | 2 | Arcana, History, Insight, Investigation, Medicine, Religion |
- **Race Skills**: If the player selected a race that grants skill proficiencies (e.g., Elf gets Perception, Half-Elf chose 2 skills, Variant Human chose 1 skill), these are pre-checked and locked with a "From Race" label. They do NOT count against the class choice count
- **All 18 Skills by Ability**:
  - STR: Athletics
  - DEX: Acrobatics, Sleight of Hand, Stealth
  - INT: Arcana, History, Investigation, Nature, Religion
  - WIS: Animal Handling, Insight, Medicine, Perception, Survival
  - CHA: Deception, Intimidation, Performance, Persuasion

## Tasks

- [ ] **T10.3.1** — Create `components/wizard/class/ClassSkillSelector.tsx` — displays the class's skill pool as a checklist. Shows the governing ability for each skill in a muted label (e.g., "Stealth (DEX)"). Enforces the exact choose count (e.g., Rogue: choose 4, Bard: choose 3 from any)
- [ ] **T10.3.2** — If the player already selected a race with skill proficiencies (e.g., Elf gets Perception), those skills are pre-checked and locked with a "From Race" label. They do NOT count against the class choice count
- [ ] **T10.3.3** — For Bard (choose any 3), display all 18 skills but group by ability score for easy scanning
- [ ] **T10.3.4** — Show a helper tooltip: "Choose skills that complement your ability scores. Higher ability modifiers make these skills more effective."
- [ ] **T10.3.5** — Validate: exactly the required number of skills must be selected before proceeding

## Acceptance Criteria

- The class skill selector shows only the skills in the selected class's skill pool (except Bard which shows all 18)
- Each skill shows its governing ability in a muted label
- The selector enforces the exact choose count for the selected class
- Race-granted skills are pre-checked and locked with a "From Race" label, not counting against the class choice count
- Bard's skill list is grouped by ability score for scanning
- A helper tooltip explains the relationship between ability scores and skill effectiveness
- Validation prevents advancing if the required number of skills is not selected

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should return correct skill pool and choose count for each of the 12 classes`
- `should identify race-granted skills that overlap with class skill pool`
- `should not count race-granted skills against class choice count`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should display only the skills in the selected class's skill pool (except Bard showing all 18)`
- `should show governing ability in muted label next to each skill (e.g., "Stealth (DEX)")`
- `should enforce exact choose count for the selected class (e.g., Rogue: 4, Bard: 3, Fighter: 2)`
- `should pre-check and lock race-granted skills with From Race label, not counting against class choice`
- `should group Bard skill list by ability score for easy scanning`
- `should show helper tooltip about ability scores and skill effectiveness`
- `should prevent advancing if required number of skills is not selected`
- `should show current ability modifier next to skill name when ability scores have been assigned (back-navigation)`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should select 4 skills for Rogue from 11 options with race skills pre-locked`
- `should select 3 skills from any for Bard with ability grouping displayed`

### Test Dependencies
- Mock SRD class data with skill pools and choose counts for all 12 classes
- Mock wizard store with race skills pre-selected (e.g., Elf Perception)
- Mock Epic 16 CountSelector component

## Identified Gaps

- **Error Handling**: No specification for what happens if race skills are not in the class pool (noted in notes but not in acceptance criteria)
- **Edge Cases**: Race skill outside class pool display as "Other Proficiencies" section is mentioned in notes but not formalized
- **Accessibility**: No keyboard navigation specified for skill checkboxes or ability grouping

## Dependencies

- **Depends on:** Story 10.1 (class must be selected to determine skill pool and count), Epic 9 Story 9.5 (race skills needed for pre-locking), Epic 16 Story 16.1 (CountSelector component), Phase 1 SRD class data
- **Blocks:** Story 10.6 (validation includes skill count), Epic 12 Story 12.1 (background skill overlap detection checks against class + race skills)

## Notes

- The skill pre-locking from race must be clearly visually distinct — use a different background color and a "From Race" badge so the player understands these are already granted and not part of their class choice
- When race skills overlap with the class skill pool (e.g., Elf Perception + Ranger), the race skill is still pre-locked — the player picks their class skills from the remaining pool
- If a race skill is NOT in the class's pool (e.g., Half-Elf chose Persuasion, class is Fighter), it still shows as pre-locked in a separate "Other Proficiencies" section or as a note
- Rogue's 4-skill choice from 11 options is the largest selection — ensure the UI handles this cleanly without overwhelming the player
- Consider showing the current ability modifier next to each skill name when ability scores have been assigned (back-navigation case)
