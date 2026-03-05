# D&D Character Forge — Phase 1: Foundation

## Detailed Epics, Stories & Tasks

**Phase Duration:** Weeks 1–2  
**Phase Goal:** Establish the complete project scaffolding, type system, SRD game data layer, calculation engine (fully tested), database schema, and basic routing shell — so that Phases 2–6 can build UI and features on a rock-solid foundation.

---

## Pre-Phase Audit: Gaps Identified in Original Spec

Before breaking Phase 1 into work items, a cross-reference of the technical spec against the D&D 5e rules surfaced the following gaps that **must be addressed in the Phase 1 type system and data layer** or the downstream phases will hit walls.

### Gap 1 — Armor Class Calculation Complexity (CRITICAL)

The spec says "Base 10 + DEX modifier (unarmored), or armor-specific formula" but does not enumerate the actual formulas. The calculation engine must handle all of these:

| Armor Type | AC Formula | DEX Cap | Stealth Penalty | STR Requirement |
|-----------|-----------|---------|-----------------|-----------------|
| Unarmored | 10 + DEX mod | None | No | — |
| Barbarian Unarmored Defense | 10 + DEX mod + CON mod | None | No | — |
| Monk Unarmored Defense | 10 + DEX mod + WIS mod | None | No | — |
| Light: Padded | 11 + DEX mod | None | Disadvantage | — |
| Light: Leather | 11 + DEX mod | None | No | — |
| Light: Studded Leather | 12 + DEX mod | None | No | — |
| Medium: Hide | 12 + DEX mod (max 2) | +2 | No | — |
| Medium: Chain Shirt | 13 + DEX mod (max 2) | +2 | No | — |
| Medium: Scale Mail | 14 + DEX mod (max 2) | +2 | Disadvantage | — |
| Medium: Breastplate | 14 + DEX mod (max 2) | +2 | No | — |
| Medium: Half Plate | 15 + DEX mod (max 2) | +2 | Disadvantage | — |
| Heavy: Ring Mail | 14 | 0 | Disadvantage | — |
| Heavy: Chain Mail | 16 | 0 | Disadvantage | STR 13 |
| Heavy: Splint | 17 | 0 | Disadvantage | STR 15 |
| Heavy: Plate | 18 | 0 | Disadvantage | STR 15 |
| Shield (add-on) | +2 to any above | — | — | — |

Additionally: wearing heavy armor without meeting the STR requirement reduces speed by 10 feet. Wearing armor without proficiency causes disadvantage on all STR/DEX ability checks, saves, and attack rolls, and prevents spellcasting.

### Gap 2 — Weapon Properties Not Defined

The spec references weapons and attacks but never defines weapon properties. The type system and data layer must account for:

| Property | Rule Effect |
|----------|-------------|
| Finesse | Use STR or DEX for attack/damage (player's choice) |
| Versatile | Different damage die one-handed vs. two-handed (e.g., 1d8 / 1d10) |
| Two-Handed | Requires two hands to attack |
| Light | Can be used for two-weapon fighting (dual wield) |
| Heavy | Small creatures have disadvantage on attacks |
| Reach | Melee range is 10 ft instead of 5 ft |
| Thrown | Can be used as a ranged weapon with specified range |
| Ammunition | Requires ammunition; has range (normal/long) |
| Loading | Only one attack per action regardless of Extra Attack |
| Special | Has unique rules (e.g., Lance, Net) |

Weapons also have categories (Simple Melee, Simple Ranged, Martial Melee, Martial Ranged) and damage types (Bludgeoning, Piercing, Slashing).

### Gap 3 — All 14 Standard Conditions Missing

The spec mentions "14 standard conditions" but never lists them. These must be defined as a type enum and stored with descriptions and mechanical effects:

Blinded, Charmed, Deafened, Exhaustion (6 levels), Frightened, Grappled, Incapacitated, Invisible, Paralyzed, Petrified, Poisoned, Prone, Restrained, Stunned, Unconscious

### Gap 4 — Damage Types & Resistances

Not enumerated in the spec. Required for racial traits (e.g., Tiefling fire resistance, Dwarf poison resistance) and spell damage:

Acid, Bludgeoning, Cold, Fire, Force, Lightning, Necrotic, Piercing, Poison, Psychic, Radiant, Slashing, Thunder

Plus immunity/vulnerability/resistance tracking on the character.

### Gap 5 — Currency System Incomplete

The spec mentions "CP, SP, EP, GP, PP with auto-conversion" but doesn't define rates:

- 1 PP = 10 GP
- 1 GP = 2 EP = 10 SP = 100 CP
- 1 EP = 5 SP

Starting gold by class (alternative to equipment packs) also missing:

| Class | Starting Gold (if not taking equipment) |
|-------|----------------------------------------|
| Barbarian | 2d4 × 10 gp |
| Bard | 5d4 × 10 gp |
| Cleric | 5d4 × 10 gp |
| Druid | 2d4 × 10 gp |
| Fighter | 5d4 × 10 gp |
| Monk | 5d4 gp |
| Paladin | 5d4 × 10 gp |
| Ranger | 5d4 × 10 gp |
| Rogue | 4d4 × 10 gp |
| Sorcerer | 3d4 × 10 gp |
| Warlock | 4d4 × 10 gp |
| Wizard | 4d4 × 10 gp |

### Gap 6 — Rest Mechanics Not Specified

Short rest and long rest are core gameplay. The type system and calculation engine need to know what resets on each:

**Short Rest (1+ hours):**
- Spend Hit Dice to recover HP (roll hit die + CON mod per die spent)
- Warlock spell slots recover
- Some class features recover (e.g., Fighter's Action Surge, Second Wind)

**Long Rest (8 hours):**
- Recover ALL lost HP
- Recover spent Hit Dice up to half your total (minimum 1)
- All spell slots recover (except Warlock pact slots)
- Most class features recover
- Reset death saves

### Gap 7 — Death Save Mechanics

The spec shows death saves as `{ successes: number; failures: number }` but the rules are nuanced:

- Roll a d20 (no modifiers) when at 0 HP at start of your turn
- 10+ = success, 9 or below = failure
- Natural 20 = regain 1 HP and consciousness (resets both counters)
- Natural 1 = counts as 2 failures
- 3 successes = stabilize (unconscious but no longer dying)
- 3 failures = death
- Taking damage at 0 HP = automatic failure (critical hit = 2 failures)
- Receiving healing at 0 HP = regain consciousness

### Gap 8 — Spellcasting System Variance

The spec treats spellcasting uniformly but there are three distinct systems:

**Prepared Casters** (Cleric, Druid, Paladin, Wizard): Know their full class spell list; prepare a subset each long rest. Number prepared = ability modifier + class level (min 1). Wizard additionally must have spells written in spellbook.

**Known Casters** (Bard, Ranger, Sorcerer): Know a fixed number of spells (per class table); can swap one spell on level-up.

**Pact Magic** (Warlock): Completely different system. Few spell slots (1-4) that are always cast at the highest available level and recharge on short rest, not long rest. Plus Mystic Arcanum at higher levels (1/long rest each for levels 6-9).

### Gap 9 — Multiclass Spell Slot Table

If multiclassing is supported (even in later phases), the type system must account for the multiclass spellcaster level calculation, which sums partial levels differently than single-class:

- Full casters (Bard, Cleric, Druid, Sorcerer, Wizard): contribute full level
- Half casters (Paladin, Ranger): contribute half level (rounded down)
- Third casters (Arcane Trickster Rogue, Eldritch Knight Fighter): contribute one-third level (rounded down)
- Warlock Pact Magic: does NOT contribute to multiclass spell slots (tracked separately)

### Gap 10 — Passive Scores (Not Just Perception)

The spec only mentions Passive Perception. The rules also define Passive Insight and Passive Investigation, all using the formula: 10 + skill modifier. Some DMs also use passive Stealth. The type system should support passive scores for any skill.

### Gap 11 — Inspiration Mechanic

Not mentioned in the spec. Inspiration is a binary flag (have it or don't). Granted by the DM for good roleplay. When used, grants advantage on one attack roll, saving throw, or ability check. Must be tracked on the character.

### Gap 12 — Carrying Capacity & Encumbrance

Mentioned briefly but rules not specified:

- **Carrying Capacity:** STR score × 15 = max weight in pounds
- **Push/Drag/Lift:** STR score × 30
- **Encumbrance (Variant):** STR × 5 = unencumbered; STR × 10 = encumbered (-10 speed); over that = heavily encumbered (-20 speed, disadvantage on ability checks, attacks, saves using STR/DEX/CON)
- Small creatures: halve carrying capacity
- Tiny creatures: quarter carrying capacity

### Gap 13 — Feat Prerequisites

Some feats require minimum ability scores, specific races, or other conditions. The type system needs a `prerequisites` field on feats.

### Gap 14 — Special Class Features Affecting Calculations

Several class features alter how standard calculations work. The type system and calculation engine must be extensible enough to handle these:

- **Jack of All Trades** (Bard 2): Add half proficiency bonus (rounded down) to ability checks that don't already include proficiency
- **Remarkable Athlete** (Champion Fighter 7): Add half proficiency to STR/DEX/CON checks without proficiency
- **Reliable Talent** (Rogue 11): Treat any d20 roll below 10 as a 10 for proficient skills
- **Expertise** (Bard/Rogue): Double proficiency bonus on chosen skills
- **Fighting Styles**: Various static bonuses (Defense: +1 AC, Dueling: +2 damage, etc.)
- **Rage** (Barbarian): Bonus damage, resistance to bludgeoning/piercing/slashing
- **Unarmored Defense** (Barbarian/Monk): Alternate AC formulas

### Gap 15 — Spell Schools & Ritual Casting

The spec mentions spell schools but doesn't enumerate them. All 8 schools must be typed:

Abjuration, Conjuration, Divination, Enchantment, Evocation, Illusion, Necromancy, Transmutation

Ritual casting: Some spells have the "ritual" tag. Classes that can ritual cast (Bard, Cleric, Druid, Wizard) can cast these without expending a spell slot if they add 10 minutes to the casting time. Wizard can ritual cast any ritual spell in their spellbook (even if not prepared). The Spell type needs a `ritual: boolean` field.

### Gap 16 — Concentration

Only one concentration spell can be active at a time. Taking damage requires a CON saving throw (DC = 10 or half damage taken, whichever is higher) to maintain concentration. Spells need a `concentration: boolean` field, and the character needs an `activeConcentrationSpell` tracker.

---

## Epic 1: Project Scaffolding & Developer Toolchain

**Goal:** A clean, running project with all dependencies installed, configured, and verified. A developer can run `npm run dev` and see a blank app shell with routing.

### Story 1.1 — Initialize Project with Vite + React + TypeScript

> As a developer, I need a properly configured React TypeScript project so I can begin building components with type safety and hot reload.

**Tasks:**

- [ ] **T1.1.1** — Run `npm create vite@latest dnd-forge -- --template react-ts` and verify the project compiles
- [ ] **T1.1.2** — Configure `tsconfig.json` with strict mode, path aliases (`@/` → `src/`), and `baseUrl`
- [ ] **T1.1.3** — Set up the directory structure per the architecture spec (`components/`, `data/`, `hooks/`, `stores/`, `utils/`, `types/`, `styles/`)
- [ ] **T1.1.4** — Add `.editorconfig` and `.prettierrc` with consistent formatting rules (2-space indent, single quotes, trailing commas)
- [ ] **T1.1.5** — Create a `README.md` with project overview, setup instructions, and architecture summary

### Story 1.2 — Install and Configure Tailwind CSS + shadcn/ui

> As a developer, I need the styling framework configured so all components can use utility-first CSS and pre-built accessible UI components.

**Tasks:**

- [ ] **T1.2.1** — Install Tailwind CSS v3 and configure `tailwind.config.ts` with custom theme tokens (colors, fonts, spacing from Section 6.1 of the spec)
- [ ] **T1.2.2** — Configure the dark fantasy color palette as Tailwind custom colors (`bg-primary: #1a1a2e`, `accent-gold: #e8b430`, etc.)
- [ ] **T1.2.3** — Add Google Fonts: Cinzel (headings), Inter (body), JetBrains Mono (monospace) via `@import` in the global CSS
- [ ] **T1.2.4** — Initialize shadcn/ui with `npx shadcn-ui@latest init` and configure the dark theme variant
- [ ] **T1.2.5** — Install initial shadcn/ui component set: Button, Card, Dialog, Input, Select, Tabs, Tooltip, Badge, Separator, ScrollArea, Sheet, DropdownMenu, Table
- [ ] **T1.2.6** — Create a `ThemeProvider` wrapper component that applies the dark fantasy theme globally
- [ ] **T1.2.7** — Build a quick visual test page (`/dev/kitchen-sink`) rendering every installed shadcn component to verify styling

### Story 1.3 — Install Runtime Dependencies

> As a developer, I need all non-UI runtime dependencies installed and import-verified so downstream code can use them immediately.

**Tasks:**

- [ ] **T1.3.1** — Install state management: `zustand` + `zustand/middleware` (persist)
- [ ] **T1.3.2** — Install database: `dexie` + `dexie-react-hooks`
- [ ] **T1.3.3** — Install routing: `react-router-dom` v6
- [ ] **T1.3.4** — Install utilities: `uuid`, `lodash-es` (tree-shakeable)
- [ ] **T1.3.5** — Install PDF generation: `jspdf`, `html2canvas`
- [ ] **T1.3.6** — Install drag-and-drop: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- [ ] **T1.3.7** — Install animation: `framer-motion`
- [ ] **T1.3.8** — Install icons: `lucide-react`
- [ ] **T1.3.9** — Create a dependency verification script that imports each package and logs success

### Story 1.4 — Install and Configure Testing Framework

> As a developer, I need a test runner configured so I can write and run unit tests for the calculation engine from the start.

**Tasks:**

- [ ] **T1.4.1** — Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`
- [ ] **T1.4.2** — Configure `vitest.config.ts` with jsdom environment, path aliases matching tsconfig, and coverage reporting
- [ ] **T1.4.3** — Create `src/test/setup.ts` with Testing Library matchers and global test utilities
- [ ] **T1.4.4** — Write a trivial smoke test (`src/App.test.tsx`) that renders the root component and verifies it mounts
- [ ] **T1.4.5** — Add npm scripts: `test`, `test:watch`, `test:coverage`
- [ ] **T1.4.6** — Verify coverage reporting produces an HTML report in `coverage/`

### Story 1.5 — Set Up Routing Shell

> As a developer, I need the application routes defined with placeholder pages so that navigation works end-to-end.

**Tasks:**

- [ ] **T1.5.1** — Create React Router `BrowserRouter` wrapper in `App.tsx`
- [ ] **T1.5.2** — Define route structure with lazy-loaded placeholder pages:
  - `/` — Home (Character Gallery)
  - `/character/new` — Creation Wizard
  - `/character/:id` — Character Sheet View
  - `/character/:id/edit` — Character Sheet Edit Mode
  - `/character/:id/levelup` — Level Up Flow
  - `/campaigns` — Campaign List (DM)
  - `/campaign/:id` — Campaign Dashboard (DM)
  - `/campaign/:id/encounter` — Initiative Tracker (DM)
  - `/dice` — Standalone Dice Roller
  - `/settings` — App Settings
  - `*` — 404 Not Found
- [ ] **T1.5.3** — Create a `MainLayout` component with: top navigation bar (logo, nav links), content area, and bottom mobile nav bar
- [ ] **T1.5.4** — Create placeholder page components for each route (a card with the page name and a "coming in Phase N" label)
- [ ] **T1.5.5** — Implement responsive navigation: top nav on desktop, bottom tab bar on mobile (breakpoint at 640px)
- [ ] **T1.5.6** — Add a global error boundary that catches rendering errors and shows a recovery UI

---

## Epic 2: Complete Type System

**Goal:** Every game entity, character field, calculation input/output, and UI state shape is defined as TypeScript types/interfaces. This is the single source of truth that all code depends on. No component or function gets written without types first.

### Story 2.1 — Core Ability & Skill Types

> As a developer, I need type-safe representations of abilities, skills, and their relationships so the calculation engine can be built with compiler-verified correctness.

**Tasks:**

- [ ] **T2.1.1** — Define `AbilityName` union type: `'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma'`
- [ ] **T2.1.2** — Define `AbilityScores` interface with all 6 abilities as `number` properties
- [ ] **T2.1.3** — Define `SkillName` union type for all 18 skills
- [ ] **T2.1.4** — Define `SKILL_ABILITY_MAP` constant mapping each skill to its governing ability (e.g., `'acrobatics' → 'dexterity'`)
- [ ] **T2.1.5** — Define `SkillProficiency` interface: `{ skill: SkillName; proficient: boolean; expertise: boolean }`
- [ ] **T2.1.6** — Define `SavingThrow` type: `{ ability: AbilityName; proficient: boolean }`
- [ ] **T2.1.7** — Define `PassiveScore` type: `{ skill: SkillName; value: number }` (supporting Perception, Insight, Investigation, and any other)
- [ ] **T2.1.8** — Define `Alignment` type as union of all 9 alignment values plus `'unaligned'`

### Story 2.2 — Race & Species Types

> As a developer, I need complete type definitions for races so the data layer and wizard can present race options with full trait information.

**Tasks:**

- [ ] **T2.2.1** — Define `Size` type: `'Tiny' | 'Small' | 'Medium' | 'Large'`
- [ ] **T2.2.2** — Define `DamageType` enum for all 13 damage types (Acid, Bludgeoning, Cold, Fire, Force, Lightning, Necrotic, Piercing, Poison, Psychic, Radiant, Slashing, Thunder)
- [ ] **T2.2.3** — Define `Resistance` interface: `{ damageType: DamageType; type: 'resistance' | 'immunity' | 'vulnerability' }`
- [ ] **T2.2.4** — Define `Sense` interface: `{ type: 'darkvision' | 'blindsight' | 'tremorsense' | 'truesight'; range: number }`
- [ ] **T2.2.5** — Define `RacialTrait` interface: `{ id: string; name: string; description: string; mechanicalEffect?: MechanicalEffect }`
- [ ] **T2.2.6** — Define `Subrace` interface: `{ id: string; name: string; abilityScoreIncrease: Partial<AbilityScores>; traits: RacialTrait[]; additionalLanguages?: string[] }`
- [ ] **T2.2.7** — Define `Race` interface with all fields: `id, name, description, abilityScoreIncrease, age, size, speed, senses, traits, languages, subraces, proficiencies, resistances, innateSpellcasting?`
- [ ] **T2.2.8** — Define `RaceSelection` interface (what gets saved on the character): `{ raceId: string; subraceId?: string; chosenLanguages?: string[]; chosenCantrip?: string; chosenSkills?: string[] }` — accounting for races with choices (e.g., High Elf gets a wizard cantrip, Half-Elf gets 2 skills)

### Story 2.3 — Class & Subclass Types

> As a developer, I need class types that capture the full complexity of class features, proficiencies, spell progression, and level-by-level advancement.

**Tasks:**

- [ ] **T2.3.1** — Define `HitDie` type: `4 | 6 | 8 | 10 | 12`
- [ ] **T2.3.2** — Define `ArmorCategory` type: `'light' | 'medium' | 'heavy' | 'shields'`
- [ ] **T2.3.3** — Define `WeaponCategory` type: `'simple melee' | 'simple ranged' | 'martial melee' | 'martial ranged'` plus specific weapon names
- [ ] **T2.3.4** — Define `ClassProficiencies` interface: `{ armor: ArmorCategory[]; weapons: (WeaponCategory | string)[]; tools: string[]; savingThrows: [AbilityName, AbilityName]; skillChoices: { choose: number; from: SkillName[] } }`
- [ ] **T2.3.5** — Define `Feature` interface: `{ id: string; name: string; description: string; level: number; recharge?: 'shortRest' | 'longRest' | 'none'; usesPerRecharge?: number; currentUses?: number; mechanicalEffect?: MechanicalEffect }`
- [ ] **T2.3.6** — Define `MechanicalEffect` union type to represent calculable effects: AC bonuses, extra damage, advantage/disadvantage, etc. Include `{ type: 'acCalculation'; formula: string }`, `{ type: 'bonusDamage'; dice: string; damageType: DamageType }`, `{ type: 'proficiencyModifier'; modifier: 'half' | 'double' }`, `{ type: 'fightingStyle'; style: FightingStyle }`, etc.
- [ ] **T2.3.7** — Define `FightingStyle` union type: `'archery' | 'defense' | 'dueling' | 'great-weapon-fighting' | 'protection' | 'two-weapon-fighting'`
- [ ] **T2.3.8** — Define `SpellcastingType` enum: `'full' | 'half' | 'third' | 'pact' | 'none'`
- [ ] **T2.3.9** — Define `ClassSpellcasting` interface: `{ type: SpellcastingType; ability: AbilityName; cantripsKnown: number[]; spellsKnownOrPrepared: 'known' | 'prepared'; spellsKnownByLevel?: number[]; ritualCasting: boolean; spellListId: string; focusType?: string }`
- [ ] **T2.3.10** — Define `SpellSlotProgression` type: a 20-element array of `SpellSlots` objects (one per level) — `SpellSlots = { [level: 1-9]: number }`
- [ ] **T2.3.11** — Define `ASILevel` array type: which levels the class gets Ability Score Improvements (most classes: 4, 8, 12, 16, 19; Fighter: 4, 6, 8, 12, 14, 16, 19; Rogue: 4, 8, 10, 12, 16, 19)
- [ ] **T2.3.12** — Define `Subclass` interface: `{ id: string; name: string; classId: string; description: string; features: Record<number, Feature[]>; spellList?: string[] }`
- [ ] **T2.3.13** — Define `Class` interface: `{ id, name, description, hitDie, primaryAbility, proficiencies, features: Record<number, Feature[]>, subclassLevel, subclassName, subclasses, spellcasting?, asiLevels, startingEquipment, startingGoldDice, multiclassRequirements? }`
- [ ] **T2.3.14** — Define `ClassSelection` interface (saved on character): `{ classId: string; subclassId?: string; level: number; chosenSkills: SkillName[]; chosenFightingStyle?: FightingStyle; chosenExpertise?: SkillName[]; hpRolls: number[] }`

### Story 2.4 — Equipment & Inventory Types

> As a developer, I need types covering all equipment categories, weapon properties, armor formulas, and inventory management.

**Tasks:**

- [ ] **T2.4.1** — Define `WeaponProperty` union type: `'ammunition' | 'finesse' | 'heavy' | 'light' | 'loading' | 'reach' | 'special' | 'thrown' | 'two-handed' | 'versatile'`
- [ ] **T2.4.2** — Define `DamageDice` interface: `{ count: number; die: DieType; type: DamageType; versatileDie?: DieType }`
- [ ] **T2.4.3** — Define `Weapon` interface: `{ id, name, category: WeaponCategory, damage: DamageDice, properties: WeaponProperty[], weight, cost: CurrencyAmount, range?: { normal: number; long: number }, special?: string }`
- [ ] **T2.4.4** — Define `ArmorType` enum: `'none' | 'padded' | 'leather' | 'studded-leather' | 'hide' | 'chain-shirt' | 'scale-mail' | 'breastplate' | 'half-plate' | 'ring-mail' | 'chain-mail' | 'splint' | 'plate'`
- [ ] **T2.4.5** — Define `Armor` interface: `{ id, name, type: ArmorType, category: ArmorCategory, baseAC: number, dexCap: number | null, stealthDisadvantage: boolean, strengthRequirement?: number, weight, cost: CurrencyAmount }`
- [ ] **T2.4.6** — Define `EquipmentCategory` type: `'weapon' | 'armor' | 'shield' | 'adventuring-gear' | 'tool' | 'mount' | 'trade-good' | 'pack'`
- [ ] **T2.4.7** — Define `EquipmentItem` interface: `{ id, name, category, description, weight, cost, quantity, isEquipped, isAttuned?, requiresAttunement?, properties?: Record<string, any> }`
- [ ] **T2.4.8** — Define `Currency` interface: `{ cp: number; sp: number; ep: number; gp: number; pp: number }`
- [ ] **T2.4.9** — Define `CurrencyAmount` interface: `{ amount: number; unit: 'cp' | 'sp' | 'ep' | 'gp' | 'pp' }`
- [ ] **T2.4.10** — Define `CURRENCY_CONVERSION_RATES` constant: `{ pp: 1000, gp: 100, ep: 50, sp: 10, cp: 1 }` (all in CP as base unit)
- [ ] **T2.4.11** — Define `StartingEquipmentChoice` type: `{ choose: number; options: (string | string[])[] }` — to represent "pick one of these options" from class/background
- [ ] **T2.4.12** — Define `Encumbrance` interface: `{ currentWeight: number; carryCapacity: number; pushDragLift: number; encumbered: boolean; heavilyEncumbered: boolean }`

### Story 2.5 — Spell & Spellcasting Types

> As a developer, I need types covering the three spellcasting systems (prepared, known, pact magic), spell properties, concentration tracking, and ritual casting.

**Tasks:**

- [ ] **T2.5.1** — Define `SpellSchool` enum: all 8 schools (Abjuration through Transmutation)
- [ ] **T2.5.2** — Define `SpellLevel` type: `0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9` (0 = cantrip)
- [ ] **T2.5.3** — Define `CastingTime` type: `{ value: number; unit: 'action' | 'bonus action' | 'reaction' | 'minute' | 'hour'; reactionTrigger?: string }`
- [ ] **T2.5.4** — Define `SpellRange` type: `{ type: 'self' | 'touch' | 'ranged' | 'sight' | 'unlimited'; distance?: number; unit?: 'feet' | 'miles'; shape?: 'cone' | 'cube' | 'cylinder' | 'line' | 'sphere'; areaSize?: number }`
- [ ] **T2.5.5** — Define `SpellComponents` interface: `{ verbal: boolean; somatic: boolean; material: boolean; materialDescription?: string; materialCost?: CurrencyAmount; materialConsumed?: boolean }`
- [ ] **T2.5.6** — Define `SpellDuration` type: `{ type: 'instantaneous' | 'concentration' | 'timed' | 'until-dispelled'; value?: number; unit?: 'round' | 'minute' | 'hour' | 'day' }`
- [ ] **T2.5.7** — Define `Spell` interface: `{ id, name, level: SpellLevel, school: SpellSchool, castingTime, range, components, duration, description, higherLevelDescription?, ritual: boolean, concentration: boolean, classes: string[], damage?: DamageDice, savingThrow?: AbilityName, attackType?: 'melee' | 'ranged' }`
- [ ] **T2.5.8** — Define `SpellSlots` interface: `{ [key: number]: number }` for slots 1-9, and `UsedSpellSlots` mirror type
- [ ] **T2.5.9** — Define `PactMagic` interface: `{ slotLevel: number; totalSlots: number; usedSlots: number; mysticArcanum: { [level: number]: { spellId: string; used: boolean } } }`
- [ ] **T2.5.10** — Define `SpellcastingData` interface: `{ type: SpellcastingType; ability: AbilityName; cantrips: string[]; knownSpells: string[]; preparedSpells: string[]; spellSlots: SpellSlots; usedSpellSlots: SpellSlots; pactMagic?: PactMagic; activeConcentration?: string; ritualCasting: boolean }`
- [ ] **T2.5.11** — Define `MULTICLASS_SPELL_SLOT_TABLE` constant: a 20-row table mapping combined spellcaster level to spell slots per level

### Story 2.6 — Background & Personality Types

> As a developer, I need types for backgrounds and the personality/roleplaying system.

**Tasks:**

- [ ] **T2.6.1** — Define `PersonalityTrait` interface: `{ id: string; text: string }`
- [ ] **T2.6.2** — Define `Background` interface: `{ id, name, description, skillProficiencies: SkillName[], toolProficiencies: string[], languages: { choose: number } | string[], equipment: string[], feature: Feature, personalityTraits: PersonalityTrait[], ideals: PersonalityTrait[], bonds: PersonalityTrait[], flaws: PersonalityTrait[], suggestedCharacteristics?: string }`
- [ ] **T2.6.3** — Define `BackgroundSelection` interface (saved on character): `{ backgroundId: string; chosenSkills?: SkillName[]; chosenLanguages?: string[]; chosenTools?: string[] }`
- [ ] **T2.6.4** — Define `CharacterDescription` interface: `{ name: string; age: string; height: string; weight: string; eyes: string; skin: string; hair: string; appearance: string; backstory: string; alliesAndOrgs: string; treasure: string }`

### Story 2.7 — Condition, Combat & Session Types

> As a developer, I need types for all gameplay-state tracking: conditions, combat, initiative, rests, and death saves.

**Tasks:**

- [ ] **T2.7.1** — Define `Condition` enum: all 14 standard conditions (Blinded through Unconscious) plus Exhaustion with level tracking
- [ ] **T2.7.2** — Define `ConditionInstance` interface: `{ condition: Condition; exhaustionLevel?: 1|2|3|4|5|6; source?: string; duration?: string }`
- [ ] **T2.7.3** — Define `DeathSaves` interface: `{ successes: 0|1|2|3; failures: 0|1|2|3; stable: boolean }`
- [ ] **T2.7.4** — Define `Speed` interface: `{ walk: number; fly?: number; swim?: number; climb?: number; burrow?: number }` — accounting for races/features with multiple movement types
- [ ] **T2.7.5** — Define `Attack` interface: `{ name: string; attackBonus: number; damage: DamageDice; range?: string; properties?: string[]; isProficient: boolean; abilityUsed: AbilityName }`
- [ ] **T2.7.6** — Define `InitiativeEntry` interface: `{ id: string; name: string; initiative: number; isPlayer: boolean; characterId?: string; hp?: number; maxHp?: number; ac?: number; conditions: ConditionInstance[] }`
- [ ] **T2.7.7** — Define `Encounter` interface: `{ id: string; campaignId: string; entries: InitiativeEntry[]; currentTurnIndex: number; round: number; isActive: boolean }`
- [ ] **T2.7.8** — Define `RestType` enum: `'short' | 'long'`

### Story 2.8 — Character Master Type

> As a developer, I need the complete Character interface that aggregates all sub-types into the master entity.

**Tasks:**

- [ ] **T2.8.1** — Define the master `Character` interface incorporating all sub-types from stories 2.1–2.7 (see spec Section 5.3 enhanced with gap corrections). This should include:
  - Identity fields (id, name, playerName, avatar, createdAt, updatedAt, version)
  - Core choices (race: RaceSelection, classes: ClassSelection[], background: BackgroundSelection, alignment)
  - Ability scores (base scores, method used, raw rolls)
  - Level & XP
  - Combat stats (hpMax, hpCurrent, tempHp, hitDiceTotal, hitDiceUsed, armorClassOverride?, initiativeBonus?, speed, deathSaves)
  - Proficiencies (all categories)
  - Equipment & inventory (equipment, currency, attunedItems)
  - Spellcasting data
  - Features, traits, feats
  - Personality & description
  - Conditions
  - Inspiration (boolean)
  - Meta (campaignId, isArchived, dmNotes)
- [ ] **T2.8.2** — Define `CharacterSummary` interface (for gallery cards): `{ id, name, race, class, level, hp, ac, avatarUrl? }`
- [ ] **T2.8.3** — Define `CharacterExport` type (for JSON import/export): `Character` plus a `formatVersion: string` field
- [ ] **T2.8.4** — Define `CharacterValidation` type: `{ field: string; severity: 'error' | 'warning'; message: string }[]`

### Story 2.9 — Campaign & DM Types

> As a developer, I need campaign, session, and DM note types.

**Tasks:**

- [ ] **T2.9.1** — Define `HouseRules` interface: `{ allowedSources: string[]; abilityScoreMethod: 'standard' | 'pointBuy' | 'rolled' | 'any'; startingLevel: number; startingGold?: number; allowMulticlass: boolean; allowFeats: boolean; encumbranceVariant: boolean }`
- [ ] **T2.9.2** — Define `SessionNote` interface: `{ id, date, title, content, xpAwarded?, lootDistributed?: { characterId: string; items: string[] }[] }`
- [ ] **T2.9.3** — Define `Campaign` interface: `{ id, name, description, dmId, playerIds: string[], characterIds: string[], joinCode, houseRules, sessions: SessionNote[], npcs?: NPC[], createdAt, updatedAt }`
- [ ] **T2.9.4** — Define `NPC` interface: `{ id, name, description, location?, relationship?: string, stats?: Partial<Character>, dmNotes?: string }`

### Story 2.10 — UI State & Store Types

> As a developer, I need types for all application-level state management.

**Tasks:**

- [ ] **T2.10.1** — Define `WizardState` interface: `{ currentStep: number; raceSelection?: RaceSelection; classSelection?: ClassSelection; abilityScores?: AbilityScores; abilityScoreMethod?: string; backgroundSelection?: BackgroundSelection; equipmentSelections?: any[]; spellSelections?: string[]; isComplete: boolean }`
- [ ] **T2.10.2** — Define `UIState` interface: `{ activeModal: string | null; sidebarOpen: boolean; editMode: boolean; mobileNavOpen: boolean; diceRollerOpen: boolean }`
- [ ] **T2.10.3** — Define `DieType` type: `'d4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100'`
- [ ] **T2.10.4** — Define `DiceRoll` interface: `{ id: string; dice: { type: DieType; count: number }[]; results: number[]; modifier: number; total: number; label?: string; advantage?: boolean; disadvantage?: boolean; timestamp: Date }`
- [ ] **T2.10.5** — Define `UserPreferences` interface: `{ diceAnimations: boolean; autoCalculate: boolean; theme: 'dark' | 'light'; defaultAbilityScoreMethod: string; showTooltips: boolean }`
- [ ] **T2.10.6** — Create a barrel export file `types/index.ts` that re-exports every type for clean imports

---

## Epic 3: SRD Game Data Layer

**Goal:** All D&D 5e Systems Reference Document data is structured as static JSON files, importable as typed constants. This is the game's reference library — immutable at runtime.

### Story 3.1 — Race Data Files

> As a developer, I need complete race data for all 9 SRD races so the wizard can present them with full mechanical detail.

**Tasks:**

- [ ] **T3.1.1** — Create `data/races.json` (or `.ts` for type safety) containing all 9 core PHB races:
  - **Dwarf** (subraces: Hill, Mountain) — CON+2; Darkvision 60ft; Dwarven Resilience (poison resistance); Stonecunning; Speed 25ft (not reduced by heavy armor)
  - **Elf** (subraces: High, Wood, Dark/Drow) — DEX+2; Darkvision 60ft; Keen Senses (Perception proficiency); Fey Ancestry (charm advantage); Trance
  - **Halfling** (subraces: Lightfoot, Stout) — DEX+2; Lucky (reroll natural 1s); Brave (advantage vs frightened); Halfling Nimbleness; Speed 25ft; Size Small
  - **Human** (variant: Variant Human) — +1 all abilities (standard) or +1 to two abilities + 1 feat + 1 skill (variant)
  - **Dragonborn** — STR+2, CHA+1; Breath Weapon (damage type by ancestry); Damage Resistance by ancestry; 10 ancestry types
  - **Gnome** (subraces: Forest, Rock) — INT+2; Darkvision 60ft; Gnome Cunning (advantage on INT/WIS/CHA saves vs magic); Size Small
  - **Half-Elf** — CHA+2, +1 to two other abilities (player choice); Darkvision 60ft; Fey Ancestry; 2 extra skill proficiencies (player choice)
  - **Half-Orc** — STR+2, CON+1; Darkvision 60ft; Menacing (Intimidation proficiency); Relentless Endurance (drop to 1 HP instead of 0, 1/long rest); Savage Attacks (extra damage die on crit)
  - **Tiefling** — CHA+2, INT+1; Darkvision 60ft; Hellish Resistance (fire); Infernal Legacy (thaumaturgy cantrip, hellish rebuke at 3rd, darkness at 5th)
- [ ] **T3.1.2** — Validate every race entry has all required fields per the `Race` type interface
- [ ] **T3.1.3** — Create `data/languages.json` with all SRD languages: Common, Dwarvish, Elvish, Giant, Gnomish, Goblin, Halfling, Orc, Abyssal, Celestial, Draconic, Deep Speech, Infernal, Primordial, Sylvan, Undercommon — with script families
- [ ] **T3.1.4** — Create typed loader: `import { races } from '@/data/races'` with full type inference

### Story 3.2 — Class Data Files

> As a developer, I need complete class data for all 12 SRD classes with level-by-level feature progression, proficiencies, and spell slot tables.

**Tasks:**

- [ ] **T3.2.1** — Create `data/classes.json` containing all 12 core classes with:
  - Hit die, primary abilities, saving throw proficiencies
  - Full proficiency lists (armor, weapons, tools, skill choices)
  - Level 1-20 feature progression (every feature at every level)
  - Subclass selection level and subclass name (e.g., "Martial Archetype" for Fighter)
  - ASI levels for each class
  - Starting equipment choices (with option groups)
  - Starting gold dice formula
- [ ] **T3.2.2** — Create `data/subclasses.json` with at least the SRD subclass for each class:
  - Barbarian: Path of the Berserker
  - Bard: College of Lore
  - Cleric: Life Domain
  - Druid: Circle of the Land
  - Fighter: Champion
  - Monk: Way of the Open Hand
  - Paladin: Oath of Devotion
  - Ranger: Hunter
  - Rogue: Thief
  - Sorcerer: Draconic Bloodline
  - Warlock: The Fiend
  - Wizard: School of Evocation
- [ ] **T3.2.3** — Create `data/spell-slot-progression.json` with the full 20-level spell slot table for each spellcasting type (full, half, third, pact magic)
- [ ] **T3.2.4** — Create `data/multiclass-spell-slots.json` with the multiclass spellcaster table (20 rows mapping combined caster level → slots per level)
- [ ] **T3.2.5** — Create `data/class-features/` directory with individual feature descriptions for features that need long text (e.g., Rage, Wild Shape, Channel Divinity, Sneak Attack)
- [ ] **T3.2.6** — Validate all class data against SRD source for accuracy

### Story 3.3 — Spell Database

> As a developer, I need the complete SRD spell list as a searchable, filterable dataset.

**Tasks:**

- [ ] **T3.3.1** — Create `data/spells.json` with all ~300 SRD spells, each containing: id, name, level (0-9), school, casting time, range, components (V/S/M with descriptions), duration, concentration flag, ritual flag, description, higher-level scaling, class list
- [ ] **T3.3.2** — Create spell index files by class: `data/spell-lists/wizard.json`, `data/spell-lists/cleric.json`, etc. — each containing an array of spell IDs for that class
- [ ] **T3.3.3** — Verify every spell has accurate data: cross-check 20 randomly selected spells against SRD source
- [ ] **T3.3.4** — Create utility function `getSpellsByClass(classId: string, maxLevel?: number): Spell[]`
- [ ] **T3.3.5** — Create utility function `searchSpells(query: string, filters?: { level?, school?, class?, ritual?, concentration? }): Spell[]`

### Story 3.4 — Equipment Database

> As a developer, I need all SRD weapons, armor, adventuring gear, tools, and packs as structured data.

**Tasks:**

- [ ] **T3.4.1** — Create `data/weapons.json` with all SRD weapons. Each weapon must include: name, category (simple melee/ranged, martial melee/ranged), cost, damage dice + type, weight, properties array with relevant details (range for thrown/ammunition, versatile die)
- [ ] **T3.4.2** — Create `data/armor.json` with all 13 armor types plus shields. Each must include: name, category (light/medium/heavy/shield), cost, base AC, DEX cap (null for uncapped, 0 for heavy), STR requirement, stealth disadvantage flag, weight
- [ ] **T3.4.3** — Create `data/adventuring-gear.json` with all SRD gear items (rope, torches, rations, etc.)
- [ ] **T3.4.4** — Create `data/tools.json` with all SRD tools (artisan's tools, gaming sets, musical instruments, thieves' tools, navigator's tools, etc.)
- [ ] **T3.4.5** — Create `data/equipment-packs.json` with pre-built packs (Burglar's Pack, Diplomat's Pack, Dungeoneer's Pack, Entertainer's Pack, Explorer's Pack, Priest's Pack, Scholar's Pack) — listing contents and total cost
- [ ] **T3.4.6** — Create `data/starting-gold.json` mapping each class ID to its starting gold dice formula

### Story 3.5 — Background Data

> As a developer, I need all SRD backgrounds with their proficiencies, equipment, features, and personality characteristic tables.

**Tasks:**

- [ ] **T3.5.1** — Create `data/backgrounds.json` with SRD backgrounds: Acolyte, Charlatan, Criminal/Spy, Entertainer, Folk Hero, Guild Artisan, Hermit, Noble, Outlander, Sage, Sailor, Soldier, Urchin — plus any additional SRD backgrounds
- [ ] **T3.5.2** — Each background must include: skill proficiencies, tool proficiencies, languages (fixed or choice), equipment list, feature (name + description), and personality characteristic tables (d8 personality traits, d6 ideals with alignment tags, d6 bonds, d6 flaws)
- [ ] **T3.5.3** — Validate that no background duplicates a class skill in a way that would create conflicts (note: if overlap occurs, player gets to choose a replacement — document this rule)

### Story 3.6 — Feat Data

> As a developer, I need all SRD feats with prerequisites and mechanical effects.

**Tasks:**

- [ ] **T3.6.1** — Create `data/feats.json` with all SRD feats. Each feat must include: id, name, description, prerequisites (ability score minimums, race requirements, proficiency requirements, or none), mechanical effects (ability score increases, new proficiencies, special abilities)
- [ ] **T3.6.2** — Flag which feats include a +1 ability score increase (relevant for ASI/feat choice)
- [ ] **T3.6.3** — Create utility function `getAvailableFeats(character: Character): Feat[]` that filters by prerequisites

### Story 3.7 — Reference Tables & Constants

> As a developer, I need all static game rule tables available as typed constants.

**Tasks:**

- [ ] **T3.7.1** — Create `data/rules.json` or `utils/constants.ts` containing:
  - Ability score modifier lookup table (score → modifier)
  - Proficiency bonus by level table (level → bonus)
  - XP thresholds by level table (level → cumulative XP)
  - Point buy cost table (score → cumulative cost)
  - Standard array values [15, 14, 13, 12, 10, 8]
  - Carrying capacity multiplier (15 lbs per STR point)
  - Encumbrance thresholds (STR × 5 and STR × 10)
  - Currency conversion rates (all to CP base)
  - Starting gold dice by class
- [ ] **T3.7.2** — Create `data/conditions.json` with all 14 conditions, each including: name, description, mechanical effects (listed as bullet points), whether it has levels (exhaustion only)
- [ ] **T3.7.3** — Create `CONDITION_EFFECTS` constant mapping each condition to its mechanical impact on the character (e.g., Blinded → disadvantage on attack rolls, auto-fail checks requiring sight, attacks against you have advantage)

---

## Epic 4: Calculation Engine

**Goal:** A pure-function calculation module that computes every derived stat from source data. Fully unit tested. Zero UI dependencies. This is the mathematical brain of the application.

### Story 4.1 — Ability Score Calculations

> As a developer, I need functions to compute modifiers, apply racial bonuses, and validate ability score generation methods.

**Tasks:**

- [ ] **T4.1.1** — Implement `getModifier(score: number): number` — `Math.floor((score - 10) / 2)`
- [ ] **T4.1.2** — Implement `getTotalAbilityScore(base: number, racialBonus: number, asiBonus: number, featBonus: number, miscBonus: number): number` — capped at 20 (unless feature overrides, e.g., Barbarian capstone goes to 24)
- [ ] **T4.1.3** — Implement `getEffectiveAbilityScores(character: Character): AbilityScores` — applies all bonuses to base scores
- [ ] **T4.1.4** — Implement `validateStandardArray(assignments: number[]): boolean` — must be a permutation of [15, 14, 13, 12, 10, 8]
- [ ] **T4.1.5** — Implement `validatePointBuy(scores: AbilityScores): { valid: boolean; pointsUsed: number; pointsRemaining: number }` — each score 8-15, total cost ≤ 27
- [ ] **T4.1.6** — Implement `getPointBuyCost(score: number): number` — lookup from cost table
- [ ] **T4.1.7** — Implement `rollAbilityScore(): { rolls: number[]; dropped: number; total: number }` — roll 4d6, drop lowest, using `crypto.getRandomValues`
- [ ] **T4.1.8** — Write unit tests: modifier table (score 1→-5, 10→0, 18→+4, 20→+5), point buy boundary cases, standard array validation (valid and invalid permutations), 10,000-roll distribution sanity check

### Story 4.2 — Proficiency & Skill Calculations

> As a developer, I need functions for proficiency bonus, skill modifiers, saving throws, and passive scores.

**Tasks:**

- [ ] **T4.2.1** — Implement `getProficiencyBonus(level: number): number` — `Math.ceil(level / 4) + 1`
- [ ] **T4.2.2** — Implement `getSkillModifier(character: Character, skill: SkillName): number` — handles proficiency, expertise, Jack of All Trades (Bard), and Remarkable Athlete (Champion Fighter)
- [ ] **T4.2.3** — Implement `getSavingThrowModifier(character: Character, ability: AbilityName): number` — ability mod + proficiency if proficient
- [ ] **T4.2.4** — Implement `getPassiveScore(character: Character, skill: SkillName): number` — `10 + getSkillModifier(...)`, accounting for advantage/disadvantage (+5/-5)
- [ ] **T4.2.5** — Implement `getAllSkillModifiers(character: Character): Record<SkillName, number>` — bulk calculation for sheet display
- [ ] **T4.2.6** — Implement `getAllSavingThrows(character: Character): Record<AbilityName, number>` — bulk calculation
- [ ] **T4.2.7** — Write unit tests: proficiency bonus at every level (1→+2, 5→+3, 9→+4, 13→+5, 17→+6), skill with no proficiency, with proficiency, with expertise, Jack of All Trades interaction, passive perception with proficiency

### Story 4.3 — Combat Stat Calculations

> As a developer, I need functions for AC, initiative, speed, HP, and attack bonuses.

**Tasks:**

- [ ] **T4.3.1** — Implement `getArmorClass(character: Character): number` — handles:
  - Unarmored (10 + DEX)
  - Barbarian Unarmored Defense (10 + DEX + CON)
  - Monk Unarmored Defense (10 + DEX + WIS)
  - Light armor (base AC + full DEX mod)
  - Medium armor (base AC + DEX mod, capped at +2; +3 with Medium Armor Master feat)
  - Heavy armor (flat base AC, no DEX)
  - Shield (+2 bonus on top of any above)
  - Fighting Style: Defense (+1 when wearing armor)
  - Does not stack multiple base formulas (takes highest)
- [ ] **T4.3.2** — Implement `getInitiative(character: Character): number` — DEX mod + any bonuses (e.g., Alert feat adds +5; Bard's Jack of All Trades adds half proficiency if not already proficient)
- [ ] **T4.3.3** — Implement `getSpeed(character: Character): Speed` — base from race, reduced by 10ft if wearing heavy armor without meeting STR requirement, modified by class features (e.g., Monk/Barbarian get speed bonuses at certain levels), mobile feat (+10ft)
- [ ] **T4.3.4** — Implement `getHitPointMax(character: Character): number` — first level: max hit die + CON mod; each subsequent level: either rolled HP or average (floor(die/2)+1) + CON mod. For multiclass: each class contributes its own hit die type
- [ ] **T4.3.5** — Implement `getHitDiceTotal(character: Character): { die: HitDie; count: number }[]` — one entry per class with that class's die and level count
- [ ] **T4.3.6** — Implement `getAttackBonus(character: Character, weapon: Weapon): number` — STR mod for melee (or DEX if finesse), DEX mod for ranged, + proficiency bonus if proficient with weapon type. Archery fighting style adds +2 to ranged attack rolls
- [ ] **T4.3.7** — Implement `getWeaponDamage(character: Character, weapon: Weapon, twoHanded: boolean): string` — damage dice + STR or DEX mod. Dueling fighting style adds +2 damage for one-handed weapons with no off-hand weapon
- [ ] **T4.3.8** — Implement `getEncumbrance(character: Character): Encumbrance` — calculate current weight from all equipment, carry capacity (STR × 15), encumbrance thresholds
- [ ] **T4.3.9** — Write unit tests: AC for every armor type + DEX combinations, AC for Barbarian unarmored with CON 16 + DEX 14, AC with shield, initiative with and without feats, HP calculation for Fighter (d10) levels 1-5 with CON 14, multiclass HP (Fighter 3 / Wizard 2), speed reduction from heavy armor without STR, attack bonus for finesse weapon using DEX vs STR

### Story 4.4 — Spellcasting Calculations

> As a developer, I need functions for spell save DC, spell attack bonus, spell slots (including multiclass), and preparation limits.

**Tasks:**

- [ ] **T4.4.1** — Implement `getSpellSaveDC(character: Character): number` — 8 + proficiency bonus + spellcasting ability modifier
- [ ] **T4.4.2** — Implement `getSpellAttackBonus(character: Character): number` — proficiency bonus + spellcasting ability modifier
- [ ] **T4.4.3** — Implement `getSpellSlots(character: Character): SpellSlots` — uses class spell slot progression table for single-class; multiclass spellcaster table for multiclass (summing caster levels: full=1, half=0.5 rounded down, third=0.33 rounded down, pact magic=separate)
- [ ] **T4.4.4** — Implement `getCantripsKnown(character: Character): number` — from class cantrip progression table
- [ ] **T4.4.5** — Implement `getSpellsPrepared(character: Character): number` — for prepared casters: ability modifier + class level (min 1). For known casters: fixed from class table
- [ ] **T4.4.6** — Implement `getPactMagicSlots(character: Character): { count: number; level: number }` — Warlock-specific: slots and their level by Warlock level
- [ ] **T4.4.7** — Write unit tests: spell save DC for Wizard INT 18 at level 5, multiclass Cleric 3/Wizard 5 spell slots (combined caster level 8), Warlock pact magic separate from multiclass slots, prepared spell count for Cleric WIS 16 level 4

### Story 4.5 — Level Up Calculations

> As a developer, I need functions to determine what a character gains at each new level.

**Tasks:**

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
- [ ] **T4.5.5** — Write unit tests: Fighter level 3→4 gains ASI + new features, Wizard level 2→3 gains School subclass, Cleric level 1→2 gains Channel Divinity + new spell slots, XP↔level roundtrip for all 20 levels

### Story 4.6 — Currency & Inventory Calculations

> As a developer, I need currency conversion and inventory weight tracking functions.

**Tasks:**

- [ ] **T4.6.1** — Implement `convertCurrency(amount: number, from: CurrencyUnit, to: CurrencyUnit): number`
- [ ] **T4.6.2** — Implement `getTotalWealth(currency: Currency): number` — convert everything to GP equivalent
- [ ] **T4.6.3** — Implement `getTotalInventoryWeight(equipment: EquipmentItem[]): number`
- [ ] **T4.6.4** — Implement `rollStartingGold(classId: string): number` — roll the class's starting gold dice formula
- [ ] **T4.6.5** — Write unit tests: convert 150 CP → 1 GP + 5 SP, total wealth calculation, weight calculation for a sample inventory

### Story 4.7 — Rest Mechanics

> As a developer, I need functions that compute what recovers on short and long rests.

**Tasks:**

- [ ] **T4.7.1** — Implement `applyShortRest(character: Character, hitDiceToSpend: number[]): Character` — spend hit dice (roll + CON mod each), recover Warlock pact magic slots, recover applicable class features (those with `recharge: 'shortRest'`)
- [ ] **T4.7.2** — Implement `applyLongRest(character: Character): Character` — restore all HP, recover half total hit dice (min 1), restore all spell slots, restore all recharging features, reset death saves
- [ ] **T4.7.3** — Write unit tests: short rest spending 2 hit dice with CON mod +2, long rest recovering half hit dice when 3 of 5 spent, Warlock slots recovering on short rest

### Story 4.8 — Character Validation

> As a developer, I need a validation function that checks a character for completeness and rule compliance.

**Tasks:**

- [ ] **T4.8.1** — Implement `validateCharacter(character: Character): CharacterValidation[]` checking:
  - All required fields populated (name, race, class, ability scores)
  - Ability scores within valid range (1-30)
  - Point buy total equals exactly 27 (if method is pointBuy)
  - Standard array uses correct values (if method is standard)
  - Number of chosen skill proficiencies matches class + background allowance
  - No duplicate skill proficiencies (unless class and background overlap, then replacement)
  - Spell count matches cantrips known and prepared/known spell limits
  - Equipment weight vs. carrying capacity (warning, not error)
  - Attunement slots not exceeded (max 3)
  - HP max matches calculated value (warning if overridden)
  - Multiclass prerequisites met (if multiclassed)
- [ ] **T4.8.2** — Classify validation results as errors (must fix) vs. warnings (informational)
- [ ] **T4.8.3** — Write unit tests: valid character passes, character with 7 skills when allowed 4 fails, point buy totaling 28 fails, multiclass without prerequisites fails

---

## Epic 5: Database Layer (IndexedDB via Dexie.js)

**Goal:** A fully functional offline-first persistence layer for characters, campaigns, and preferences with CRUD operations, auto-save, and import/export.

### Story 5.1 — Database Schema & Initialization

> As a developer, I need the IndexedDB database schema created and auto-upgrading.

**Tasks:**

- [ ] **T5.1.1** — Create `utils/database.ts` defining the Dexie database class with tables: `characters`, `campaigns`, `preferences`
- [ ] **T5.1.2** — Define indexes: characters indexed on `id`, `name`, `campaignId`, `isArchived`, `updatedAt`; campaigns on `id`, `name`, `joinCode`; preferences on `id`
- [ ] **T5.1.3** — Implement database version migration strategy (version 1 initial schema)
- [ ] **T5.1.4** — Create singleton database instance export
- [ ] **T5.1.5** — Write integration test: database initializes, table count is correct, indexes exist

### Story 5.2 — Character CRUD Operations

> As a developer, I need repository functions for all character data operations.

**Tasks:**

- [ ] **T5.2.1** — Implement `createCharacter(char: Partial<Character>): Promise<Character>` — generates UUID, sets timestamps, version=1, defaults
- [ ] **T5.2.2** — Implement `getCharacter(id: string): Promise<Character | undefined>`
- [ ] **T5.2.3** — Implement `getAllCharacters(includeArchived?: boolean): Promise<CharacterSummary[]>` — returns summary projections for gallery
- [ ] **T5.2.4** — Implement `updateCharacter(id: string, updates: Partial<Character>): Promise<Character>` — updates timestamp and version, optimistic concurrency check
- [ ] **T5.2.5** — Implement `archiveCharacter(id: string): Promise<void>` — soft delete (sets isArchived=true)
- [ ] **T5.2.6** — Implement `deleteCharacter(id: string): Promise<void>` — hard delete
- [ ] **T5.2.7** — Implement `duplicateCharacter(id: string, newName?: string): Promise<Character>` — deep clone with new ID
- [ ] **T5.2.8** — Implement `exportCharacter(id: string): Promise<CharacterExport>` — returns character with format version
- [ ] **T5.2.9** — Implement `importCharacter(data: CharacterExport): Promise<Character>` — validates format, generates new ID, saves
- [ ] **T5.2.10** — Write integration tests: full CRUD lifecycle, duplicate preserves data, export/import roundtrip, concurrent update detection

### Story 5.3 — Campaign CRUD Operations

> As a developer, I need repository functions for campaign management.

**Tasks:**

- [ ] **T5.3.1** — Implement `createCampaign(data: Partial<Campaign>): Promise<Campaign>` — generates UUID, join code (6-char alphanumeric)
- [ ] **T5.3.2** — Implement `getCampaign(id: string): Promise<Campaign | undefined>`
- [ ] **T5.3.3** — Implement `getAllCampaigns(): Promise<Campaign[]>`
- [ ] **T5.3.4** — Implement `updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign>`
- [ ] **T5.3.5** — Implement `addCharacterToCampaign(campaignId: string, characterId: string): Promise<void>`
- [ ] **T5.3.6** — Implement `removeCharacterFromCampaign(campaignId: string, characterId: string): Promise<void>`
- [ ] **T5.3.7** — Implement `getCharactersByCampaign(campaignId: string): Promise<Character[]>`
- [ ] **T5.3.8** — Write integration tests: create campaign, add/remove characters, campaign deletion

### Story 5.4 — Auto-Save & Preferences

> As a developer, I need debounced auto-save for character edits and user preference persistence.

**Tasks:**

- [ ] **T5.4.1** — Implement `useAutoSave(character: Character, delay?: number)` hook — debounces 500ms, calls `updateCharacter`
- [ ] **T5.4.2** — Implement `getPreferences(): Promise<UserPreferences>`
- [ ] **T5.4.3** — Implement `updatePreferences(prefs: Partial<UserPreferences>): Promise<void>`
- [ ] **T5.4.4** — Create default preferences constant
- [ ] **T5.4.5** — Write test: auto-save triggers after delay, multiple rapid changes coalesce into single save

---

## Epic 6: Zustand State Management Stores

**Goal:** Application-level state management configured with Zustand, including persist middleware for wizard state survival across navigation.

### Story 6.1 — Character Store

> As a developer, I need a Zustand store that manages the active character state and bridges to the database layer.

**Tasks:**

- [ ] **T6.1.1** — Create `stores/characterStore.ts` with state: `{ activeCharacter: Character | null; characters: CharacterSummary[]; loading: boolean; error: string | null }`
- [ ] **T6.1.2** — Implement actions: `loadCharacters()`, `loadCharacter(id)`, `saveCharacter()`, `createNewCharacter()`, `deleteCharacter(id)`, `duplicateCharacter(id)`
- [ ] **T6.1.3** — Implement `updateField(path: string, value: any)` — generic field updater with auto-recalculation trigger
- [ ] **T6.1.4** — Implement computed derivations: whenever the character changes, recompute all derived stats via the calculation engine
- [ ] **T6.1.5** — Write tests: store initializes empty, loading a character populates state, updates trigger recalculation

### Story 6.2 — Wizard Store

> As a developer, I need a persistent store for character creation wizard state so it survives page navigation.

**Tasks:**

- [ ] **T6.2.1** — Create `stores/wizardStore.ts` with Zustand persist middleware (sessionStorage backend)
- [ ] **T6.2.2** — State: `{ currentStep, raceSelection, classSelection, abilityScores, abilityScoreMethod, backgroundSelection, equipmentSelections, spellSelections, characterName, isComplete }`
- [ ] **T6.2.3** — Implement actions: `setStep(n)`, `setRace(selection)`, `setClass(selection)`, `setAbilityScores(scores, method)`, `setBackground(selection)`, `setEquipment(selections)`, `setSpells(selections)`, `reset()`, `finalize(): Character`
- [ ] **T6.2.4** — Implement `finalize()` that assembles a complete Character object from all wizard state and calls the calculation engine
- [ ] **T6.2.5** — Write tests: state persists across simulated navigation, reset clears all, finalize produces valid Character

### Story 6.3 — UI Store

> As a developer, I need a store for transient UI state.

**Tasks:**

- [ ] **T6.3.1** — Create `stores/uiStore.ts` with state: `{ activeModal, sidebarOpen, editMode, mobileNavOpen, diceRollerOpen, theme }`
- [ ] **T6.3.2** — Implement toggle/set actions for each state property
- [ ] **T6.3.3** — Implement responsive breakpoint detection hook that auto-updates `isMobile` flag

### Story 6.4 — Dice Store

> As a developer, I need a store for dice roll history and configuration.

**Tasks:**

- [ ] **T6.4.1** — Create `stores/diceStore.ts` with state: `{ rolls: DiceRoll[]; maxHistory: number }`
- [ ] **T6.4.2** — Implement `roll(dice: { type: DieType; count: number }[], modifier: number, label?: string, advantage?: boolean, disadvantage?: boolean): DiceRoll`
- [ ] **T6.4.3** — Implement `clearHistory()` and `removeRoll(id)`
- [ ] **T6.4.4** — Write tests: roll produces valid results within die range, advantage takes higher of 2d20, disadvantage takes lower, history accumulates and truncates at maxHistory

---

## Epic 7: Dice Engine

**Goal:** A cryptographically random dice rolling engine that supports all D&D dice types, advantage/disadvantage, drop-lowest, and modifiers.

### Story 7.1 — Core Dice Engine

> As a developer, I need a pure-function dice engine that all rolling throughout the app delegates to.

**Tasks:**

- [ ] **T7.1.1** — Implement `rollDie(sides: number): number` using `crypto.getRandomValues()` — returns 1 to sides inclusive, uniform distribution
- [ ] **T7.1.2** — Implement `rollDice(count: number, sides: number): number[]` — returns array of individual results
- [ ] **T7.1.3** — Implement `rollWithDropLowest(count: number, sides: number, dropCount: number): { rolls: number[]; dropped: number[]; kept: number[]; total: number }` — for 4d6 drop lowest
- [ ] **T7.1.4** — Implement `rollWithAdvantage(sides: number, modifier: number): { roll1: number; roll2: number; used: number; total: number }` — roll 2, take higher
- [ ] **T7.1.5** — Implement `rollWithDisadvantage(sides: number, modifier: number): { roll1: number; roll2: number; used: number; total: number }` — roll 2, take lower
- [ ] **T7.1.6** — Implement `rollAbilityScoreSet(): { scores: { rolls: number[]; dropped: number; total: number }[]; totals: number[] }` — 6 sets of 4d6-drop-lowest
- [ ] **T7.1.7** — Implement `rollInitiative(modifier: number): number` — d20 + modifier
- [ ] **T7.1.8** — Implement `rollHitPoints(hitDie: HitDie, conModifier: number): number` — roll hit die + CON mod, minimum 1
- [ ] **T7.1.9** — Implement `rollStartingGold(diceFormula: string): number` — parse formula like "5d4×10" and roll
- [ ] **T7.1.10** — Write unit tests: distribution test (10,000 d20 rolls should average ~10.5 ±0.5), drop lowest always drops the minimum value, advantage always returns the higher die, all die types produce values in valid range

---

## Phase 1 Completion Criteria

Before moving to Phase 2, ALL of the following must be true:

1. **Project runs:** `npm run dev` shows the app shell with routing to all placeholder pages
2. **Types compile:** Every type file compiles with zero TypeScript errors under strict mode
3. **Data loads:** All SRD JSON files parse correctly and are importable as typed constants
4. **Calculations pass:** 100% of calculation engine unit tests pass (minimum 150 test cases)
5. **Database works:** Character and Campaign CRUD integration tests pass
6. **Stores function:** Zustand stores initialize, update, and persist correctly
7. **Dice roll:** Dice engine produces cryptographically random results with correct distribution
8. **Test coverage:** Calculation engine has >95% line coverage; overall project >80%
9. **No hardcoded stats:** Zero derived values exist as constants; everything flows through the calculation engine

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Epics | 7 |
| Stories | 28 |
| Tasks | ~185 |
| Unit Tests Required | ~150+ test cases |
| Data Files to Create | ~20 JSON/TS files |
| Type Definitions | ~60+ interfaces/types |
| Calculation Functions | ~35+ pure functions |
| Database Functions | ~20+ CRUD operations |
| Zustand Stores | 4 |

---

## Dependency Graph

```
Epic 1 (Scaffolding)
  └── Epic 2 (Types) — cannot write any code without types
       ├── Epic 3 (SRD Data) — data files must conform to types
       │    └── Epic 4 (Calculations) — calculations consume SRD data
       │         └── Epic 5 (Database) — stores Character type
       │              └── Epic 6 (Stores) — stores bridge to database
       └── Epic 7 (Dice Engine) — uses DieType from types, consumed by calculations
```

**Parallelizable:** Epics 3 and 7 can be worked simultaneously after Epic 2 is complete. Epic 4 depends on both 3 and 7. Epics 5 and 6 are sequential but can begin their type definitions during Epic 2.
