# Story 27.2 — Temporary HP Management

> **Epic 27: HP Tracker** | **Phase 4: Session Play Features** (Weeks 7-8)

## Description

As a player, I need to track temporary hit points with the correct stacking rules. Temporary HP in D&D 5e are a buffer that absorbs damage before regular HP, but they have specific non-stacking rules that must be enforced. The UI must clearly distinguish temp HP from regular HP and provide satisfying visual feedback when temp HP is depleted by damage.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
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

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should keep higher value when new temp HP is set and existing temp HP is present (non-stacking rule)`
- `should replace temp HP when new value exceeds current temp HP`
- `should calculate temp HP depletion from damage (e.g., 10 temp HP - 7 damage = 3 temp HP, 0 regular damage)`
- `should pass remaining damage to current HP after temp HP is fully depleted`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render temp HP field as always editable even in view mode`
- `should show tooltip "Temp HP don't stack. Keep the higher value." when setting new temp HP over existing`
- `should display blue-tinted shield overlay on HP bar when temp HP is present`
- `should render two-segment HP bar: blue (temp) stacked on normal HP gradient`
- `should animate temp HP count-down when damage depletes temp HP before reducing current HP`
- `should allow direct edit of temp HP value`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should set temp HP, apply damage that partially depletes temp HP, and verify animated depletion and HP bar update`
- `should set new temp HP when existing is lower, verify higher value is kept with tooltip`
- `should take damage exceeding temp HP and verify spillover to current HP`

### Test Dependencies
- Mock character data with known HP, max HP, and temp HP values
- CSS animation testing utilities for depletion animation verification
- Phase 3 HP bar component for visual enhancement testing

## Identified Gaps

- **Error Handling**: No specification for setting temp HP to negative or non-numeric values
- **Edge Cases**: Behavior when temp HP is set to 0 explicitly vs being depleted to 0; visual state when temp HP equals 0 vs not having temp HP at all
- **Accessibility**: No ARIA label for temp HP field; screen reader should announce temp HP depletion separately from regular HP loss
- **Performance**: No specification for animation frame rate of temp HP depletion count-down

## Dependencies

- Story 27.1 (Damage & Healing Input) for damage application that depletes temp HP
- Phase 3 HP bar component for visual enhancement

## Notes

- The temp HP field must be always editable because players receive temp HP during play, even when the sheet is in "view mode"
- The animated depletion provides important visual feedback during combat -- the player can see their temp HP buffer being consumed
- Temp HP persistence through rests is DM-dependent; the app should not auto-clear temp HP on rest (handled in Epic 30)
