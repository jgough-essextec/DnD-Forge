# D&D Character Forge — Phase 2: Character Creation Wizard

## Detailed Epics, Stories & Tasks

**Phase Duration:** Weeks 3–4  
**Phase Goal:** Deliver a fully functional, guided character creation wizard that walks players through the official D&D 5e creation process step-by-step, as well as a freeform creation mode for experienced players. By the end of Phase 2, a user can create a complete, valid level-1 character and save it to IndexedDB.

**Phase 1 Dependencies:** Phase 2 assumes all Phase 1 deliverables are complete — project scaffolding, the full type system, all SRD game data files, the calculation engine (tested), the database layer (Dexie.js CRUD), Zustand stores, and the dice engine.

---

## Pre-Phase 2 Audit: Edge Cases & Gaps to Address

Before breaking Phase 2 into work items, a cross-reference of the wizard steps against D&D 5e creation rules surfaced the following concerns that must be handled within the wizard or will cause user confusion.

### Gap W1 — Race Choices Are Not Uniform

Not every race is "pick race, done." Several races require additional player decisions during selection:

| Race | Additional Choices Required |
|------|-----------------------------|
| Dragonborn | Choose draconic ancestry (10 options) → determines breath weapon damage type + damage resistance |
| Half-Elf | Choose +1 to two ability scores (from any except CHA), choose 2 skill proficiencies (from any) |
| High Elf | Choose 1 wizard cantrip, choose 1 extra language |
| Wood Elf | No additional choices beyond subrace selection |
| Hill Dwarf / Mountain Dwarf | No additional choices beyond subrace selection |
| Human (Standard) | No choices (+1 all) |
| Human (Variant) | Choose +1 to two abilities, choose 1 skill proficiency, choose 1 feat |
| Forest Gnome / Rock Gnome | No additional choices beyond subrace selection |
| Lightfoot / Stout Halfling | No additional choices beyond subrace selection |
| Half-Orc | No additional choices |
| Tiefling | No additional choices |

The Race Step must dynamically render choice sub-panels based on the selected race. Variant Human is particularly complex because it pulls in the feat selection system.

### Gap W2 — Class Skill Choices Have Variable Counts

Each class offers a different number of skill picks from a different pool. The Class Step must present the correct pick count and pool:

| Class | Skills to Choose | Pool Size |
|-------|-----------------|-----------|
| Barbarian | 2 | 6 |
| Bard | 3 (any skill) | 18 |
| Cleric | 2 | 5 |
| Druid | 2 | 8 |
| Fighter | 2 | 8 |
| Monk | 2 | 8 |
| Paladin | 2 | 6 |
| Ranger | 3 | 8 |
| Rogue | 4 | 11 |
| Sorcerer | 2 | 6 |
| Warlock | 2 | 7 |
| Wizard | 2 | 6 |

### Gap W3 — Subclass Selection at Level 1

Most subclasses are chosen at level 3, but Clerics choose their Divine Domain at level 1 and Sorcerers choose their Sorcerous Origin at level 1. The wizard must prompt for subclass selection during the Class Step for these two classes (and Warlock chooses at level 1 for Otherworldly Patron). This means the Class Step must conditionally show a subclass picker.

### Gap W4 — Background Skill Overlap Resolution

If a background grants a skill proficiency the character already has from their class, the PHB rules say the player may choose a replacement skill from any skill. The wizard must detect this overlap and prompt the player to pick a substitute.

### Gap W5 — Starting Equipment Has Nested Choices

Starting equipment options are not flat lists — they contain conditional groups. For example, the Fighter's starting equipment:

- **(a)** chain mail **OR** **(b)** leather armor, longbow, and 20 arrows
- **(a)** a martial weapon and a shield **OR** **(b)** two martial weapons
- **(a)** a light crossbow and 20 bolts **OR** **(b)** two handaxes
- A dungeoneer's pack **OR** an explorer's pack

Each "martial weapon" choice requires drilling down into the weapon list. The Equipment Step must support multi-level selection trees.

### Gap W6 — Spellcasting Systems Vary by Class

The Spell Step must handle three distinct systems at level 1:

| Class | Cantrips Known (Lv 1) | Spells Known/Prepared (Lv 1) | System |
|-------|----------------------|------------------------------|--------|
| Bard | 2 | 4 known | Known caster |
| Cleric | 3 | WIS mod + 1 prepared (from full list) | Prepared caster |
| Druid | 2 | WIS mod + 1 prepared (from full list) | Prepared caster |
| Sorcerer | 4 | 2 known | Known caster |
| Warlock | 2 | 2 known (Pact Magic) | Known caster (Pact) |
| Wizard | 3 | Spellbook: 6 spells, prepare INT mod + 1 | Prepared caster (spellbook) |
| Paladin | 0 | No spells at level 1 | Prepared (starts at Lv 2) |
| Ranger | 0 | No spells at level 1 | Known (starts at Lv 2) |
| Fighter | 0 | No spells at level 1 (Eldritch Knight at Lv 3) | Third caster |
| Rogue | 0 | No spells at level 1 (Arcane Trickster at Lv 3) | Third caster |

The Spell Step should be skipped entirely for non-casters and for half/third casters who don't get spells at level 1.

### Gap W7 — Freeform Mode Must Coexist with the Wizard

The spec calls for a "Freeform Mode" toggle at the wizard entry point. This is a parallel creation path — not a separate page — that presents the full character sheet as an editable form without enforced step ordering. The freeform mode still needs access to all the same data pickers (race selector, class selector, spell browser, etc.) but surfaced as inline form elements rather than wizard steps.

### Gap W8 — Wizard State Recovery

If a user closes their browser mid-wizard, they should be able to resume. The Zustand wizard store with sessionStorage persistence (from Phase 1) handles this, but the wizard UI must check for in-progress state on mount and offer to resume or start fresh.

---

## Epic 8: Wizard Framework & Navigation

**Goal:** A reusable, multi-step wizard component with progress tracking, validation gating, state persistence, and both guided and freeform creation modes. This is the container that all individual steps plug into.

### Story 8.1 — Wizard Shell & Step Management

> As a player, I need a guided step-by-step interface so I can create my character without feeling overwhelmed by all the options at once.

**Tasks:**

- [ ] **T8.1.1** — Create `components/wizard/CreationWizard.tsx` as the top-level wizard controller. It reads `currentStep` from the wizard store and renders the corresponding step component. Includes animated transitions between steps (framer-motion slide left/right)
- [ ] **T8.1.2** — Define the wizard step registry as a constant array:
  ```
  Step 0: Intro / Mode Selection
  Step 1: Race Selection
  Step 2: Class Selection
  Step 3: Ability Scores
  Step 4: Background & Personality
  Step 5: Equipment
  Step 6: Spellcasting (conditional — skip for non-casters at level 1)
  Step 7: Review & Finalize
  ```
- [ ] **T8.1.3** — Create `components/wizard/WizardProgress.tsx` — a left sidebar (desktop) / top bar (mobile) showing all steps with numbered indicators. Completed steps show a checkmark icon. Current step is highlighted with the accent-gold color. Future steps are dimmed. Clicking a completed step navigates back to it
- [ ] **T8.1.4** — Create `components/wizard/WizardNavigation.tsx` — a fixed bottom bar with "Back" and "Next" buttons. The "Next" button is disabled (with tooltip explaining why) until the current step's validation passes. Shows "Save Character" on the final step instead of "Next". Include a "Skip" option on the Spellcasting step only (since it's conditional)
- [ ] **T8.1.5** — Implement step validation gating: each step component exposes a `validate(): { valid: boolean; errors: string[] }` function. The wizard calls this before advancing. Invalid fields are highlighted with error messages
- [ ] **T8.1.6** — Implement back navigation that preserves all state — returning to a previous step shows the user's prior selections intact. Changing a prior selection (e.g., switching race) triggers a cascade warning if it invalidates later steps (e.g., "Changing your race will reset your ability scores because racial bonuses change. Continue?")
- [ ] **T8.1.7** — Wire the wizard to the Zustand wizard store: every selection immediately persists to sessionStorage via the store's persist middleware. On mount, check for existing wizard state and show a modal: "You have an unfinished character. Resume or Start Fresh?"
- [ ] **T8.1.8** — Implement the conditional step skip logic: if the selected class has no spellcasting at level 1, the wizard jumps from Equipment (Step 5) directly to Review (Step 7). The progress bar reflects this by dimming the Spellcasting step with a "N/A" label
- [ ] **T8.1.9** — Add keyboard navigation support: Enter/Tab to advance, Escape to go back, number keys (1-7) to jump to completed steps

### Story 8.2 — Intro Screen & Mode Selection

> As a player, I need to choose between guided wizard mode and freeform mode so I can use the workflow that matches my experience level.

**Tasks:**

- [ ] **T8.2.1** — Create `components/wizard/IntroStep.tsx` — the initial wizard screen with a welcoming header ("Let's Build Your Adventurer!"), brief explanation of what the wizard does, and two prominent mode selection cards
- [ ] **T8.2.2** — Create the "Guided Creation" card: icon (wand/scroll), title, description ("Perfect for new players. We'll walk you through every step of building your character."), and a "Start Guided Creation" button
- [ ] **T8.2.3** — Create the "Freeform Creation" card: icon (quill/edit), title, description ("For experienced players who know the rules. Edit all fields directly on a blank character sheet."), and a "Start Freeform" button
- [ ] **T8.2.4** — Add an optional "Character Name" field on the intro screen so the player can name their character up front (can also be set later in the Background step)
- [ ] **T8.2.5** — Add a "Player Name" field on the intro screen (pre-populated from user preferences if stored)
- [ ] **T8.2.6** — If resuming an in-progress wizard (state found in sessionStorage), show a banner at the top: "Welcome back! You were building [Character Name or 'a character']. Pick up where you left off?" with Resume and Start Fresh buttons

### Story 8.3 — Freeform Creation Mode

> As an experienced player, I need a blank character sheet where I can fill in whatever I want in any order, with auto-calculation of derived stats but no enforced step sequence.

**Tasks:**

- [ ] **T8.3.1** — Create `components/wizard/FreeformCreation.tsx` — renders a full editable character sheet as a single scrollable form. Sections correspond to the same groupings as the wizard steps but are all visible at once as collapsible accordion sections: Race & Species, Class & Level, Ability Scores, Background & Personality, Equipment & Inventory, Spellcasting (if applicable), Description & Backstory
- [ ] **T8.3.2** — Each section header shows a completion indicator: green checkmark if all required fields are filled, yellow warning triangle if partially complete, empty circle if not started
- [ ] **T8.3.3** — Embed the same data picker components used in the wizard steps (race selector, class selector, spell browser, etc.) as inline form elements within each section
- [ ] **T8.3.4** — Implement real-time derived stat calculation: as the user fills in fields, a sticky "Computed Stats" sidebar (desktop) or collapsible panel (mobile) shows the live AC, HP, initiative, proficiency bonus, spell save DC, and attack bonuses — all updating as fields change
- [ ] **T8.3.5** — Implement validation as warnings (yellow badges), not blocking errors. The user can save an incomplete character from freeform mode at any time — the save button shows "Save (3 warnings)" if there are validation issues
- [ ] **T8.3.6** — Add a "Switch to Guided Mode" link that opens the wizard at Step 1, pre-populating from any freeform data already entered. Show a confirmation dialog since the freeform layout will be replaced
- [ ] **T8.3.7** — Add a "Quick Fill" dropdown for each section that auto-populates with common presets (e.g., "Standard Fighter" fills race=Human, class=Fighter, standard array assigned optimally, background=Soldier)

---

## Epic 9: Race Selection Step

**Goal:** A visually rich, informative race selection experience that presents all 9 SRD races with their subraces, traits, and required choices, helping players understand what each race offers mechanically and narratively.

### Story 9.1 — Race Card Gallery

> As a player, I need to see all available races at a glance with key information so I can pick the one that appeals to me.

**Tasks:**

- [ ] **T9.1.1** — Create `components/wizard/RaceStep.tsx` as the Step 1 container. Layout: a responsive grid of race cards (2 columns on mobile, 3 on tablet, 4-5 on desktop) with a detail panel that opens on selection
- [ ] **T9.1.2** — Create `components/wizard/race/RaceCard.tsx` — a selectable card for each race displaying: placeholder avatar/silhouette art (themed to race), race name in Cinzel font, 2-3 key traits as compact badges (e.g., "Darkvision 60ft", "+2 DEX", "Fey Ancestry"), size and speed as small icons, and a brief one-sentence tagline
- [ ] **T9.1.3** — Implement card selection state: clicking a card highlights it with a gold border and accent glow. Only one race is selected at a time. The previously selected card reverts to its default state
- [ ] **T9.1.4** — Add a search/filter bar above the grid: text search by race name, filter chips for size (Small/Medium), filter by primary ability bonus (STR, DEX, etc.), and a "Has Darkvision" toggle
- [ ] **T9.1.5** — Add a "Recommended for your class" badge on race cards if the player has already selected a class (from back-navigation). For example, if class is Wizard, highlight races with INT bonuses (High Elf, Gnome)
- [ ] **T9.1.6** — Implement a tooltip or info icon on each badge that shows the full trait description on hover/tap

### Story 9.2 — Race Detail Panel

> As a player, after clicking a race card I need to see the full details — all traits, ability bonuses, proficiencies, languages, and subrace options — so I can make an informed decision.

**Tasks:**

- [ ] **T9.2.1** — Create `components/wizard/race/RaceDetailPanel.tsx` — a slide-in panel (right side on desktop, bottom sheet on mobile) that shows when a race card is clicked. Animated entrance with framer-motion
- [ ] **T9.2.2** — Panel header: race name, size badge, speed badge, description paragraph from SRD data
- [ ] **T9.2.3** — "Ability Score Bonuses" section: display each bonus as "+2 Dexterity" with a visual indicator (colored number). If the race has choice bonuses (Half-Elf: +1 to two others), display selectable dropdowns
- [ ] **T9.2.4** — "Racial Traits" section: list all traits with name in bold and description below. Traits with mechanical effects (e.g., Darkvision, Fey Ancestry, Dwarven Resilience) should have a subtle icon indicating the type (vision, resistance, advantage, proficiency)
- [ ] **T9.2.5** — "Languages" section: list fixed languages and, if applicable, a language chooser dropdown (e.g., High Elf gets one extra language)
- [ ] **T9.2.6** — "Proficiencies" section: list any weapon, armor, or tool proficiencies granted by the race
- [ ] **T9.2.7** — "Speed & Senses" section: walking speed, special movement (if any), darkvision range

### Story 9.3 — Subrace Selection

> As a player choosing a race with subraces, I need to pick my subrace and see how it modifies my racial traits.

**Tasks:**

- [ ] **T9.3.1** — Create `components/wizard/race/SubraceSelector.tsx` — within the detail panel, if the selected race has subraces, display subrace options as selectable tabs or mini-cards. Each shows the subrace name, additional ability bonus, and unique traits
- [ ] **T9.3.2** — When a subrace is selected, update the detail panel to show the combined traits (base race + subrace). Clearly distinguish which traits come from the base race vs. the subrace using subtle labels or grouping
- [ ] **T9.3.3** — Handle races without subraces (Human standard, Dragonborn, Half-Elf, Half-Orc, Tiefling) by hiding the subrace selector entirely
- [ ] **T9.3.4** — Handle Variant Human as a special subrace-like option: when selected, show inputs for +1 to two abilities (dropdowns), 1 skill proficiency (dropdown from all 18), and 1 feat (opens feat picker — see T9.4.3)
- [ ] **T9.3.5** — Handle Dragonborn ancestry as a special subrace-like chooser: display a 10-row table of draconic ancestries showing dragon type, damage type, and breath weapon shape (line vs. cone). Selection sets the damage resistance and breath weapon type

### Story 9.4 — Race-Specific Choice Panels

> As a player choosing a race with additional decisions (Half-Elf skills, High Elf cantrip, Variant Human feat), I need clear interfaces for each choice.

**Tasks:**

- [ ] **T9.4.1** — Create `components/wizard/race/AbilityBonusChooser.tsx` — for Half-Elf and Variant Human. Shows 6 ability score buttons; the player selects the required number. Already-fixed bonuses (e.g., Half-Elf CHA +2) are shown but not selectable. Validate correct count selected
- [ ] **T9.4.2** — Create `components/wizard/race/SkillChooser.tsx` — reusable component for picking N skills from a list. Used by Half-Elf (choose 2 from any), Variant Human (choose 1 from any). Shows skills as a checkbox list with ability grouping. Enforces the choose count
- [ ] **T9.4.3** — Create `components/wizard/race/FeatPicker.tsx` — for Variant Human only at this stage (reused later for ASI/feat at level up). Displays available feats as cards with name, prerequisites, and description. Feats whose prerequisites the character doesn't meet are disabled with explanation. Selecting a feat that includes ability score increases or proficiency choices shows nested sub-pickers
- [ ] **T9.4.4** — Create `components/wizard/race/CantrippPicker.tsx` — for High Elf (choose 1 wizard cantrip). Shows cantrip cards from the wizard spell list filtered to level 0. Each card shows name, school, casting time, and description preview
- [ ] **T9.4.5** — Create `components/wizard/race/LanguagePicker.tsx` — reusable dropdown for choosing additional languages. Filters out languages the character already knows. Used by High Elf (+1 language) and any race with language choices
- [ ] **T9.4.6** — Create `components/wizard/race/DragonbornAncestryPicker.tsx` — table/card grid of 10 ancestry options (Black/Acid, Blue/Lightning, Brass/Fire, Bronze/Lightning, Copper/Acid, Gold/Fire, Green/Poison, Red/Fire, Silver/Cold, White/Cold). Each shows dragon color, damage type, breath weapon shape (5×30 ft line or 15 ft cone), and saving throw type

### Story 9.5 — Race Step Validation & State

> As a developer, I need the Race Step to validate all selections and persist them to the wizard store.

**Tasks:**

- [ ] **T9.5.1** — Implement `validateRaceStep()`: race must be selected; if race has subraces, subrace must be selected; all conditional choices must be completed (Dragonborn ancestry, Half-Elf ability bonuses and skills, High Elf cantrip and language, Variant Human abilities/skill/feat)
- [ ] **T9.5.2** — On "Next" click, persist the complete `RaceSelection` object to the wizard store including all choices. This includes: raceId, subraceId, chosen ability bonuses, chosen skills, chosen languages, chosen cantrip, chosen feat, dragonborn ancestry
- [ ] **T9.5.3** — On back-navigation to the Race Step, restore all previous selections from the wizard store and re-render the detail panel with the previously selected race/subrace
- [ ] **T9.5.4** — Display a summary of selected race/subrace in the wizard progress sidebar: "[Subrace] [Race]" (e.g., "High Elf", "Hill Dwarf", "Variant Human")

---

## Epic 10: Class Selection Step

**Goal:** A visually engaging class selection experience that helps players understand each class's role, abilities, and playstyle, and captures all level-1 class decisions including skill proficiencies and (for Clerics/Sorcerers/Warlocks) subclass selection.

### Story 10.1 — Class Card Gallery

> As a player, I need to see all 12 classes with their roles and key features so I can choose the one that matches my desired playstyle.

**Tasks:**

- [ ] **T10.1.1** — Create `components/wizard/ClassStep.tsx` as the Step 2 container. Layout mirrors the Race Step: responsive card grid + detail panel
- [ ] **T10.1.2** — Create `components/wizard/class/ClassCard.tsx` — a selectable card for each class displaying: class icon/silhouette placeholder, class name, role archetype tag (e.g., "Tank", "Healer", "Spellcaster", "Striker", "Support", "Utility"), hit die badge (e.g., "d10"), primary ability icons (e.g., STR for Fighter, INT for Wizard), and a one-sentence role summary
- [ ] **T10.1.3** — Define role archetype tags for all 12 classes:
  - Barbarian: Striker / Tank
  - Bard: Support / Spellcaster
  - Cleric: Healer / Support
  - Druid: Spellcaster / Support
  - Fighter: Striker / Tank
  - Monk: Striker
  - Paladin: Tank / Healer
  - Ranger: Striker / Utility
  - Rogue: Striker / Utility
  - Sorcerer: Spellcaster
  - Warlock: Spellcaster
  - Wizard: Spellcaster / Utility
- [ ] **T10.1.4** — Add filter/search bar: text search by name, filter by role archetype, filter by primary ability, filter by "Has Spellcasting" toggle
- [ ] **T10.1.5** — Add "Synergy with your race" indicator if the player already selected a race — highlight classes whose primary ability matches the race's ability bonuses (e.g., Elf +2 DEX → highlight Rogue, Ranger, Monk)

### Story 10.2 — Class Detail Panel

> As a player, I need to see the full details of a class — proficiencies, starting features, equipment options, and spellcasting info — before committing.

**Tasks:**

- [ ] **T10.2.1** — Create `components/wizard/class/ClassDetailPanel.tsx` — slide-in panel with tabbed or scrollable sections
- [ ] **T10.2.2** — "Overview" section: class description, hit die, primary ability recommendation, saving throw proficiencies
- [ ] **T10.2.3** — "Proficiencies" section: armor proficiencies (listed with icons), weapon proficiencies, tool proficiencies
- [ ] **T10.2.4** — "Level 1 Features" section: list each feature the class gains at level 1 with full description. Expandable cards for long descriptions (e.g., Rage, Spellcasting, Fighting Style). Features that involve choices (Fighting Style, Expertise) should be noted with "You'll choose this during creation"
- [ ] **T10.2.5** — "Spellcasting Preview" section (casters only): brief summary of spellcasting type (prepared vs. known vs. pact), spellcasting ability, cantrips known at level 1, spells known/prepared at level 1, and a note about when spell selection happens (Step 6)
- [ ] **T10.2.6** — "Level Progression Preview" section: a compact table showing key features gained at each level (1-20). Highlight subclass selection level, ASI levels, and notable power spikes. This is read-only informational content
- [ ] **T10.2.7** — "Starting Equipment Preview" section: show the equipment choice groups (e.g., "(a) chain mail OR (b) leather armor + longbow + 20 arrows") as a preview. Note that actual selection happens in Step 5

### Story 10.3 — Class Skill Proficiency Selection

> As a player, after choosing my class I need to pick my skill proficiencies from the class's allowed list.

**Tasks:**

- [ ] **T10.3.1** — Create `components/wizard/class/ClassSkillSelector.tsx` — displays the class's skill pool as a checklist. Shows the governing ability for each skill in a muted label (e.g., "Stealth (DEX)"). Enforces the exact choose count (e.g., Rogue: choose 4, Bard: choose 3 from any)
- [ ] **T10.3.2** — If the player already selected a race with skill proficiencies (e.g., Elf gets Perception), those skills are pre-checked and locked with a "From Race" label. They do NOT count against the class choice count
- [ ] **T10.3.3** — For Bard (choose any 3), display all 18 skills but group by ability score for easy scanning
- [ ] **T10.3.4** — Show a helper tooltip: "Choose skills that complement your ability scores. Higher ability modifiers make these skills more effective."
- [ ] **T10.3.5** — Validate: exactly the required number of skills must be selected before proceeding

### Story 10.4 — Level-1 Subclass Selection (Conditional)

> As a Cleric, Sorcerer, or Warlock player, I need to choose my subclass at level 1 since these classes require it before other classes do.

**Tasks:**

- [ ] **T10.4.1** — Create `components/wizard/class/SubclassSelector.tsx` — conditionally rendered within the Class Step when the selected class has `subclassLevel: 1`. Displays subclass options as cards with name, description, and key features
- [ ] **T10.4.2** — For Cleric (Divine Domain): show Life Domain (SRD) with domain spells, bonus proficiency (heavy armor), and Disciple of Life feature. If additional domains are in the data, show those too
- [ ] **T10.4.3** — For Sorcerer (Sorcerous Origin): show Draconic Bloodline (SRD) with draconic ancestry choice (dragon type), Draconic Resilience feature (HP bonus, natural AC)
- [ ] **T10.4.4** — For Warlock (Otherworldly Patron): show The Fiend (SRD) with expanded spell list and Dark One's Blessing feature
- [ ] **T10.4.5** — Subclass features that modify the character (e.g., Cleric Life Domain grants heavy armor proficiency, Sorcerer Draconic Bloodline grants +1 HP per level) must be captured and applied to the character data
- [ ] **T10.4.6** — For classes where subclass is chosen later (level 2 or 3), show an informational note: "You'll choose your [subclass name] at level [N]"

### Story 10.5 — Fighting Style Selection (Conditional)

> As a Fighter, Paladin, or Ranger player, I need to choose my Fighting Style at level 1.

**Tasks:**

- [ ] **T10.5.1** — Create `components/wizard/class/FightingStyleSelector.tsx` — conditionally rendered for Fighter, Paladin, and Ranger. Displays Fighting Style options as radio cards with name and description
- [ ] **T10.5.2** — Fighter options: Archery (+2 ranged attack), Defense (+1 AC when armored), Dueling (+2 damage one-handed), Great Weapon Fighting (reroll 1-2 damage dice with two-handed), Protection (impose disadvantage with shield), Two-Weapon Fighting (add ability mod to off-hand damage)
- [ ] **T10.5.3** — Paladin options: Defense, Dueling, Great Weapon Fighting, Protection
- [ ] **T10.5.4** — Ranger options: Archery, Defense, Dueling, Two-Weapon Fighting
- [ ] **T10.5.5** — Show a recommendation tip based on the character's ability scores (if already assigned): "With your high Dexterity, Archery or Two-Weapon Fighting would complement your build."

### Story 10.6 — Class Step Validation & State

> As a developer, I need the Class Step to persist all class selections and validate completeness.

**Tasks:**

- [ ] **T10.6.1** — Implement `validateClassStep()`: class must be selected; skill proficiencies must meet the required count; if level-1 subclass is required, it must be selected; if fighting style applies, it must be selected
- [ ] **T10.6.2** — Persist `ClassSelection` to wizard store: classId, subclassId (if applicable), chosenSkills, chosenFightingStyle (if applicable), level=1
- [ ] **T10.6.3** — Display class in progress sidebar: "Level 1 [Class Name]" or "Level 1 [Subclass] [Class]" if subclass is chosen
- [ ] **T10.6.4** — When changing class after previously selecting one, show a cascade warning if the change affects downstream steps (e.g., spell selections become invalid if switching from Wizard to Fighter)

---

## Epic 11: Ability Score Step

**Goal:** Three distinct ability score generation methods — Standard Array (drag-and-drop), Point Buy (interactive sliders), and Rolling (animated dice) — each producing six ability scores that the player assigns to the six abilities, with racial bonuses clearly displayed.

### Story 11.1 — Method Selection

> As a player, I need to choose how I want to generate my ability scores, with clear explanations of each method.

**Tasks:**

- [ ] **T11.1.1** — Create `components/wizard/AbilityScoreStep.tsx` as the Step 3 container. Top section shows three method selection tabs/cards: Standard Array, Point Buy, and Rolling. Each has a brief description
- [ ] **T11.1.2** — Standard Array card: "Use the pre-set values [15, 14, 13, 12, 10, 8] and assign each to an ability. Balanced and predictable."
- [ ] **T11.1.3** — Point Buy card: "Customize each score from 8 to 15 using 27 points. Full control over your build."
- [ ] **T11.1.4** — Rolling card: "Roll 4d6, drop the lowest die, six times. The classic method — exciting but unpredictable!"
- [ ] **T11.1.5** — If the campaign has house rules restricting the method (from campaign data), only show the allowed method(s) and explain the restriction
- [ ] **T11.1.6** — Switching methods resets any in-progress assignments with a confirmation dialog

### Story 11.2 — Standard Array Assignment

> As a player using Standard Array, I need a drag-and-drop interface to assign each of the six values to an ability.

**Tasks:**

- [ ] **T11.2.1** — Create `components/wizard/ability/StandardArrayAssigner.tsx` — displays the six unassigned values [15, 14, 13, 12, 10, 8] as draggable chips at the top, and six ability score slots below (STR, DEX, CON, INT, WIS, CHA)
- [ ] **T11.2.2** — Implement drag-and-drop using `@dnd-kit/core` and `@dnd-kit/sortable`: each value chip is draggable; each ability slot is a drop target. Dropping a value on a slot assigns it. If the slot already has a value, the values swap
- [ ] **T11.2.3** — Alternative assignment method (for accessibility and mobile): clicking an unassigned value highlights it, then clicking an ability slot assigns it. A "Reset" button clears all assignments
- [ ] **T11.2.4** — Show a "Suggested Assignment" button that auto-assigns values optimally based on the selected class's primary abilities (e.g., Wizard: highest to INT, second to DEX or CON)
- [ ] **T11.2.5** — Display the racial bonus next to each ability slot as a "+N" badge (e.g., Elf gets +2 DEX). Show the final total (base + racial) and the resulting modifier
- [ ] **T11.2.6** — All six values must be assigned before proceeding. Show a completion indicator ("4 of 6 assigned")

### Story 11.3 — Point Buy Interface

> As a player using Point Buy, I need an interactive interface to allocate 27 points across my six abilities with live cost tracking.

**Tasks:**

- [ ] **T11.3.1** — Create `components/wizard/ability/PointBuyAllocator.tsx` — displays all six abilities in a column, each with a current score value, increment (+) and decrement (−) buttons, the ability modifier, and the racial bonus preview
- [ ] **T11.3.2** — Implement point cost tracking: display "Points Remaining: N / 27" prominently at the top. As the user adjusts scores, the counter updates in real-time. Color-code: green when points remain, gold at exactly 0, red if negative (should not be reachable)
- [ ] **T11.3.3** — Enforce guardrails: minimum score 8 (decrement button disabled at 8), maximum score 15 (increment button disabled at 15), and insufficient points disables the increment button for scores that would exceed remaining points
- [ ] **T11.3.4** — Show the point cost for each score level next to the slider/counter. Use the cost table: 8=0, 9=1, 10=2, 11=3, 12=4, 13=5, 14=7, 15=9. Highlight the marginal cost of the next increment (e.g., "Going from 13 to 14 costs 2 points")
- [ ] **T11.3.5** — Show racial bonuses as a separate "+N" column with the final total and modifier clearly distinguished from the base (purchased) score
- [ ] **T11.3.6** — Add "Quick Presets" dropdown for common builds: "Balanced" (13, 13, 13, 12, 12, 12 — 27 pts), "Min-Max Caster" (8, 14, 14, 15, 8, 8 — 27 pts customized to class), "MAD Build" (15, 14, 13, 10, 10, 8 — balanced for multi-ability classes)
- [ ] **T11.3.7** — Validate: all 27 points must be spent (or allow saving with fewer points spent and a warning)

### Story 11.4 — Dice Rolling Interface

> As a player using the Rolling method, I need to roll 4d6-drop-lowest six times with animated dice and assign the results to abilities.

**Tasks:**

- [ ] **T11.4.1** — Create `components/wizard/ability/DiceRollingInterface.tsx` — a two-phase interface: Phase 1 is rolling six sets of 4d6, Phase 2 is assigning the six totals to abilities (reusing the drag-and-drop assigner from Standard Array)
- [ ] **T11.4.2** — Phase 1: display 6 roll slots. Each slot shows either "Not Rolled" or the result. A "Roll" button triggers an animated dice roll for the current slot using the dice engine. Show the 4 individual die values with the lowest visually crossed out/dimmed, and the total of the kept 3
- [ ] **T11.4.3** — Implement dice rolling animation: use CSS 3D transforms for a realistic tumbling effect on four d6 dice. After the animation (1-2 seconds), reveal the values. Include optional sound effects (dice clatter) controlled by user preferences
- [ ] **T11.4.4** — Add a "Roll All" button that auto-rolls all 6 sets in sequence with a slight delay between each for dramatic effect
- [ ] **T11.4.5** — Add a "Reroll All" button that re-rolls all 6 sets (with a confirmation dialog: "Are you sure? Your current rolls will be lost.")
- [ ] **T11.4.6** — Optional house rule toggle: "Reroll if total is below X" — if enabled and the total of all 6 scores is below a threshold (commonly 70), automatically offer a reroll
- [ ] **T11.4.7** — Once all 6 sets are rolled, Phase 2 activates: display the 6 totals as assignable values using the same drag-and-drop/click-to-assign interface as Standard Array. Show racial bonuses and modifiers
- [ ] **T11.4.8** — Preserve the raw roll data (individual die values per set) in the wizard store for display on the character sheet

### Story 11.5 — Ability Score Summary & Recommendations

> As a player, I need to see a clear summary of my final ability scores with modifiers and understand how they affect my character.

**Tasks:**

- [ ] **T11.5.1** — Create `components/wizard/ability/AbilityScoreSummary.tsx` — rendered below the method-specific interface. Shows a 6-column table: Ability Name | Base Score | Racial Bonus | Total | Modifier. The modifier is highlighted in a large, prominent font (e.g., "+3" in accent-gold)
- [ ] **T11.5.2** — Show a "What This Means" helper panel: for each ability with a notably high (15+) or low (8-9) score, display a brief gameplay implication (e.g., "With 15 DEX (+2): You'll be agile in combat with good AC and initiative" or "With 8 STR (-1): You'll struggle with Athletics and carrying heavy gear")
- [ ] **T11.5.3** — If the selected class has a primary ability, highlight it with a recommendation: "As a Wizard, Intelligence is your most important ability." Show a warning if the primary ability score is below 13
- [ ] **T11.5.4** — Display derived combat stats preview: estimated AC (based on likely armor from class), estimated HP (hit die max + CON mod), initiative modifier — giving the player a peek at how their scores translate to gameplay

### Story 11.6 — Ability Score Step Validation & State

> As a developer, I need all ability score data persisted and validated.

**Tasks:**

- [ ] **T11.6.1** — Implement `validateAbilityScoreStep()`: all 6 abilities must have assigned values; if point buy, exactly 27 points must be spent; if standard array, values must be a valid permutation; if rolling, all 6 rolls must be completed and assigned
- [ ] **T11.6.2** — Persist to wizard store: abilityScores (base values), abilityScoreMethod, racialBonuses (from race selection), rolledScores (raw die data if rolling method)
- [ ] **T11.6.3** — Display summary in progress sidebar: show the six modifier values as compact badges (e.g., "STR +1 | DEX +3 | CON +2 | INT +4 | WIS +0 | CHA -1")

---

## Epic 12: Background & Personality Step

**Goal:** A combined step for selecting a background (with proficiencies and equipment), defining personality characteristics, entering physical description details, choosing alignment, and optionally writing a backstory.

### Story 12.1 — Background Selection

> As a player, I need to choose a background that gives my character a history and additional proficiencies.

**Tasks:**

- [ ] **T12.1.1** — Create `components/wizard/BackgroundStep.tsx` as the Step 4 container. Layout: background selector on the left/top, personality and description on the right/bottom
- [ ] **T12.1.2** — Create `components/wizard/background/BackgroundSelector.tsx` — list or card grid of all available backgrounds. Each card shows: name, skill proficiencies granted, tool proficiencies, languages, and a brief one-sentence description
- [ ] **T12.1.3** — On selecting a background, expand to show: full description, feature name and description, granted equipment list, and personality characteristic tables (traits, ideals, bonds, flaws)
- [ ] **T12.1.4** — Implement skill overlap detection: if the selected background grants a skill the character already has from class or race, highlight the conflict in red and show a replacement picker ("You already have Perception from your Elf race. Choose a replacement skill from any skill list.")
- [ ] **T12.1.5** — If the background offers language choices, show the language picker (reuse from Race Step) with already-known languages pre-excluded
- [ ] **T12.1.6** — If the background offers tool proficiency choices (e.g., Guild Artisan: one type of artisan's tools), show a dropdown selector

### Story 12.2 — Personality Characteristics

> As a player, I need to define my character's personality traits, ideals, bonds, and flaws — either by selecting from tables or writing custom ones.

**Tasks:**

- [ ] **T12.2.1** — Create `components/wizard/background/PersonalityEditor.tsx` — four sections: Personality Traits (choose or write 2), Ideal (choose or write 1), Bond (choose or write 1), Flaw (choose or write 1)
- [ ] **T12.2.2** — Each section shows the background's characteristic table as selectable options. For personality traits (d8 table), the player selects 2 items. For ideals (d6 table with alignment tags), the player selects 1. For bonds and flaws (d6 tables), the player selects 1 each
- [ ] **T12.2.3** — Add a "Roll Randomly" button for each section that uses the dice engine to randomly select from the table (roll d8 or d6 as appropriate). Animate the roll result
- [ ] **T12.2.4** — Add a "Write Custom" toggle for each section that replaces the table with a text input field. The player can mix selected and custom entries (e.g., select one trait from the table, write the second one custom)
- [ ] **T12.2.5** — For ideals, show the alignment tag next to each option (e.g., "Charity. I always help those in need. (Good)") to help the player pick one consistent with their planned alignment
- [ ] **T12.2.6** — Add a "Randomize All" button that rolls all four sections at once for players who want quick personality generation

### Story 12.3 — Character Description & Identity

> As a player, I need to enter my character's name, physical appearance, and alignment.

**Tasks:**

- [ ] **T12.3.1** — Create `components/wizard/background/CharacterDescription.tsx` — a form section for personal details
- [ ] **T12.3.2** — "Character Name" field: prominent text input. If the player already entered a name in the Intro Step, pre-populate it. Add a "Random Name" button that generates a race-appropriate name (use simple name tables per race)
- [ ] **T12.3.3** — "Alignment" selector: a 3×3 clickable grid (Lawful/Neutral/Chaotic × Good/Neutral/Evil). Clicking a cell selects it with a highlight. Each cell shows a tooltip with a brief description of what that alignment means. Include an "Unaligned" option below the grid
- [ ] **T12.3.4** — Physical appearance fields: Age, Height, Weight, Eye Color, Hair Color, Skin Color — as text inputs (freeform, not enforced). Show race-typical ranges as placeholder text (e.g., Elf age placeholder: "100-750 years")
- [ ] **T12.3.5** — "Appearance Notes" textarea: freeform description of distinguishing features, clothing, scars, etc.
- [ ] **T12.3.6** — "Backstory" textarea: large text area for the character's backstory narrative. Include a helper prompt: "Where did your character grow up? What event set them on the path of adventure? What do they hope to achieve?"
- [ ] **T12.3.7** — "Allies & Organizations" textarea: freeform field for faction memberships, mentors, allies
- [ ] **T12.3.8** — All description fields are optional for wizard validation (can be filled in later in edit mode)

### Story 12.4 — Background Step Validation & State

> As a developer, I need background selections and personality data persisted and validated.

**Tasks:**

- [ ] **T12.4.1** — Implement `validateBackgroundStep()`: background must be selected; if skill overlap exists, replacement must be chosen; personality traits should have at least 1 entry (warning, not error); character name should be entered (warning, not error)
- [ ] **T12.4.2** — Persist to wizard store: backgroundId, chosenSkills (including replacements), chosenLanguages, chosenTools, personalityTraits, ideals, bonds, flaws, characterName, alignment, all description fields
- [ ] **T12.4.3** — Display in progress sidebar: background name, character name (if entered)

---

## Epic 13: Equipment Selection Step

**Goal:** A two-mode equipment selection experience — choosing from class/background starting equipment packages, or rolling gold and buying gear from the equipment catalog — that properly populates the character's inventory, weapons, and armor.

### Story 13.1 — Starting Equipment Packages

> As a player, I need to make the starting equipment choices offered by my class, with clear descriptions of what each option includes.

**Tasks:**

- [ ] **T13.1.1** — Create `components/wizard/EquipmentStep.tsx` as the Step 5 container. Top section has a toggle: "Choose Starting Equipment" (default) vs. "Roll for Gold and Buy"
- [ ] **T13.1.2** — Create `components/wizard/equipment/StartingEquipmentSelector.tsx` — renders the class's starting equipment choice groups. Each choice group is displayed as a labeled section ("Choose one:") with radio-button options
- [ ] **T13.1.3** — For choices involving generic items (e.g., "a martial weapon"), render a nested item picker that opens the weapon/gear catalog filtered to the relevant category. The player must drill down to select a specific item (e.g., choose "Longsword" from martial weapons)
- [ ] **T13.1.4** — Create `components/wizard/equipment/WeaponPicker.tsx` — a searchable, filterable list/grid of weapons from the SRD data. Each weapon shows: name, damage dice + type, properties (finesse, versatile, etc.), weight, and cost. Sort by name, damage, or weight. Filter by category (simple/martial, melee/ranged)
- [ ] **T13.1.5** — Create `components/wizard/equipment/ArmorPicker.tsx` — similar to weapon picker but for armor. Shows: name, category (light/medium/heavy), base AC, DEX cap, stealth penalty, weight, and STR requirement. Include a "Your AC with this armor" computed column based on the player's DEX
- [ ] **T13.1.6** — Display background starting equipment as a separate read-only section below class equipment: "From your [Background] background, you receive: [item list]"
- [ ] **T13.1.7** — Show a running "Inventory Summary" panel on the right (desktop) or bottom (mobile): lists all selected equipment with total weight, currently computed AC (based on armor + shield selections), and primary weapon damage

### Story 13.2 — Gold Buy Mode

> As a player who prefers to buy equipment with gold, I need to roll starting gold and shop from the full equipment catalog.

**Tasks:**

- [ ] **T13.2.1** — Create `components/wizard/equipment/GoldBuyMode.tsx` — when toggled, replaces the starting equipment chooser with a two-panel layout: equipment catalog on the left, shopping cart on the right
- [ ] **T13.2.2** — Display the class's starting gold dice formula (e.g., "Fighter: 5d4 × 10 gp") with a "Roll Gold" button. Animate the dice roll and display the result prominently. Allow manual entry as an alternative (for DMs who set fixed starting gold)
- [ ] **T13.2.3** — Equipment catalog: tabbed interface with categories (Weapons, Armor & Shields, Adventuring Gear, Tools, Equipment Packs). Each tab shows a searchable, sortable table of items with name, cost, weight, and key properties
- [ ] **T13.2.4** — Shopping cart: list of selected items with quantity adjusters (+/−), individual and running total cost in GP, total weight, and a "Remove" button per item. Show "Remaining Gold: X GP" at the top, color-coded (green if positive, red if negative)
- [ ] **T13.2.5** — Implement equipment pack expansion: clicking a pack (e.g., "Dungeoneer's Pack — 12 GP") shows its contents and adds all items individually to the cart
- [ ] **T13.2.6** — Prevent exceeding available gold (disable "Add" buttons or show warning when insufficient funds)
- [ ] **T13.2.7** — Add quick-buy shortcuts for essential items: "Essentials Kit" button that adds the most common adventuring gear (backpack, bedroll, rations, rope, torch, waterskin) to the cart

### Story 13.3 — Equipment Step Validation & State

> As a developer, I need equipment selections persisted and validated with inventory weight calculated.

**Tasks:**

- [ ] **T13.3.1** — Implement `validateEquipmentStep()`: in starting equipment mode, all choice groups must have a selection (including drill-down for generic items); in gold buy mode, total cost must not exceed rolled gold
- [ ] **T13.3.2** — Persist to wizard store: all selected equipment items (resolved to specific item IDs with quantities), selected armor, selected weapons, remaining currency, equipment selection mode used
- [ ] **T13.3.3** — Compute and display total inventory weight vs. carrying capacity (STR × 15). Show encumbrance warning if applicable
- [ ] **T13.3.4** — Determine equipped armor and shield for AC calculation in the Review Step

---

## Epic 14: Spellcasting Step (Conditional)

**Goal:** A spell selection interface shown only for classes that have spellcasting at level 1 (Bard, Cleric, Druid, Sorcerer, Warlock, Wizard). Supports cantrip selection, known/prepared spell selection, and provides a rich spell browsing experience with full details.

### Story 14.1 — Spell Step Conditional Rendering

> As a developer, I need the Spell Step to only appear when the character's class has spellcasting at level 1.

**Tasks:**

- [ ] **T14.1.1** — In the wizard step registry, implement conditional logic: check if the selected class has `spellcasting.type !== 'none'` AND the class gets spells at level 1 (Paladin and Ranger do NOT at level 1). If no spells, skip this step entirely and advance to Review
- [ ] **T14.1.2** — Update the wizard progress bar to show the Spellcasting step as "N/A — No spells at level 1" for non-casters (dimmed, not clickable)
- [ ] **T14.1.3** — For Sorcerer (Draconic Bloodline), display a note about the ancestry-specific spell if applicable

### Story 14.2 — Cantrip Selection

> As a spellcasting player, I need to choose my cantrips (at-will spells) from my class's cantrip list.

**Tasks:**

- [ ] **T14.2.1** — Create `components/wizard/SpellStep.tsx` as the Step 6 container. Top section shows spellcasting summary: "As a level 1 [Class], you can choose [N] cantrips and [M] level 1 spells. Your spellcasting ability is [Ability]."
- [ ] **T14.2.2** — Create `components/wizard/spells/CantripSelector.tsx` — displays all cantrips available to the class as a selectable card grid. Shows the count required: "Select N cantrips" with a live counter
- [ ] **T14.2.3** — If the character already has a racial cantrip (e.g., Tiefling: Thaumaturgy, High Elf: chosen wizard cantrip), display it as pre-selected and locked with a "From Race" label. It does NOT count against the class cantrip count
- [ ] **T14.2.4** — Implement cantrip card component: shows spell name, school of magic icon, casting time, range, and a 1-2 sentence description preview. Full details on click/expand

### Story 14.3 — Level 1 Spell Selection

> As a spellcasting player, I need to select my known or prepared spells from my class's level 1 spell list.

**Tasks:**

- [ ] **T14.3.1** — Create `components/wizard/spells/SpellSelector.tsx` — a browsable, searchable, filterable spell list for level 1 spells available to the class. Layout: spell list on the left, detail pane on the right
- [ ] **T14.3.2** — For **known casters** (Bard, Sorcerer, Warlock): display "Choose N spells to learn" and enforce the exact count. These spells are permanent choices until level-up
- [ ] **T14.3.3** — For **prepared casters** (Cleric, Druid): display the full level 1 spell list as a read-only reference, explain that they can prepare [Ability mod + 1] spells each day, and let them select their initial prepared list. Note: "You can change your prepared spells after each long rest"
- [ ] **T14.3.4** — For **Wizard**: explain the spellbook mechanic — "You start with 6 level 1 spells in your spellbook. Choose 6 spells." Then separately, "You can prepare [INT mod + 1] of these spells each day. Select your initial prepared list."
- [ ] **T14.3.5** — Display the computed "Spells Prepared" count based on ability modifier + class level (minimum 1). Show: "[Ability] modifier ([N]) + Level (1) = [M] prepared spells"
- [ ] **T14.3.6** — Handle Warlock's Pact Magic differently: explain that Warlock spell slots recharge on short rest (not long rest), and that they have only 1 slot at level 1 which is always cast at its highest available level

### Story 14.4 — Spell Detail Cards & Browser

> As a player browsing spells, I need to see full details — casting time, range, components, duration, description, and effects — so I can make informed choices.

**Tasks:**

- [ ] **T14.4.1** — Create `components/wizard/spells/SpellDetailCard.tsx` — a comprehensive spell information display. Structured layout:
  - Header: spell name, level badge, school of magic with icon
  - Properties row: casting time, range, duration, concentration badge (if applicable), ritual badge (if applicable)
  - Components row: V/S/M icons with material description if applicable
  - Description: full spell text
  - "At Higher Levels" section (if applicable)
  - Damage/healing info (if applicable): dice, damage type, save type
  - Classes: list of classes that can use this spell
- [ ] **T14.4.2** — Create `components/wizard/spells/SpellFilterBar.tsx` — filter controls: search by name (text input), filter by school of magic (multi-select), filter by casting time, toggle "Ritual only", toggle "Concentration only", sort by name/level/school
- [ ] **T14.4.3** — Implement spell list virtualization for performance: use windowed rendering to handle 100+ spells without lag. Only render the visible spell cards in the scroll viewport
- [ ] **T14.4.4** — Add "Recommended Spells" section at the top of the list highlighting commonly-chosen spells for the class at level 1 (e.g., Wizard: Shield, Magic Missile, Mage Armor, Find Familiar, Detect Magic)
- [ ] **T14.4.5** — Add a "Compare" feature: allow the player to pin up to 3 spells side-by-side for easy comparison before making their final selection

### Story 14.5 — Spell Step Validation & State

> As a developer, I need spell selections validated and persisted.

**Tasks:**

- [ ] **T14.5.1** — Implement `validateSpellStep()`: correct number of cantrips selected for the class; correct number of known spells (known casters) or spellbook spells (Wizard) selected; prepared spell count within limit; no duplicate selections; all selected spells must be valid for the class's spell list
- [ ] **T14.5.2** — Persist to wizard store: selectedCantrips (spell IDs), selectedSpells (spell IDs — known or spellbook), preparedSpells (spell IDs — initial prepared list), racial cantrips (tracked separately)
- [ ] **T14.5.3** — Display in progress sidebar: "N cantrips, M spells selected" with spell count

---

## Epic 15: Review & Finalize Step

**Goal:** A comprehensive review screen that shows the complete character sheet with all computed values, highlights any validation issues, and enables the player to save the character to the database.

### Story 15.1 — Character Sheet Preview

> As a player, I need to see a full preview of my finished character with all derived stats computed before I save.

**Tasks:**

- [ ] **T15.1.1** — Create `components/wizard/ReviewStep.tsx` as the Step 7 container. Uses the calculation engine to compute ALL derived stats from the wizard state
- [ ] **T15.1.2** — Create `components/wizard/review/CharacterPreview.tsx` — renders a read-only character sheet matching the 3-page layout described in the spec. This is a preview of what the saved character will look like
- [ ] **T15.1.3** — **Page 1 Preview (Core Stats):**
  - Top banner: character name, "Level 1 [Class]", background, player name, race, alignment, XP (0)
  - Left column: all 6 ability scores with modifiers, saving throws (with proficiency dots), all 18 skills (with proficiency dots and modifiers), passive Perception
  - Center column: AC, initiative, speed, HP max, hit dice, death saves (empty), attacks section (showing equipped weapons with computed attack bonus and damage), spellcasting summary (if applicable)
  - Right column: personality traits, ideals, bonds, flaws, features & traits list (racial + class + background)
- [ ] **T15.1.4** — **Page 2 Preview (Backstory & Details):**
  - Character appearance fields (age, height, weight, eyes, skin, hair)
  - Backstory text
  - Allies & organizations
  - Equipment/inventory with weight totals
  - Treasure/currency
- [ ] **T15.1.5** — **Page 3 Preview (Spellcasting — if applicable):**
  - Spellcasting class, ability, spell save DC, spell attack bonus
  - Cantrips listed
  - Level 1 spell slots (count)
  - Known/prepared spells listed with school and brief description
- [ ] **T15.1.6** — Use the dark fantasy styling (parchment textures, Cinzel headings) for the preview to match the app's theme

### Story 15.2 — Validation Summary

> As a player, I need to see if anything is missing or incorrect so I can go back and fix it before saving.

**Tasks:**

- [ ] **T15.2.1** — Run the full `validateCharacter()` function from the calculation engine against the assembled character data
- [ ] **T15.2.2** — Display validation results at the top of the Review Step as a collapsible section:
  - **Errors** (red, must fix): missing required fields, invalid ability score totals, incorrect proficiency counts
  - **Warnings** (yellow, informational): missing backstory, no character name, low primary ability score, empty personality fields
  - **Info** (blue, helpful): "Your character is ready to save!", "Tip: You can always edit these details later"
- [ ] **T15.2.3** — Each validation message includes a "Fix" link/button that navigates back to the relevant wizard step
- [ ] **T15.2.4** — If there are no errors (warnings are acceptable), enable the "Save Character" button. If there are errors, disable it with a tooltip: "Fix N errors before saving"

### Story 15.3 — Save & Character Assembly

> As a player, I need to save my completed character and be taken to the character sheet view.

**Tasks:**

- [ ] **T15.3.1** — Implement the "Save Character" action: calls the wizard store's `finalize()` method which assembles a complete `Character` object from all wizard state, runs the calculation engine to compute all derived stats, and calls `createCharacter()` from the database layer
- [ ] **T15.3.2** — Show a saving animation/progress indicator while the character is being written to IndexedDB
- [ ] **T15.3.3** — On successful save: clear the wizard store (reset session), show a success celebration (confetti animation or themed "Your adventurer is ready!" splash), and navigate to the character sheet view (`/character/:id`)
- [ ] **T15.3.4** — Implement "Save & Create Another" button that saves the character and returns to the wizard Intro Step with a fresh state
- [ ] **T15.3.5** — Implement "Go Back & Edit" button that keeps the review open for further changes without saving yet
- [ ] **T15.3.6** — Handle save errors gracefully: if IndexedDB write fails, show an error message with a retry option and suggest exporting as JSON as a backup

### Story 15.4 — Quick Edit from Review

> As a player reviewing my character, I need to make last-minute tweaks without navigating all the way back through the wizard.

**Tasks:**

- [ ] **T15.4.1** — Add inline edit icons on each section of the character preview. Clicking the edit icon on the ability score section opens a modal with the ability score interface. Clicking edit on equipment opens the equipment modal, etc.
- [ ] **T15.4.2** — Create `components/wizard/review/QuickEditModal.tsx` — a modal wrapper that renders the appropriate step component in a dialog. On save within the modal, the preview immediately updates with recalculated stats
- [ ] **T15.4.3** — Character name should be directly editable in the review header (inline text edit on click)

---

## Epic 16: Shared Wizard Components & Utilities

**Goal:** Reusable components that multiple wizard steps share — search/filter bars, card grids, tooltip system, and data display patterns.

### Story 16.1 — Shared Selection Components

> As a developer, I need reusable components for common selection patterns across wizard steps.

**Tasks:**

- [ ] **T16.1.1** — Create `components/shared/SelectableCardGrid.tsx` — a generic responsive grid of selectable cards. Props: items array, selected item(s), onSelect callback, single vs. multi select mode, card render function. Used by race cards, class cards, background cards, spell cards
- [ ] **T16.1.2** — Create `components/shared/SearchFilterBar.tsx` — a generic search + filter bar. Props: search placeholder, filter definitions (dropdown, toggle, chip), onSearch callback, onFilter callback. Used across race, class, equipment, and spell steps
- [ ] **T16.1.3** — Create `components/shared/DetailSlidePanel.tsx` — a generic slide-in side panel (right on desktop, bottom sheet on mobile) with animated open/close. Props: isOpen, onClose, title, children. Used for race details, class details, spell details
- [ ] **T16.1.4** — Create `components/shared/CountSelector.tsx` — a "choose N from this list" component with checkboxes. Props: items, maxSelections, selectedItems, onSelectionChange, labels. Used for skill selection, language selection, spell selection
- [ ] **T16.1.5** — Create `components/shared/ChoiceGroup.tsx` — a radio-button group for "pick one of these options." Props: options (with labels and descriptions), selectedOption, onSelect. Used for equipment choices, fighting style, alignment

### Story 16.2 — Tooltip & Help System

> As a new player, I need tooltips and contextual help throughout the wizard so I can understand D&D game terms.

**Tasks:**

- [ ] **T16.2.1** — Create `components/shared/GameTermTooltip.tsx` — wraps any D&D game term (e.g., "Darkvision", "Proficiency", "Saving Throw", "Cantrip") with a hover/tap tooltip showing a brief plain-English definition. Uses a centralized game terms dictionary
- [ ] **T16.2.2** — Create `data/game-terms.ts` — a dictionary of ~50 common D&D terms with beginner-friendly definitions. Examples: "Proficiency Bonus: A bonus added to rolls for things your character is trained in", "Cantrip: A spell you can cast at will without using a spell slot", "Hit Die: A die rolled to determine hit points gained per level"
- [ ] **T16.2.3** — Create `components/shared/StepHelp.tsx` — a collapsible "Need Help?" panel at the top of each wizard step that provides step-specific guidance for new players. Different help text for each step
- [ ] **T16.2.4** — Implement a "First-Time Hints" system: on the first visit to each step, briefly highlight key interactive areas with a pulsing border and tooltip (like an onboarding tour). Dismiss after the first interaction. Store "seen" flags in user preferences

### Story 16.3 — Modifier & Stat Display Components

> As a developer, I need consistent visual components for displaying ability scores, modifiers, and other recurring stat patterns.

**Tasks:**

- [ ] **T16.3.1** — Create `components/shared/AbilityScoreDisplay.tsx` — the classic D&D ability score block: large modifier number on top (+3), smaller score below (16), ability abbreviation label (STR). Variant with racial bonus indicator
- [ ] **T16.3.2** — Create `components/shared/ProficiencyDot.tsx` — a small filled/empty circle indicating proficiency. Filled = proficient, double-filled = expertise, half-filled = half proficiency (Jack of All Trades)
- [ ] **T16.3.3** — Create `components/shared/DiceNotation.tsx` — renders dice notation (e.g., "2d6 + 3") with styled dice icons. Clicking the notation triggers a dice roll via the dice engine (wired to the dice store)
- [ ] **T16.3.4** — Create `components/shared/ModifierBadge.tsx` — displays a +N or -N modifier in a styled badge. Positive = green tint, zero = neutral, negative = red tint

---

## Phase 2 Completion Criteria

Before moving to Phase 3, ALL of the following must be true:

1. **Guided Wizard:** A player can complete all 7 steps of the guided wizard and save a valid level-1 character for every one of the 12 classes
2. **Freeform Mode:** A player can create a character using the freeform mode and save it
3. **All Races:** All 9 SRD races with all subraces and all conditional choices (Dragonborn ancestry, Half-Elf bonuses/skills, High Elf cantrip/language, Variant Human feat) work correctly
4. **All Classes:** All 12 SRD classes with correct skill counts, level-1 subclass selection (Cleric, Sorcerer, Warlock), and fighting style selection (Fighter, Paladin, Ranger) work correctly
5. **Ability Scores:** All 3 methods (Standard Array, Point Buy, Rolling) produce valid scores with racial bonuses correctly applied and modifiers correctly computed
6. **Backgrounds:** All SRD backgrounds are selectable with skill overlap detection and replacement working
7. **Equipment:** Both starting equipment packages and gold-buy mode work. AC computes correctly from armor selection
8. **Spellcasting:** Cantrip and spell selection works for all 6 level-1 casting classes with correct counts per spellcasting type (known, prepared, pact, spellbook)
9. **Review:** The character preview shows all 3 pages with correctly computed derived stats
10. **Persistence:** Wizard state survives browser refresh (sessionStorage). Saved characters appear in the character gallery (IndexedDB)
11. **Validation:** No character can be saved with validation errors. Warnings are non-blocking but clearly communicated
12. **Responsive:** The wizard is usable on mobile (640px), tablet (1024px), and desktop (1440px)
13. **Accessible:** All interactive elements are keyboard-navigable with visible focus indicators. ARIA labels on all form controls

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Epics | 9 (Epic 8–16) |
| Stories | 28 |
| Tasks | ~145 |
| New Components | ~40+ |
| Reusable Shared Components | ~10 |
| Wizard Steps | 8 (Intro + 7 creation steps) |
| Data Pickers Required | 8 (Race, Subrace, Class, Subclass, Skills, Equipment, Spells, Feats) |
| Conditional UI Branches | 6+ (spellcasting type, level-1 subclass, fighting style, Dragonborn ancestry, Variant Human feat, skill overlap) |

---

## Dependency Graph

```
Epic 8 (Wizard Framework)
  ├── Story 8.1 (Shell) — must be built first, all steps plug into this
  ├── Story 8.2 (Intro) — entry point
  └── Story 8.3 (Freeform) — parallel path, shares components with guided steps
       │
Epic 16 (Shared Components) — built alongside or just ahead of the steps
       │
       ├── Epic 9 (Race Step) — first guided step
       │    └── depends on: shared card grid, detail panel, search/filter, count selector
       │
       ├── Epic 10 (Class Step) — second guided step
       │    └── depends on: shared card grid, detail panel, skill chooser (from Race Step)
       │
       ├── Epic 11 (Ability Scores) — third guided step
       │    └── depends on: dice engine (Phase 1), @dnd-kit (drag-and-drop)
       │
       ├── Epic 12 (Background) — fourth guided step
       │    └── depends on: skill chooser, language picker (from Race Step)
       │
       ├── Epic 13 (Equipment) — fifth guided step
       │    └── depends on: equipment SRD data, AC calculation engine
       │
       ├── Epic 14 (Spellcasting) — sixth guided step (conditional)
       │    └── depends on: spell SRD data, spell slot calculations
       │
       └── Epic 15 (Review & Finalize) — final step
            └── depends on: ALL previous steps, calculation engine, database layer
```

**Parallelizable:** Once the wizard framework (Epic 8) and shared components (Epic 16) are in place, individual step Epics (9-14) can be worked in parallel by different developers. Epic 15 (Review) must be last as it integrates everything.

---

## Open Questions for Phase 2

1. **Avatar/Portrait Upload:** Should the wizard include a step or option for uploading or selecting a character portrait? The spec mentions avatars but doesn't detail the upload mechanism. Recommend: defer to Phase 3 (character management), show a placeholder silhouette based on race in Phase 2.

2. **Undo/Redo in Wizard:** Should individual steps support undo? The spec mentions "undo history" for the edit mode but not the wizard. Recommend: not for MVP wizard. Back navigation suffices.

3. **Dice Animation Fidelity:** How elaborate should the 4d6 rolling animation be? Options range from CSS 3D cubes (fast to build) to Three.js 3D physics (impressive but complex). Recommend: CSS 3D transforms for Phase 2, upgrade to Three.js in Phase 4 (Session Play Features).

4. **Spell Description Length:** Some SRD spell descriptions are very long (500+ words). Should the spell browser truncate with "read more" or show everything? Recommend: truncate to 2-3 lines in list view, show full text in detail panel.

5. **Random Name Generator Quality:** How sophisticated should race-appropriate name generation be? Options: simple random from a static list per race, or a more complex syllable-based generator. Recommend: static list of 20-30 names per race for Phase 2, improve later if users request it.
