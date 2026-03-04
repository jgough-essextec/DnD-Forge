# Story 10.5 — Fighting Style Selection (Conditional)

> **Epic 10: Class Selection Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a Fighter, Paladin, or Ranger player, I need to choose my Fighting Style at level 1. This story builds the conditional fighting style selector that appears for martial classes, displaying class-appropriate fighting style options as radio cards with descriptions and ability-based recommendations.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, Dexie.js database layer, Zustand stores, dice engine
- **Fighting Style Options by Class**:
  - **Fighter**: Archery (+2 ranged attack rolls), Defense (+1 AC when wearing armor), Dueling (+2 damage with one-handed weapon, no other weapon), Great Weapon Fighting (reroll 1s and 2s on damage dice with two-handed/versatile weapons), Protection (impose disadvantage on attack roll against adjacent ally when wielding shield), Two-Weapon Fighting (add ability modifier to off-hand damage)
  - **Paladin**: Defense, Dueling, Great Weapon Fighting, Protection
  - **Ranger**: Archery, Defense, Dueling, Two-Weapon Fighting
- **Conditional Rendering**: This selector only appears for Fighter, Paladin, and Ranger. All other classes do not see this component
- **Ability-Based Recommendations**: If ability scores have already been assigned (back-navigation), show a recommendation based on the character's stats (e.g., "With your high Dexterity, Archery or Two-Weapon Fighting would complement your build")
- **Shared Components**: Uses ChoiceGroup from Epic 16

## Tasks

- [ ] **T10.5.1** — Create `components/wizard/class/FightingStyleSelector.tsx` — conditionally rendered for Fighter, Paladin, and Ranger. Displays Fighting Style options as radio cards with name and description
- [ ] **T10.5.2** — Fighter options: Archery (+2 ranged attack), Defense (+1 AC when armored), Dueling (+2 damage one-handed), Great Weapon Fighting (reroll 1-2 damage dice with two-handed), Protection (impose disadvantage with shield), Two-Weapon Fighting (add ability mod to off-hand damage)
- [ ] **T10.5.3** — Paladin options: Defense, Dueling, Great Weapon Fighting, Protection
- [ ] **T10.5.4** — Ranger options: Archery, Defense, Dueling, Two-Weapon Fighting
- [ ] **T10.5.5** — Show a recommendation tip based on the character's ability scores (if already assigned): "With your high Dexterity, Archery or Two-Weapon Fighting would complement your build."

## Acceptance Criteria

- The fighting style selector appears only for Fighter, Paladin, and Ranger
- Each class shows only its available fighting style options (Fighter: 6, Paladin: 4, Ranger: 4)
- Fighting styles are displayed as radio cards with name and mechanical description
- Only one fighting style can be selected at a time
- If ability scores have been assigned, a recommendation tip appears suggesting styles that complement the character's stats
- The selected fighting style is captured in the wizard store
- Classes other than Fighter/Paladin/Ranger do not see the fighting style selector

## Dependencies

- **Depends on:** Story 10.1 (class must be selected to determine if fighting style applies), Epic 11 (ability scores may be assigned via back-navigation for recommendations), Epic 16 Story 16.1 (ChoiceGroup component), Phase 1 SRD class data
- **Blocks:** Story 10.6 (validation checks fighting style selection for applicable classes), Epic 15 (review shows fighting style in features list)

## Notes

- **Fighting Style Descriptions (SRD)**:
  - **Archery**: You gain a +2 bonus to attack rolls you make with ranged weapons
  - **Defense**: While you are wearing armor, you gain a +1 bonus to AC
  - **Dueling**: When you are wielding a melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon
  - **Great Weapon Fighting**: When you roll a 1 or 2 on a damage die for an attack you make with a melee weapon that you are wielding with two hands, you can reroll the die and must use the new roll. The weapon must have the two-handed or versatile property
  - **Protection**: When a creature you can see attacks a target other than you that is within 5 feet of you, you can use your reaction to impose disadvantage on the attack roll. You must be wielding a shield
  - **Two-Weapon Fighting**: When you engage in two-weapon fighting, you can add your ability modifier to the damage of the second attack
- The recommendation system should map: high DEX -> Archery, Two-Weapon Fighting; high STR -> Great Weapon Fighting, Dueling; balanced -> Defense, Protection
- Fighting style affects equipment recommendations in Step 5 (e.g., Archery -> recommend ranged weapons; Protection -> recommend shield)
