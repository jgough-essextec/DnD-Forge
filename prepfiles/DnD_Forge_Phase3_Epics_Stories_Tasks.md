# D&D Character Forge — Phase 3: Character Sheet & Management

## Detailed Epics, Stories & Tasks

**Phase Duration:** Weeks 5–6  
**Phase Goal:** Deliver a full-fidelity, 3-page digital character sheet with both read-only view and inline edit modes, a character gallery home screen with search/filter/sort, and complete character lifecycle management (duplicate, archive, delete, import, export). By the end of Phase 3, a player can view, edit, manage, and share their characters as fully functional digital character sheets.

**Phase 2 Dependencies:** Phase 3 assumes all Phase 2 deliverables are complete — the creation wizard (guided + freeform), all wizard step components and data pickers, and the ability to save a valid level-1 character to IndexedDB. Phase 3 builds the "post-creation" experience: what happens after you hit "Save Character."

---

## Pre-Phase 3 Audit: Edge Cases & Gaps to Address

### Gap S1 — The Character Sheet Has More Fields Than the Wizard Produces

The wizard creates a level-1 character, but the character sheet must display fields that don't yet have values and won't until later gameplay:

| Field | Initial State at Level 1 | User Expectation |
|-------|--------------------------|-----------------|
| Current HP | Equal to Max HP | Must be editable immediately (damage tracking) |
| Temp HP | 0 | Editable — some class features grant temp HP |
| Death Saves | 0 successes / 0 failures | Display as empty circles, fill during gameplay |
| Hit Dice Used | 0 of total | Track usage for short rests (Phase 4) |
| Spell Slots Used | 0 of total | Track usage during sessions (Phase 4) |
| Conditions | None active | Display empty, populatable during play |
| XP | 0 | Editable for DMs awarding XP |
| Treasure | Empty | Freeform text or structured currency |
| Attunement | 0 of 3 | Show empty slots |
| Additional Features | May be empty | Space for homebrew or multiclass features |

The character sheet view must gracefully handle empty states for all of these — showing placeholder text, empty slot indicators, or collapsed sections rather than blank voids.

### Gap S2 — Edit Mode Must Handle Cascading Recalculations

When a player edits a core value in edit mode (e.g., changes a base ability score), dozens of derived values must update instantly:

**Changing STR from 14 to 16 affects:**
- STR modifier (+2 → +3)
- STR saving throw modifier
- Athletics skill modifier
- All STR-based attack bonuses (melee weapons)
- All STR-based damage rolls
- Carrying capacity (14×15=210 → 16×15=240)
- Encumbrance thresholds

**Changing CON from 12 to 14 affects:**
- CON modifier (+1 → +2)
- CON saving throw modifier
- Max HP (recalculate for every level: +1 HP per level)
- Concentration save modifier

**Changing equipped armor affects:**
- Armor Class (entirely different formula)
- Stealth disadvantage flag
- Speed (heavy armor without STR requirement)

The edit mode must run the full calculation engine on every relevant change with debounced reactivity — not on every keystroke, but on field blur or after a 300ms pause.

### Gap S3 — The Official 5e Sheet Layout Has Specific Spatial Conventions

The standard D&D 5e character sheet has a very specific layout that players are trained to expect. Deviating significantly will cause confusion. The digital version should respect these conventions while adapting for interactivity:

**Page 1 Layout Zones:**
- Top banner: 40% name, 60% identity fields (class/level, background, player name, race, alignment, XP) — arranged in a specific 2×3 grid
- Left column (~30%): 6 ability score blocks (each a large modifier + small score circle), saving throws list (6 items with proficiency dots), skills list (18 items with proficiency dots), passive Perception
- Center column (~35%): AC/Initiative/Speed row, HP block (max, current, temp), hit dice + death saves, attacks & spellcasting (3 weapon rows + notes area)
- Right column (~35%): Personality traits, ideals, bonds, flaws, features & traits

**Page 2 Layout Zones:**
- Top banner: character name (duplicate), appearance fields in a row (age, height, weight, eyes, skin, hair)
- Left narrow column (~35%): character appearance image/description, allies & organizations
- Right wide column (~65%): character backstory, additional features & traits, treasure
- Bottom: Equipment list with weight, currency section (CP, SP, EP, GP, PP)

**Page 3 Layout Zones (Spellcasting):**
- Top row: spellcasting class, spellcasting ability, spell save DC, spell attack bonus
- Body: 10 spell level sections (cantrips + levels 1-9), each with slots total, slots expended, and spell list with checkboxes for prepared spells

### Gap S4 — Gallery Card Must Convey Identity at a Glance

The character gallery is the app's home screen. Each card must communicate enough information that a player with 5-10 characters can instantly find the one they need. Research shows players identify characters by a combination of name, race, class, and level — in that priority order. Visual differentiation (avatar color, class icon) is critical when names are similar.

### Gap S5 — JSON Import Requires Robust Validation and Migration

When importing a character from JSON, the app must handle:
- **Malformed JSON:** Syntax errors → clear error message
- **Wrong schema:** Valid JSON but not a Character object → schema validation with specific field-level errors
- **Version mismatch:** Character from a newer or older app version → migration strategy (transform old fields to new schema)
- **Duplicate IDs:** Imported character has the same ID as an existing one → generate new ID
- **Invalid data references:** Equipment or spell IDs that don't exist in the SRD data → flag but allow import with warnings
- **Oversized data:** Backstory or notes fields with excessive content → import with size warning

### Gap S6 — Edit Mode vs. View Mode Are Two Distinct UX Paradigms

View mode should feel like reading a beautifully rendered character sheet — clean typography, no visible form controls, optimal information density. Edit mode should feel like a smart form — every value becomes interactive, inline validation appears, and the calculation engine runs visibly. The transition between modes must be seamless, maintaining scroll position and not jarring the user with a full re-render.

### Gap S7 — Attacks Section Is Computed, Not Just Stored

The "Attacks & Spellcasting" section on Page 1 is one of the most complex display areas. Each weapon in the character's equipment generates an attack row with:

| Column | Computation |
|--------|-------------|
| Name | Weapon name from equipment |
| Attack Bonus | Proficiency bonus + STR mod (melee) or DEX mod (ranged). Finesse weapons: higher of STR/DEX. Monk weapons: use DEX if higher |
| Damage | Weapon damage dice + STR mod (melee) or DEX mod (ranged). Two-handed versatile weapons show both dice |
| Type | Slashing/Piercing/Bludgeoning from weapon data |
| Properties | Range, thrown, finesse, etc. as compact badges |

Spellcasters also use this section for cantrip attacks (e.g., Fire Bolt: spell attack bonus, 1d10 fire damage).

### Gap S8 — Avatar/Portrait System

The spec mentions avatar/portrait on character cards but doesn't detail the upload mechanism. For Phase 3:
- Support image upload (JPEG/PNG, max 2MB) stored as base64 in IndexedDB
- Crop/resize to a standard aspect ratio (1:1 square or 3:4 portrait)
- Fallback: generate a default avatar based on race (silhouette icon) with a class-themed color
- Display on gallery card, character sheet header, and (eventually) DM party view

---

## Epic 17: Character Sheet — Page 1 (Core Stats)

**Goal:** A pixel-accurate digital recreation of the D&D 5e character sheet Page 1, showing all identity information, ability scores, skills, saving throws, combat stats, attacks, personality, and features in a responsive layout that works from mobile to desktop.

### Story 17.1 — Page 1 Layout Shell & Top Banner

> As a player viewing my character, I need to see the top banner with my character's name, class, level, race, background, alignment, XP, and player name — exactly where I'd expect them on a standard D&D sheet.

**Tasks:**

- [ ] **T17.1.1** — Create `components/character/CharacterSheet.tsx` as the top-level character sheet controller. Accepts a `characterId` prop, loads the full character from IndexedDB via the `useCharacter` hook, runs the calculation engine to compute all derived values, and manages the view/edit mode toggle. Renders three tab panels: "Core Stats", "Backstory & Details", and "Spellcasting"
- [ ] **T17.1.2** — Create `components/character/page1/SheetBanner.tsx` — the top banner. **View mode:** character name in large Cinzel font (left-aligned, ~40% width), identity grid on the right (~60% width) with fields in a 2-row × 3-column layout: [Class & Level | Background | Player Name] / [Race | Alignment | Experience Points]. Each field has a muted label above the value. **Edit mode:** each value becomes an editable input or dropdown
- [ ] **T17.1.3** — Class & Level display: show "Level N [Subclass] [Class]" (e.g., "Level 1 Champion Fighter"). For multiclass (future), show each class/level. In edit mode, this opens the class/subclass/level editors
- [ ] **T17.1.4** — XP display: show current XP and next-level threshold in parentheses (e.g., "300 / 900"). In edit mode, XP is a numeric input. Show an XP progress bar subtly below the number
- [ ] **T17.1.5** — Add a character avatar/portrait thumbnail to the far left of the banner (circular, 64px). Clicking it in edit mode opens the avatar upload dialog. In view mode, it serves as visual identification

### Story 17.2 — Ability Score Blocks (Left Column)

> As a player, I need to see my six ability scores with their modifiers in the classic vertical layout, with the modifier prominently displayed and the base score in a smaller circle.

**Tasks:**

- [ ] **T17.2.1** — Create `components/character/page1/AbilityScoreColumn.tsx` — renders 6 ability score blocks vertically in the left column. Each block uses the `AbilityScoreDisplay` shared component (from Phase 2, Story 16.3)
- [ ] **T17.2.2** — Each ability block shows: ability abbreviation label (STR, DEX, etc.) at top, large modifier value in the center (e.g., "+3" in bold Cinzel, accent-gold for positive, accent-red for negative), base total score in a smaller circle below (e.g., "16"), and a subtle tooltip showing the breakdown: "Base 14 + Racial +2 = 16 (Modifier: +3)"
- [ ] **T17.2.3** — **Edit mode:** clicking an ability score opens an inline numeric editor for the base score (before racial bonuses). The modifier and total auto-recalculate in real-time. Show the racial bonus as a non-editable "+N" badge
- [ ] **T17.2.4** — Add a compact "Inspiration" toggle at the top of the left column — a single checkbox or diamond icon that toggles between filled (has inspiration) and empty. Tooltip explains: "Inspiration lets you reroll one ability check, saving throw, or attack roll"

### Story 17.3 — Saving Throws List

> As a player, I need to see all 6 saving throws with proficiency indicators and computed modifiers.

**Tasks:**

- [ ] **T17.3.1** — Create `components/character/page1/SavingThrowsList.tsx` — rendered below the ability score blocks. Lists all 6 saving throws as a compact vertical list: proficiency dot, modifier value, and ability name
- [ ] **T17.3.2** — Proficiency dot: filled circle if proficient (class-granted), empty circle if not. The modifier is: ability modifier + proficiency bonus (if proficient). Display the modifier as a signed number (e.g., "+5", "-1")
- [ ] **T17.3.3** — **Edit mode:** proficiency dots become toggleable checkboxes. Toggling proficiency immediately recalculates the modifier. Add a small "+ Custom" button for features that add bonuses to specific saves (e.g., Paladin's Aura of Protection adds CHA mod to all saves)
- [ ] **T17.3.4** — Tooltip on each saving throw shows the computation breakdown: "DEX Save: DEX Mod (+3) + Proficiency (+2) = +5"
- [ ] **T17.3.5** — In view mode, clicking a saving throw triggers a dice roll (hooks into the dice engine from Phase 1): roll 1d20 + modifier, display the result inline briefly

### Story 17.4 — Skills List

> As a player, I need to see all 18 skills with proficiency indicators, expertise markers, and computed modifiers, grouped or listed in the official order.

**Tasks:**

- [ ] **T17.4.1** — Create `components/character/page1/SkillsList.tsx` — renders all 18 skills in the official alphabetical order. Each row: proficiency indicator, skill modifier (signed), skill name, and governing ability abbreviation in muted text (e.g., "Stealth (DEX)")
- [ ] **T17.4.2** — Proficiency indicator states: empty circle = not proficient, filled circle = proficient, double circle (or filled with inner ring) = expertise. Modifier calculation: ability mod + proficiency bonus (if proficient) + double proficiency bonus (if expertise). Jack of All Trades (Bard feature): add half proficiency bonus to non-proficient skills — show as half-filled dot
- [ ] **T17.4.3** — **Edit mode:** proficiency dots cycle through three states on click: not proficient → proficient → expertise → not proficient. This recalculates the modifier immediately
- [ ] **T17.4.4** — In view mode, clicking a skill triggers a dice roll: roll 1d20 + modifier. Display the result inline with the skill name highlighted
- [ ] **T17.4.5** — Below the skills list, show "Passive Perception: N" (10 + Perception modifier). Also show Passive Insight and Passive Investigation as these are commonly referenced by DMs
- [ ] **T17.4.6** — **Edit mode:** add a "Custom Bonus" field next to each skill for situational modifiers (e.g., Observant feat adds +5 to passive Perception)

### Story 17.5 — Combat Stats Block (Center Column Top)

> As a player, I need to see my AC, initiative bonus, and speed prominently displayed at the top of the center column.

**Tasks:**

- [ ] **T17.5.1** — Create `components/character/page1/CombatStatsRow.tsx` — three prominent stat boxes in a horizontal row: AC (shield icon), Initiative (lightning bolt icon), Speed (boot/running icon). Each box has the numeric value in large bold text and the label below
- [ ] **T17.5.2** — **AC box:** display computed AC from the calculation engine. Tooltip shows breakdown (e.g., "Studded Leather (12) + DEX Mod (+3) = 15" or "Chain Mail (16) + Shield (+2) = 18"). **Edit mode:** AC can be manually overridden with a toggle "Use computed / Manual" — some class features (e.g., Barbarian Unarmored Defense, Monk Unarmored Defense) have unique AC formulas
- [ ] **T17.5.3** — **Initiative box:** display DEX modifier (+ any class/feat bonuses). Tooltip: "DEX Mod (+3)". **Edit mode:** allow custom initiative bonus for features like Bard's Jack of All Trades or the Alert feat (+5). Clicking in view mode rolls initiative (1d20 + modifier)
- [ ] **T17.5.4** — **Speed box:** display walking speed from race data. If the character has multiple movement types (rare at level 1 but possible), show primary speed with a dropdown for others (swim, fly, climb, burrow). **Edit mode:** speed is editable for armor penalties or magic effects
- [ ] **T17.5.5** — Apply class-specific AC formula logic: detect Barbarian (10 + DEX + CON), Monk (10 + DEX + WIS), and default armor-based calculations. Show which formula is active in the tooltip

### Story 17.6 — Hit Points Block

> As a player, I need to see and track my HP max, current HP, and temporary HP, with a clear visual indicator of my health status.

**Tasks:**

- [ ] **T17.6.1** — Create `components/character/page1/HitPointBlock.tsx` — the HP section below combat stats. Three HP fields: Max HP (computed, displayed at top), Current HP (large editable field in center), Temp HP (smaller field below)
- [ ] **T17.6.2** — Max HP: computed by the calculation engine (hit die max + CON mod at level 1, plus per-level additions). Tooltip shows breakdown. **Edit mode:** allow manual override for house rules or Tough feat adjustments
- [ ] **T17.6.3** — Current HP: always editable (even in view mode since HP changes constantly during play). Display as a large number with a color gradient: green (75-100%), yellow (25-74%), red (1-24%), black with skull icon (0). Include quick-adjust buttons: "−" (take damage) and "+" (heal) that open a numeric input modal
- [ ] **T17.6.4** — Temp HP: editable field. Temp HP don't stack (only the higher value applies) — enforce this with a tooltip note. Display as a separate number in a blue-tinted box. When temp HP is present, show it as a "shield" over the current HP
- [ ] **T17.6.5** — HP bar: a slim horizontal bar below the numbers showing current HP as a percentage of max. Color matches the gradient (green→yellow→red)
- [ ] **T17.6.6** — Quick damage/heal modal: when clicking the −/+ buttons, show a small popup with a numeric input and "Apply" button. Damage applies to temp HP first, then current HP (per 5e rules). Healing cannot exceed max HP. Log the change in a mini-history (last 5 changes visible)

### Story 17.7 — Hit Dice & Death Saves

> As a player, I need to see my total hit dice, track used dice, and record death saving throw successes/failures.

**Tasks:**

- [ ] **T17.7.1** — Create `components/character/page1/HitDiceBlock.tsx` — shows total hit dice (e.g., "1d10" for a level 1 Fighter) and tracks used hit dice. Display as "Used: 0 / Total: 1d10"
- [ ] **T17.7.2** — **Edit mode:** hit dice usage is adjustable with +/− buttons. For multiclass characters, show each class's hit dice separately (e.g., "1d10 (Fighter) + 1d8 (Rogue)")
- [ ] **T17.7.3** — Create `components/character/page1/DeathSaves.tsx` — three success circles and three failure circles in a row. Clicking a circle fills it in (toggling success/failure counts). Three successes = stabilized (show green checkmark). Three failures = dead (show red X with skull). A natural 20 = restore 1 HP (show tooltip). A natural 1 = two failures
- [ ] **T17.7.4** — Add a "Roll Death Save" button that rolls 1d20 and auto-fills the appropriate circle (≥10 = success, <10 = failure, 20 = critical success, 1 = critical failure marking 2 circles)
- [ ] **T17.7.5** — Reset death saves button (appears when any are marked): clears all circles back to empty

### Story 17.8 — Attacks & Spellcasting Section

> As a player, I need to see my equipped weapons with computed attack bonuses and damage, plus a summary of spellcasting attacks.

**Tasks:**

- [ ] **T17.8.1** — Create `components/character/page1/AttacksSection.tsx` — a table with columns: Attack Name, Attack Bonus, Damage/Type. Pre-populated from the character's equipped weapons
- [ ] **T17.8.2** — Auto-populate weapon attacks from equipped weapons: for each weapon in the character's equipment marked as equipped, generate a row with:
  - Name: weapon name
  - Attack Bonus: proficiency bonus + ability modifier (STR for melee, DEX for ranged, higher of STR/DEX for finesse)
  - Damage: weapon damage dice + ability modifier + damage type (e.g., "1d8 + 3 slashing")
- [ ] **T17.8.3** — Handle weapon properties in the display: versatile weapons show both damage values (e.g., "1d8/1d10 + 3"), thrown weapons show melee and ranged attack bonuses, ammunition weapons show range
- [ ] **T17.8.4** — For spellcasters, add a row for attack cantrips (e.g., "Fire Bolt: +5 to hit, 1d10 fire, range 120ft") below the weapon rows
- [ ] **T17.8.5** — **Edit mode:** allow adding/removing attack rows manually (for homebrew or special abilities). Each field is editable. Add an "Add Attack" button that opens a picker: choose from equipped weapons, known attack spells, or enter a custom attack
- [ ] **T17.8.6** — In view mode, clicking an attack row triggers a combined roll: attack roll (1d20 + attack bonus) and damage roll (damage dice + modifier). Display both results inline
- [ ] **T17.8.7** — Below the attack rows, include a freeform "Notes" area for spellcasting summary text (e.g., "Spell Save DC 15, Spell Attack +7") or special attack notes

### Story 17.9 — Personality & Features (Right Column)

> As a player, I need to see my personality traits, ideals, bonds, flaws, and features & traits in the right column.

**Tasks:**

- [ ] **T17.9.1** — Create `components/character/page1/PersonalityBlock.tsx` — four sections stacked vertically: Personality Traits (multi-line), Ideals (single), Bonds (single), Flaws (single). Each has a header label and text content. In view mode, text is rendered in a styled box with parchment background. **Edit mode:** text areas become editable
- [ ] **T17.9.2** — Create `components/character/page1/FeaturesTraits.tsx` — a scrollable list below the personality block showing all features and traits: racial traits, class features, background feature, and feats. Each feature shows its name in bold and description below
- [ ] **T17.9.3** — Group features by source with subtle labels: "Racial Traits", "Class Features", "Background Feature", "Feats". Collapsible groups for space management
- [ ] **T17.9.4** — **Edit mode:** features can be reordered (drag handle), individually deleted, or custom features can be added via an "Add Feature" button with name and description fields
- [ ] **T17.9.5** — Features with limited uses (e.g., "Second Wind — 1/short rest", "Rage — 2/long rest") display usage counters: filled/empty circles indicating uses remaining

### Story 17.10 — Proficiency Bonus Display

> As a player, I need my proficiency bonus prominently shown and accurately computed from my level.

**Tasks:**

- [ ] **T17.10.1** — Display the proficiency bonus in the left column between the Inspiration toggle and the saving throws list. Large "+N" in a circle badge. Computed from level: ceil(level/4)+1
- [ ] **T17.10.2** — Tooltip: "Proficiency Bonus: +N (Level N character). Added to attacks, saves, and skills you're proficient in."
- [ ] **T17.10.3** — **Edit mode:** not directly editable (always computed from level). If the user needs a custom value, they can use the manual override toggle which displays a warning

---

## Epic 18: Character Sheet — Page 2 (Backstory & Details)

**Goal:** The second page of the character sheet displaying character appearance, backstory narrative, allies & organizations, additional features, equipment/inventory with weight tracking, and currency.

### Story 18.1 — Appearance & Description Section

> As a player, I need to see my character's physical description fields and appearance notes.

**Tasks:**

- [ ] **T18.1.1** — Create `components/character/page2/BackstoryPage.tsx` as the Page 2 container. Two-column layout: narrow left column for appearance/allies, wide right column for backstory/features/treasure
- [ ] **T18.1.2** — Create `components/character/page2/AppearanceBanner.tsx` — top row showing character name (duplicate from Page 1) and physical detail fields in a horizontal strip: Age, Height, Weight, Eyes, Skin, Hair. Each is a compact field with label above
- [ ] **T18.1.3** — Create `components/character/page2/CharacterPortrait.tsx` — in the left column, a large portrait area (placeholder if no image uploaded). Shows the character avatar at a larger size (~200px). Below it, the "Appearance Notes" text area for freeform description of distinguishing features
- [ ] **T18.1.4** — **Edit mode:** all appearance fields become editable text inputs. The portrait area shows an "Upload Image" button overlaying the placeholder/image. Physical detail fields accept any text (not validated — players describe height as "5'10\"" or "tall")
- [ ] **T18.1.5** — Create `components/character/page2/AlliesOrgs.tsx` — below the portrait, a text block for allies & organizations. Shows faction logos or text descriptions. **Edit mode:** freeform textarea

### Story 18.2 — Backstory & Additional Features

> As a player, I need to see my character's backstory narrative and any additional features that overflow from Page 1.

**Tasks:**

- [ ] **T18.2.1** — Create `components/character/page2/BackstoryBlock.tsx` — a large text block in the right column for the character's backstory. In view mode, renders the text with proper paragraph formatting. Supports markdown-lite (bold, italic, headers) for structured backstories
- [ ] **T18.2.2** — **Edit mode:** backstory becomes a rich textarea with basic formatting toolbar (bold, italic, heading). Character count display. No hard limit but soft warning at 5,000 characters
- [ ] **T18.2.3** — Create `components/character/page2/AdditionalFeatures.tsx` — a secondary features section below backstory for overflow from Page 1's features list, multiclass features, homebrew abilities, or DM-granted boons. Same format as the Page 1 features section but with an "Additional" label
- [ ] **T18.2.4** — **Edit mode:** same edit controls as Page 1 features — add, remove, reorder, edit name and description

### Story 18.3 — Equipment & Inventory

> As a player, I need to see my full equipment list with quantities, weights, and the ability to add, remove, and equip/unequip items.

**Tasks:**

- [ ] **T18.3.1** — Create `components/character/page2/EquipmentList.tsx` — a scrollable table of all equipment items. Columns: Equipped (checkbox), Name, Quantity, Weight (per unit), Total Weight, Notes/Properties
- [ ] **T18.3.2** — Items from the starting equipment (wizard) are pre-populated. Each item shows its SRD properties on hover (e.g., weapon damage, armor AC, tool description)
- [ ] **T18.3.3** — "Equipped" checkbox column: toggling equip state for armor recalculates AC. Toggling equip for a weapon adds/removes it from the Attacks section on Page 1. Only one armor and one shield can be equipped at a time — enforce with a warning if the user tries to equip a second
- [ ] **T18.3.4** — **Edit mode:** add "Add Item" button at the bottom that opens a modal with two tabs: "From SRD" (searchable equipment catalog from Phase 2's equipment picker) and "Custom" (freeform name, weight, notes). "Remove" button on each row with confirmation
- [ ] **T18.3.5** — Quantity column: +/− buttons for consumables (arrows, rations, etc.). Adjusting quantity updates total weight
- [ ] **T18.3.6** — Footer row showing: Total Inventory Weight, Carrying Capacity (STR × 15), and an encumbrance indicator. If using variant encumbrance rules: weight > STR×5 = encumbered (−10 speed), > STR×10 = heavily encumbered (−20 speed + disadvantage). Color-code: green (normal), yellow (encumbered), red (over capacity)
- [ ] **T18.3.7** — **Attunement tracking:** items that require attunement show an attunement badge. A separate "Attuned Items" counter at the top shows "N / 3 attunement slots used." Toggling attunement on a 4th item shows an error: "You can only attune to 3 magic items at a time"

### Story 18.4 — Currency Section

> As a player, I need to track my currency across all five denominations with auto-conversion.

**Tasks:**

- [ ] **T18.4.1** — Create `components/character/page2/CurrencyTracker.tsx` — five currency fields arranged horizontally: CP, SP, EP, GP, PP. Each shows the denomination icon/abbreviation and current amount
- [ ] **T18.4.2** — Always editable (even in view mode since currency changes frequently). +/− buttons for quick adjustment. Direct numeric input for larger changes
- [ ] **T18.4.3** — "Auto-Convert" toggle: when enabled, converts currency up automatically (e.g., 10 SP → 1 GP). Show the conversion rates in a tooltip: "1 PP = 10 GP = 20 EP = 100 SP = 1000 CP"
- [ ] **T18.4.4** — Display total wealth in GP equivalent at the bottom: "Total: X.XX GP equivalent"

### Story 18.5 — Treasure Section

> As a player, I need a freeform section to track non-currency treasure — gems, art objects, magic items, quest items.

**Tasks:**

- [ ] **T18.5.1** — Create `components/character/page2/TreasureBlock.tsx` — a freeform text block for tracking miscellaneous treasure. **View mode:** rendered text. **Edit mode:** textarea with placeholder: "Gems, art objects, magic items, and other valuables"
- [ ] **T18.5.2** — Optionally support structured treasure entries: "Add Treasure Item" button that creates a named entry with optional value in GP and description

---

## Epic 19: Character Sheet — Page 3 (Spellcasting)

**Goal:** A comprehensive spellcasting page displayed only for spellcasting characters, showing the spellcasting header stats, spell slot tracking, and organized spell lists by level with prepared spell toggles.

### Story 19.1 — Spellcasting Header

> As a spellcaster, I need to see my spellcasting ability, spell save DC, and spell attack bonus at the top of the spell page.

**Tasks:**

- [ ] **T19.1.1** — Create `components/character/page3/SpellcastingPage.tsx` as the Page 3 container. Conditionally rendered: if the character has no spellcasting data, show a placeholder message ("This character doesn't have spellcasting abilities" with a note about when they might gain them, e.g., "Eldritch Knight at level 3")
- [ ] **T19.1.2** — Create `components/character/page3/SpellcastingHeader.tsx` — top row with four stat boxes: Spellcasting Class (e.g., "Wizard"), Spellcasting Ability (e.g., "Intelligence"), Spell Save DC (computed: 8 + proficiency + ability mod), Spell Attack Bonus (computed: proficiency + ability mod)
- [ ] **T19.1.3** — Tooltip on Spell Save DC: "8 + Proficiency Bonus (+2) + INT Modifier (+3) = 13"
- [ ] **T19.1.4** — Tooltip on Spell Attack Bonus: "Proficiency Bonus (+2) + INT Modifier (+3) = +5"
- [ ] **T19.1.5** — **Edit mode:** spellcasting class and ability are dropdowns (for edge cases like multiclass or custom). DC and attack bonus can be manually overridden

### Story 19.2 — Cantrips Section

> As a spellcaster, I need to see my cantrips listed at the top of the spell page.

**Tasks:**

- [ ] **T19.2.1** — Create `components/character/page3/CantripList.tsx` — a section labeled "Cantrips" with all known cantrips listed. Each cantrip shows: name, casting time icon, range, and a brief description preview
- [ ] **T19.2.2** — Clicking a cantrip name expands to show the full spell detail card (reuse `SpellDetailCard` from Phase 2)
- [ ] **T19.2.3** — **Edit mode:** "Add Cantrip" button opens the spell browser filtered to cantrips for the class. "Remove" button on each cantrip. Validate against the maximum cantrips known for class/level

### Story 19.3 — Spell Slots & Spell Lists by Level

> As a spellcaster, I need to see my spell slots and spell lists organized by spell level (1-9), with tracking for used slots and prepared/unprepared spell toggles.

**Tasks:**

- [ ] **T19.3.1** — Create `components/character/page3/SpellLevelSection.tsx` — a repeating section for each spell level (1 through 9, showing only levels the character has access to). Each section has: level header ("1st Level", "2nd Level", etc.), slot tracker, and spell list
- [ ] **T19.3.2** — **Spell slot tracker:** displays "Slots Total: N" and "Slots Expended: M" as a row of fillable circles. Clicking an empty circle marks it as expended (filled/crossed). Clicking an expended circle marks it as recovered. Always interactive (even in view mode since slot tracking happens during play)
- [ ] **T19.3.3** — **Spell list:** for each spell level, list all known/spellbook spells available at that level. Each spell row shows: prepared checkbox (for prepared casters), spell name, school icon, casting time, concentration badge (if applicable), ritual badge (if applicable)
- [ ] **T19.3.4** — **Prepared spell checkbox:** for prepared casters (Cleric, Druid, Wizard, Paladin), the checkbox toggles whether the spell is currently prepared. Show the prepared count vs. maximum: "Prepared: 4 / 5". Enforce the maximum — disable checkboxes when the limit is reached. For known casters (Bard, Sorcerer, Warlock), all spells are always "known" — hide the checkbox and show a "Known" badge
- [ ] **T19.3.5** — Clicking a spell name expands to show the full spell detail inline (or opens a side panel). Include all spell properties from the spell data
- [ ] **T19.3.6** — **Warlock Pact Magic:** if the character is a Warlock, display Pact Magic slots separately from regular spell slots. Label as "Pact Magic Slots" with a note: "Recharge on short rest." Warlock slots are always cast at the highest available level — show the current level prominently
- [ ] **T19.3.7** — **Edit mode:** "Add Spell" button per level opens the spell browser filtered to that level and class. "Remove Spell" button on each row. For Wizard spellbook: distinguish between "In Spellbook" (permanent) and "Prepared" (daily choice)
- [ ] **T19.3.8** — **Spell description on hover:** quick-preview tooltips that show spell name, components (V/S/M), and first sentence of description without needing to click

### Story 19.4 — Domain/Subclass Spells

> As a Cleric, Druid, or other subclass with bonus spells, I need to see my always-prepared domain/subclass spells separately marked.

**Tasks:**

- [ ] **T19.4.1** — For classes with subclass-granted spells (e.g., Cleric Life Domain gets Bless and Cure Wounds always prepared), display these with a special "Always Prepared" badge and a different background tint. These don't count against the prepared spell limit
- [ ] **T19.4.2** — Group subclass spells at the top of their respective level section with a "Domain Spells" or "Subclass Spells" sub-header
- [ ] **T19.4.3** — Prevent the user from unpreparing domain spells in edit mode — they're always prepared and can't be toggled off

---

## Epic 20: View / Edit Mode Toggle System

**Goal:** A seamless mode-switching system that transforms the character sheet between a clean read-only view and a full-featured editing form, with auto-save, undo history, and cascade recalculation.

### Story 20.1 — Mode Toggle & Visual Differentiation

> As a player, I need a clear way to switch between reading my character sheet and editing it, with obvious visual cues for which mode I'm in.

**Tasks:**

- [ ] **T20.1.1** — Create `components/character/ModeToggle.tsx` — a prominent toggle button in the top-right corner of the character sheet header. States: "View" (eye icon) and "Edit" (pencil icon). Current mode shown with active styling
- [ ] **T20.1.2** — **View mode styling:** clean text rendering, no visible form borders, parchment-like backgrounds on text blocks, proficiency dots are static, numbers are plain text. Optimize for readability and information density
- [ ] **T20.1.3** — **Edit mode styling:** all editable fields gain a subtle bottom border or background highlight (bg-surface tint). Hover states on all interactive elements. Edit icons appear next to sections. A persistent "Unsaved changes" indicator shows in the header if changes exist
- [ ] **T20.1.4** — Mode transition animation: cross-fade (200ms) between view and edit states. Preserve scroll position during the transition
- [ ] **T20.1.5** — Keyboard shortcut: `Ctrl+E` / `Cmd+E` toggles between modes. `Escape` exits edit mode (with a save prompt if there are unsaved changes)
- [ ] **T20.1.6** — When entering edit mode, show a brief help banner (dismissable, only first time): "You're now editing. Changes auto-save. Click any value to modify it."

### Story 20.2 — Auto-Save with Debouncing

> As a player editing my character, I need my changes to save automatically without me having to click a save button, but without overwhelming the database with writes.

**Tasks:**

- [ ] **T20.2.1** — Implement auto-save in the `useCharacter` hook: when any character field changes, start a 500ms debounce timer. If another change occurs before the timer fires, reset the timer. When the timer fires, write the updated character to IndexedDB via `updateCharacter()`
- [ ] **T20.2.2** — Display a save status indicator in the character sheet header:
  - "Saved" (green checkmark) — no pending changes
  - "Saving..." (spinning icon) — debounce timer fired, write in progress
  - "Unsaved changes" (yellow dot) — changes exist but debounce timer hasn't fired yet
  - "Save failed" (red X) — IndexedDB write failed, show retry button
- [ ] **T20.2.3** — Implement optimistic concurrency: increment the character's `version` field on every save. If two tabs somehow edit the same character, detect the conflict on write and show a merge dialog (or "last write wins" with a warning)
- [ ] **T20.2.4** — On tab close / browser navigation while in edit mode with unsaved changes, trigger `beforeunload` confirmation: "You have unsaved changes. Leave anyway?"
- [ ] **T20.2.5** — Emergency save: if the debounce timer fires but IndexedDB is unavailable (e.g., storage quota exceeded), attempt to save the character as JSON in sessionStorage as a backup. Show a warning: "Auto-save failed. Your changes are temporarily stored. Please export your character as JSON."

### Story 20.3 — Undo / Redo History

> As a player, I need to undo and redo changes in edit mode so I can safely experiment with modifications.

**Tasks:**

- [ ] **T20.3.1** — Implement an undo/redo stack in the character store: before each auto-save, push the previous character state onto the undo stack (max depth: 50 states). Each undo pops the stack and pushes the current state onto the redo stack
- [ ] **T20.3.2** — UI: "Undo" and "Redo" buttons in the edit mode toolbar (or the sheet header). Disabled when the respective stack is empty. Show the count of available undos
- [ ] **T20.3.3** — Keyboard shortcuts: `Ctrl+Z` / `Cmd+Z` for undo, `Ctrl+Shift+Z` / `Cmd+Shift+Z` for redo
- [ ] **T20.3.4** — Undo is state-based, not action-based: each undo restores the full character state from the previous auto-save snapshot, not individual field changes. This simplifies implementation at the cost of granularity
- [ ] **T20.3.5** — Clear the undo stack when exiting edit mode or navigating away from the character

### Story 20.4 — Cascade Recalculation on Edit

> As a developer, I need every edit to trigger the appropriate recalculations so derived stats are always accurate.

**Tasks:**

- [ ] **T20.4.1** — Create a `useCharacterCalculations` hook that wraps the Phase 1 calculation engine. Input: the mutable character data. Output: all computed derived values (AC, initiative, all skill modifiers, all save modifiers, spell save DC, attack bonuses, HP max, passive scores, carrying capacity, spell attack bonus). Recalculates on every character data change
- [ ] **T20.4.2** — Implement a dependency map for efficient partial recalculation:
  - Ability score change → recalc: modifier, related saves, related skills, AC (if DEX), HP max (if CON), spell DC (if spellcasting ability), all attack bonuses
  - Level change → recalc: proficiency bonus, HP max, spell slots, all proficiency-dependent values
  - Equipment change → recalc: AC (if armor/shield), attack table, inventory weight
  - Spell list change → recalc: spell page data only
- [ ] **T20.4.3** — Performance guard: debounce recalculation to avoid running the full engine on every keystroke. Run on field blur, after 300ms of inactivity, or on explicit "Recalculate" button press
- [ ] **T20.4.4** — Visual feedback on recalculation: when a derived value changes, briefly flash the new value with a gold highlight (300ms fade) so the player notices the change

---

## Epic 21: Character Gallery (Home Screen)

**Goal:** The app's home screen — a visually rich gallery of all the player's characters with search, filter, sort, and character management actions. This is the primary entry point after login/launch.

### Story 21.1 — Gallery Grid Layout

> As a player opening the app, I need to see all my characters displayed as visually distinct cards so I can quickly find and open the one I want.

**Tasks:**

- [ ] **T21.1.1** — Create `pages/HomePage.tsx` as the main gallery route (`/`). Loads all non-archived characters from IndexedDB. Displays a header with app branding, a "Create New Character" floating action button, and the character card grid
- [ ] **T21.1.2** — Create `components/gallery/CharacterGallery.tsx` — responsive grid of character cards. Layout: 1 column on mobile (<640px), 2 columns on tablet (640-1024px), 3 columns on desktop (1024-1440px), 4 columns on wide (>1440px). Cards have consistent height with overflow handled
- [ ] **T21.1.3** — Create `components/gallery/CharacterCard.tsx` — each card shows:
  - Avatar/portrait thumbnail (top, ~120px height) or race-silhouette placeholder with class-color background
  - Character name in Cinzel font (primary text)
  - "Level N [Race] [Class]" subtitle (e.g., "Level 1 High Elf Wizard")
  - Quick stats row: HP icon + max HP, shield icon + AC, eye icon + passive Perception
  - Last edited timestamp in muted text ("Edited 2 hours ago")
  - Campaign badge if linked to a campaign
- [ ] **T21.1.4** — Card hover effect: subtle lift with shadow increase, gold border glow on hover. Click navigates to character sheet view (`/character/:id`)
- [ ] **T21.1.5** — Card context menu (right-click or kebab icon): View, Edit, Duplicate, Export JSON, Archive, Delete
- [ ] **T21.1.6** — **Empty state:** when no characters exist, show a welcoming illustration with centered CTA: "You don't have any characters yet. Create your first adventurer!" with a prominent "Create Character" button

### Story 21.2 — Search, Filter & Sort

> As a player with many characters, I need to search by name and filter by class, race, level, or campaign to find specific characters quickly.

**Tasks:**

- [ ] **T21.2.1** — Create `components/gallery/GalleryToolbar.tsx` — a toolbar above the card grid with search and filter controls
- [ ] **T21.2.2** — **Search:** text input with magnifying glass icon. Filters characters by name (case-insensitive, substring match). Debounced at 200ms. Show "No characters match your search" empty state when no results
- [ ] **T21.2.3** — **Filter chips:**
  - By Class: dropdown showing all classes present in the user's characters (e.g., if they have 3 Fighters and 2 Wizards, show "Fighter (3)" and "Wizard (2)"). Multi-select
  - By Race: same pattern as class
  - By Level range: "1-4", "5-10", "11-16", "17-20" toggle chips
  - By Campaign: dropdown of campaigns the user has characters in, plus "No Campaign"
  - "Show Archived": toggle to include archived characters (displayed with a muted/dimmed style)
- [ ] **T21.2.4** — **Sort:** dropdown with options: "Last Edited" (default), "Name (A-Z)", "Name (Z-A)", "Level (High→Low)", "Level (Low→High)", "Date Created (Newest)", "Date Created (Oldest)"
- [ ] **T21.2.5** — **View toggle:** switch between "Grid View" (cards) and "List View" (compact table). List view shows: avatar thumbnail, name, race, class, level, AC, HP, campaign, last edited — as a sortable data table
- [ ] **T21.2.6** — Persist the user's last-used sort/filter preferences in the user preferences IndexedDB table so the gallery opens in their preferred state

### Story 21.3 — Character Quick Actions

> As a player, I need quick-access actions for each character without opening the full sheet — duplicate, export, archive, and delete.

**Tasks:**

- [ ] **T21.3.1** — Create `components/gallery/CharacterActions.tsx` — a dropdown menu rendered from the kebab icon on each card and from the right-click context menu. Actions: View Character, Edit Character, Duplicate, Export as JSON, Archive, Delete
- [ ] **T21.3.2** — **Duplicate:** creates a deep copy of the character with a new ID, incremented name (e.g., "Gandalf → Gandalf (Copy)"), and fresh timestamps. Persists immediately to IndexedDB. Shows a success toast: "Character duplicated!" with an "Open Copy" link
- [ ] **T21.3.3** — **Archive (soft delete):** sets `isArchived: true` on the character. Card disappears from the default gallery view. Show a toast: "Character archived. Undo?" with a 5-second undo timer. Archived characters appear in the "Show Archived" filtered view with a muted overlay and "Unarchive" action
- [ ] **T21.3.4** — **Permanent Delete:** confirmation dialog: "Permanently delete [Character Name]? This cannot be undone." Red "Delete" button, muted "Cancel" button. On confirm, remove from IndexedDB. Show toast: "Character deleted."
- [ ] **T21.3.5** — **Batch operations:** a "Select" mode toggle that enables multi-select on cards (checkbox overlay). When cards are selected, show a batch action bar at the bottom: "N selected — Archive | Delete | Export All"

---

## Epic 22: JSON Import / Export

**Goal:** Allow players to export their characters as portable JSON files and import characters from JSON, enabling sharing, backup, and migration between devices or users.

### Story 22.1 — JSON Export

> As a player, I need to export a character as a JSON file so I can back it up, share it with others, or transfer to another device.

**Tasks:**

- [ ] **T22.1.1** — Create `utils/characterExport.ts` with function `exportCharacterAsJSON(character: Character): string` that serializes the full character object to formatted JSON. Include a metadata wrapper: `{ formatVersion: "1.0", appVersion: "x.y.z", exportedAt: ISO timestamp, character: { ... } }`
- [ ] **T22.1.2** — Trigger download as a `.json` file named `[CharacterName]_[Class]_Level[N].json` (sanitize filename characters). Use `URL.createObjectURL()` with Blob for the download trigger
- [ ] **T22.1.3** — Accessible from: gallery card context menu "Export as JSON", character sheet header "Export" button, and batch export from gallery select mode
- [ ] **T22.1.4** — **Batch export:** when multiple characters are selected, export as a single JSON file with array wrapper: `{ formatVersion: "1.0", characters: [...] }`. Filename: `DnD_Forge_Export_[date].json`
- [ ] **T22.1.5** — Exclude transient state from the export: remove `hitPointCurrent` (export `hitPointMax` only), `usedSpellSlots`, `hitDiceUsed`, `deathSaves`, `tempHitPoints` — these are session-specific. Include an option toggle: "Include session state" for full exports

### Story 22.2 — JSON Import

> As a player, I need to import a character from a JSON file, with validation that catches problems before corrupting my data.

**Tasks:**

- [ ] **T22.2.1** — Create `utils/characterImport.ts` with function `importCharacterFromJSON(jsonString: string): ImportResult` that parses, validates, and returns the character(s) or a list of errors
- [ ] **T22.2.2** — Create `components/gallery/ImportDialog.tsx` — a modal triggered from the gallery toolbar ("Import Character" button). Two input methods: file upload (drag-and-drop zone + file picker button) and paste JSON text (textarea for clipboard import)
- [ ] **T22.2.3** — **Validation pipeline:** Run the imported JSON through:
  1. JSON syntax validation → "Invalid JSON: unexpected token at line N"
  2. Schema validation: check required fields exist (name, race, class, abilityScores, etc.) → "Missing required field: abilityScores"
  3. Type validation: check field types match the Character type system → "Field 'level' expected number, got string"
  4. Reference validation: check that raceId, classId, spell IDs, equipment IDs reference valid SRD data → "Warning: spell 'fireball' not found in SRD data (will be imported as custom)"
  5. Business rule validation: check ability score ranges (3-30), level (1-20), HP consistency → "Warning: HP max (45) doesn't match calculated value (42)"
- [ ] **T22.2.4** — Display validation results in the import dialog:
  - **Errors** (red, blocks import): malformed JSON, missing required fields
  - **Warnings** (yellow, allows import): computed value mismatches, unknown references
  - **Info** (blue): version differences, transient state omitted
- [ ] **T22.2.5** — On successful validation, show a character preview card in the dialog. "Import" button creates the character in IndexedDB with a newly generated ID (never use the imported ID to avoid conflicts). Set `createdAt` and `updatedAt` to now
- [ ] **T22.2.6** — **Batch import:** if the JSON contains a `characters` array, show all character previews and allow selective import ("Import All" or individual "Import" buttons per character)
- [ ] **T22.2.7** — **Version migration:** if the `formatVersion` in the import differs from the current app version, apply migration transforms. Create a `migrations/` directory with versioned migration functions. For v1.0 launch, this is a no-op but the infrastructure is in place

### Story 22.3 — Share via URL (Lightweight)

> As a player, I need a quick way to share a read-only view of my character without requiring the recipient to import a JSON file.

**Tasks:**

- [ ] **T22.3.1** — Generate a shareable URL by encoding the character data as a compressed, base64-encoded URL hash: `/share#[encodedData]`. Use `pako` (gzip) compression to keep URL lengths manageable
- [ ] **T22.3.2** — Create `pages/SharedCharacterView.tsx` — a read-only route that decodes the URL hash, deserializes the character data, and renders the character sheet in view-only mode with no edit capabilities
- [ ] **T22.3.3** — Add a "Share Link" button to the character sheet header. Clicking it copies the shareable URL to clipboard with a toast: "Share link copied!" Include a warning: "This link contains your full character data in the URL"
- [ ] **T22.3.4** — Size guard: if the encoded character data exceeds 8,000 characters (URL length limits), show a warning and suggest JSON export instead. Most level 1-5 characters should fit comfortably
- [ ] **T22.3.5** — The shared view shows a banner: "Shared Character — [Character Name]" with an "Import to My Characters" button that copies the character into the viewer's IndexedDB

---

## Epic 23: Character Avatar / Portrait System

**Goal:** Allow players to upload, crop, and display a character portrait/avatar throughout the app — on gallery cards, character sheet headers, and shared views.

### Story 23.1 — Avatar Upload & Storage

> As a player, I need to upload an image for my character's portrait and have it stored with the character data.

**Tasks:**

- [ ] **T23.1.1** — Create `components/character/AvatarUploader.tsx` — an upload dialog triggered from the character sheet's portrait area (edit mode) or the gallery card edit action. Accept JPEG and PNG files up to 2MB
- [ ] **T23.1.2** — Implement client-side image processing: resize the uploaded image to a maximum of 400×400 pixels while maintaining aspect ratio. Use `canvas` API for resizing. Convert to JPEG at 80% quality to minimize storage. Store the result as a base64 data URL string in the character's `avatar` field
- [ ] **T23.1.3** — Create `components/character/AvatarCropper.tsx` — after uploading, show a crop interface where the player can select a square region of the image. Use simple CSS-based crop with drag-to-position (no heavy library needed). "Confirm" saves the cropped image
- [ ] **T23.1.4** — "Remove Avatar" button that clears the `avatar` field and reverts to the default placeholder
- [ ] **T23.1.5** — Default avatar generation: if no avatar is uploaded, generate a placeholder based on race and class. Use a simple icon-based system: race silhouette icon (Elf, Dwarf, Human, etc.) with a class-themed color background (red for Fighter, blue for Wizard, green for Ranger, etc.)

### Story 23.2 — Avatar Display Across the App

> As a developer, I need the avatar component to render consistently in all contexts — gallery cards, sheet header, shared views.

**Tasks:**

- [ ] **T23.2.1** — Create `components/shared/CharacterAvatar.tsx` — a reusable avatar component. Props: `character` (for data), `size` ('sm' | 'md' | 'lg' | 'xl' mapping to 32/48/64/128px), `editable` (shows upload icon on hover). Renders the avatar image if present or the default placeholder
- [ ] **T23.2.2** — Gallery card: `size="lg"` (64px) at the top of the card
- [ ] **T23.2.3** — Character sheet banner: `size="xl"` (128px) with circular mask
- [ ] **T23.2.4** — Shared view: `size="xl"` (128px), no edit capability
- [ ] **T23.2.5** — DM party view (future): `size="md"` (48px) next to character name in the party grid
- [ ] **T23.2.6** — Apply a subtle parchment-textured border ring around all avatars to match the app's dark fantasy aesthetic

---

## Epic 24: Character Sheet Responsive Design

**Goal:** Ensure the 3-page character sheet is fully usable across all device sizes, from mobile phones to wide desktop monitors, by intelligently reorganizing the layout without losing information.

### Story 24.1 — Desktop Layout (1024px+)

> As a player on desktop, I need the full 3-column character sheet layout with maximum information density.

**Tasks:**

- [ ] **T24.1.1** — Page 1 desktop: three-column layout matching the official sheet. Left column (ability scores, saves, skills) ~30% width, center column (combat stats, HP, attacks) ~35% width, right column (personality, features) ~35% width. Top banner spans full width
- [ ] **T24.1.2** — Page 2 desktop: two-column layout. Left (~40%): portrait, appearance, allies. Right (~60%): backstory, features, treasure. Equipment section spans full width at bottom
- [ ] **T24.1.3** — Page 3 desktop: cantrips and spell levels in a multi-column flow (2-3 columns depending on spell count). Spell slot trackers inline with level headers
- [ ] **T24.1.4** — Tab navigation between pages: three tabs at the top of the sheet. Active tab highlighted. Tab content rendered with entrance animation

### Story 24.2 — Tablet Layout (640-1024px)

> As a player on a tablet, I need a readable sheet that balances information density with touch-friendly targets.

**Tasks:**

- [ ] **T24.2.1** — Page 1 tablet: two-column layout. Left column (ability scores + saves + skills) ~40%. Right column (combat stats + HP + attacks + personality + features) ~60%. Skills list uses a more compact format (abbreviations)
- [ ] **T24.2.2** — Page 2 tablet: single column, sections stacked vertically. Portrait area reduced to thumbnail
- [ ] **T24.2.3** — Page 3 tablet: single column, spell levels stacked vertically. Spell slot trackers above spell lists
- [ ] **T24.2.4** — Touch targets: all interactive elements (proficiency dots, spell slot circles, edit fields) minimum 44×44px for comfortable tapping

### Story 24.3 — Mobile Layout (<640px)

> As a player on a phone during a session, I need a usable character sheet that I can scroll through to find key information quickly.

**Tasks:**

- [ ] **T24.3.1** — Page 1 mobile: single column, sections stacked vertically. Section order optimized for play: combat stats (AC, HP, initiative, speed) at top, attacks, then ability scores/skills below. Personality and features collapse by default
- [ ] **T24.3.2** — Mobile navigation: swap tabs for a scrollable page with sticky section headers that act as jump links. Or keep tabs but stack all Page 1 content in one scrollable view
- [ ] **T24.3.3** — Ability scores mobile: horizontal row of 6 compact score blocks (2 rows of 3) rather than a vertical column. Show modifier only; tap to expand and see full score breakdown
- [ ] **T24.3.4** — Skills mobile: collapsible section. Default collapsed with a "Skills" header showing the count of proficient skills. Expand to see the full list
- [ ] **T24.3.5** — Attacks mobile: card-style layout for each weapon/attack rather than a table. Each attack card shows name, attack bonus, and damage prominently
- [ ] **T24.3.6** — Quick-access floating action bar at the bottom of mobile view with the 4 most common actions: Roll d20, HP +/−, Spell Slots, and Edit toggle
- [ ] **T24.3.7** — Spell page mobile: accordion sections per spell level. Only the level currently relevant (has unused slots) is expanded by default

### Story 24.4 — Print-Friendly Styles

> As a player, I need to print my character sheet from the browser with a clean, readable layout — even before the PDF export feature in Phase 6.

**Tasks:**

- [ ] **T24.4.1** — Create `styles/character-sheet-print.css` with `@media print` rules. Remove all UI chrome (navigation, edit buttons, mode toggles, hover states). Force white background with dark text
- [ ] **T24.4.2** — Print layout: force the three-column Page 1 layout regardless of screen size. Each page (Stats, Backstory, Spells) starts on a new printed page using `page-break-before: always`
- [ ] **T24.4.3** — "Print" button in the character sheet header. Options dialog: "Print All Pages", "Page 1 Only (Core Stats)", "Pages 1 & 3 (Stats + Spells)", custom page selection
- [ ] **T24.4.4** — Optimize typography for print: increase contrast, ensure Cinzel headings render properly, use pt-based font sizes. Parchment textures are hidden in print (solid white background)
- [ ] **T24.4.5** — Test with: Chrome Print Preview, Firefox Print, Safari Print. Ensure proper page breaks, no orphaned headers, and readable font sizes

---

## Epic 25: Routing & Navigation

**Goal:** Wire up all Phase 3 pages into the React Router route structure and build the app's navigation chrome — top bar, side navigation, and page transitions.

### Story 25.1 — Route Structure

> As a developer, I need all Phase 3 pages properly routed with clean URLs and navigation.

**Tasks:**

- [ ] **T25.1.1** — Define Phase 3 routes in the React Router configuration:
  - `/` — Home (Character Gallery)
  - `/character/new` — Creation Wizard (Phase 2, already exists)
  - `/character/:id` — Character Sheet View (default tab: Core Stats)
  - `/character/:id/edit` — Character Sheet Edit Mode (or use query param `?mode=edit`)
  - `/share#[data]` — Shared Character View (read-only)
  - `/import` — Import Character page (or modal overlay)
- [ ] **T25.1.2** — Implement `useParams()` to extract `characterId` from the URL. If the character doesn't exist in IndexedDB, show a 404-style page: "Character not found. It may have been deleted." with a "Go Home" button
- [ ] **T25.1.3** — Page transition animations: slide-in from right when navigating deeper (gallery → sheet), slide-in from left when navigating back (sheet → gallery). Use framer-motion `AnimatePresence`
- [ ] **T25.1.4** — Browser back button should work intuitively: sheet → gallery, edit mode → view mode. Push URL state changes to the history stack

### Story 25.2 — Top Navigation Bar

> As a player, I need a consistent navigation bar across the app that shows where I am and lets me get to key areas.

**Tasks:**

- [ ] **T25.2.1** — Create `components/layout/TopNav.tsx` — fixed top bar with: app logo/name ("D&D Character Forge" in Cinzel), breadcrumb trail (Home > Character Name), and right-side actions
- [ ] **T25.2.2** — Right-side actions in the nav bar: "New Character" button (accent-gold), "Import" button, and a settings gear icon
- [ ] **T25.2.3** — Breadcrumbs dynamically update based on the current route: "Characters" (on gallery), "Characters > [Name]" (on character sheet), "Characters > [Name] > Editing" (in edit mode)
- [ ] **T25.2.4** — Mobile: collapse the top nav into a hamburger menu with a slide-out drawer. Keep the character name and key actions visible

### Story 25.3 — Settings & Preferences

> As a player, I need a settings page or panel to configure my preferences (dice sounds, auto-save, theme, default ability score method).

**Tasks:**

- [ ] **T25.3.1** — Create `pages/SettingsPage.tsx` or `components/layout/SettingsPanel.tsx` — accessible from the nav bar gear icon. Settings stored in the IndexedDB `preferences` table
- [ ] **T25.3.2** — Available settings:
  - **Default Player Name:** pre-fills in the creation wizard
  - **Dice Sound Effects:** toggle on/off
  - **Dice Animation Speed:** fast / normal / dramatic
  - **Auto-Save Interval:** 500ms / 1s / 2s / manual only
  - **Default Ability Score Method:** Standard Array / Point Buy / Rolling
  - **Show Dice Roll Results Inline:** toggle
  - **Reduced Motion:** toggle (disables all animations for accessibility)
  - **Dark Mode / Light Mode:** toggle (default: dark)
  - **Gallery Default Sort:** dropdown matching gallery sort options
- [ ] **T25.3.3** — "Clear All Data" danger zone at the bottom of settings: "Delete all characters, campaigns, and preferences. This cannot be undone." Requires typing "DELETE" to confirm
- [ ] **T25.3.4** — "Export All Data" button that exports the entire IndexedDB database as a single JSON backup file
- [ ] **T25.3.5** — "About" section: app version, license acknowledgments (OGL for SRD content), link to D&D 5e SRD, credits

---

## Phase 3 Completion Criteria

Before moving to Phase 4, ALL of the following must be true:

1. **Character Sheet Page 1:** All sections render correctly — banner, 6 ability scores with modifiers, 6 saving throws with proficiency, 18 skills with proficiency/expertise, proficiency bonus, AC, initiative, speed, HP (max/current/temp), hit dice, death saves, attacks (auto-computed from weapons), personality traits/ideals/bonds/flaws, features & traits. All computed values match manual calculation
2. **Character Sheet Page 2:** Appearance fields, portrait area, backstory, allies & organizations, additional features, full equipment list with weight tracking, currency section with 5 denominations, treasure
3. **Character Sheet Page 3:** Spellcasting header (class, ability, DC, attack bonus), cantrip list, spell slot trackers per level, spell lists per level with prepared checkboxes (for prepared casters) or known badges (for known casters). Warlock Pact Magic slots handled separately. Domain/subclass spells marked as always prepared
4. **View Mode:** Clean, read-only rendering with no form controls visible. Optimized for readability. Click-to-roll on skills, saves, attacks, and initiative
5. **Edit Mode:** All fields editable with inline controls. Auto-save with 500ms debounce. Undo/redo (50-state stack). Cascade recalculation on all changes. Visual indicator for save status. Change cascade warnings for core stat edits
6. **Character Gallery:** Responsive grid/list of character cards with name, race, class, level, AC, HP, portrait, and last-edited time. Search by name, filter by class/race/level/campaign, sort by 6+ criteria. Empty state with CTA
7. **Character Lifecycle:** Duplicate (deep copy with new ID), Archive (soft delete with undo), Permanent Delete (with confirmation), all accessible from gallery and character sheet
8. **JSON Export:** Single character and batch export. Formatted JSON with metadata wrapper. Session state toggle. Automatic file download with descriptive filename
9. **JSON Import:** File upload and paste support. 5-stage validation pipeline (syntax, schema, type, reference, business rules). Error/warning/info display. Character preview before import. New ID generation. Batch import support. Version migration framework
10. **Share Link:** URL-encoded character data for quick sharing. Read-only shared view. Import from shared link
11. **Avatar System:** Upload JPEG/PNG, client-side resize/crop, base64 storage. Default race/class placeholder. Consistent rendering across gallery, sheet, and shared views
12. **Responsive:** Gallery and character sheet usable at mobile (640px), tablet (1024px), and desktop (1440px). Print stylesheet produces clean multi-page output
13. **Routing:** Clean URL structure, 404 handling, breadcrumbs, browser back button, page transitions
14. **Settings:** User preferences for dice, auto-save, defaults, and accessibility. Data management (clear, export all)
15. **Accessible:** All interactive elements keyboard navigable. ARIA labels on all form controls. Color contrast 4.5:1+. Reduced motion option. Focus indicators on all interactive elements

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Epics | 9 (Epic 17–25) |
| Stories | 30 |
| Tasks | ~155 |
| New Components | ~45+ |
| Character Sheet Sections | ~25 distinct display components |
| Responsive Breakpoints | 4 (mobile, tablet, desktop, wide) |
| Edit Mode Features | Auto-save, undo/redo, cascade recalc, mode toggle |
| Import Validation Stages | 5 |
| Gallery Features | Search, 4 filter types, 6 sort options, grid/list toggle |

---

## Dependency Graph

```
Epic 20 (View/Edit Mode Toggle) ← foundation, build first
  │
  ├── Epic 17 (Page 1 — Core Stats) ← depends on mode toggle system
  │    ├── Story 17.2 (Ability Scores) ← uses Phase 1 calculation engine
  │    ├── Story 17.3 (Saving Throws) ← depends on ability scores
  │    ├── Story 17.4 (Skills) ← depends on ability scores + proficiency
  │    ├── Story 17.5 (Combat Stats) ← depends on ability scores + equipment
  │    ├── Story 17.6 (HP Block) ← depends on CON + class
  │    └── Story 17.8 (Attacks) ← depends on equipment + ability scores
  │
  ├── Epic 18 (Page 2 — Backstory) ← can be built in parallel with Page 1
  │    └── Story 18.3 (Equipment) ← depends on Page 1 AC calculation
  │
  ├── Epic 19 (Page 3 — Spellcasting) ← can be built in parallel
  │    └── depends on spell data from Phase 1 + Phase 2 spell components
  │
  ├── Epic 23 (Avatar System) ← independent, can be built in parallel
  │
  ├── Epic 21 (Gallery) ← depends on character sheet being viewable
  │    └── uses CharacterCard (summary of sheet data)
  │
  ├── Epic 22 (Import/Export) ← depends on character type system
  │    └── Story 22.2 (Import) depends on validation engine
  │
  ├── Epic 24 (Responsive Design) ← applied across all above epics
  │    └── must be done alongside or immediately after each page epic
  │
  └── Epic 25 (Routing & Navigation) ← wires everything together, build first
       └── can scaffold routes early, flesh out as pages are built
```

**Recommended build order:**

1. **Week 5, Day 1-2:** Epic 25 (Routing scaffold) + Epic 20 (Mode toggle system)
2. **Week 5, Day 3-5:** Epic 17 (Page 1) — the most complex page with the most components
3. **Week 5 overflow → Week 6, Day 1:** Epic 18 (Page 2) + Epic 19 (Page 3) — can be parallelized
4. **Week 6, Day 2-3:** Epic 21 (Gallery) + Epic 23 (Avatar)
5. **Week 6, Day 4-5:** Epic 22 (Import/Export) + Epic 24 (Responsive polish) + Epic 25 (Settings/nav finalization)

---

## Open Questions for Phase 3

1. **Manual Override vs. Computed Values:** When a player manually overrides a computed value (e.g., sets AC to a custom number), how do we handle subsequent changes that would normally recalculate AC? Recommend: show both the computed and overridden values, with a "Reset to Computed" button and a clear visual indicator that the value is manually set.

2. **Edit Mode Granularity:** Should edit mode enable ALL fields simultaneously or should it use section-level edit toggles (click "Edit Abilities" to make only the ability section editable)? Recommend: full-sheet edit mode for simplicity, with the understanding that most fields auto-calculate. Inline section editors are a Phase 6 polish item.

3. **Share Link Size Limits:** Heavily equipped or backstory-rich characters may exceed URL length limits. Should we implement a server-side share endpoint (requires backend) or accept the URL-only limitation? Recommend: URL-only for Phase 3 with a graceful fallback to JSON export when the character is too large.

4. **Gallery Card Information Density:** Should gallery cards show more combat stats (spell save DC, initiative) or keep them minimal? Recommend: minimal for Phase 3 (name, race/class/level, HP, AC). Add a "Detailed Cards" toggle in Phase 6 polish.

5. **Offline Character Sheet Printing:** The print stylesheet approach works for basic printing, but some players expect the output to match the exact WotC official sheet layout (with the same field positions and decorative borders). Should Phase 3 target "functional print" (all data, clean layout) or "faithful print" (pixel-matched to the official sheet)? Recommend: functional print for Phase 3. Pixel-perfect PDF export in Phase 6.

6. **Character Versioning for Undo:** The undo system stores full character snapshots (simple but memory-heavy). At 50 states × ~20KB per character state, that's 1MB per character in memory. Should we cap at 20 states instead, or implement a diff-based undo? Recommend: 20 states for Phase 3, diff-based optimization in Phase 6 if needed.
