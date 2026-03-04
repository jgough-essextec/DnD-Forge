# Story 3.1 — Race Data Files

> **Epic 3: SRD Game Data Layer** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need complete race data for all 9 SRD races so the wizard can present them with full mechanical detail.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Data format**: Static TypeScript files (`.ts` preferred over `.json` for type safety) that export typed constants. Imported via `import { races } from '@/data/races'` with full type inference against the `Race` interface defined in Story 2.2
- **9 SRD Races with full details**:
  - **Dwarf** (subraces: Hill, Mountain) — CON+2; Darkvision 60ft; Dwarven Resilience (poison resistance, advantage on saves vs poison); Stonecunning (double proficiency on History checks related to stonework); Speed 25ft (not reduced by heavy armor); proficiency with battleaxe, handaxe, light hammer, warhammer; languages: Common, Dwarvish. Hill Dwarf: WIS+1, +1 HP per level. Mountain Dwarf: STR+2, light and medium armor proficiency
  - **Elf** (subraces: High, Wood, Dark/Drow) — DEX+2; Darkvision 60ft; Keen Senses (Perception proficiency); Fey Ancestry (advantage vs charm, can't be put to sleep magically); Trance (4 hours instead of 8 for long rest); proficiency with longsword, shortsword, shortbow, longbow (High/Wood); languages: Common, Elvish. High Elf: INT+1, one wizard cantrip, one extra language. Wood Elf: WIS+1, speed 35ft, Mask of the Wild (hide in light natural cover). Drow: CHA+1, Superior Darkvision 120ft, Sunlight Sensitivity, Drow Magic (dancing lights cantrip, faerie fire at 3rd, darkness at 5th)
  - **Halfling** (subraces: Lightfoot, Stout) — DEX+2; Lucky (reroll natural 1s on attack/ability/save); Brave (advantage vs frightened); Halfling Nimbleness (move through creatures of larger size); Speed 25ft; Size Small; languages: Common, Halfling. Lightfoot: CHA+1, Naturally Stealthy (hide behind Medium+ creatures). Stout: CON+1, Stout Resilience (advantage + resistance vs poison)
  - **Human** (variant: Variant Human) — Standard: +1 to all ability scores; Speed 30ft; languages: Common + one extra. Variant: +1 to two abilities, one feat, one skill proficiency
  - **Dragonborn** — STR+2, CHA+1; Breath Weapon (damage type and shape by draconic ancestry); Damage Resistance (matching ancestry type); Speed 30ft; languages: Common, Draconic. 10 ancestry types: Black (Acid, 5x30 line), Blue (Lightning, 5x30 line), Brass (Fire, 5x30 line), Bronze (Lightning, 5x30 line), Copper (Acid, 5x30 line), Gold (Fire, 15ft cone), Green (Poison, 15ft cone), Red (Fire, 15ft cone), Silver (Cold, 15ft cone), White (Cold, 15ft cone). Breath weapon save DC = 8 + CON mod + proficiency bonus; damage = 2d6 scaling to 5d6
  - **Gnome** (subraces: Forest, Rock) — INT+2; Darkvision 60ft; Gnome Cunning (advantage on INT/WIS/CHA saves vs magic); Size Small; Speed 25ft; languages: Common, Gnomish. Forest Gnome: DEX+1, Natural Illusionist (minor illusion cantrip), Speak with Small Beasts. Rock Gnome: CON+1, Artificer's Lore (double proficiency on History checks for magic/tech), Tinker (create tiny clockwork devices)
  - **Half-Elf** — CHA+2, +1 to two other abilities (player choice); Darkvision 60ft; Fey Ancestry; 2 extra skill proficiencies (player choice from any); Speed 30ft; languages: Common, Elvish + one extra
  - **Half-Orc** — STR+2, CON+1; Darkvision 60ft; Menacing (Intimidation proficiency); Relentless Endurance (drop to 1 HP instead of 0, once per long rest); Savage Attacks (extra damage die on melee crit); Speed 30ft; languages: Common, Orc
  - **Tiefling** — CHA+2, INT+1; Darkvision 60ft; Hellish Resistance (fire resistance); Infernal Legacy (thaumaturgy cantrip, hellish rebuke at 3rd level 1/day, darkness at 5th level 1/day); Speed 30ft; languages: Common, Infernal
- **Languages**: 16 SRD languages with script families: Common (Common), Dwarvish (Dwarvish), Elvish (Elvish), Giant (Dwarvish), Gnomish (Dwarvish), Goblin (Dwarvish), Halfling (Common), Orc (Dwarvish), Abyssal (Infernal), Celestial (Celestial), Draconic (Draconic), Deep Speech (none), Infernal (Infernal), Primordial (Dwarvish), Sylvan (Elvish), Undercommon (Elvish)

## Tasks
- [ ] **T3.1.1** — Create `data/races.ts` containing all 9 core PHB races with complete data as listed above
- [ ] **T3.1.2** — Validate every race entry has all required fields per the `Race` type interface
- [ ] **T3.1.3** — Create `data/languages.ts` with all SRD languages (Common, Dwarvish, Elvish, Giant, Gnomish, Goblin, Halfling, Orc, Abyssal, Celestial, Draconic, Deep Speech, Infernal, Primordial, Sylvan, Undercommon) with script families
- [ ] **T3.1.4** — Create typed loader: `import { races } from '@/data/races'` with full type inference

## Acceptance Criteria
- All 9 races are present with complete data matching SRD rules
- Every race entry passes TypeScript type checking against the `Race` interface
- Subraces are properly nested within their parent races
- All racial traits include both descriptive text and mechanical effects where applicable
- Dragonborn includes all 10 draconic ancestry options with correct damage types and breath weapon shapes
- Half-Elf and Variant Human correctly model player-choice fields (ability score allocation, skill selection, feat selection)
- Languages file includes all 16 SRD languages with script information
- Data is importable via `@/data/races` path alias with full TypeScript type inference

## Dependencies
- **Depends on:** Story 2.2 (Race, Subrace, RacialTrait, Size, Sense, Resistance, DamageType types must be defined first)
- **Blocks:** Story 4.1 (Ability score calculations use racial bonuses), Story 4.3 (Speed and AC calculations use race data)

## Notes
- Dwarf speed is 25ft but is not reduced by heavy armor — this is a unique trait that the calculation engine (Story 4.3) must handle as a special case
- Dragonborn Breath Weapon damage scales: 2d6 at 1st level, 3d6 at 6th, 4d6 at 11th, 5d6 at 16th. This progression should be stored in the trait data
- Drow's Sunlight Sensitivity (disadvantage on attack rolls and Perception checks in direct sunlight) is a mechanical penalty that should be represented in the trait's mechanical effect
- Variant Human is the only race that grants a feat at character creation. This means feat data (Story 3.6) must be available during race selection in the wizard
- Half-Elf's "+1 to two other abilities" means any two abilities other than Charisma. The data should store this constraint for the wizard to enforce
