# Story 26.5 — Character Sheet Roll Integration

> **Epic 26: Dice Roller** | **Phase 4: Session Play Features** (Weeks 7-8)

## Description

As a player, I need to roll directly from values on my character sheet -- tapping a skill, save, attack, or initiative should automatically roll with the correct modifier. This is the deep integration layer that connects the dice roller to every rollable value on the character sheet, including attack-to-damage chaining, critical hit automation, and death save automation.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard), Phase 3 (character sheet 3-page display, gallery, import/export, view/edit mode with auto-save)

### Rollable Values on the Character Sheet
All of the following values should have a d20 roll icon and be clickable to trigger a roll:

**Ability Checks (6):** STR, DEX, CON, INT, WIS, CHA -- roll 1d20 + ability modifier

**Skills (18):** Acrobatics, Animal Handling, Arcana, Athletics, Deception, History, Insight, Intimidation, Investigation, Medicine, Nature, Perception, Performance, Persuasion, Religion, Sleight of Hand, Stealth, Survival -- roll 1d20 + skill modifier (includes proficiency if proficient)

**Saving Throws (6):** STR, DEX, CON, INT, WIS, CHA saves -- roll 1d20 + save modifier

**Initiative:** Roll 1d20 + DEX modifier (+ any initiative bonuses from features)

**Attack Rolls:** Each weapon/attack rolls 1d20 + attack bonus. On hit, chain to damage roll.

**Spell Attacks:** Same as weapon attacks but with spell attack bonus.

**Death Saves:** Roll 1d20 with no modifier. Special results:
- 10 or higher: Success (fill one success circle)
- 9 or lower: Failure (fill one failure circle)
- Natural 20: Critical success -- regain 1 HP, stabilize, remove unconscious
- Natural 1: Counts as 2 failures (fill two failure circles)
- 3 failures: Character dies
- 3 successes: Character stabilizes

### Critical Hit Rules (D&D 5e)
- A natural 20 on an attack roll is always a hit (regardless of AC) and is a critical hit
- On a critical hit, double the number of damage dice (not the modifier). Example: 1d8 + 3 becomes 2d8 + 3
- A natural 1 on an attack roll is always a miss (regardless of bonuses)

### Spell Save DCs
When a spell requires the target to make a saving throw, the caster doesn't roll -- the DM rolls for the target. Display: "Spell Save DC: [N] -- Target must beat [N]"

## Tasks

- [ ] **T26.5.1** — Add a d20 icon next to every rollable value on the character sheet: all 18 skills, all 6 saving throws, initiative, each attack row, and death saves. The icon is subtle in view mode (appears on hover/tap)
- [ ] **T26.5.2** — Clicking a rollable value: opens the dice panel (if closed), auto-populates the roll expression (1d20 + modifier), and immediately triggers the roll. The roll history entry is labeled with the source (e.g., "Stealth Check (+7)")
- [ ] **T26.5.3** — For attack rolls: roll attack (1d20 + attack bonus) first. If hit, auto-prompt "Roll Damage?" and pre-populate the weapon's damage expression. Show attack and damage results together
- [ ] **T26.5.4** — For spell attacks: same as weapon attacks but with spell attack bonus. For spell save DCs: show "Spell Save DC: [N] -- Target must beat [N]" instead of rolling (the DM rolls, not the caster)
- [ ] **T26.5.5** — Critical hit automation: if the d20 shows a natural 20 on an attack roll, automatically double the damage dice in the damage roll prompt (e.g., 2d8 + 3 instead of 1d8 + 3). Show a "CRITICAL HIT!" banner
- [ ] **T26.5.6** — For ability checks (not skills): add rollable icons next to each ability modifier in the ability score blocks. Roll 1d20 + ability modifier
- [ ] **T26.5.7** — Death save roll button: rolls 1d20 with no modifier. Auto-fills the death save success/failure circle based on the result (10+ = success, 9- = failure, 20 = critical success/regain 1 HP, 1 = 2 failures)

## Acceptance Criteria

1. Every rollable value on the character sheet has a subtle d20 icon (visible on hover/tap)
2. Clicking any skill rolls 1d20 + skill modifier and labels the result (e.g., "Stealth Check (+7)")
3. Clicking any saving throw rolls 1d20 + save modifier
4. Clicking initiative rolls 1d20 + initiative bonus
5. Clicking an attack rolls 1d20 + attack bonus, then prompts for damage on hit
6. Spell attacks work like weapon attacks; spell save DCs display the DC value instead of rolling
7. Natural 20 on attack rolls doubles damage dice and shows "CRITICAL HIT!" banner
8. Natural 1 on attack rolls shows a miss indicator
9. Ability check modifiers (on ability score blocks) are rollable
10. Death save button rolls 1d20 and auto-fills success/failure circles per 5e rules
11. Death save natural 20 triggers HP recovery and stabilization
12. Death save natural 1 counts as 2 failures

## Dependencies

- Story 26.1 (Dice Roller Panel) for opening/populating the panel
- Story 26.2 (Dice Animation) for rendering the roll
- Story 26.3 (Advantage/Disadvantage) for pre-roll ADV/DIS option
- Story 26.4 (Roll History) for labeled history entries
- Phase 3 character sheet components (skills, saves, attacks, ability scores, death saves)

## Notes

- The d20 icon should be subtle enough not to clutter the sheet in view mode but discoverable via hover/tap
- Attack-to-damage chaining is a key UX feature -- the flow should feel natural and fast during combat
- Death save automation is critical for at-the-table play at 0 HP
- All rolls should respect active conditions (from Epic 29) that impose advantage or disadvantage
