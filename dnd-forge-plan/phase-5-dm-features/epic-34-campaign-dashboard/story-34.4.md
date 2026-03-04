# Story 34.4 — Language Coverage

> **Epic 34: Campaign Dashboard & Party Overview** | **Phase 5: DM Features** (Weeks 9-10)

## Description

As a DM, I need to see which languages the party collectively speaks for planning encounters with non-Common-speaking NPCs.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth. DM role authenticated via Django User model, campaigns have owner FK with join codes for player association.
- **Prior Phases Available**: Phase 1-4 (full character creation, sheet display, session play features including dice roller, HP tracker, spell slots, conditions, rest, level up)

This story creates a compact language coverage panel showing all unique languages across the party, categorized into Common and Exotic, with gap identification.

**SRD Language Categories:**
- **Common languages:** Common, Dwarvish, Elvish, Giant, Gnomish, Goblin, Halfling, Orc
- **Exotic languages:** Abyssal, Celestial, Deep Speech, Draconic, Infernal, Primordial, Sylvan, Undercommon

Each language is shown as a badge with the count of speakers: "Common (4)", "Elvish (2)", "Draconic (0)". Languages with 0 speakers are SRD languages known in the world but not spoken by any party member — shown in a "Gaps" section.

Clicking a language badge reveals which characters speak it.

A separate "Tools" subsection shows tool proficiencies with the same format (aggregated from all party characters).

## Tasks

- [ ] **T34.4.1** — Create `components/dm/LanguageCoverage.tsx` — a compact panel showing all unique languages across the party. Each language is a badge with the count of speakers: "Common (4)", "Elvish (2)", "Dwarvish (1)", "Draconic (0)" — where 0 means "known in the world but no one in the party speaks it"
- [ ] **T34.4.2** — Categorize languages: Common languages (Common, Dwarvish, Elvish, Giant, Gnomish, Goblin, Halfling, Orc) and Exotic languages (Abyssal, Celestial, Deep Speech, Draconic, Infernal, Primordial, Sylvan, Undercommon). Show SRD languages not covered by any party member as a "Gaps" section
- [ ] **T34.4.3** — Clicking a language badge shows which characters speak it
- [ ] **T34.4.4** — Include tool proficiencies in a separate "Tools" subsection with the same format

## Acceptance Criteria

- Language coverage panel displays all unique languages across the party as badges with speaker counts
- Languages are categorized into Common and Exotic sections
- SRD languages not spoken by any party member appear in a "Gaps" section with a count of 0
- Clicking a language badge reveals which characters speak it
- Tool proficiencies are shown in a separate "Tools" subsection with the same badge format
- Panel is compact and readable as part of the Party tab

## Testing Requirements

### Unit Tests (Vitest)
_For pure functions, calculations, data transforms, utilities, type guards, validators_

- `should aggregate unique languages across all party characters with correct speaker counts`
- `should categorize languages into Common (8 languages) and Exotic (8 languages) correctly`
- `should identify SRD language gaps (languages with 0 speakers in the party)`
- `should aggregate tool proficiencies across all party characters`

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should render language badges with speaker counts in Common and Exotic sections`
- `should display "Gaps" section with SRD languages not spoken by any party member`
- `should reveal which characters speak a language when clicking a badge`
- `should display tool proficiencies in a separate "Tools" subsection`
- `should render as a compact panel within the Party tab`

### Test Dependencies
- Mock campaign with characters having varied language and tool proficiencies
- SRD language reference data (8 Common + 8 Exotic)
- Character fixtures with edge cases (no languages beyond Common, many exotic languages)

## Identified Gaps

- **Accessibility**: No ARIA labels for language badges; no keyboard interaction specified for expanding speaker lists
- **Mobile/Responsive**: No mobile-specific layout mentioned for the language panel
- **Edge Cases**: Behavior when a character has a non-SRD custom language not specified; behavior with empty party not addressed

## Dependencies

- Story 34.1 — Campaign dashboard layout (Party tab host)
- Epic 33 Story 33.1 — Campaign data model with character resolution
- Phase 1-3 — Character language and tool proficiency data

## Notes

- This panel helps DMs plan encounters and social interactions. Knowing the party's language coverage is essential for NPC encounters, puzzles with inscriptions, and overheard conversations.
- The "Gaps" section is particularly useful — it shows what the party cannot communicate in, which creates interesting gameplay opportunities.
- Tool proficiencies follow the same pattern and are included because DMs frequently need to know "Does anyone have thieves' tools?" or "Who has proficiency in herbalism kit?"
