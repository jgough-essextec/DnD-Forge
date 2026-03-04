# Story 4.3 — Combat Stat Calculations

> **Epic 4: Calculation Engine** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need functions for AC, initiative, speed, HP, and attack bonuses.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Armor Class (AC) calculation** — the most complex calculation in the game. Must handle all formulas:
  - Unarmored: 10 + DEX modifier
  - Barbarian Unarmored Defense: 10 + DEX modifier + CON modifier (only when not wearing armor)
  - Monk Unarmored Defense: 10 + DEX modifier + WIS modifier (only when not wearing armor)
  - Light armor (Padded, Leather, Studded Leather): base AC + full DEX modifier, no cap
  - Medium armor (Hide, Chain Shirt, Scale Mail, Breastplate, Half Plate): base AC + DEX modifier capped at +2 (or +3 with Medium Armor Master feat)
  - Heavy armor (Ring Mail, Chain Mail, Splint, Plate): flat base AC, no DEX contribution
  - Shield: +2 bonus added on top of any base AC formula
  - Fighting Style: Defense (+1 AC when wearing armor, not with Unarmored Defense)
  - Multiple base formulas do NOT stack — take the highest (e.g., if a Barbarian wears armor, they use armor AC, not Unarmored Defense)
- **Initiative**: DEX modifier + bonuses. Alert feat adds +5. Bard's Jack of All Trades adds half proficiency (since initiative is a DEX ability check without proficiency)
- **Speed**: Base from race (typically 25-35ft). Modifiers:
  - Heavy armor without meeting STR requirement: -10ft
  - Barbarian Fast Movement (level 5+): +10ft when not wearing heavy armor
  - Monk Unarmored Movement (level 2+): +10ft to +30ft when not wearing armor or shield
  - Mobile feat: +10ft
  - Dwarf special: speed not reduced by heavy armor (even without STR requirement)
  - Multiple speed types: walk, fly, swim, climb, burrow (some races/features grant these)
- **Hit Points**: First level: max hit die + CON modifier. Subsequent levels: rolled HP (or average: floor(die/2)+1) + CON modifier per level. Multiclass: each class contributes its own hit die type. Minimum 1 HP per level
- **Hit dice total**: One hit die per level, type determined by class. Multiclass characters have multiple hit die types (e.g., Fighter 3/Wizard 2 has 3d10 + 2d6)
- **Attack bonus**: STR modifier for melee weapons (or DEX if finesse), DEX modifier for ranged weapons, + proficiency bonus if proficient with the weapon type. Archery fighting style adds +2 to ranged attack rolls only
- **Weapon damage**: Damage dice + ability modifier (STR for melee, DEX for ranged/finesse). Dueling fighting style adds +2 damage when wielding a one-handed weapon with no off-hand weapon. Versatile weapons use a larger die when wielded two-handed
- **Encumbrance**: Current weight of all equipment vs carrying capacity (STR x 15). Variant encumbrance: STR x 5 = unencumbered, STR x 10 = encumbered (-10ft speed), above = heavily encumbered (-20ft speed, disadvantage on STR/DEX/CON checks/saves/attacks)

## Tasks
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
- [ ] **T4.3.8** — Implement `getEncumbrance(character: Character): Encumbrance` — calculate current weight from all equipment, carry capacity (STR x 15), encumbrance thresholds
- [ ] **T4.3.9** — Write unit tests: AC for every armor type + DEX combinations, AC for Barbarian unarmored with CON 16 + DEX 14, AC with shield, initiative with and without feats, HP calculation for Fighter (d10) levels 1-5 with CON 14, multiclass HP (Fighter 3 / Wizard 2), speed reduction from heavy armor without STR, attack bonus for finesse weapon using DEX vs STR

## Acceptance Criteria
- `getArmorClass()` returns correct AC for all armor types, unarmored defense variants, shield, and fighting style combinations
- AC calculation selects the highest base formula and does not stack multiple formulas
- Medium armor DEX cap is +2 normally, +3 with Medium Armor Master feat
- `getInitiative()` includes DEX mod, Alert feat, and Jack of All Trades
- `getSpeed()` accounts for race base speed, heavy armor penalty, Monk/Barbarian bonuses, Mobile feat, and Dwarf heavy armor exception
- `getHitPointMax()` correctly calculates for single-class and multiclass characters
- `getHitDiceTotal()` correctly groups hit dice by class for multiclass
- `getAttackBonus()` handles finesse (higher of STR/DEX), ranged (DEX), melee (STR), and Archery fighting style
- `getWeaponDamage()` handles versatile weapons, Dueling fighting style, and correct ability modifier
- `getEncumbrance()` calculates all thresholds correctly
- Unit tests cover all AC formulas, multiclass HP, speed edge cases, and weapon calculations

## Dependencies
- **Depends on:** Story 2.3 (HitDie, FightingStyle, ClassSelection), Story 2.4 (Weapon, Armor, Encumbrance, EquipmentItem), Story 2.7 (Speed), Story 2.8 (Character), Story 3.2 (class data for features), Story 3.4 (armor/weapon data), Story 4.1 (getModifier, getEffectiveAbilityScores), Story 4.2 (getProficiencyBonus)
- **Blocks:** Story 4.8 (validation checks calculated stats), Epic 5 (stored calculated values), Epic 6 (stores trigger recalculation)

## Notes
- The AC calculation is the most complex single function in the engine. Consider implementing it as a pipeline: (1) determine base AC formula, (2) apply DEX modifier with cap, (3) add shield, (4) add Defense fighting style
- Finesse weapons let the player use either STR or DEX — the calculation should use whichever is higher (since players always want the better modifier)
- Dueling fighting style specifically requires wielding a melee weapon in one hand with no weapon in the other hand. A character with a sword and shield qualifies, but dual-wielding does not
- Monk Unarmored Movement bonus scales: +10ft at level 2, +15ft at 6, +20ft at 10, +25ft at 14, +30ft at 18. Only applies when not wearing armor or carrying a shield
- For multiclass HP, only the first class grants the full hit die at level 1. Subsequent class levels use the rolled/average formula regardless
- The `getWeaponDamage` function should return a string like "1d8 + 3" or "2d6 + 5" for display purposes, including the ability modifier and any fighting style bonuses
