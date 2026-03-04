# Story 30.3 — Class Feature Usage Tracking

> **Epic 30: Short Rest & Long Rest Automation** | **Phase 4: Session Play Features** (Weeks 7-8)

## Description

As a developer, I need a system to track uses remaining for all limited-use class features, integrated with the rest recovery system. This story extends the data model with usage tracking fields, builds the visual usage counter UI (filled/empty circles), creates the rest recovery utility functions, and maps all SRD class features to their recovery types.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard), Phase 3 (character sheet 3-page display, gallery, import/export, view/edit mode with auto-save)

### Extended Feature Type

The `Feature` type in the character data model must be extended with:
```typescript
interface Feature {
  // ... existing fields from Phase 1
  maxUses: number | null;        // null = unlimited uses
  usesRemaining: number;         // current remaining uses
  recoversOn: 'short_rest' | 'long_rest' | 'special' | null;  // null = no recovery (permanent)
  currentLevel: number;          // for features whose uses scale with level
}
```

### Complete Class Feature Recovery Mapping

**Short Rest Recovery Features:**
| Feature | Class | Uses at Various Levels | Notes |
|---------|-------|----------------------|-------|
| Second Wind | Fighter | 1 (all levels) | Regain 1d10 + Fighter level HP |
| Action Surge | Fighter | 1 (Lv2+), 2 (Lv17+) | Extra action on your turn |
| Channel Divinity | Cleric | 1 (Lv1+), 2 (Lv6+), 3 (Lv18+) | Class-specific uses |
| Wild Shape | Druid | 2 (all levels) | Transform into beasts |
| Ki Points | Monk | = Monk level (Lv2+) | Fuel monk abilities |
| Warlock Spell Slots | Warlock | Per Pact Magic table | All slots recover |
| Bardic Inspiration | Bard (Lv5+) | = CHA mod (min 1) | Font of Inspiration at Lv5 |

**Long Rest Recovery Features:**
| Feature | Class | Uses at Various Levels | Notes |
|---------|-------|----------------------|-------|
| Rage | Barbarian | 2 (Lv1), 3 (Lv3), 4 (Lv6), 5 (Lv12), 6 (Lv17), Unlimited (Lv20) | Bonus damage, resistance |
| Bardic Inspiration | Bard (Lv<5) | = CHA mod (min 1) | Short rest at Lv5+ |
| Lay on Hands | Paladin | 5 x Paladin level | Healing pool |
| Sorcery Points | Sorcerer | = Sorcerer level (Lv2+) | Metamagic fuel |
| Arcane Recovery | Wizard | 1/day | Slot recovery budget = ceil(Wizard level/2) |

**Special Recovery Features:**
| Feature | Class | Recovery Rule |
|---------|-------|--------------|
| Hit Dice | All | Long rest: recover up to half total (minimum 1) |
| Exhaustion | All | Long rest: reduce by 1 level (if fed/watered) |
| Death Saves | All | Long rest: reset to 0/0; also reset when healed from 0 HP |

**Subclass Features (Examples):**
| Feature | Subclass | Recovery | Notes |
|---------|----------|----------|-------|
| Superiority Dice | Battle Master (Fighter) | Short Rest | 4 dice (Lv3), 5 (Lv7), 6 (Lv15) |
| Divine Smite Pool | Paladin (all) | Long Rest | Uses spell slots, not separate resource |
| Arcane Ward | Abjuration Wizard | Special | Recharges when casting abjuration spells |

### Usage Counter Visual Design
- Filled circles (solid) = remaining uses
- Empty circles (outline) = expended uses
- Clicking a filled circle expends a use
- Clicking an empty circle recovers a use (manual override for corrections)
- Example: Rage at Barbarian Lv3: [filled] [filled] [empty] = 2/3 uses remaining

### Scaling Rules
Some features' max uses change with level. The level-up flow (Epic 31) must update `maxUses` when level thresholds are crossed:
- Rage: 2 at Lv1, 3 at Lv3, 4 at Lv6, 5 at Lv12, 6 at Lv17, unlimited at Lv20
- Channel Divinity: 1 at Lv1, 2 at Lv6, 3 at Lv18
- Action Surge: 1 at Lv2, 2 at Lv17
- Ki Points: equals Monk level
- Sorcery Points: equals Sorcerer level

## Tasks

- [ ] **T30.3.1** — Extend the `Feature` type in the character data model to include: `maxUses: number | null`, `usesRemaining: number`, `recoversOn: 'short_rest' | 'long_rest' | 'special' | null`, `currentLevel: number` (for features whose uses scale with level)
- [ ] **T30.3.2** — On the character sheet's Features & Traits section (Page 1, right column), display limited-use features with usage counters: filled circles for remaining uses, empty circles for expended uses. Clicking a circle expends a use. Clicking an expended circle recovers a use (manual override)
- [ ] **T30.3.3** — Create `utils/restRecovery.ts` with functions:
  - `applyShortRest(character): RestResult` — recovers short-rest features, returns summary
  - `applyLongRest(character): RestResult` — recovers all features + HP + slots + dice + exhaustion, returns summary
- [ ] **T30.3.4** — Map all SRD class features to their recovery type in the data layer. Include: Second Wind (short), Action Surge (short), Rage (long), Bardic Inspiration (long, short at 5+), Channel Divinity (short), Wild Shape (short), Ki Points (short), Lay on Hands (long), Sorcery Points (long), Arcane Recovery (long), plus subclass features
- [ ] **T30.3.5** — For features whose max uses change with level (e.g., Rage: 2 at Lv 1, 3 at Lv 3, 4 at Lv 6, etc.), the level-up flow must update `maxUses` when the threshold is crossed

## Acceptance Criteria

1. Feature type extended with maxUses, usesRemaining, recoversOn, and currentLevel fields
2. Limited-use features show usage counters (filled/empty circles) on the character sheet
3. Clicking a filled circle expends a use; clicking an empty circle recovers a use
4. `applyShortRest()` correctly recovers all short-rest features and returns a summary
5. `applyLongRest()` correctly recovers all features + HP + slots + dice + exhaustion and returns a summary
6. All SRD class features are mapped to their recovery type
7. Bardic Inspiration correctly switches from long-rest to short-rest recovery at Bard level 5
8. Features with scaling max uses (Rage, Channel Divinity, etc.) have correct values at each level
9. Level-up flow updates maxUses when level thresholds are crossed
10. Usage counter state persists in character data (auto-saved)

## Dependencies

- Phase 1 character data model (Feature type base)
- Phase 1 SRD class feature data
- Phase 3 character sheet Features & Traits section

## Notes

- This story provides the data foundation that Story 30.1 (Short Rest) and Story 30.2 (Long Rest) consume
- The rest recovery utility functions should be pure functions that take a character and return a modified character + summary
- Manual override (clicking to recover a use) is important for DM-granted extra uses or corrections
- The scaling rules in T30.3.5 connect to the level-up flow (Epic 31) which must update these values
