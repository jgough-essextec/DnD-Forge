# Story 2.4 — Equipment & Inventory Types

> **Epic 2: Complete Type System** | **Phase 1: Foundation** (Weeks 1-2)

## Description
As a developer, I need types covering all equipment categories, weapon properties, armor formulas, and inventory management.

## Technical Context
- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Domain**: D&D 5th Edition SRD — 9 races (with subraces), 12 classes (with subclasses), ability scores, skills, spells, equipment, backgrounds, feats
- **Weapon properties** (10 total): Each property affects gameplay mechanics:
  - Ammunition: requires ammo, has range (normal/long)
  - Finesse: use STR or DEX for attack/damage (player's choice)
  - Heavy: Small creatures have disadvantage on attacks
  - Light: can be used for two-weapon fighting (dual wield)
  - Loading: only one attack per action regardless of Extra Attack
  - Reach: melee range is 10ft instead of 5ft
  - Special: has unique rules (e.g., Lance, Net)
  - Thrown: can be used as a ranged weapon with specified range
  - Two-Handed: requires two hands to attack
  - Versatile: different damage die one-handed vs two-handed (e.g., 1d8 / 1d10)
- **Weapon categories**: Simple Melee, Simple Ranged, Martial Melee, Martial Ranged. Damage types: Bludgeoning, Piercing, Slashing
- **Armor types** (13 + shield): Light (Padded, Leather, Studded Leather), Medium (Hide, Chain Shirt, Scale Mail, Breastplate, Half Plate), Heavy (Ring Mail, Chain Mail, Splint, Plate). Each has base AC, DEX cap, stealth disadvantage flag, STR requirement, weight, and cost
- **Currency system**: 5 denominations — CP (copper), SP (silver), EP (electrum), GP (gold), PP (platinum). Conversion: 1 PP = 10 GP, 1 GP = 2 EP = 10 SP = 100 CP, 1 EP = 5 SP. Base unit for calculation is CP: PP=1000, GP=100, EP=50, SP=10, CP=1
- **Carrying capacity**: STR score x 15 = max weight in pounds. Push/Drag/Lift: STR x 30. Encumbrance variant: STR x 5 = unencumbered, STR x 10 = encumbered (-10 speed), over = heavily encumbered (-20 speed, disadvantage on STR/DEX/CON). Small creatures halve capacity, Tiny quarter it
- **Starting equipment**: Characters choose between pre-built equipment packs OR rolling for starting gold. Equipment choices are structured as "pick one of these options" groups
- **Attunement**: Some magic items require attunement. A character can attune to a maximum of 3 items

## Tasks
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

## Acceptance Criteria
- All types compile with zero TypeScript errors under strict mode
- `Weapon` interface can represent every SRD weapon including all properties and range data
- `Armor` interface can represent all 13 armor types plus the distinction between light/medium/heavy categories
- `dexCap` is `null` for uncapped armor (light) and `0` for heavy armor (no DEX contribution)
- `Currency` and `CurrencyAmount` cover all 5 denominations
- `CURRENCY_CONVERSION_RATES` enables conversion between any two denominations via the CP base unit
- `Encumbrance` provides all thresholds needed for the variant encumbrance rule
- `StartingEquipmentChoice` can express multi-option choice groups (e.g., "choose a martial weapon OR two simple weapons")

## Dependencies
- **Depends on:** Story 2.1 (uses AbilityName for STR requirements), Story 2.2 (uses DamageType), Story 2.3 (uses WeaponCategory, ArmorCategory, DieType references)
- **Blocks:** Story 2.8 (Character master type includes equipment and currency), Story 3.4 (Equipment data files), Story 4.3 (Combat calculations use Armor/Weapon), Story 4.6 (Currency calculations)

## Notes
- `dexCap` is `null` for light armor (no maximum DEX bonus), a positive number for medium armor (typically +2), and `0` for heavy armor (DEX does not contribute to AC)
- The `DieType` used in `DamageDice` should be imported from Story 2.10 (UI State types) or defined in a shared location since it is also used by the dice engine
- `EquipmentItem` uses `Record<string, any>` for `properties` as a catch-all for item-specific data. This is intentionally loose to accommodate the variety of adventuring gear
- Versatile weapons need both a regular and versatile damage die (e.g., longsword: 1d8 slashing or 1d10 two-handed)
