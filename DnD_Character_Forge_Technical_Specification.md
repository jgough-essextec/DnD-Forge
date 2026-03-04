# D&D Character Forge — Technical Specification

## For Claude Code Implementation

**Version:** 1.0  
**Author:** Jonathan (Pellera) — Technical Architecture  
**Date:** March 2026  
**Target:** Full-stack React web application with persistent storage

---

## 1. Executive Summary

D&D Character Forge is a comprehensive web application for creating, managing, storing, and printing Dungeons & Dragons 5th Edition characters. The app serves two primary user personas: **Players** (who create and manage their own characters) and **Dungeon Masters** (who manage campaigns, track party composition, and reference player characters at the table). The app faithfully implements the official D&D 5e character creation process as a guided, step-by-step wizard while also supporting freeform editing for experienced players.

---

## 2. D&D Character Creation — Domain Knowledge Deep Dive

### 2.1 The Character Creation Process

D&D character creation is a sequential, interdependent process where each step feeds data into subsequent steps. The canonical order from the Player's Handbook is:

**Step 1 — Choose a Race (Species)**  
The player selects from fantasy species such as Human, Elf, Dwarf, Halfling, Gnome, Half-Elf, Half-Orc, Tiefling, or Dragonborn (core PHB). Each race provides racial traits including ability score bonuses, size (Small/Medium), base speed (typically 25 or 30 feet), darkvision or other senses, weapon or armor proficiencies, languages (Common plus one or more), resistance to certain damage types, and innate spellcasting abilities. Many races have subraces (e.g., High Elf, Wood Elf, Dark Elf) that further specialize traits.

**Step 2 — Choose a Class**  
The class defines the character's combat role, abilities, and progression. The 13 official classes are: Artificer, Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, and Wizard. Each class has a hit die (d6 through d12) that determines hit points, saving throw proficiencies (two of six), skill proficiency choices (pick N from a list), weapon and armor proficiencies, and starting equipment options. At level 1, the character gains all first-level class features. Subclasses are chosen between levels 1-3 depending on the class (e.g., Cleric at 1st, Fighter at 3rd).

**Step 3 — Determine Ability Scores**  
Six core ability scores define a character's capabilities. Each score typically ranges from 3-18 at creation. The six scores are:

- **Strength (STR):** Physical power, melee attack/damage, carrying capacity, Athletics skill
- **Dexterity (DEX):** Agility, ranged attacks, AC bonus, initiative, Acrobatics/Stealth/Sleight of Hand
- **Constitution (CON):** Endurance, hit point bonus per level, concentration saves
- **Intelligence (INT):** Reasoning, memory; Arcana/History/Investigation/Nature/Religion
- **Wisdom (WIS):** Perception, intuition; Animal Handling/Insight/Medicine/Perception/Survival
- **Charisma (CHA):** Force of personality; Deception/Intimidation/Performance/Persuasion

Ability score generation methods the app must support:

1. **Standard Array:** Use the predefined set [15, 14, 13, 12, 10, 8], assigning one to each ability
2. **Point Buy:** Start with all 8s and spend 27 points to increase scores (costs vary: 8→13 costs 1 point each, 14 costs 2, 15 costs 2)
3. **Rolling:** Roll 4d6, drop the lowest die, repeat six times; assign results to abilities

Each ability score produces a **modifier** = floor((score - 10) / 2). A score of 10-11 yields +0; 14-15 yields +2; 18-19 yields +4. Racial bonuses are then applied on top.

**Step 4 — Describe Your Character**  
This encompasses background selection and personal details. A background (e.g., Acolyte, Criminal, Folk Hero, Noble, Sage, Soldier) provides two additional skill proficiencies, tool proficiencies, additional languages, starting equipment, and a background feature (a narrative ability). The player also defines personality traits (2), ideals (1), bonds (1), and flaws (1) — either selected from tables or custom written. Physical details include name, age, height, weight, eye color, hair color, skin color, and appearance. Alignment is chosen from a 3×3 grid: Lawful/Neutral/Chaotic crossed with Good/Neutral/Evil.

**Step 5 — Choose Equipment**  
Equipment comes from two sources: class starting equipment (with choices, e.g., "a martial weapon and a shield, OR two martial weapons") and background starting equipment. The player may alternatively take starting gold and buy equipment from the equipment tables. Equipment determines Armor Class (AC), available weapons and their damage dice, adventuring gear, and tools.

**Step 6 — Computed Statistics**  
After all choices are made, derived values are calculated:

- **Armor Class (AC):** Base 10 + DEX modifier (unarmored), or armor-specific formula
- **Initiative:** DEX modifier (plus any class/feat bonuses)
- **Speed:** From race (typically 30 ft), modified by armor
- **Hit Points:** Class hit die maximum + CON modifier at level 1
- **Proficiency Bonus:** +2 at level 1, increases by level
- **Saving Throws:** Ability modifier + proficiency bonus (if proficient)
- **Skill Modifiers:** Ability modifier + proficiency bonus (if proficient), doubled if expertise
- **Passive Perception:** 10 + Perception modifier
- **Spell Save DC:** 8 + proficiency bonus + spellcasting ability modifier
- **Spell Attack Bonus:** Proficiency bonus + spellcasting ability modifier
- **Attack Bonuses:** STR or DEX modifier + proficiency bonus (if proficient)

**Step 7 — Spellcasting (If Applicable)**  
Spellcasting classes (Bard, Cleric, Druid, Sorcerer, Warlock, Wizard, and optionally Paladin, Ranger, Artificer) must select known spells and/or prepare spells from their spell list. Each spell has a level (cantrip through 9th), school of magic, casting time, range, components (Verbal, Somatic, Material), duration, and description. The number of spell slots per level is determined by class and character level.

### 2.2 Character Sheet Structure (3 Pages)

**Page 1 — Core Stats:**  
Top banner (name, class & level, background, player name, race, alignment, XP), left column (ability scores, modifiers, saving throws, skills, passive perception), center column (AC, initiative, speed, HP max/current/temp, hit dice, death saves, attacks & spellcasting), right column (personality traits, ideals, bonds, flaws, features & traits).

**Page 2 — Backstory & Details:**  
Character appearance details, backstory/biography, allies & organizations, additional features & traits, treasure, equipment/inventory with weight tracking.

**Page 3 — Spellcasting:**  
Spellcasting class, spellcasting ability, spell save DC, spell attack bonus, spell slots per level (1st through 9th), cantrips known, and prepared/known spells organized by level.

### 2.3 Level Advancement

When a character gains enough XP (or by milestone), they level up. This involves: increasing the hit point maximum (roll hit die + CON modifier, or take average), possibly gaining new class features, new spell slots, new spells known, ability score improvements (at levels 4, 8, 12, 16, 19) where the player adds +2 to one ability or +1 to two abilities (or selects a feat), and possibly selecting a subclass.

### 2.4 The Dungeon Master's Perspective

A DM needs to see party-level data at a glance: each character's AC, passive perception, HP, spell save DC, speed, proficient skills, and languages. During combat, the DM tracks initiative order, current HP, conditions/status effects, and available actions. Between sessions, the DM may need to review character backstories, bonds, and connections to NPCs.

---

## 3. User Personas & Journeys

### 3.1 Player Journeys

**Journey: First-Time Character Creation (Guided Wizard)**

1. Player lands on home screen, clicks "Create New Character"
2. Wizard opens with a brief intro: "Let's build your adventurer!"
3. **Step 1 — Race Selection:** Visual cards showing each race with art placeholder, name, and 2-3 key traits. Clicking a race opens a detail panel with full traits, subraces, and ability bonuses. Player selects race and subrace
4. **Step 2 — Class Selection:** Visual cards for each class with role archetype (Tank, Healer, DPS, Support, etc.), hit die, and primary ability. Detail panel shows proficiencies, features, and recommended ability scores. Player selects class
5. **Step 3 — Ability Scores:** Player chooses method (Standard Array, Point Buy, or Roll). For Standard Array: drag-and-drop assignment interface. For Point Buy: slider/counter interface showing remaining points. For Rolling: animated dice roll with 4d6-drop-lowest, showing individual die values, with reroll option (configurable)
6. **Step 4 — Background & Details:** Select background from list with description, skill proficiencies, and equipment shown. Fill in personality traits, ideals, bonds, flaws (with random roll option from tables). Enter name, physical description, alignment, backstory
7. **Step 5 — Equipment:** Show class starting equipment choices as selectable option groups. Alternatively, toggle to "buy with gold" mode showing equipment tables with drag-to-cart
8. **Step 6 — Spellcasting (conditional):** Only shown for spellcasting classes. Select cantrips and level 1 spells from class spell list with search/filter. Each spell shows full details on hover/click
9. **Step 7 — Review & Finalize:** Full character sheet preview with all computed values. Highlight anything missing or invalid. "Save Character" button

**Journey: Experienced Player (Freeform Edit)**

1. Player clicks "Create New Character" then toggles "Freeform Mode"
2. Full character sheet is displayed as an editable form
3. All fields are directly editable with auto-calculation of derived stats
4. No enforced step order — player fills in what they want, when they want
5. Validation warnings (not blocks) for inconsistencies

**Journey: Returning to Edit a Character**

1. Player opens app, sees character gallery with portrait/avatar, name, race, class, and level
2. Clicks a character to open the full sheet view
3. Can switch between "View" (read-only, print-friendly) and "Edit" modes
4. Edit mode allows changing any field with recalculation
5. Changes auto-save with undo history

**Journey: Leveling Up**

1. From character view, player clicks "Level Up" button
2. App shows what the next level provides: HP increase, new features, ASI/feat if applicable
3. Player rolls or takes average for HP
4. If ASI level: choose ability score increases or feat selection
5. If subclass selection level: choose subclass
6. If new spells/spell slots: spell selection interface
7. Review changes and confirm

**Journey: During a Session (Quick Reference)**

1. Player opens character on phone/tablet
2. Compact view shows: AC, HP (editable tracker), key attacks, spell slots (toggle used/available), important abilities
3. Dice roller integrated: tap a skill/save/attack to roll with correct modifier
4. HP tracker with damage/healing quick input
5. Spell slot tracker with expend/recover
6. Conditions tracker (stunned, poisoned, etc.)
7. Short rest / long rest buttons that auto-recover appropriate resources

**Journey: Printing a Character Sheet**

1. From character view, click "Print" or "Export PDF"
2. App generates a formatted character sheet matching the official D&D 5e layout across all 3 pages
3. Options: include/exclude backstory page, include/exclude spell sheet
4. PDF download or direct browser print

### 3.2 Dungeon Master Journeys

**Journey: Creating a Campaign**

1. DM clicks "Create Campaign" from dashboard
2. Names the campaign, adds description, sets house rules (e.g., allowed sources, ability score method)
3. Generates a shareable join code or link
4. Players join with the code and add (or create) a character for the campaign

**Journey: Party Overview Dashboard**

1. DM selects a campaign to view the party dashboard
2. Summary grid shows all characters: name, race, class, level, AC, HP, passive perception, spell save DC, speed
3. Expandable rows show proficient skills, languages, and key features
4. Quick filters: "Who speaks Elvish?", "Who has proficiency in Stealth?"
5. Party composition analysis: roles covered (healer, tank, DPS, utility), gaps identified

**Journey: Combat/Initiative Tracker**

1. DM clicks "Start Encounter" from campaign view
2. All party members auto-populate with their initiative modifiers
3. DM adds monsters/NPCs with stats
4. Everyone rolls initiative (auto-roll option for monsters)
5. Sorted initiative order displayed
6. DM cycles through turns, tracking HP, conditions, and actions
7. Encounter ends, XP is optionally distributed

**Journey: Session Notes & Character Updates**

1. DM can add session notes to a campaign timeline
2. Track items given to players, NPCs encountered, locations visited
3. Award XP or milestone level-ups to individual or all characters
4. Annotate individual characters with DM-only notes (hidden from players)

---

## 4. Feature Specification

### 4.1 Core Features (MVP)

**F1: Character Creation Wizard**

- Guided 7-step wizard with progress indicator
- Each step validates before allowing progression
- Back navigation preserves all state
- Race/class data pulled from SRD (Systems Reference Document — open game content)
- Animated dice rolling with sound effects (toggleable)

**F2: Character Sheet View**

- Faithful digital recreation of the 3-page official character sheet
- All derived values auto-calculated
- View mode (read-only, clean) and Edit mode (all fields editable)
- Responsive: full sheet on desktop, scrollable sections on mobile

**F3: Character Storage & Management**

- Character gallery on home screen with card view
- Multiple characters per user
- Duplicate character function
- Archive (soft delete) and permanent delete
- Import/Export characters as JSON

**F4: Ability Score Calculator**

- Standard Array assignment with drag-and-drop
- Point Buy with live counter and guardrails (min 8, max 15, 27 points)
- 4d6 Drop Lowest roller with animated dice and optional reroll
- Racial bonus auto-applied
- Modifier auto-calculated and displayed

**F5: Spell Management**

- Full SRD spell database with search, filter by level/school/class, and sort
- Spell detail cards with all properties
- Prepared vs. Known spells tracking
- Spell slot tracker with expend/recover
- Concentration spell indicator

**F6: Equipment & Inventory**

- Starting equipment selection from class/background
- Full SRD equipment database
- Weight tracking with encumbrance calculation
- Currency tracker (CP, SP, EP, GP, PP) with auto-conversion
- Attunement tracking (3 max)

**F7: PDF Export / Print**

- Generate printable character sheet matching official layout
- 3-page format: stats, backstory, spells
- Clean typography, proper field sizing
- Option to export as PDF or print directly

**F8: Level Up Flow**

- Step-by-step level advancement
- Auto-calculate new HP (roll or average)
- Present new class features
- ASI/feat selection at appropriate levels
- New spell slot and spell selection for casters

### 4.2 DM Features

**F9: Campaign Management**

- Create/edit/archive campaigns
- Invite players via shareable code
- View all characters in the campaign
- Set campaign house rules (allowed sources, starting level, etc.)

**F10: Party Dashboard**

- At-a-glance stats grid for all party members
- Skill proficiency matrix
- Language coverage
- Party composition analysis

**F11: Initiative & Combat Tracker**

- Initiative roller with auto-sort
- HP tracker per combatant
- Condition tracking (14 standard conditions)
- Turn order with current turn indicator
- Add monsters/NPCs on the fly

**F12: DM Notes**

- Per-character DM-only notes
- Campaign-level session log
- NPC tracker
- Loot/reward tracker

### 4.3 Enhanced Features (Post-MVP)

**F13: Dice Roller**

- Roll any combination of dice (d4, d6, d8, d10, d12, d20, d100)
- Quick-roll from skill/save/attack values
- Roll history log
- Advantage/disadvantage rolling (roll 2d20, take higher/lower)
- Critical hit detection

**F14: Character Sharing**

- Share read-only character view via link
- Share editable character to another user
- Campaign-linked sharing (DM sees player sheets)

**F15: Homebrew Content**

- Custom race builder
- Custom class/subclass builder
- Custom background builder
- Custom spell builder
- Custom item builder

**F16: Multi-class Support**

- Add levels in additional classes
- Track features from multiple classes
- Calculate multi-class spell slots correctly
- Validate multi-class prerequisites

---

## 5. Technical Architecture

### 5.1 Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend Framework | React 18+ with TypeScript | Component-based, strong typing, massive ecosystem |
| Styling | Tailwind CSS + shadcn/ui | Rapid, consistent styling; accessible components |
| State Management | Zustand | Lightweight, intuitive, no boilerplate |
| Client Routing | React Router v6 | Standard routing solution |
| Data Persistence | IndexedDB via Dexie.js | Offline-first, no backend required for MVP, stores complex objects |
| PDF Generation | jsPDF + html2canvas OR @react-pdf/renderer | Client-side PDF generation |
| Dice Animation | Three.js or CSS 3D transforms | 3D dice rolling animation |
| Data Layer | Static JSON + SRD data | Game rules data bundled with app |
| Build Tool | Vite | Fast HMR, optimized builds |
| Testing | Vitest + React Testing Library | Fast unit/integration tests |
| Deployment | Vercel or Netlify | Zero-config deployment, CDN |

### 5.2 Application Architecture

```
src/
├── app/
│   ├── App.tsx                    # Root component, routing
│   └── providers.tsx              # Context providers
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── character/
│   │   ├── CharacterCard.tsx      # Gallery card
│   │   ├── CharacterSheet.tsx     # Full 3-page sheet view
│   │   ├── AbilityScoreBlock.tsx  # Score + modifier display
│   │   ├── SkillList.tsx          # Skills with proficiency
│   │   ├── CombatStats.tsx        # AC, HP, initiative, speed
│   │   ├── AttackTable.tsx        # Weapons and attacks
│   │   ├── SpellSheet.tsx         # Spell management page
│   │   ├── EquipmentList.tsx      # Inventory management
│   │   ├── PersonalityBlock.tsx   # Traits, ideals, bonds, flaws
│   │   └── BackstoryPage.tsx      # Page 2: description & story
│   ├── wizard/
│   │   ├── CreationWizard.tsx     # Main wizard controller
│   │   ├── RaceStep.tsx           # Race selection + details
│   │   ├── ClassStep.tsx          # Class selection + details
│   │   ├── AbilityScoreStep.tsx   # Score generation + assignment
│   │   ├── BackgroundStep.tsx     # Background + personality
│   │   ├── EquipmentStep.tsx      # Starting equipment
│   │   ├── SpellStep.tsx          # Initial spell selection
│   │   └── ReviewStep.tsx         # Final review + save
│   ├── campaign/
│   │   ├── CampaignDashboard.tsx  # DM campaign view
│   │   ├── PartyGrid.tsx          # Party stat overview
│   │   ├── InitiativeTracker.tsx  # Combat tracker
│   │   └── SessionLog.tsx         # Session notes
│   ├── dice/
│   │   ├── DiceRoller.tsx         # Dice rolling interface
│   │   ├── DiceAnimation.tsx      # 3D dice visuals
│   │   └── RollHistory.tsx        # Roll log
│   └── shared/
│       ├── SearchFilter.tsx       # Reusable search/filter
│       ├── Modal.tsx              # Reusable modal
│       └── PrintLayout.tsx        # Print-specific layout
├── data/
│   ├── races.json                 # All SRD races + traits
│   ├── classes.json               # All SRD classes + features
│   ├── backgrounds.json           # All SRD backgrounds
│   ├── spells.json                # Full SRD spell database
│   ├── equipment.json             # Weapons, armor, gear, tools
│   ├── feats.json                 # All SRD feats
│   └── rules.json                 # Ability score tables, proficiency progression
├── hooks/
│   ├── useCharacter.ts            # Character CRUD operations
│   ├── useDiceRoll.ts             # Dice rolling logic
│   ├── useAbilityScores.ts        # Score calculation logic
│   ├── useSpellSlots.ts           # Spell slot management
│   └── useCampaign.ts             # Campaign operations
├── stores/
│   ├── characterStore.ts          # Character state management
│   ├── campaignStore.ts           # Campaign state
│   ├── uiStore.ts                 # UI state (modals, wizard step)
│   └── diceStore.ts               # Dice roll state
├── utils/
│   ├── calculations.ts            # All derived stat calculations
│   ├── validation.ts              # Character validation rules
│   ├── pdfExport.ts               # PDF generation logic
│   ├── diceEngine.ts              # Dice rolling math
│   └── storage.ts                 # IndexedDB wrapper
├── types/
│   ├── character.ts               # Character type definitions
│   ├── race.ts                    # Race/species types
│   ├── class.ts                   # Class/subclass types
│   ├── spell.ts                   # Spell types
│   ├── equipment.ts               # Equipment/item types
│   └── campaign.ts                # Campaign types
└── styles/
    ├── character-sheet.css         # Print-specific styles
    └── dice.css                    # Dice animation styles
```

### 5.3 Data Models

**Character (Primary Entity):**

```typescript
interface Character {
  id: string;                      // UUID
  createdAt: Date;
  updatedAt: Date;
  version: number;                 // Optimistic concurrency

  // Identity
  name: string;
  playerName: string;
  avatar?: string;                 // Base64 or URL

  // Core Choices
  race: RaceSelection;
  class: ClassSelection[];         // Array for multiclass
  background: BackgroundSelection;
  alignment: Alignment;

  // Ability Scores
  abilityScores: AbilityScores;    // Base scores before racial
  abilityScoreMethod: 'standard' | 'pointBuy' | 'rolled';
  rolledScores?: number[];         // Preserved for reference

  // Level & XP
  level: number;
  experiencePoints: number;

  // Combat Stats (some derived, some tracked)
  hitPointMax: number;
  hitPointCurrent: number;
  tempHitPoints: number;
  hitDiceTotal: HitDice[];
  hitDiceUsed: number;
  armorClass: number;              // Can be overridden
  initiative: number;              // Can be overridden
  speed: Speed;
  deathSaves: { successes: number; failures: number };

  // Proficiencies
  savingThrowProficiencies: AbilityName[];
  skillProficiencies: SkillProficiency[];
  toolProficiencies: string[];
  weaponProficiencies: string[];
  armorProficiencies: string[];
  languages: string[];
  expertise: string[];             // Double proficiency

  // Equipment & Inventory
  equipment: EquipmentItem[];
  currency: Currency;
  attunedItems: string[];          // Max 3

  // Spellcasting
  spellcasting?: SpellcastingData;

  // Features & Traits
  racialTraits: Feature[];
  classFeatures: Feature[];
  feats: Feat[];

  // Personality
  personalityTraits: string[];
  ideals: string;
  bonds: string;
  flaws: string;

  // Description
  age: string;
  height: string;
  weight: string;
  eyes: string;
  skin: string;
  hair: string;
  appearance: string;
  backstory: string;
  alliesAndOrgs: string;
  treasure: string;

  // Meta
  campaignId?: string;
  isArchived: boolean;
  dmNotes?: string;                // DM-only field
}

interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

interface RaceSelection {
  raceId: string;
  subraceId?: string;
  abilityBonuses: Partial<AbilityScores>;
  traits: Feature[];
  size: 'Small' | 'Medium';
  baseSpeed: number;
  darkvision?: number;
  languages: string[];
}

interface ClassSelection {
  classId: string;
  subclassId?: string;
  level: number;
  hitDie: 4 | 6 | 8 | 10 | 12;
  features: Feature[];
  spellcasting?: {
    ability: AbilityName;
    cantripsKnown: number;
    spellsKnown?: number;
    spellsPrepared?: number;
    spellSlots: SpellSlots;
  };
}

interface SpellcastingData {
  spellcastingAbility: AbilityName;
  spellSaveDC: number;             // Derived
  spellAttackBonus: number;        // Derived
  cantrips: Spell[];
  knownSpells: Spell[];
  preparedSpells: string[];        // Spell IDs currently prepared
  spellSlots: SpellSlots;
  usedSpellSlots: SpellSlots;
}

interface SpellSlots {
  1: number; 2: number; 3: number; 4: number; 5: number;
  6: number; 7: number; 8: number; 9: number;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  dmId: string;
  characterIds: string[];
  joinCode: string;
  houseRules: HouseRules;
  sessions: SessionNote[];
  createdAt: Date;
}
```

### 5.4 Calculation Engine

The calculation engine is the heart of the app. All derived values must auto-update when any input changes.

```typescript
// Core calculation functions
function getModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

function getArmorClass(char: Character): number {
  const dexMod = getModifier(char.abilityScores.dexterity);
  const equippedArmor = char.equipment.find(e => e.isEquipped && e.type === 'armor');
  if (!equippedArmor) return 10 + dexMod; // Unarmored
  // Apply armor-specific formula
  return calculateArmorAC(equippedArmor, dexMod, char);
}

function getSkillModifier(char: Character, skill: SkillName): number {
  const ability = SKILL_ABILITY_MAP[skill];
  const mod = getModifier(char.abilityScores[ability]);
  const profBonus = getProficiencyBonus(char.level);
  const isProficient = char.skillProficiencies.some(s => s.skill === skill);
  const hasExpertise = char.expertise.includes(skill);
  if (hasExpertise) return mod + (profBonus * 2);
  if (isProficient) return mod + profBonus;
  return mod;
}

function getHitPointMax(char: Character): number {
  let hp = 0;
  const conMod = getModifier(char.abilityScores.constitution);
  for (const cls of char.class) {
    // Level 1: max hit die + CON
    hp += cls.hitDie + conMod;
    // Subsequent levels: average or rolled + CON
    for (let i = 1; i < cls.level; i++) {
      hp += Math.floor(cls.hitDie / 2) + 1 + conMod; // Average method
    }
  }
  return hp;
}

function getPassivePerception(char: Character): number {
  return 10 + getSkillModifier(char, 'perception');
}

function getSpellSaveDC(char: Character): number {
  if (!char.spellcasting) return 0;
  const abilityMod = getModifier(
    char.abilityScores[char.spellcasting.spellcastingAbility]
  );
  return 8 + getProficiencyBonus(char.level) + abilityMod;
}
```

### 5.5 IndexedDB Schema (Dexie.js)

```typescript
import Dexie from 'dexie';

class CharacterForgeDB extends Dexie {
  characters!: Dexie.Table<Character, string>;
  campaigns!: Dexie.Table<Campaign, string>;
  preferences!: Dexie.Table<UserPreferences, string>;

  constructor() {
    super('CharacterForgeDB');
    this.version(1).stores({
      characters: 'id, name, campaignId, isArchived, updatedAt',
      campaigns: 'id, name, joinCode',
      preferences: 'id'
    });
  }
}
```

---

## 6. UI/UX Design Specifications

### 6.1 Design System

**Theme:** Dark fantasy with warm accents — think parchment tones on dark backgrounds. The aesthetic should evoke a tavern where adventurers gather.

**Color Palette:**

| Token | Color | Usage |
|-------|-------|-------|
| bg-primary | #1a1a2e | Main background |
| bg-secondary | #16213e | Card/panel backgrounds |
| bg-surface | #0f3460 | Elevated surfaces |
| accent-gold | #e8b430 | Primary accent, CTAs |
| accent-red | #c0392b | Damage, danger, HP loss |
| accent-green | #27ae60 | Healing, success, HP gain |
| accent-blue | #2980b9 | Information, spells |
| text-primary | #eee8d5 | Main text (parchment white) |
| text-secondary | #93a1a1 | Secondary text |
| text-muted | #657b83 | Disabled/hint text |
| border | #2a2a4a | Default borders |

**Typography:**

- Headings: Cinzel (Google Fonts) — fantasy serif, excellent for D&D aesthetic
- Body: Inter — clean, readable for stats and data
- Monospace: JetBrains Mono — for dice rolls and calculations

**Component Patterns:**

- Cards with subtle parchment texture backgrounds for character info
- Tabbed interfaces for character sheet pages
- Collapsible sections for detailed info
- Tooltips on all abbreviated/game-term elements
- Inline dice roll buttons (d20 icon) next to rollable values

### 6.2 Key Screen Layouts

**Home / Character Gallery:**  
Grid of character cards (responsive: 1 col mobile, 2-3 cols tablet, 4 cols desktop). Each card shows avatar placeholder, name, "Level X [Race] [Class]", and quick-stats bar (HP, AC). Floating action button for "New Character". Secondary nav for Campaigns, Dice Roller, Settings.

**Creation Wizard:**  
Left sidebar showing steps with progress indicators (numbered, with checkmarks for completed). Main content area for current step. Bottom bar with Back/Next/Skip navigation. Step content uses a card-based selection pattern for races and classes.

**Character Sheet View:**  
Three-tab layout (Stats | Backstory | Spells). Stats tab mirrors the official sheet layout in a responsive grid. Edit toggle in top-right corner. Quick-action bar at bottom (Rest, Level Up, Roll, Print).

**DM Campaign Dashboard:**  
Left panel: campaign list. Main area: selected campaign with party grid, session log tabs. Party grid is a data table with sortable columns. Encounter button opens initiative tracker overlay.

### 6.3 Responsive Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Mobile | < 640px | Single column, stacked cards, bottom nav |
| Tablet | 640-1024px | Two column, side panel for details |
| Desktop | 1024-1440px | Three column, full sheet layout |
| Wide | > 1440px | Centered max-width container |

### 6.4 Accessibility

- All interactive elements keyboard navigable
- ARIA labels on all form controls
- Color contrast minimum 4.5:1 for text
- Screen reader announcements for dice rolls
- Reduced motion option disables dice animations
- Focus visible indicators on all interactive elements

---

## 7. SRD Game Data

### 7.1 Data Sources

All game mechanics data must come from the D&D 5e Systems Reference Document (SRD), which is released under the Open Game License and Creative Commons. This includes:

- 9 core races with subraces
- 12 classes with 1 subclass each (SRD subset)
- 18 backgrounds (SRD)
- 300+ spells
- Complete equipment tables
- All rules mechanics

**Data Format:** Static JSON files bundled with the application. Each file follows a consistent schema with IDs for cross-referencing.

### 7.2 Race Data Structure

```json
{
  "id": "elf",
  "name": "Elf",
  "description": "Elves are a magical people of otherworldly grace...",
  "abilityScoreIncrease": { "dexterity": 2 },
  "age": "mature at ~100, live to 750+",
  "size": "Medium",
  "speed": 30,
  "traits": [
    { "name": "Darkvision", "description": "See in dim light within 60 feet..." },
    { "name": "Keen Senses", "description": "Proficiency in Perception" },
    { "name": "Fey Ancestry", "description": "Advantage on saves vs. charm..." },
    { "name": "Trance", "description": "Meditate 4 hours instead of sleeping 8" }
  ],
  "languages": ["Common", "Elvish"],
  "subraces": [
    {
      "id": "high-elf",
      "name": "High Elf",
      "abilityScoreIncrease": { "intelligence": 1 },
      "traits": [
        { "name": "Elf Weapon Training", "description": "Proficiency with longsword..." },
        { "name": "Cantrip", "description": "One cantrip from wizard spell list" },
        { "name": "Extra Language", "description": "One additional language" }
      ]
    }
  ]
}
```

### 7.3 Class Data Structure

```json
{
  "id": "fighter",
  "name": "Fighter",
  "description": "A master of martial combat...",
  "hitDie": 10,
  "primaryAbility": ["strength", "dexterity"],
  "savingThrows": ["strength", "constitution"],
  "armorProficiencies": ["all armor", "shields"],
  "weaponProficiencies": ["simple weapons", "martial weapons"],
  "toolProficiencies": [],
  "skillChoices": {
    "choose": 2,
    "from": ["Acrobatics", "Animal Handling", "Athletics", "History",
             "Insight", "Intimidation", "Perception", "Survival"]
  },
  "startingEquipment": [
    { "choose": 1, "options": [
      ["chain mail"],
      ["leather armor", "longbow", "20 arrows"]
    ]},
    { "choose": 1, "options": [
      ["martial weapon", "shield"],
      ["two martial weapons"]
    ]}
  ],
  "features": {
    "1": [
      { "name": "Fighting Style", "description": "Choose a fighting style..." },
      { "name": "Second Wind", "description": "Bonus action to regain 1d10 + level HP..." }
    ],
    "2": [
      { "name": "Action Surge", "description": "Take one additional action..." }
    ]
  },
  "subclassLevel": 3,
  "subclassName": "Martial Archetype",
  "subclasses": [
    {
      "id": "champion",
      "name": "Champion",
      "features": {
        "3": [{ "name": "Improved Critical", "description": "Crit on 19-20" }]
      }
    }
  ],
  "asiLevels": [4, 6, 8, 12, 14, 16, 19]
}
```

---

## 8. Implementation Phases

### Phase 1 — Foundation (Weeks 1-2)

- Project scaffolding: Vite + React + TypeScript + Tailwind + shadcn/ui
- Data layer: Load and parse all SRD JSON data files
- IndexedDB setup with Dexie.js
- Type definitions for all game entities
- Calculation engine with full test coverage
- Basic routing: Home, Create, View, Edit

### Phase 2 — Character Creation Wizard (Weeks 3-4)

- Wizard framework with step management
- Race selection step with visual cards and detail panels
- Class selection step
- Ability score step (all 3 methods)
- Background and personality step
- Equipment selection step
- Spell selection step (for casters)
- Review and save step

### Phase 3 — Character Sheet & Management (Weeks 5-6)

- Full character sheet view (all 3 pages)
- Edit mode with inline editing
- Character gallery with search and filter
- Character duplication, archiving, deletion
- JSON import/export

### Phase 4 — Session Play Features (Weeks 7-8)

- Dice roller with animations
- HP tracker with damage/healing
- Spell slot tracker
- Conditions tracker
- Short rest / long rest automation
- Level up flow

### Phase 5 — DM Features (Weeks 9-10)

- Campaign CRUD
- Join code / invite system
- Party dashboard with stat grid
- Initiative tracker
- DM notes per character and per campaign

### Phase 6 — Polish & Export (Weeks 11-12)

- PDF export with official sheet layout
- Print stylesheet optimization
- Mobile responsive refinement
- Accessibility audit and fixes
- Performance optimization
- PWA support for offline access

---

## 9. Testing Strategy

### 9.1 Unit Tests

- Calculation engine: test every derived stat function
- Dice roller: distribution validation over 10,000 rolls
- Data validation: ensure all SRD data files parse correctly
- Point buy: boundary testing (min/max scores, exact point totals)

### 9.2 Integration Tests

- Character creation wizard: complete flow from step 1 to save
- Level up: test all class features unlock at correct levels
- Multi-class: verify correct spell slot calculation
- Equipment: AC calculation with different armor types

### 9.3 E2E Tests (Playwright)

- Full character creation for each class
- Print/export produces valid PDF
- Campaign join flow
- Mobile responsive behavior

---

## 10. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Lighthouse Score | > 90 (all categories) |
| Offline Support | Full functionality (PWA) |
| Bundle Size | < 500KB (gzipped, excluding SRD data) |
| SRD Data Size | Lazy-loaded, < 2MB total |
| Browser Support | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ |
| Mobile Support | iOS Safari, Chrome Android |
| Concurrent Characters | 100+ per user |
| Auto-save | Debounced, 500ms after last change |

---

## 11. Reference Tables

### 11.1 Ability Score Modifier Table

| Score | Modifier |
|-------|----------|
| 1 | -5 |
| 2-3 | -4 |
| 4-5 | -3 |
| 6-7 | -2 |
| 8-9 | -1 |
| 10-11 | +0 |
| 12-13 | +1 |
| 14-15 | +2 |
| 16-17 | +3 |
| 18-19 | +4 |
| 20 | +5 |

### 11.2 Proficiency Bonus by Level

| Level | Bonus |
|-------|-------|
| 1-4 | +2 |
| 5-8 | +3 |
| 9-12 | +4 |
| 13-16 | +5 |
| 17-20 | +6 |

### 11.3 The 18 Skills and Their Abilities

| Skill | Ability |
|-------|---------|
| Acrobatics | DEX |
| Animal Handling | WIS |
| Arcana | INT |
| Athletics | STR |
| Deception | CHA |
| History | INT |
| Insight | WIS |
| Intimidation | CHA |
| Investigation | INT |
| Medicine | WIS |
| Nature | INT |
| Perception | WIS |
| Performance | CHA |
| Persuasion | CHA |
| Religion | INT |
| Sleight of Hand | DEX |
| Stealth | DEX |
| Survival | WIS |

### 11.4 Point Buy Cost Table

| Score | Cumulative Cost |
|-------|----------------|
| 8 | 0 |
| 9 | 1 |
| 10 | 2 |
| 11 | 3 |
| 12 | 4 |
| 13 | 5 |
| 14 | 7 |
| 15 | 9 |

### 11.5 XP Thresholds by Level

| Level | XP Required |
|-------|-------------|
| 1 | 0 |
| 2 | 300 |
| 3 | 900 |
| 4 | 2,700 |
| 5 | 6,500 |
| 6 | 14,000 |
| 7 | 23,000 |
| 8 | 34,000 |
| 9 | 48,000 |
| 10 | 64,000 |
| 11 | 85,000 |
| 12 | 100,000 |
| 13 | 120,000 |
| 14 | 140,000 |
| 15 | 165,000 |
| 16 | 195,000 |
| 17 | 225,000 |
| 18 | 265,000 |
| 19 | 305,000 |
| 20 | 355,000 |

---

## 12. Claude Code Implementation Notes

### 12.1 Build Order

Follow the phase plan strictly. Each phase should produce a working, testable increment. Start Phase 1 by:

1. `npm create vite@latest dnd-forge -- --template react-ts`
2. Install dependencies: `tailwindcss`, `@shadcn/ui`, `zustand`, `dexie`, `react-router-dom`, `uuid`
3. Create the full type system in `types/` FIRST before any components
4. Build and test the calculation engine BEFORE the UI
5. Populate SRD data files — use the 5e SRD API (https://www.dnd5eapi.co/) as reference

### 12.2 Critical Implementation Details

- **Never hardcode derived stats.** Always compute from source data using the calculation engine
- **Wizard state must survive navigation.** Use Zustand persist middleware or session storage
- **SRD data is immutable.** Store as static imports, never modify at runtime
- **Character data is mutable.** Store in IndexedDB with optimistic concurrency (version field)
- **All dice rolls must use cryptographically random values** via `crypto.getRandomValues()`
- **PDF export must work offline.** No server calls for PDF generation
- **Accessibility is not optional.** Every interactive element needs keyboard support and ARIA labels
- **Mobile-first responsive design.** Start with mobile layout, scale up

### 12.3 SRD Data Acquisition

The D&D 5e SRD content is available under the Open Game License. The 5e SRD API (https://www.dnd5eapi.co/) provides all SRD content as JSON. For the bundled app, download and restructure this data into the JSON files described in Section 7. Key endpoints:

- `/api/races` — All SRD races
- `/api/classes` — All SRD classes
- `/api/spells` — All SRD spells
- `/api/equipment` — All SRD equipment
- `/api/backgrounds` — SRD backgrounds (limited)
- `/api/features` — Class features
- `/api/traits` — Racial traits

### 12.4 Key Libraries

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "zustand": "^4.4.0",
    "dexie": "^3.2.0",
    "dexie-react-hooks": "^1.1.0",
    "uuid": "^9.0.0",
    "jspdf": "^2.5.0",
    "html2canvas": "^1.4.0",
    "lucide-react": "^0.294.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "framer-motion": "^10.16.0"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.1.0",
    "playwright": "^1.40.0"
  }
}
```

---

## 13. Open Questions & Future Considerations

1. **Authentication:** MVP is local-only. Future: add user accounts for cross-device sync?
2. **Real-time collaboration:** Should the DM see live HP changes during a session?
3. **Homebrew content:** How much custom content creation to support in v1?
4. **D&D Beyond integration:** API access for character import?
5. **2024 Player's Handbook:** Support both 2014 and 2024 rules? Toggle between them?
6. **AI Assistant:** Integrate an AI helper for backstory generation, NPC creation, and rules questions?
7. **Virtual Tabletop Integration:** Export to Roll20, Foundry VTT, or Fantasy Grounds?

---

*This specification provides the complete domain knowledge, user journey mapping, feature definition, technical architecture, and implementation guidance needed to build D&D Character Forge from scratch using Claude Code.*
