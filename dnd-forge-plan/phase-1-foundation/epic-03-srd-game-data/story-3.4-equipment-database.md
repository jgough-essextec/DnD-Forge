# Story 3.4 — Equipment Database

> **Epic 3: SRD Game Data Layer** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need all SRD weapons, armor, adventuring gear, tools, and packs as structured data.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Weapons**: All SRD weapons across 4 categories (Simple Melee, Simple Ranged, Martial Melee, Martial Ranged). Each weapon has: name, category, cost (in GP), damage dice + damage type, weight, and properties. Weapon properties include: Ammunition (with range), Finesse, Heavy, Light, Loading, Reach, Special, Thrown (with range), Two-Handed, Versatile (with alternate die)
- **Armor** (13 types + shield): Organized by category (Light, Medium, Heavy). Each armor has: name, category, cost, base AC, DEX modifier cap (null=uncapped, 2=medium max, 0=heavy), stealth disadvantage flag, STR requirement (for heavy armor), and weight
  - Light: Padded (11+DEX, stealth disadv), Leather (11+DEX), Studded Leather (12+DEX)
  - Medium: Hide (12+DEX max 2), Chain Shirt (13+DEX max 2), Scale Mail (14+DEX max 2, stealth disadv), Breastplate (14+DEX max 2), Half Plate (15+DEX max 2, stealth disadv)
  - Heavy: Ring Mail (14, stealth disadv), Chain Mail (16, STR 13, stealth disadv), Splint (17, STR 15, stealth disadv), Plate (18, STR 15, stealth disadv)
  - Shield: +2 AC
- **Adventuring gear**: All standard SRD items (rope, torches, rations, bedroll, etc.) with name, cost, weight, and description
- **Tools**: Artisan's tools (brewer's, carpenter's, cartographer's, cobbler's, cook's, glassblower's, jeweler's, leatherworker's, mason's, painter's, potter's, smith's, tinker's, weaver's, woodcarver's), gaming sets (dice, playing cards), musical instruments (various), thieves' tools, navigator's tools, herbalism kit, poisoner's kit, disguise kit, forgery kit
- **Equipment packs**: Pre-built bundles offered during character creation: Burglar's Pack, Diplomat's Pack, Dungeoneer's Pack, Entertainer's Pack, Explorer's Pack, Priest's Pack, Scholar's Pack. Each lists its contents and total cost
- **Starting gold by class**: Alternative to equipment packs — each class has a dice formula for random starting gold: Barbarian 2d4x10, Bard 5d4x10, Cleric 5d4x10, Druid 2d4x10, Fighter 5d4x10, Monk 5d4, Paladin 5d4x10, Ranger 5d4x10, Rogue 4d4x10, Sorcerer 3d4x10, Warlock 4d4x10, Wizard 4d4x10

## Tasks
- [ ] **T3.4.1** — Create `data/weapons.ts` with all SRD weapons. Each weapon must include: name, category (simple melee/ranged, martial melee/ranged), cost, damage dice + type, weight, properties array with relevant details (range for thrown/ammunition, versatile die)
- [ ] **T3.4.2** — Create `data/armor.ts` with all 13 armor types plus shields. Each must include: name, category (light/medium/heavy/shield), cost, base AC, DEX cap (null for uncapped, 0 for heavy), STR requirement, stealth disadvantage flag, weight
- [ ] **T3.4.3** — Create `data/adventuring-gear.ts` with all SRD gear items (rope, torches, rations, etc.)
- [ ] **T3.4.4** — Create `data/tools.ts` with all SRD tools (artisan's tools, gaming sets, musical instruments, thieves' tools, navigator's tools, etc.)
- [ ] **T3.4.5** — Create `data/equipment-packs.ts` with pre-built packs (Burglar's Pack, Diplomat's Pack, Dungeoneer's Pack, Entertainer's Pack, Explorer's Pack, Priest's Pack, Scholar's Pack) — listing contents and total cost
- [ ] **T3.4.6** — Create `data/starting-gold.ts` mapping each class ID to its starting gold dice formula

## Acceptance Criteria
- All SRD weapons are present with correct damage, properties, and categories
- All 13 armor types plus shields are present with correct AC formulas, DEX caps, and requirements
- Adventuring gear covers all standard SRD items
- All SRD tool types are present
- All 7 equipment packs list their complete contents with total cost
- Starting gold formulas are correct for all 12 classes
- Every data entry passes TypeScript type checking against its respective interface (Weapon, Armor, EquipmentItem)

## Dependencies
- **Depends on:** Story 2.4 (Weapon, Armor, EquipmentItem, EquipmentCategory, WeaponProperty, ArmorType, CurrencyAmount types)
- **Blocks:** Story 4.3 (Combat calculations use weapon/armor data), Story 4.6 (Currency/inventory calculations), Epic 6 Story 6.2 (Wizard store equipment selections)

## Notes
- Weapon properties should be stored as an array of `WeaponProperty` values, with additional data for range (Thrown/Ammunition) and versatile die stored alongside
- The Lance and Net weapons have the "Special" property with unique rules that should be documented in a `special` string field
- Monk weapons are a special case: at level 1, monks can use shortswords and any simple melee weapon that doesn't have the Two-Handed or Heavy property. This affects equipment selection in the wizard
- Equipment pack contents should reference item IDs from the adventuring gear data so packs can be "unpacked" into individual items in the inventory
- Starting gold is mutually exclusive with starting equipment packs — the player chooses one or the other during character creation
