# Story 27.2 — Temporary HP Management

> **Epic 27: HP Tracker** | **Phase 4: Session Play Features** (Weeks 7-8)

## Description

As a player, I need to track temporary hit points with the correct stacking rules. Temporary HP in D&D 5e are a buffer that absorbs damage before regular HP, but they have specific non-stacking rules that must be enforced. The UI must clearly distinguish temp HP from regular HP and provide satisfying visual feedback when temp HP is depleted by damage.

## Technical Context

- **App**: D&D Character Forge — local-first React PWA for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand (state), Dexie.js (IndexedDB), React Router
- **Architecture**: No backend, pure client-side, offline-capable PWA, IndexedDB for persistence
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard), Phase 3 (character sheet 3-page display, gallery, import/export, view/edit mode with auto-save)

### D&D 5e Temporary HP Rules (Complete)

**Core Rules:**
- Temporary HP are a buffer on top of your actual HP
- When you take damage, temp HP is reduced first. Any leftover damage then reduces your actual HP
- Temp HP **do not stack**: if you receive new temp HP while you already have some, you choose whether to keep the old value or take the new one. You do NOT add them together
- Best practice: always keep the higher value when new temp HP are received
- Temp HP cannot be healed -- healing only restores actual HP
- Temp HP are lost after a long rest (debatable per DM ruling, but common rule is they persist)
- Temp HP are separate from your HP max -- you can have temp HP even at full HP

**Common Sources of Temp HP:**
- Heroism spell (CHA mod temp HP at the start of each turn)
- Inspiring Leader feat (level + CHA mod temp HP after a short rest speech)
- Dark One's Blessing (Fiend Warlock: CHA mod + Warlock level temp HP on kill)
- Armor of Agathys spell (5 temp HP per spell level)
- False Life spell (1d4+4 temp HP, +5 per spell level above 1st)

**Interaction with Damage:**
Example: Character has 30 HP, 10 temp HP, takes 15 damage:
1. 10 damage absorbed by temp HP (temp HP drops to 0)
2. Remaining 5 damage reduces HP (30 -> 25)

### Visual Design
- Temp HP displayed as a blue-tinted shield overlay on the HP bar
- HP bar shows two segments: blue (temp) stacked on top of the normal HP color gradient
- Animated depletion when temp HP absorbs damage

## Tasks

- [ ] **T27.2.1** — The temp HP field is always editable (even in view mode). Setting temp HP: if the character already has temp HP, the new value replaces the old only if it's higher (5e rule: temp HP don't stack, you choose the higher). Show a tooltip: "Temp HP don't stack. Keep the higher value."
- [ ] **T27.2.2** — When damage is applied, temp HP depletion is animated: the temp HP number counts down visually before the current HP starts reducing
- [ ] **T27.2.3** — Temp HP visual: display in a blue-tinted shield overlay on the HP bar. When temp HP is present, the HP bar shows two segments: blue (temp) stacked on top of the normal HP color gradient

## Acceptance Criteria

1. Temp HP field is always editable, even in view mode (session tracking)
2. Setting new temp HP when existing temp HP is present: keeps the higher value, shows tooltip explaining non-stacking rule
3. Damage application depletes temp HP first with a visible count-down animation before current HP reduces
4. HP bar visually shows temp HP as a blue-tinted shield overlay segment stacked on the normal HP gradient
5. The two-segment HP bar clearly distinguishes temp HP (blue) from regular HP
6. Temp HP interact correctly with the damage logic from Story 27.1

## Dependencies

- Story 27.1 (Damage & Healing Input) for damage application that depletes temp HP
- Phase 3 HP bar component for visual enhancement

## Notes

- The temp HP field must be always editable because players receive temp HP during play, even when the sheet is in "view mode"
- The animated depletion provides important visual feedback during combat -- the player can see their temp HP buffer being consumed
- Temp HP persistence through rests is DM-dependent; the app should not auto-clear temp HP on rest (handled in Epic 30)
