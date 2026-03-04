# Story 12.2 — Personality Characteristics

> **Epic 12: Background & Personality Step** | **Phase 2: Character Creation Wizard** (Weeks 3-4)

## Description

As a player, I need to define my character's personality traits, ideals, bonds, and flaws — either by selecting from tables or writing custom ones. This story builds the personality editor with four sections for selecting or writing personality characteristics, random roll support using the dice engine, and alignment-tagged ideals.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Phase 1 Foundation Available**: Type system, SRD game data (races, classes, spells, equipment, backgrounds, feats as static JSON), calculation engine, React Query API layer, Zustand stores (UI state), dice engine
- **Four Personality Sections**:
  - **Personality Traits (d8 table)**: Choose or write 2 traits that describe your character's general personality
  - **Ideal (d6 table)**: Choose or write 1 ideal that drives your character. Each ideal has an alignment tag (Good, Evil, Lawful, Chaotic, Neutral, Any)
  - **Bond (d6 table)**: Choose or write 1 bond — a connection to a person, place, or event that motivates your character
  - **Flaw (d6 table)**: Choose or write 1 flaw — a weakness or vice that can be exploited
- **Selection Mode**: Each section shows the background's characteristic table as selectable options. Player picks from the table
- **Custom Mode**: "Write Custom" toggle replaces the table with a text input. Player can mix selected and custom entries (e.g., select one trait from table, write second one custom)
- **Random Roll**: "Roll Randomly" button uses the dice engine to randomly select from the table (d8 for traits, d6 for ideals/bonds/flaws). Animated roll result
- **Alignment Tags on Ideals**: Each ideal in the table has an alignment tag (e.g., "Charity. I always help those in need. (Good)"). Helps player pick one consistent with their planned alignment

## Tasks

- [ ] **T12.2.1** — Create `components/wizard/background/PersonalityEditor.tsx` — four sections: Personality Traits (choose or write 2), Ideal (choose or write 1), Bond (choose or write 1), Flaw (choose or write 1)
- [ ] **T12.2.2** — Each section shows the background's characteristic table as selectable options. For personality traits (d8 table), the player selects 2 items. For ideals (d6 table with alignment tags), the player selects 1. For bonds and flaws (d6 tables), the player selects 1 each
- [ ] **T12.2.3** — Add a "Roll Randomly" button for each section that uses the dice engine to randomly select from the table (roll d8 or d6 as appropriate). Animate the roll result
- [ ] **T12.2.4** — Add a "Write Custom" toggle for each section that replaces the table with a text input field. The player can mix selected and custom entries (e.g., select one trait from the table, write the second one custom)
- [ ] **T12.2.5** — For ideals, show the alignment tag next to each option (e.g., "Charity. I always help those in need. (Good)") to help the player pick one consistent with their planned alignment
- [ ] **T12.2.6** — Add a "Randomize All" button that rolls all four sections at once for players who want quick personality generation

## Acceptance Criteria

- Four personality sections are displayed: Traits (2), Ideal (1), Bond (1), Flaw (1)
- Each section shows the selected background's characteristic table as selectable options
- Personality Traits section allows selecting 2 from the d8 table; Ideal, Bond, and Flaw each allow selecting 1
- "Roll Randomly" button randomly selects from the table with animated dice roll
- "Write Custom" toggle replaces the table with a text input for custom entries
- Mixed selection is supported (e.g., one trait from table + one custom trait)
- Ideals show alignment tags to help alignment-consistent selection
- "Randomize All" button rolls all four sections simultaneously

## Testing Requirements

### Functional Tests (React Testing Library)
_For component rendering, user interactions, state changes, prop variations_

- `should display four personality sections: Traits (2), Ideal (1), Bond (1), Flaw (1)`
- `should show the selected background's characteristic table as selectable options in each section`
- `should allow selecting 2 traits from the d8 table`
- `should allow selecting 1 ideal, 1 bond, and 1 flaw from their respective tables`
- `should randomly select from the table with animated dice roll when Roll Randomly is clicked`
- `should replace table with text input when Write Custom toggle is activated`
- `should support mixed selection (one trait from table + one custom trait)`
- `should show alignment tags on ideal options (e.g., "(Good)", "(Chaotic)")`
- `should roll all four sections simultaneously when Randomize All is clicked`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should select 2 traits, 1 ideal, 1 bond, and 1 flaw from background tables and advance`
- `should use Randomize All to generate all personality characteristics and verify entries are populated`

### Test Dependencies
- Mock SRD background data with personality characteristic tables
- Mock Phase 1 dice engine for deterministic random roll results
- Test fixtures for background personality tables (d8 traits, d6 ideals/bonds/flaws)

## Identified Gaps

- **Error Handling**: No specification for what happens if personality tables are empty or missing for a background
- **Edge Cases**: Character limit for custom entries is mentioned (200 chars) in notes but not in acceptance criteria
- **Accessibility**: No keyboard navigation specified for table selection, custom input toggle, or dice roll animation

## Dependencies

- **Depends on:** Story 12.1 (Background Selection — personality tables come from the selected background), Phase 1 dice engine (for random rolls), Phase 1 SRD background data (personality tables)
- **Blocks:** Story 12.4 (validation checks personality entries), Epic 15 Story 15.1 (review displays personality characteristics)

## Notes

- Personality characteristics are flavor/roleplay content — they have no mechanical effects on the character
- The "Roll Randomly" animation should be quick but satisfying — show the die rolling and landing on a number, then highlight the corresponding table entry
- Custom entries should have a reasonable character limit (e.g., 200 characters) but be flexible enough for creative players
- The "Randomize All" feature is a convenience for players who want to quickly generate a personality and move on — especially useful for one-shot games
- Personality traits are different from the personality table entries — a player might select one entry from the table and write one custom entry to get their 2 traits
- Consider showing the selected background's name above the personality tables for context: "Personality Characteristics for [Background Name]"
