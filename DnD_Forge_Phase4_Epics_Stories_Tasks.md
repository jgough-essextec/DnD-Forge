# D&D Character Forge — Phase 4: Session Play Features

## Detailed Epics, Stories & Tasks

**Phase Duration:** Weeks 7–8  
**Phase Goal:** Transform the character sheet from a static record into a living play tool. Deliver an integrated dice roller with animations and roll history, an interactive HP tracker with damage/healing, spell slot tracking with expend/recover, a full conditions tracker (all 14 standard conditions plus exhaustion levels), short rest and long rest automation that recovers the correct resources per 5e rules, and a complete level-up flow that handles HP increases, new class features, ASI/feat selection, subclass choices, and spellcasting progression for all 12 classes across levels 1–20.

**Phase 3 Dependencies:** Phase 4 assumes all Phase 3 deliverables are complete — the full 3-page character sheet (view + edit modes), the character gallery, and the auto-save/recalculation system. Phase 4 adds the real-time play interaction layer on top of the sheet and the level-up progression system.

---

## Pre-Phase 4 Audit: Edge Cases & Gaps to Address

### Gap P1 — Class Features with Limited Uses Have Varied Recovery Rules

The short rest / long rest buttons must know which resources recover on which rest type. This is not a simple toggle — each class feature has its own recovery rule, and some have partial recovery. The app must track "uses remaining" per feature and reset the correct ones on each rest type.

| Feature | Class | Uses at Level 1 | Recovers On |
|---------|-------|-----------------|-------------|
| Rage | Barbarian | 2 | Long Rest |
| Bardic Inspiration | Bard | CHA mod (min 1) | Long Rest (Short Rest at Lv 5+) |
| Channel Divinity | Cleric | 1 | Short Rest |
| Wild Shape | Druid | 2 | Short Rest |
| Second Wind | Fighter | 1 | Short Rest |
| Action Surge | Fighter | 1 (at Lv 2) | Short Rest |
| Ki Points | Monk | Monk Level | Short Rest |
| Lay on Hands Pool | Paladin | 5 × Paladin Level | Long Rest |
| Sorcery Points | Sorcerer | Sorcerer Level (at Lv 2+) | Long Rest |
| Arcane Recovery | Wizard | 1 (recover spell slots ≤ half wizard level, rounded up) | Long Rest (used during Short Rest) |
| Warlock Spell Slots | Warlock | Per Pact Magic table | Short Rest |

The rest automation must also handle features that partially recover:
- **Hit Dice:** Long Rest recovers up to half your total hit dice (minimum 1), not all
- **Exhaustion:** Long Rest reduces exhaustion by 1 level (if fed and watered), not full removal
- **Death Saves:** Long Rest resets death saves to 0/0

### Gap P2 — Level-Up Is Not Uniform Across Classes

Every class has a unique level progression. The level-up flow must handle all of these variations:

**Subclass Selection Levels:**

| Class | Subclass Level |
|-------|---------------|
| Barbarian | 3 (Path) |
| Bard | 3 (College) |
| Cleric | 1 (Domain) |
| Druid | 2 (Circle) |
| Fighter | 3 (Archetype) |
| Monk | 3 (Tradition) |
| Paladin | 3 (Oath) |
| Ranger | 3 (Archetype) |
| Rogue | 3 (Archetype) |
| Sorcerer | 1 (Origin) |
| Warlock | 1 (Patron) |
| Wizard | 2 (School) |

**ASI Levels by Class:**

| Class | ASI Levels |
|-------|-----------|
| Most classes | 4, 8, 12, 16, 19 |
| Fighter | 4, 6, 8, 12, 14, 16, 19 (7 total) |
| Rogue | 4, 8, 10, 12, 16, 19 (6 total) |

**Extra Attack:**
- Fighter, Barbarian, Paladin, Ranger, Monk: Level 5
- Fighter gets additional at 11 and 20

### Gap P3 — Spellcasting Progression Is Per-Class and Non-Linear

The spells known, cantrips known, and spell slots change at every level, and the tables are different for each class:

| Class | Cantrip Progression | Spells Known/Prepared | New Spell Levels Unlocked |
|-------|--------------------|-----------------------|--------------------------|
| Bard | +1 at Lv 4, 10 | Spells known increases per level (see table) + can swap 1 per level | Lv 2 spells at class Lv 3, Lv 3 at 5, Lv 4 at 7, etc. |
| Cleric | +1 at Lv 4, 10 | Prepare WIS mod + Cleric level each day | Same as Bard |
| Druid | +1 at Lv 4, 10 | Prepare WIS mod + Druid level each day | Same as Bard |
| Sorcerer | +1 at Lv 4, 10 | Spells known per table + can swap 1 per level | Same |
| Warlock | +1 at Lv 4, 10 | Spells known per table + can swap 1 per level | Pact slots: 1 at Lv 1, 2 at Lv 2, all at highest available level |
| Wizard | +1 at Lv 4, 10 | Add 2 spells to spellbook per level; prepare INT mod + Wizard level | Same |
| Paladin | 0 cantrips | Prepare CHA mod + half Paladin level; starts at Lv 2 | Lv 2 spells at class Lv 5, etc. (half-caster) |
| Ranger | 0 cantrips | Spells known per table; starts at Lv 2 | Half-caster progression |

On level-up, known casters (Bard, Sorcerer, Warlock, Ranger) may also **swap one known spell** for a different spell of the same level or lower. The level-up flow must offer this.

### Gap P4 — Dice Roller Must Support Complex Roll Expressions

Players don't just roll "1d20." Common roll expressions include:

- `1d20 + 5` (skill check with modifier)
- `2d20kh1 + 5` (advantage: roll 2d20, keep highest)
- `2d20kl1 + 5` (disadvantage: roll 2d20, keep lowest)
- `4d6kh3` (ability score roll: 4d6 keep highest 3)
- `2d6 + 3` (damage roll)
- `8d6` (fireball damage)
- `1d12 + 1d6 + 5` (mixed weapon + feature damage)
- `1d20 + 5` twice with critical hit doubled dice

The dice engine (from Phase 1) handles the math, but the UI must make these easy to construct without typing raw notation.

### Gap P5 — HP Tracker Must Correctly Apply 5e Damage Rules

Damage application in D&D 5e has specific rules:
- Damage reduces temporary HP first, then current HP
- If remaining damage exceeds current HP, the character goes to 0 HP (not negative)
- If remaining damage after hitting 0 HP equals or exceeds max HP, **instant death** (massive damage rule)
- Healing cannot exceed max HP
- Healing at 0 HP stabilizes the character and resets death saves
- Resistance halves damage (round down); vulnerability doubles damage

The HP tracker should handle all of these correctly with visual indicators.

### Gap P6 — Conditions Have Mechanical Effects on the Sheet

Active conditions should visibly modify the character sheet, not just appear as badges:
- **Blinded:** Flag on all attack rolls ("Disadvantage — Blinded")
- **Frightened:** Flag on ability checks and attack rolls while source is in sight
- **Poisoned:** Flag on attack rolls and ability checks ("Disadvantage — Poisoned")
- **Prone:** Flag on attack rolls ("Disadvantage — Prone")
- **Restrained:** Flag on DEX saves and attack rolls, note advantage for attackers
- **Exhaustion (Level 1-5):** Various escalating effects on speed, ability checks, HP max, saves, attack rolls
- **Paralyzed/Petrified/Stunned/Unconscious:** Multiple compounding effects

At minimum, conditions should show as visible badges on the character sheet with tooltip descriptions. Ideally, affected rolls show the condition's impact inline.

### Gap P7 — Cantrip Damage Scaling

Cantrip damage scales at character levels 5, 11, and 17 (not class levels). The level-up flow and the character sheet must update cantrip damage dice at these thresholds regardless of which class the levels are in. For example, Fire Bolt goes from 1d10 to 2d10 at level 5, 3d10 at level 11, and 4d10 at level 17.

---

## Epic 26: Dice Roller

**Goal:** A standalone, always-accessible dice roller with animated 3D dice, support for complex roll expressions, advantage/disadvantage, roll history, and deep integration with the character sheet so that clicking any rollable value on the sheet triggers the correct roll.

### Story 26.1 — Dice Roller Panel

> As a player during a session, I need a dice roller I can access from anywhere in the app to roll any combination of dice quickly.

**Tasks:**

- [ ] **T26.1.1** — Create `components/dice/DiceRollerPanel.tsx` — a persistent, toggleable panel. On desktop: slide-out right panel (~320px wide). On mobile: bottom sheet overlay. Toggled via a d20 floating action button (FAB) that's always visible in the bottom-right corner
- [ ] **T26.1.2** — Panel layout: three zones stacked vertically — dice tray (animation area, ~40% height), quick-roll buttons (dice selection, ~30% height), and roll history log (~30% height)
- [ ] **T26.1.3** — Quick-roll buttons: one button per die type (d4, d6, d8, d10, d12, d20, d100/percentile). Each button shows the die icon and type. Single tap rolls 1 of that die. Long press or number badge lets the user set quantity (e.g., "Roll 3d8")
- [ ] **T26.1.4** — Modifier input: a compact "+" / "−" adjuster next to the dice buttons. Set a modifier (+5, −2, etc.) that's added to the next roll total. Pre-populated from the last used modifier. Reset to 0 after each roll
- [ ] **T26.1.5** — "Roll" button (accent-gold): commits the current dice selection + modifier and triggers the roll animation. Keyboard shortcut: Enter
- [ ] **T26.1.6** — Custom expression input: a text field that accepts standard dice notation (e.g., "2d6 + 1d4 + 3"). Parse with the Phase 1 dice engine. Show a validation error for invalid expressions. History of recently typed expressions as suggestions
- [ ] **T26.1.7** — Panel remembers its open/closed state in the UI store. Opening the panel on mobile doesn't navigate away from the current page

### Story 26.2 — Dice Animation

> As a player, I want satisfying dice rolling animations that build excitement and clearly show the result.

**Tasks:**

- [ ] **T26.2.1** — Create `components/dice/DiceAnimation.tsx` — a dice tray component that renders animated dice using CSS 3D transforms. Each die type has a distinct shape and color scheme: d4 (green pyramid), d6 (white cube), d8 (blue octahedron), d10 (purple), d12 (red), d20 (gold)
- [ ] **T26.2.2** — Implement the animation sequence: dice "tumble" with random 3D rotations for 1-2 seconds, then settle to show the result face. The tumble uses CSS `@keyframes` with random rotation values per axis. Final position shows the result clearly
- [ ] **T26.2.3** — Multiple dice: when rolling N dice simultaneously, stagger their animations slightly (50-100ms offset) and position them in a scattered arrangement within the tray
- [ ] **T26.2.4** — Critical hit highlight: when a d20 shows 20, flash the die with a gold glow and play a success chime. When it shows 1, flash with a red glow and play a failure sound
- [ ] **T26.2.5** — Result display: after animation completes, show the total prominently above the dice tray in large font. If there's a modifier, show "Roll: [sum] + [mod] = [total]". If advantage/disadvantage, show both d20 values with the kept one highlighted
- [ ] **T26.2.6** — Sound effects: dice clatter sound during tumble, distinct "landing" sound on settle. Sounds controlled by user preference toggle (from Phase 3 settings). Default: enabled
- [ ] **T26.2.7** — Respect "Reduced Motion" preference: if enabled, skip the tumble animation and instantly show results with a simple fade-in
- [ ] **T26.2.8** — Animation speed: three settings (Fast: 0.5s, Normal: 1.2s, Dramatic: 2.5s) configurable in settings

### Story 26.3 — Advantage & Disadvantage Rolling

> As a player, I need quick buttons for advantage (roll 2d20, keep highest) and disadvantage (roll 2d20, keep lowest) since these are among the most common D&D roll modifications.

**Tasks:**

- [ ] **T26.3.1** — Add "ADV" and "DIS" toggle buttons above the d20 quick-roll button. When ADV is active, any d20 roll becomes 2d20-keep-highest. When DIS is active, it becomes 2d20-keep-lowest. Toggles are mutually exclusive (activating one deactivates the other)
- [ ] **T26.3.2** — Visual: both d20s animate and show results. The kept die is highlighted in gold (ADV) or red (DIS). The dropped die is dimmed. The result display shows: "ADV: [high] / ~~[low]~~ + [mod] = [total]"
- [ ] **T26.3.3** — ADV/DIS toggles auto-reset after each roll (one-shot behavior). Add a "Lock" option (pin icon) to keep advantage/disadvantage active for multiple consecutive rolls
- [ ] **T26.3.4** — When rolling from the character sheet (e.g., clicking a skill), show a pre-roll dialog asking: "Normal / Advantage / Disadvantage?" — or default to normal and let the user long-press for options

### Story 26.4 — Roll History Log

> As a player, I need to see my recent roll history so I can reference past results and resolve disputes.

**Tasks:**

- [ ] **T26.4.1** — Create `components/dice/RollHistory.tsx` — a scrollable list in the bottom section of the dice panel. Each entry shows: timestamp, roll expression (e.g., "1d20 + 5"), individual die results, total, source label (e.g., "Perception Check", "Longsword Attack")
- [ ] **T26.4.2** — Store roll history in the dice store (Zustand). Persist the last 50 rolls per session. Clear on page reload (session-scoped) or offer a "Clear History" button
- [ ] **T26.4.3** — Color-code entries: green border for natural 20, red border for natural 1, gold for max possible damage, default border for normal rolls
- [ ] **T26.4.4** — Clicking a history entry re-rolls the same expression (quick re-roll). Long-press copies the result text to clipboard
- [ ] **T26.4.5** — Collapsible history section with a "N rolls" counter in the header. Mobile: swipe up to expand history, swipe down to collapse

### Story 26.5 — Character Sheet Roll Integration

> As a player, I need to roll directly from values on my character sheet — tapping a skill, save, attack, or initiative should automatically roll with the correct modifier.

**Tasks:**

- [ ] **T26.5.1** — Add a d20 icon next to every rollable value on the character sheet: all 18 skills, all 6 saving throws, initiative, each attack row, and death saves. The icon is subtle in view mode (appears on hover/tap)
- [ ] **T26.5.2** — Clicking a rollable value: opens the dice panel (if closed), auto-populates the roll expression (1d20 + modifier), and immediately triggers the roll. The roll history entry is labeled with the source (e.g., "Stealth Check (+7)")
- [ ] **T26.5.3** — For attack rolls: roll attack (1d20 + attack bonus) first. If hit, auto-prompt "Roll Damage?" and pre-populate the weapon's damage expression. Show attack and damage results together
- [ ] **T26.5.4** — For spell attacks: same as weapon attacks but with spell attack bonus. For spell save DCs: show "Spell Save DC: [N] — Target must beat [N]" instead of rolling (the DM rolls, not the caster)
- [ ] **T26.5.5** — Critical hit automation: if the d20 shows a natural 20 on an attack roll, automatically double the damage dice in the damage roll prompt (e.g., 2d8 + 3 instead of 1d8 + 3). Show a "CRITICAL HIT!" banner
- [ ] **T26.5.6** — For ability checks (not skills): add rollable icons next to each ability modifier in the ability score blocks. Roll 1d20 + ability modifier
- [ ] **T26.5.7** — Death save roll button: rolls 1d20 with no modifier. Auto-fills the death save success/failure circle based on the result (10+ = success, 9− = failure, 20 = critical success/regain 1 HP, 1 = 2 failures)

---

## Epic 27: HP Tracker

**Goal:** An interactive hit point management system that correctly applies 5e damage/healing rules, tracks temporary HP, handles instant death from massive damage, and provides quick damage/heal input accessible from both the character sheet and a compact floating widget.

### Story 27.1 — Damage & Healing Input

> As a player during combat, I need to quickly apply damage or healing to my character with the correct 5e rules for temp HP, overflow damage, and max HP caps.

**Tasks:**

- [ ] **T27.1.1** — Enhance the Phase 3 HP block (`components/character/page1/HitPointBlock.tsx`) with a quick-input overlay. Clicking the HP number (or the +/− buttons) opens an input modal with two tabs: "Take Damage" and "Heal"
- [ ] **T27.1.2** — **Take Damage tab:** numeric input for damage amount, optional damage type dropdown (for resistance/vulnerability tracking), "Apply" button. Below the input, show a real-time preview: "Current: 25 → After: 18 (7 damage)" or "Current: 25 → 0 HP (instant death: damage exceeds max HP)" if applicable
- [ ] **T27.1.3** — Damage application logic (strict 5e rules):
  1. If temp HP > 0: subtract damage from temp HP first
  2. Remaining damage (after temp HP absorbed) subtracts from current HP
  3. Current HP cannot go below 0
  4. If remaining damage after reaching 0 HP ≥ max HP: **instant death** (show dramatic warning modal: "Massive Damage! Your character is killed instantly.")
  5. If current HP reaches 0 (not instant death): character is unconscious, reset death saves to 0/0, show unconscious condition badge
- [ ] **T27.1.4** — **Resistance/Vulnerability:** if a damage type is selected and the character has resistance to that type, auto-halve the damage (round down) and show "(Resisted: half damage)." If vulnerable, auto-double. If immune, set damage to 0 and show "(Immune)"
- [ ] **T27.1.5** — **Heal tab:** numeric input for healing amount. Healing adds to current HP up to max HP. If at 0 HP: healing stabilizes the character, resets death saves, removes unconscious condition. Show preview: "Current: 0 → After: 8 (stabilized!)"
- [ ] **T27.1.6** — Log each damage/heal event in a mini-history (last 10 events) visible in the HP block: "[−7 slashing] [+12 healing] [−4 fire (resisted from 8)]"
- [ ] **T27.1.7** — Keyboard shortcuts in the HP modal: number keys to input amount, Enter to apply, Tab to switch between Damage/Heal tabs

### Story 27.2 — Temporary HP Management

> As a player, I need to track temporary hit points with the correct stacking rules.

**Tasks:**

- [ ] **T27.2.1** — The temp HP field is always editable (even in view mode). Setting temp HP: if the character already has temp HP, the new value replaces the old only if it's higher (5e rule: temp HP don't stack, you choose the higher). Show a tooltip: "Temp HP don't stack. Keep the higher value."
- [ ] **T27.2.2** — When damage is applied, temp HP depletion is animated: the temp HP number counts down visually before the current HP starts reducing
- [ ] **T27.2.3** — Temp HP visual: display in a blue-tinted shield overlay on the HP bar. When temp HP is present, the HP bar shows two segments: blue (temp) stacked on top of the normal HP color gradient

### Story 27.3 — Compact HP Widget (Session Play)

> As a player on mobile during a session, I need a compact HP tracker visible without scrolling through the full character sheet.

**Tasks:**

- [ ] **T27.3.1** — Create `components/session/CompactHPWidget.tsx` — a sticky floating widget at the bottom of the mobile character sheet view (above the FAB). Shows: current HP / max HP in large text, temp HP badge (if nonzero), AC badge, and two large tap targets: shield icon (take damage) and heart icon (heal)
- [ ] **T27.3.2** — The compact widget triggers the same damage/heal modal as the full HP block
- [ ] **T27.3.3** — Widget is collapsible: swipe down to minimize to a thin bar showing just "HP: 25/35 | AC: 16"
- [ ] **T27.3.4** — The widget persists across tab changes within the character sheet (stays visible whether on Core Stats, Backstory, or Spells tab)

---

## Epic 28: Spell Slot Tracker

**Goal:** An interactive spell slot management system integrated into the character sheet's spellcasting page, allowing players to expend and recover spell slots during play, with correct handling of Warlock Pact Magic, Arcane Recovery, and rest-based recovery.

### Story 28.1 — Spell Slot Expend & Recover UI

> As a spellcaster during a session, I need to mark spell slots as used when I cast spells and recover them on rest.

**Tasks:**

- [ ] **T28.1.1** — Enhance the Phase 3 spell slot tracker (`SpellLevelSection.tsx`): each spell slot is now a clickable circle. Filled circle = available. Crossed/dimmed circle = expended. Click to toggle between available and expended. Always interactive (even in view mode since this is session tracking)
- [ ] **T28.1.2** — When a player clicks a spell name to "cast" it, auto-prompt: "Expend a level [N] slot?" with options to upcast at higher levels. On confirm, mark one slot of the chosen level as expended
- [ ] **T28.1.3** — Show a running summary at the top of the spell page: "Slots: 2/4 (1st) · 1/3 (2nd) · 3/3 (3rd)" with color coding (green if >50% available, yellow if ≤50%, red if 0)
- [ ] **T28.1.4** — Prevent casting when no slots of the required level remain: show the spell as dimmed with a "No slots available" tooltip. Allow the player to override (some class features grant free casts)
- [ ] **T28.1.5** — Ritual casting: spells with the "Ritual" tag can be cast without expending a slot. Show a "Cast as Ritual" button alongside "Cast with Slot." Ritual casting takes 10 extra minutes (display this note)

### Story 28.2 — Warlock Pact Magic Slots

> As a Warlock, my spell slots work differently — they all recover on short rest and are always cast at my highest available level.

**Tasks:**

- [ ] **T28.2.1** — Detect Warlock class and render Pact Magic slots in a separate, distinctly styled section (different color — purple accent instead of blue). Label: "Pact Magic Slots (Short Rest Recovery)"
- [ ] **T28.2.2** — Pact Magic slots are always at the same level: display "2 × Level [N] Slots" rather than individual level sections. For example, at Warlock level 5: "2 × 3rd Level Slots"
- [ ] **T28.2.3** — When the short rest automation runs, Pact Magic slots recover to full. Regular spell slots (if multiclassed) do not recover on short rest
- [ ] **T28.2.4** — If the character is multiclassed (Warlock + another caster), show Pact Magic slots separately from the standard spell slot table, with a clear visual divider and label

### Story 28.3 — Arcane Recovery (Wizard)

> As a Wizard, I can recover some spell slots once per day during a short rest using Arcane Recovery.

**Tasks:**

- [ ] **T28.3.1** — Detect Wizard class and add an "Arcane Recovery" button to the spell page. Label: "Arcane Recovery (1/day, during Short Rest)"
- [ ] **T28.3.2** — On click, open a modal: "Choose spell slots to recover. Total slot levels recovered cannot exceed [ceil(Wizard level / 2)]. No slot can be 6th level or higher." Show a selection interface where the player picks specific slots to recover
- [ ] **T28.3.3** — Track whether Arcane Recovery has been used today with a checkbox. Reset on long rest
- [ ] **T28.3.4** — During the short rest automation, prompt: "Use Arcane Recovery?" if it hasn't been used yet

---

## Epic 29: Conditions Tracker

**Goal:** A visual conditions management system showing all 14 standard 5e conditions plus exhaustion levels, with mechanical effect descriptions and visual indicators on the character sheet.

### Story 29.1 — Active Conditions Display

> As a player, I need to see which conditions are currently affecting my character and what their mechanical effects are.

**Tasks:**

- [ ] **T29.1.1** — Create `components/character/ConditionsTracker.tsx` — displayed on the character sheet Page 1 as a horizontal badge strip below the combat stats row (AC/Init/Speed). When no conditions are active, show a subtle "No conditions" placeholder
- [ ] **T29.1.2** — Each active condition renders as a colored badge with an icon and condition name. Color coding: red for debilitating (blinded, paralyzed, stunned, unconscious, petrified), orange for moderate (frightened, poisoned, restrained, exhaustion), yellow for mild (charmed, deafened, grappled, prone), green for beneficial (invisible)
- [ ] **T29.1.3** — Clicking a condition badge shows a tooltip/popover with: condition name, full mechanical effects text (from the SRD conditions data created in Phase 1), and a "Remove" button
- [ ] **T29.1.4** — For **Exhaustion**: display as "Exhaustion [N]" with the level number (1-6). The tooltip shows all current cumulative effects. Level 6 shows a death warning: "Level 6: Death"

### Story 29.2 — Add / Remove Conditions

> As a player, I need to easily add and remove conditions as they're applied during gameplay.

**Tasks:**

- [ ] **T29.2.1** — "Add Condition" button (+ icon) at the end of the conditions strip. Opens a dropdown/modal showing all 14 conditions + exhaustion as selectable options. Each shows name and a one-line summary
- [ ] **T29.2.2** — Selecting a condition adds it to the active list immediately. If the condition is already active, show a note: "Already active" (conditions don't stack except exhaustion)
- [ ] **T29.2.3** — For **Exhaustion**: selecting it increments the level by 1 (up to 6). Show the current level and a +/− stepper. Each increment shows the new cumulative effect. Reaching level 6 triggers a dramatic warning: "Your character dies from exhaustion!"
- [ ] **T29.2.4** — "Remove Condition" via the badge's remove button or by clicking the condition in the add dropdown (toggle behavior). Removing exhaustion decrements by 1 level (not full removal)
- [ ] **T29.2.5** — Quick-add shortcuts: conditions that commonly come from specific triggers show contextual suggestions. For example, when HP reaches 0, auto-suggest adding "Unconscious." When a prone-causing effect is used, suggest "Prone"
- [ ] **T29.2.6** — Persist active conditions in the character data (auto-save). Conditions survive page refresh. Long rest automation clears certain conditions automatically (exhaustion −1 level)

### Story 29.3 — Condition Effects on Sheet Display

> As a player, I need to see how active conditions modify my rolls and stats directly on the character sheet.

**Tasks:**

- [ ] **T29.3.1** — When **Poisoned** is active: show a subtle poison icon next to all attack roll values and ability check modifiers. Tooltip on these values adds: "(Disadvantage from Poisoned)"
- [ ] **T29.3.2** — When **Blinded** is active: flag attack rolls with disadvantage icon. Show "(Auto-fail sight-based checks)" on relevant skill modifiers
- [ ] **T29.3.3** — When **Prone** is active: flag attack rolls with disadvantage. Show a note on the combat stats: "Attackers within 5ft have advantage"
- [ ] **T29.3.4** — When **Restrained** is active: speed shows as "0 ft" (overridden). DEX saves flagged with disadvantage. Attack rolls flagged with disadvantage
- [ ] **T29.3.5** — When **Frightened** is active: ability checks and attack rolls flagged with disadvantage
- [ ] **T29.3.6** — When **Paralyzed/Stunned/Unconscious** is active: show a prominent full-width banner on the character sheet: "PARALYZED — Cannot move, speak, or take actions. Auto-fail STR/DEX saves." with the condition's color
- [ ] **T29.3.7** — When **Exhaustion** is active: Level 1: flag ability checks with disadvantage. Level 2: show speed as halved. Level 3: flag attack rolls and saves with disadvantage. Level 4: show HP max as halved. Level 5: show speed as 0. Display all cumulative effects
- [ ] **T29.3.8** — When **Invisible** is active: show a green badge on attack rolls ("Advantage — Invisible") and note that attacks against the character have disadvantage
- [ ] **T29.3.9** — Implement a `getConditionModifiers(conditions: Condition[])` utility function that returns all active modifiers from conditions. The character sheet display layer reads these modifiers and applies appropriate visual indicators

---

## Epic 30: Short Rest & Long Rest Automation

**Goal:** One-button rest actions that correctly recover the right resources — HP via hit dice (short rest), all HP + half hit dice + spell slots + class features (long rest), plus exhaustion reduction and death save reset, with clear summary of what was recovered.

### Story 30.1 — Short Rest Flow

> As a player, I need a "Short Rest" button that walks me through spending hit dice to recover HP and resets short-rest features.

**Tasks:**

- [ ] **T30.1.1** — Create `components/session/ShortRestModal.tsx` — triggered from a "Short Rest" button on the character sheet's quick-action bar (bottom of sheet or floating menu). Opens a modal workflow
- [ ] **T30.1.2** — **Step 1: Hit Dice Spending.** Show available hit dice (total minus used). For each available die, show a "Spend" button. Clicking "Spend" rolls the hit die + CON modifier, adds the result to current HP (up to max), and marks that die as used. Show the roll result: "Spent 1d10 + 2 = 8 HP recovered (HP: 18 → 26)." Allow spending multiple dice sequentially
- [ ] **T30.1.3** — For multiclass characters, show each class's hit dice separately with distinct die types. Let the player choose which die type to spend
- [ ] **T30.1.4** — "Take Average" toggle: instead of rolling, use the average value (ceil(die/2) + CON mod). E.g., d10 average = 6 + CON mod. This is a common house rule option
- [ ] **T30.1.5** — **Step 2: Feature Recovery.** Auto-recover all short-rest class features. Show a summary list: "Recovered: Second Wind (1/1), Channel Divinity (1/1), Warlock Spell Slots (2/2)." Each recovered feature shows its name and restored count
- [ ] **T30.1.6** — **Wizard Arcane Recovery prompt:** if the character is a Wizard and Arcane Recovery hasn't been used today, prompt: "Use Arcane Recovery to restore spell slots?" If yes, open the Arcane Recovery modal (from Epic 28)
- [ ] **T30.1.7** — **Step 3: Summary.** Show a complete rest summary: HP before/after, hit dice spent, features recovered. "Finish Short Rest" button closes the modal and saves all changes
- [ ] **T30.1.8** — Duration note at the top of the modal: "A short rest takes at least 1 hour of light activity"

### Story 30.2 — Long Rest Flow

> As a player, I need a "Long Rest" button that fully recovers my HP, restores spell slots, recovers class features, regains half my hit dice, and reduces exhaustion.

**Tasks:**

- [ ] **T30.2.1** — Create `components/session/LongRestModal.tsx` — triggered from the "Long Rest" button. Opens a summary modal showing all recovery effects
- [ ] **T30.2.2** — **Automatic recovery (no choices needed):**
  - Current HP → Max HP (full recovery)
  - All spell slots → fully restored (display: "Spell Slots: All recovered")
  - All long-rest class features → restored (list each: "Rage (2/2), Bardic Inspiration (3/3), Lay on Hands (10/10)")
  - Death saves → reset to 0 successes / 0 failures
  - Temp HP → remains (temp HP persist through rests)
- [ ] **T30.2.3** — **Hit Dice recovery:** recover spent hit dice up to half your total (minimum 1, round down). Show: "Hit Dice: Recovered 2 of 4 spent (now 6/8 total)." If fewer than half were spent, recover all spent dice
- [ ] **T30.2.4** — **Exhaustion reduction:** if the character has any exhaustion levels, reduce by 1. Show: "Exhaustion: Level 3 → Level 2." Note: "Requires food and water during the rest"
- [ ] **T30.2.5** — **Conditions that end:** auto-remove conditions that typically end on long rest (DM discretion, but suggest clearing transient combat conditions). Show a checklist letting the player confirm which conditions to clear
- [ ] **T30.2.6** — **Summary panel:** show complete before/after comparison: HP, spell slots per level, hit dice, exhaustion level, features recovered. "Finish Long Rest" button applies all changes and saves
- [ ] **T30.2.7** — Duration note: "A long rest takes at least 8 hours, with no more than 2 hours of light activity"
- [ ] **T30.2.8** — Guard: "You can only benefit from one long rest per 24-hour period." Track last long rest timestamp. If a second long rest is attempted within 24 hours (in-game time), show a warning (not blocking, since the app doesn't track in-game time precisely)

### Story 30.3 — Class Feature Usage Tracking

> As a developer, I need a system to track uses remaining for all limited-use class features, integrated with the rest recovery system.

**Tasks:**

- [ ] **T30.3.1** — Extend the `Feature` type in the character data model to include: `maxUses: number | null`, `usesRemaining: number`, `recoversOn: 'short_rest' | 'long_rest' | 'special' | null`, `currentLevel: number` (for features whose uses scale with level)
- [ ] **T30.3.2** — On the character sheet's Features & Traits section (Page 1, right column), display limited-use features with usage counters: filled circles for remaining uses, empty circles for expended uses. Clicking a circle expends a use. Clicking an expended circle recovers a use (manual override)
- [ ] **T30.3.3** — Create `utils/restRecovery.ts` with functions:
  - `applyShortRest(character): RestResult` — recovers short-rest features, returns summary
  - `applyLongRest(character): RestResult` — recovers all features + HP + slots + dice + exhaustion, returns summary
- [ ] **T30.3.4** — Map all SRD class features to their recovery type in the data layer. Include: Second Wind (short), Action Surge (short), Rage (long), Bardic Inspiration (long, short at 5+), Channel Divinity (short), Wild Shape (short), Ki Points (short), Lay on Hands (long), Sorcery Points (long), Arcane Recovery (long), plus subclass features
- [ ] **T30.3.5** — For features whose max uses change with level (e.g., Rage: 2 at Lv 1, 3 at Lv 3, 4 at Lv 6, etc.), the level-up flow must update `maxUses` when the threshold is crossed

---

## Epic 31: Level Up Flow

**Goal:** A guided, step-by-step level advancement wizard that handles the full complexity of D&D 5e leveling — HP increase (roll or average), new class features, subclass selection, ability score improvement / feat selection, spell slot progression, new spells, cantrip scaling, proficiency bonus increases, and feature use scaling — for all 12 classes across levels 1–20.

### Story 31.1 — Level Up Entry & Overview

> As a player, I need a "Level Up" button that shows me what I gain at the next level and walks me through each decision.

**Tasks:**

- [ ] **T31.1.1** — Add a "Level Up" button to the character sheet's quick-action bar (and the character gallery card context menu). Button is visually distinct (accent-gold with a sparkle icon). If the character's XP meets the next level threshold, show a pulsing notification badge
- [ ] **T31.1.2** — Create `components/levelup/LevelUpWizard.tsx` — a modal wizard (reusing the wizard framework pattern from Phase 2). Steps are dynamically generated based on what the new level grants
- [ ] **T31.1.3** — **Level Up Overview screen (Step 0):** "Level Up to [N]!" header with a summary card showing everything the new level provides: HP increase method, new class features (listed by name), new proficiency bonus (if changed), subclass selection (if applicable), ASI/feat (if applicable), new spell slots (if caster), new spells known/prepared (if caster). Each item is a preview row; items requiring decisions have a "(Choose)" badge
- [ ] **T31.1.4** — Dynamically build the step list based on what the new level grants. For a non-caster at a non-ASI level, there may only be 2 steps (HP + features). For a caster at an ASI level with a subclass choice, there could be 5+ steps
- [ ] **T31.1.5** — Support leveling up multiple levels at once (e.g., DM grants 2 levels via milestone). Walk through each level sequentially, showing which level's decisions are being made

### Story 31.2 — HP Increase Step

> As a player leveling up, I need to increase my hit point maximum by rolling my hit die or taking the average.

**Tasks:**

- [ ] **T31.2.1** — Create `components/levelup/HPIncreaseStep.tsx` — two options: "Roll" and "Take Average"
- [ ] **T31.2.2** — **Roll option:** display the class hit die (e.g., "d10 for Fighter"). Click "Roll" to animate a single die roll using the dice engine. Show: "Rolled: [result] + CON Mod ([N]) = [total] HP gained." Minimum HP gained is 1 (even with negative CON). Add the total to max HP
- [ ] **T31.2.3** — **Average option:** show the fixed average value: "Average: [ceil(die/2)] + CON Mod ([N]) = [total] HP gained." E.g., Fighter d10: 6 + CON mod. No randomness. Add to max HP
- [ ] **T31.2.4** — Display the HP change: "HP Max: [old] → [new]"
- [ ] **T31.2.5** — If CON modifier changed since last level (due to ASI at this level), recalculate retroactively: each previous level also gains the CON mod difference. Show: "Retroactive CON increase: +[N] HP from [M] previous levels"

### Story 31.3 — New Class Features Step

> As a player, I need to see what new class features I gain at this level and make any required choices within those features.

**Tasks:**

- [ ] **T31.3.1** — Create `components/levelup/NewFeaturesStep.tsx` — lists all new features gained at the new level, pulled from the class and subclass data. Each feature shows its name, full description, and any choices
- [ ] **T31.3.2** — Features that involve choices (e.g., Fighting Style at Fighter 1, Metamagic options for Sorcerer, Maneuver choices for Battle Master) present inline selection interfaces. The player must make all required choices before proceeding
- [ ] **T31.3.3** — Features with scaling values update automatically: Sneak Attack dice increase, Rage damage bonus increase, Ki point pool increase, Sorcery point pool increase, Channel Divinity uses increase, etc. Show: "Sneak Attack: 1d6 → 2d6" as informational (no choice needed)
- [ ] **T31.3.4** — If the proficiency bonus increases at this level (levels 5, 9, 13, 17), show it prominently: "Proficiency Bonus: +2 → +3. This affects all proficient skills, saves, and attacks."
- [ ] **T31.3.5** — Extra Attack notification at level 5 (for Fighter, Barbarian, Paladin, Ranger, Monk): "You can now attack twice when you take the Attack action!" Fighter level 11: "Three attacks!" Fighter level 20: "Four attacks!"
- [ ] **T31.3.6** — For features that grant new proficiencies (e.g., heavy armor from a multiclass dip or subclass), add them to the character's proficiency lists

### Story 31.4 — Subclass Selection Step (Conditional)

> As a player reaching a subclass selection level, I need to choose my subclass with full information about each option.

**Tasks:**

- [ ] **T31.4.1** — Create `components/levelup/SubclassSelectionStep.tsx` — conditionally rendered when the character reaches their class's subclass level and hasn't yet chosen one. Reuses the SubclassSelector from Phase 2 (Story 10.4) in a modal context
- [ ] **T31.4.2** — Show all available subclass options for the class with: name, description, features gained at this level, and a preview of features at future levels
- [ ] **T31.4.3** — On selection, add the subclass's features to the character and update the class display on the banner: "Level 3 Champion Fighter" or "Level 3 Thief Rogue"
- [ ] **T31.4.4** — For classes that chose their subclass at level 1 (Cleric, Sorcerer, Warlock), this step is skipped during level-up (already chosen during creation). Instead, apply the subclass features granted at higher levels automatically

### Story 31.5 — ASI / Feat Selection Step (Conditional)

> As a player reaching an ASI level, I need to choose between increasing ability scores or taking a feat.

**Tasks:**

- [ ] **T31.5.1** — Create `components/levelup/ASIStep.tsx` — conditionally rendered when the new level is an ASI level for the character's class. Two mode cards: "Ability Score Increase" and "Choose a Feat"
- [ ] **T31.5.2** — **ASI mode:** three sub-options:
  - "+2 to one ability": dropdown of all 6 abilities. Selected ability increases by 2 (cannot exceed 20). Show modifier change: "STR: 16 (+3) → 18 (+4)"
  - "+1 to two abilities": two dropdowns. Each selected ability increases by 1 (cannot exceed 20). Can select the same ability twice (equivalent to +2)
  - Show the cap: "Ability scores cannot exceed 20 through ASI"
- [ ] **T31.5.3** — **Feat mode:** reuse the FeatPicker from Phase 2 (Story 9.4.3). Show all available feats with prerequisites. Feats the character doesn't qualify for are disabled with an explanation. Selecting a feat applies its effects: some feats grant +1 to an ability (show the ability selector), some grant proficiencies, some grant special abilities
- [ ] **T31.5.4** — After ASI/feat selection, immediately recalculate all derived stats affected by the ability score change. Show a summary: "Stats Changed: STR Mod +3 → +4, Athletics +5 → +6, Melee Attack +5 → +6, STR Save +5 → +6"
- [ ] **T31.5.5** — **Cantrip replacement (2024 rules optional):** at ASI levels, the player may optionally replace one cantrip with another from the same class. Show: "Would you like to replace a cantrip?" as an optional sub-step

### Story 31.6 — Spell Progression Step (Conditional, Casters)

> As a spellcaster leveling up, I need to gain new spell slots, learn or prepare new spells, and optionally swap one known spell.

**Tasks:**

- [ ] **T31.6.1** — Create `components/levelup/SpellProgressionStep.tsx` — conditionally rendered for casters. Shows all spellcasting changes at the new level
- [ ] **T31.6.2** — **New Spell Slots:** display the before/after spell slot table. Highlight new slots in gold: "1st Level: 3 → 4 slots. New: 2nd Level: 2 slots (unlocked!)." For new spell levels unlocked, show excitement: "You can now cast 2nd level spells!"
- [ ] **T31.6.3** — **New Cantrips (if applicable):** if the class gains a new cantrip at this level, open the cantrip picker. Show the class's available cantrips, excluding those already known
- [ ] **T31.6.4** — **Known Casters (Bard, Sorcerer, Warlock, Ranger):**
  - Show "Spells Known: [old] → [new]." Open the spell browser to select new spells from the newly available levels plus lower levels
  - "Swap one known spell: You may replace one spell you know with another of the same level or lower." Show the current known spell list with "Replace" buttons, then open the browser for the replacement
- [ ] **T31.6.5** — **Prepared Casters (Cleric, Druid, Paladin):**
  - Show "Prepared Spell Limit: [old] → [new]." The full spell list is always available; the limit for daily preparation just increased
  - If new spell levels are unlocked, highlight the new spells available: "New spells available: Aid, Hold Person, Lesser Restoration..."
- [ ] **T31.6.6** — **Wizard Spellbook:**
  - "Add 2 spells to your spellbook from the Wizard spell list." Open the spell browser for selection. These can be from any level the Wizard has spell slots for
  - Show the updated prepared limit: "Prepared: INT Mod ([N]) + Wizard Level ([M]) = [total]"
- [ ] **T31.6.7** — **Warlock Pact Magic:** show the updated slot level and count. "Pact Magic: 2 × 2nd Level → 2 × 2nd Level" (or level/count change if applicable)
- [ ] **T31.6.8** — **Cantrip damage scaling:** at character levels 5, 11, and 17, show: "Your cantrip damage increases! Fire Bolt: 1d10 → 2d10." Update the stored cantrip damage data on the character

### Story 31.7 — Level Up Review & Apply

> As a player, I need to see a summary of all level-up changes before confirming, and have the character sheet update to reflect the new level.

**Tasks:**

- [ ] **T31.7.1** — Create `components/levelup/LevelUpReview.tsx` — a summary screen showing all changes made during the level-up wizard:
  - Level: [old] → [new]
  - HP Max: [old] → [new] (rolled/average: [result])
  - Proficiency Bonus: [old] → [new] (if changed)
  - Ability Scores: any ASI changes
  - Feat: name (if selected)
  - Subclass: name (if selected)
  - New Features: list of feature names
  - Spell Slots: before/after table (if caster)
  - New Spells: list of new spell names (if caster)
  - Swapped Spell: old → new (if applicable)
- [ ] **T31.7.2** — "Apply Level Up" button: commits all changes to the character in IndexedDB. Runs the full calculation engine to recalculate all derived stats. Shows a success celebration: "Welcome to Level [N]!"
- [ ] **T31.7.3** — "Cancel Level Up" button: discards all level-up state and returns to the character sheet at the current level. Confirmation dialog: "Discard all level-up choices?"
- [ ] **T31.7.4** — Update the character gallery card to show the new level immediately after applying
- [ ] **T31.7.5** — If XP-based progression: auto-update XP display. If milestone-based: allow the DM to simply click "Level Up" without XP considerations

---

## Epic 32: Session Play Compact View

**Goal:** A mobile-optimized compact character view designed specifically for at-the-table play, showing only the most frequently referenced information with large touch targets and quick-access actions.

### Story 32.1 — Compact Session Mode

> As a player using my phone at the table, I need a streamlined view that shows my key stats, attacks, and spell slots without scrolling through the full character sheet.

**Tasks:**

- [ ] **T32.1.1** — Create `components/session/SessionView.tsx` — a compact single-screen layout accessible via a "Session Mode" toggle in the character sheet header (or auto-activated when the viewport is ≤640px and in view mode)
- [ ] **T32.1.2** — Session view layout (top to bottom):
  - **Top strip:** Character name, level, class. AC and Speed badges
  - **HP bar:** large, spanning full width. Current HP / Max HP with color gradient. Temp HP overlay. Tap to open damage/heal modal
  - **Quick Actions row:** four large icon buttons — Roll d20, Short Rest, Long Rest, Conditions
  - **Attacks section:** card per weapon/cantrip showing name, attack bonus, and damage. Tap to roll attack + damage
  - **Spell Slots strip:** compact horizontal display of all slot levels. Tap a slot to expend. Shows cantrip list as text
  - **Key abilities:** most-used skills and saves (customizable: player picks their "pinned" skills/saves, default to class primary + Perception + Stealth + Athletics)
  - **Conditions strip:** active condition badges (same as full sheet)
  - **Features with uses:** compact list of limited-use features with usage counters
- [ ] **T32.1.3** — All values are interactive: tap a skill to roll, tap a spell slot to expend, tap an attack to roll, tap HP to damage/heal
- [ ] **T32.1.4** — "Full Sheet" toggle at the bottom: switches back to the complete character sheet view
- [ ] **T32.1.5** — Long-press on any stat opens a tooltip with the computation breakdown (same tooltips as the full sheet)

### Story 32.2 — Pinned Skills & Customization

> As a player, I want to choose which skills and abilities appear in my session compact view so I see what's relevant to my character.

**Tasks:**

- [ ] **T32.2.1** — Create a "Customize Session View" settings modal: checkboxes for all 18 skills and 6 saves. Default pinned: class-primary skills + Perception + Stealth + Athletics + Investigation. Limit: 8 pinned items
- [ ] **T32.2.2** — Persist pinned selections in the character data (per-character, not global)
- [ ] **T32.2.3** — Add a "Pin" star icon to skills in the full character sheet: toggling it adds/removes the skill from the session view
- [ ] **T32.2.4** — Pinned skills in session view show: skill name, modifier (large font, rollable), and proficiency dot. Grouped by ability score with the ability abbreviation as a section header

---

## Phase 4 Completion Criteria

Before moving to Phase 5, ALL of the following must be true:

1. **Dice Roller:** Roll any combination of d4/d6/d8/d10/d12/d20/d100. Custom expression input parsing. Advantage/disadvantage toggle. Animated dice with sound (toggleable). Roll history (50 entries). Critical hit/fumble detection with visual/audio feedback
2. **Sheet Roll Integration:** Clicking any skill, save, attack, initiative, ability check, or death save on the character sheet triggers the correct roll with proper modifier. Attack rolls chain to damage rolls. Critical hits double damage dice. Death save results auto-fill circles
3. **HP Tracker:** Damage correctly reduces temp HP first, then current HP. Overflow damage cannot go below 0. Massive damage (remaining ≥ max HP) triggers instant death warning. Healing caps at max HP. Healing from 0 HP stabilizes and resets death saves. Resistance halves damage; vulnerability doubles. Damage/heal history log
4. **Spell Slot Tracker:** Click-to-expend spell slots per level. Slot recovery on rest. Ritual casting option. Warlock Pact Magic tracked separately with short rest recovery. Wizard Arcane Recovery modal. Prepared spell count enforcement. Upcast prompt when casting
5. **Conditions Tracker:** All 14 standard conditions + exhaustion (6 levels). Add/remove/toggle conditions. Exhaustion increments/decrements with cumulative effect display. Condition badges on character sheet. Mechanical effect indicators on affected rolls (disadvantage/advantage flags). Auto-suggest unconscious at 0 HP
6. **Short Rest:** Hit dice spending with roll or average option. Multiclass die type selection. Short-rest feature recovery (Second Wind, Channel Divinity, Ki, Wild Shape, Warlock slots, etc.). Arcane Recovery prompt for Wizards. Complete summary
7. **Long Rest:** Full HP recovery. Half hit dice recovery (minimum 1). All spell slot recovery. All long-rest feature recovery. Death save reset. Exhaustion −1 level. Summary with before/after comparison
8. **Feature Use Tracking:** All limited-use class features have usage counters (filled/empty circles). Manual expend/recover. Correct recovery on short/long rest per feature data
9. **Level Up — HP:** Roll or average with CON mod. Retroactive CON adjustment if CON changed this level. Minimum 1 HP gained
10. **Level Up — Features:** All new class features displayed. Choice-based features (Fighting Style, Metamagic, Maneuvers) have selection interfaces. Scaling features auto-update. Proficiency bonus increase shown when applicable
11. **Level Up — Subclass:** Correct subclass selection at the right level per class. Subclass features applied. Class display updated
12. **Level Up — ASI/Feat:** +2 to one ability or +1 to two abilities with 20 cap. Full feat picker with prerequisite validation. Feat effects applied (ability bonuses, proficiencies, special abilities). Cascade recalculation of all affected derived stats
13. **Level Up — Spells:** New spell slots shown. New cantrips selectable (if applicable). Known casters: new spells + 1 swap. Prepared casters: updated preparation limit. Wizard: +2 spellbook spells. Cantrip damage scaling at 5/11/17
14. **Level Up — All Classes:** Level-up works for all 12 classes from level 1 to 20. Fighter gets 7 ASIs. Rogue gets 6. Every subclass selection level triggers correctly. All spell progressions accurate
15. **Session Compact View:** Mobile-optimized single-screen view. All key stats visible without scrolling. All values interactive (roll, expend, damage/heal). Customizable pinned skills
16. **Responsive:** All Phase 4 features work on mobile (640px), tablet (1024px), and desktop (1440px). Dice roller panel adapts to viewport. Session view auto-activates on mobile

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Epics | 7 (Epic 26–32) |
| Stories | 22 |
| Tasks | ~130 |
| New Components | ~30+ |
| Dice Animation States | 7 (one per die type) |
| Conditions Tracked | 15 (14 standard + exhaustion with 6 levels) |
| Class Feature Recovery Rules | ~25 distinct features mapped |
| Level-Up Decision Points | 6 per level (HP, features, subclass, ASI/feat, spells, review) |
| Classes × 20 Levels | 240 unique level-up scenarios |

---

## Dependency Graph

```
Epic 26 (Dice Roller) ← independent, can be built first
  │
  ├── Story 26.5 (Sheet Integration) ← depends on Phase 3 character sheet
  │
Epic 27 (HP Tracker) ← depends on dice roller for healing rolls
  │
Epic 28 (Spell Slot Tracker) ← independent of dice, depends on Phase 3 spell page
  │
Epic 29 (Conditions Tracker) ← depends on Phase 1 conditions data
  │    └── Story 29.3 (Sheet Effects) ← depends on sheet display components
  │
Epic 30 (Short/Long Rest) ← depends on HP tracker, spell slots, feature tracking
  │    ├── Story 30.1 (Short Rest) ← uses dice roller for hit dice
  │    ├── Story 30.2 (Long Rest) ← resets HP, slots, features, exhaustion
  │    └── Story 30.3 (Feature Tracking) ← foundation for rest recovery
  │
Epic 31 (Level Up) ← complex, depends on most other systems
  │    ├── Story 31.2 (HP) ← uses dice roller
  │    ├── Story 31.5 (ASI/Feat) ← uses feat picker from Phase 2
  │    ├── Story 31.6 (Spells) ← uses spell browser from Phase 2
  │    └── Story 31.7 (Review) ← uses calculation engine
  │
Epic 32 (Session Compact View) ← depends on all above being functional
       └── integrates: dice, HP tracker, spell slots, conditions, features
```

**Recommended build order:**

1. **Week 7, Day 1-2:** Epic 26 (Dice Roller) — independent, enables all other sheet interactions
2. **Week 7, Day 3-4:** Epic 27 (HP Tracker) + Epic 28 (Spell Slot Tracker) — parallelizable
3. **Week 7, Day 5 → Week 8, Day 1:** Epic 29 (Conditions) + Epic 30 (Rest Automation) — rest depends on feature tracking
4. **Week 8, Day 2-4:** Epic 31 (Level Up) — the most complex epic, needs focused time
5. **Week 8, Day 5:** Epic 32 (Session Compact View) — integrates everything

---

## Open Questions for Phase 4

1. **Three.js vs CSS Dice:** The spec mentions Three.js as an option for dice animation. CSS 3D transforms are faster to build but less realistic. Three.js gives physics-based tumbling but adds ~150KB to the bundle. Recommend: CSS for Phase 4 launch, Three.js upgrade as a Phase 6 polish item.

2. **Multiclass Level Up:** The spec mentions multiclass support (F16) as a post-MVP feature, but the level-up flow needs to at least not break for multiclass characters. Should Phase 4 fully implement multiclass leveling or stub it? Recommend: stub it with a "Multiclass support coming soon" message and a manual override option. The data model already supports `class: ClassSelection[]` as an array.

3. **Level-Up Undo:** What if a player levels up incorrectly and wants to undo? The Phase 3 undo system stores 20 character snapshots, so a pre-level-up snapshot exists. Recommend: take an explicit named snapshot ("Before Level 8 → 9") that persists until the next level-up, accessible from settings.

4. **Spell Slot Tracking Between Sessions:** When a player closes the app mid-session with used spell slots, those should persist. But when they start a new session, should the app prompt "Start of new session — long rest?" Recommend: no auto-prompt (the app doesn't know if time passed in-game), but show a prominent "Long Rest" button.

5. **Condition Duration Tracking:** Some conditions last for a fixed duration (e.g., "frightened for 1 minute"). Should the app track duration with a timer? Recommend: no real-time timer in Phase 4. Just show the condition badge and let the DM/player remove it manually. Round/duration tracking is a Phase 5 DM tool.

6. **Level-Up for DM-Controlled Characters:** Should the DM be able to level up a player's character in their campaign? Recommend: yes in Phase 5 when DM features are built. Phase 4 focuses on player-initiated level-up only.
