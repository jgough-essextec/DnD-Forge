# Story 31.3 — New Class Features Step

> **Epic 31: Level Up Flow** | **Phase 4: Session Play Features** (Weeks 7-8)

## Description

As a player, I need to see what new class features I gain at this level and make any required choices within those features. The new features step displays all features gained at the new level with full descriptions, provides inline selection interfaces for features that require choices (like Fighting Style or Metamagic), and auto-updates scaling features. It also highlights proficiency bonus increases and Extra Attack progression.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard), Phase 3 (character sheet 3-page display, gallery, import/export, view/edit mode with auto-save)

### D&D 5e Proficiency Bonus Progression
| Character Level | Proficiency Bonus |
|----------------|------------------|
| 1-4 | +2 |
| 5-8 | +3 |
| 9-12 | +4 |
| 13-16 | +5 |
| 17-20 | +6 |

Proficiency bonus increases affect: all proficient skills, all proficient saving throws, spell attack bonus, spell save DC, proficient weapon/tool attacks.

### Features That Require Choices (by Class)

**Barbarian:**
- Level 3: Path feature (if subclass already chosen, apply path feature)
- Level 10: Path feature choice may grant options

**Bard:**
- Level 3: Expertise (choose 2 skill proficiencies to double)
- Level 10: Magical Secrets (choose 2 spells from any class)

**Cleric:**
- Domain features at levels 1, 2, 6, 8, 17 (most are automatic based on domain)

**Druid:**
- Circle features at levels 2, 6, 10, 14 (some circles offer choices)

**Fighter:**
- Level 1: Fighting Style choice (Archery, Defense, Dueling, Great Weapon Fighting, Protection, Two-Weapon Fighting)
- Level 3: Archetype features (some have choices, e.g., Battle Master maneuvers)
- Battle Master: Choose 3 maneuvers at Lv3, 2 more at Lv7, 2 more at Lv10, 2 more at Lv15

**Monk:**
- Level 3: Tradition features (some traditions offer choices)

**Paladin:**
- Level 2: Fighting Style choice
- Level 3: Oath features (automatic based on oath)

**Ranger:**
- Level 2: Fighting Style choice
- Level 6: Favored Enemy and Natural Explorer improvements

**Rogue:**
- Level 1: Expertise (choose 2 skills)
- Level 6: Expertise (choose 2 more skills)

**Sorcerer:**
- Level 3: Metamagic (choose 2 options)
- Level 10: Metamagic (choose 1 more option)
- Level 17: Metamagic (choose 1 more option)

**Warlock:**
- Level 2: Eldritch Invocations (choose 2)
- Additional invocations at levels 5, 7, 9, 12, 15, 18
- Level 3: Pact Boon choice (Pact of the Chain/Blade/Tome)

**Wizard:**
- School features at levels 2, 6, 10, 14 (automatic based on school)

### Scaling Features (Auto-Update, No Choice)
| Feature | Scaling Pattern |
|---------|----------------|
| Sneak Attack (Rogue) | +1d6 every odd level (1d6 at 1, 2d6 at 3, etc.) |
| Rage Damage (Barbarian) | +2 at 1, +2 at 9, +3 at 16 |
| Ki Points (Monk) | = Monk level |
| Sorcery Points (Sorcerer) | = Sorcerer level |
| Martial Arts Die (Monk) | d4 at 1, d6 at 5, d8 at 11, d10 at 17 |
| Channel Divinity Uses (Cleric) | 1 at 1, 2 at 6, 3 at 18 |
| Rage Uses (Barbarian) | 2/3/4/5/6/unlimited progression |
| Superiority Dice (Battle Master) | 4 at 3, 5 at 7, 6 at 15; die size d8->d10 at 10, d10->d12 at 18 |

### Extra Attack Progression
| Class | Extra Attack Level | Details |
|-------|-------------------|---------|
| Barbarian | 5 | 2 attacks per Attack action |
| Fighter | 5 | 2 attacks |
| Fighter | 11 | 3 attacks |
| Fighter | 20 | 4 attacks |
| Monk | 5 | 2 attacks |
| Paladin | 5 | 2 attacks |
| Ranger | 5 | 2 attacks |

## Tasks

- [ ] **T31.3.1** — Create `components/levelup/NewFeaturesStep.tsx` — lists all new features gained at the new level, pulled from the class and subclass data. Each feature shows its name, full description, and any choices
- [ ] **T31.3.2** — Features that involve choices (e.g., Fighting Style at Fighter 1, Metamagic options for Sorcerer, Maneuver choices for Battle Master) present inline selection interfaces. The player must make all required choices before proceeding
- [ ] **T31.3.3** — Features with scaling values update automatically: Sneak Attack dice increase, Rage damage bonus increase, Ki point pool increase, Sorcery point pool increase, Channel Divinity uses increase, etc. Show: "Sneak Attack: 1d6 -> 2d6" as informational (no choice needed)
- [ ] **T31.3.4** — If the proficiency bonus increases at this level (levels 5, 9, 13, 17), show it prominently: "Proficiency Bonus: +2 -> +3. This affects all proficient skills, saves, and attacks."
- [ ] **T31.3.5** — Extra Attack notification at level 5 (for Fighter, Barbarian, Paladin, Ranger, Monk): "You can now attack twice when you take the Attack action!" Fighter level 11: "Three attacks!" Fighter level 20: "Four attacks!"
- [ ] **T31.3.6** — For features that grant new proficiencies (e.g., heavy armor from a multiclass dip or subclass), add them to the character's proficiency lists

## Acceptance Criteria

1. All new features at the new level are listed with name and full description
2. Features requiring choices present inline selection interfaces
3. Player cannot proceed without making all required choices
4. Scaling features show before/after values (e.g., "Sneak Attack: 1d6 -> 2d6")
5. Proficiency bonus increase is prominently displayed at levels 5, 9, 13, 17
6. Proficiency bonus notification lists affected areas (skills, saves, attacks)
7. Extra Attack is clearly highlighted at level 5 (and Fighter 11, 20)
8. New proficiencies from features are added to the character's proficiency lists
9. Features are pulled from the correct class/subclass data

## Dependencies

- Story 31.1 (Level Up Entry & Overview) for the wizard container
- Phase 1 class data (features by level, subclass features)
- Phase 2 feature selection components (for inline selectors)

## Notes

- This is one of the most complex steps because of the sheer variety of class features and choices
- For features with choices, validate that all required selections are made before allowing the player to proceed
- Scaling features should clearly show the old and new values for clarity
- The proficiency bonus increase at key levels is one of the most impactful changes and should feel exciting
