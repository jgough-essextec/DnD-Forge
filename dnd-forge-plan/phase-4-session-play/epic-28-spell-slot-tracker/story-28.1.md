# Story 28.1 — Spell Slot Expend & Recover UI

> **Epic 28: Spell Slot Tracker** | **Phase 4: Session Play Features** (Weeks 7-8)

## Description

As a spellcaster during a session, I need to mark spell slots as used when I cast spells and recover them on rest. The spell slot tracker enhances the Phase 3 spell page with interactive, clickable slot circles that toggle between available and expended states, with cast-to-expend prompts, running availability summaries, and ritual casting support.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phase 1 (types, SRD data, calculation engine, database, state stores, dice engine), Phase 2 (character creation wizard), Phase 3 (character sheet 3-page display, gallery, import/export, view/edit mode with auto-save)

### D&D 5e Spell Slot System

**Standard Caster Spell Slots (Full Casters: Bard, Cleric, Druid, Sorcerer, Wizard):**
| Level | 1st | 2nd | 3rd | 4th | 5th | 6th | 7th | 8th | 9th |
|-------|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| 1 | 2 | - | - | - | - | - | - | - | - |
| 2 | 3 | - | - | - | - | - | - | - | - |
| 3 | 4 | 2 | - | - | - | - | - | - | - |
| 4 | 4 | 3 | - | - | - | - | - | - | - |
| 5 | 4 | 3 | 2 | - | - | - | - | - | - |
| 9 | 4 | 3 | 3 | 3 | 1 | - | - | - | - |
| 13 | 4 | 3 | 3 | 3 | 2 | 1 | 1 | - | - |
| 17 | 4 | 3 | 3 | 3 | 2 | 1 | 1 | 1 | 1 |
| 20 | 4 | 3 | 3 | 3 | 3 | 2 | 2 | 1 | 1 |

**Half Casters (Paladin, Ranger):** Start at class level 2, slots progress at roughly half the rate.

**Upcasting:** A spell can be cast using a higher-level slot than its base level. Example: Cure Wounds (1st level) can be cast using a 2nd level slot for additional healing. The player chooses which slot level to expend.

**Ritual Casting:** Spells with the "Ritual" tag can be cast without expending a spell slot. The casting takes 10 minutes longer than normal. Available to: Bard (must know the spell), Cleric (must have prepared), Druid (must have prepared), Wizard (must have in spellbook, doesn't need to be prepared).

**Slot Recovery:**
- Standard slots recover on long rest only
- Warlock Pact Magic slots recover on short rest (all Pact Magic slots are the same level, equal to the Warlock's Pact Magic slot level, and all recover on short rest)
- Wizard Arcane Recovery: recover spell slots totaling up to ceil(Wizard level / 2) levels during one short rest per day (no individual slot can be 6th level or higher)

### Component Enhancement
This story enhances the Phase 3 `SpellLevelSection.tsx` component to make spell slots interactive.

## Tasks

- [ ] **T28.1.1** — Enhance the Phase 3 spell slot tracker (`SpellLevelSection.tsx`): each spell slot is now a clickable circle. Filled circle = available. Crossed/dimmed circle = expended. Click to toggle between available and expended. Always interactive (even in view mode since this is session tracking)
- [ ] **T28.1.2** — When a player clicks a spell name to "cast" it, auto-prompt: "Expend a level [N] slot?" with options to upcast at higher levels. On confirm, mark one slot of the chosen level as expended
- [ ] **T28.1.3** — Show a running summary at the top of the spell page: "Slots: 2/4 (1st) . 1/3 (2nd) . 3/3 (3rd)" with color coding (green if >50% available, yellow if <=50%, red if 0)
- [ ] **T28.1.4** — Prevent casting when no slots of the required level remain: show the spell as dimmed with a "No slots available" tooltip. Allow the player to override (some class features grant free casts)
- [ ] **T28.1.5** — Ritual casting: spells with the "Ritual" tag can be cast without expending a slot. Show a "Cast as Ritual" button alongside "Cast with Slot." Ritual casting takes 10 extra minutes (display this note)

## Acceptance Criteria

1. Each spell slot is a clickable circle: filled = available, crossed/dimmed = expended
2. Clicking a slot toggles its state (expend/recover)
3. Spell slots are always interactive, even in view mode
4. Clicking a spell name prompts to expend a slot with upcast options for higher-level slots
5. Running slot summary displays at the top of the spell page with color coding
6. Spells are dimmed when no slots of the required level remain, with "No slots available" tooltip
7. Player can override the no-slots restriction (for class features that grant free casts)
8. Ritual spells show a "Cast as Ritual" option that doesn't expend a slot
9. Ritual casting shows the "+10 minutes" duration note

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should toggle spell slot state between available and expended`
- `should calculate running slot summary with correct available/total per level`
- `should determine color code for slot summary: green (>50%), yellow (<=50%), red (0)`
- `should determine if a spell can be upcast to available higher-level slots`
- `should identify ritual-tagged spells from spell data`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render clickable slot circles: filled for available, crossed/dimmed for expended`
- `should toggle slot state on click (expend and recover)`
- `should be interactive even in view mode (session tracking)`
- `should prompt "Expend a level [N] slot?" with upcast options when a spell name is clicked`
- `should show running slot summary at top of spell page with color coding`
- `should dim spells with "No slots available" tooltip when no slots of required level remain`
- `should allow player to override no-slots restriction`
- `should show "Cast as Ritual" button for ritual-tagged spells`
- `should display "+10 minutes" duration note for ritual casting`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should click a spell, choose a slot level to expend, verify slot circle becomes expended and summary updates`
- `should expend all slots of one level, verify spells are dimmed, then override to cast`
- `should cast a spell as a ritual without expending a slot`
- `should upcast a 1st level spell using a 3rd level slot`

### Test Dependencies
- Mock character data with spell slot configuration for a full caster (e.g., Level 5 Wizard)
- Mock spell data with ritual and non-ritual spells at various levels
- Phase 3 SpellLevelSection.tsx component stub
- Mock Zustand character store for slot state persistence

## Identified Gaps

- **Error Handling**: No specification for what happens if slot state becomes inconsistent (e.g., more expended than total)
- **Loading/Empty States**: No specification for non-caster characters visiting the spell page
- **Edge Cases**: Behavior when all slots at every level are expended; upcasting to a level with no available slots; slot recovery interaction with manual toggle vs rest recovery
- **Accessibility**: No ARIA labels for slot circles (available/expended state); no keyboard interaction for toggling slots; screen reader should announce slot expend/recover events
- **Performance**: No specification for slot state auto-save frequency via the API

## Dependencies

- Phase 3 SpellLevelSection.tsx component
- Phase 1 spell data (for ritual tag, spell levels)
- Epic 30 (Rest Automation) for slot recovery on rest

## Notes

- Spell slot expended state must persist in the character data (auto-saved via the API) so it survives page refresh
- The override for no-slots casting is important for features like the Sorcerer's ability to convert sorcery points to slots
- Slot recovery happens through the rest system (Epic 30), not through manual un-expending (though manual toggle is available as a correction mechanism)
