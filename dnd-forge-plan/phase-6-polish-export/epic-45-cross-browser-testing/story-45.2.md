# Story 45.2 — E2E Test Suite

> **Epic 45: Cross-Browser Testing & Bug Fixes** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a developer, I need automated tests that verify critical user flows work correctly. This story covers setting up the Playwright test suite with fixtures, then implementing 9 end-to-end tests covering: character creation (all 12 classes), character sheet rendering, dice rolling, session play, level-up, PDF export, campaign flow, import/export, and data persistence verification.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router, WeasyPrint (server-side PDF), Playwright (E2E testing)
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **E2E Framework**: Playwright
- **Test Fixtures**: Pre-created Level 5 Fighter, pre-created Level 3 Wizard, campaign with 4 characters
- **10 Critical E2E Flows**:
  1. Character creation (all 12 classes)
  2. Character sheet rendering (all 3 pages)
  3. Dice rolling (d20, advantage, skill check from sheet)
  4. Session play (damage, heal, spell slots, conditions, short rest, long rest)
  5. Level-up (HP increase, new features, spell slots, ASI/feat)
  6. PDF export (download valid PDF, contains character name)
  7. Campaign flow (create, add characters, encounter, initiative, turns, XP)
  8. Import/export (export JSON, delete, import, verify restoration)
  9. (Implicit in fixtures) Data persistence verification via API

## Tasks

- [ ] **T45.2.1** — Set up Playwright test suite with fixtures for: a pre-created character (Level 5 Fighter), a pre-created caster (Level 3 Wizard), a campaign with 4 characters
- [ ] **T45.2.2** — **E2E test: Character creation.** Walk through the full wizard for each of the 12 classes. Verify the created character has correct: ability scores, proficiencies, HP, AC, features, spells (if caster). Assert the character appears in the gallery
- [ ] **T45.2.3** — **E2E test: Character sheet.** Open a character, verify all three pages render. Switch to edit mode, change an ability score, verify cascade recalculation. Switch back to view mode
- [ ] **T45.2.4** — **E2E test: Dice rolling.** Open dice roller, roll a d20, verify a result appears in [1,20]. Roll with advantage, verify two dice and the higher is kept. Roll a skill check from the sheet, verify the modifier is applied
- [ ] **T45.2.5** — **E2E test: Session play.** Take damage, verify HP decreases and temp HP is consumed first. Expend a spell slot, verify the circle changes. Add a condition, verify the badge appears. Short rest, verify hit dice spending and feature recovery. Long rest, verify full recovery
- [ ] **T45.2.6** — **E2E test: Level up.** Level up a character, verify HP increases, new features appear, spell slots update (for casters), ASI/feat selection works at appropriate levels
- [ ] **T45.2.7** — **E2E test: PDF export.** Export a character sheet, verify a PDF file is downloaded and is a valid PDF (check file header bytes). Verify the PDF contains the character's name (using a PDF text extraction utility)
- [ ] **T45.2.8** — **E2E test: Campaign flow.** Create a campaign, add characters, start an encounter, roll initiative, advance turns, end encounter, verify XP distribution
- [ ] **T45.2.9** — **E2E test: Import/export.** Export a character as JSON, delete the character, import the JSON, verify the character is restored with all data intact
- [ ] **T45.2.10** — **E2E test: Data persistence.** Create a character, refresh the page, verify the character persists via API. Modify character data, refresh, verify changes are preserved

## Acceptance Criteria

- Playwright test suite is configured and runs against the production build
- Test fixtures are set up: Level 5 Fighter, Level 3 Wizard, campaign with 4 characters
- Character creation test passes for all 12 classes with correct ability scores, proficiencies, HP, AC, features, and spells
- Character sheet test verifies all 3 pages render and edit mode cascade recalculation works
- Dice rolling test verifies d20 results in [1,20], advantage rolls correctly, and skill check modifiers apply
- Session play test verifies damage (temp HP first), spell slot expenditure, condition badges, short rest recovery, and long rest full recovery
- Level-up test verifies HP increase, new features, spell slot updates, and ASI/feat selection
- PDF export test verifies a valid PDF is downloaded containing the character's name
- Campaign flow test verifies creation, character assignment, encounter flow, initiative, turn advancement, and XP distribution
- Import/export test verifies round-trip data integrity (export, delete, import, verify)
- Data persistence test verifies character data survives page refresh via API
- All tests pass consistently (no flaky tests)

## Testing Requirements

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should create characters for all 12 classes with correct ability scores, proficiencies, HP, AC, features, and spells`
- `should render all three character sheet pages and verify edit mode cascade recalculation`
- `should roll d20 with result in [1,20], roll with advantage keeping higher, and apply skill check modifiers`
- `should take damage consuming temp HP first, expend spell slot, add condition badge, complete short and long rest with correct recovery`
- `should level up character verifying HP increase, new features, spell slot updates, and ASI/feat selection`
- `should export valid PDF file containing character name (verify %PDF- header and text extraction)`
- `should create campaign, add characters, start encounter, roll initiative, advance turns, and distribute XP`
- `should export character as JSON, delete, import, and verify complete data restoration`
- `should persist character data across page refreshes via API`
- `should run all tests consistently with no flaky failures`

### Test Dependencies
- Playwright test suite with project configuration
- Pre-created Level 5 Fighter fixture
- Pre-created Level 3 Wizard fixture
- Campaign fixture with 4 characters
- PDF validation utility (header byte check, text extraction via pdf-parse)
- Test database state cleanup between tests
- CI/CD configuration (GitHub Actions with Playwright support)

## Identified Gaps

- **Performance**: Character creation tests for all 12 classes will be long-running — parallelization strategy not specified
- **Error Handling**: No specification for handling flaky test detection and retry strategy
- **Edge Cases**: Test isolation when database state is shared between tests not fully specified
- **Dependency Issues**: pdf-parse library for PDF text extraction adds to test dependencies but not to app bundle — needs clarification

## Dependencies

- Story 45.1 (manual testing should verify flows before automating them)
- All Phase 1-6 features complete (tests exercise the full app)
- Django test server for API integration testing

## Notes

- PDF validation can check the file starts with `%PDF-` header bytes
- For PDF text extraction, consider using `pdf-parse` or similar library in the test
- Character creation tests for all 12 classes will be the longest-running tests — consider parallelizing
- Test database state should be cleared between tests to ensure isolation
- Consider running E2E tests in CI/CD (GitHub Actions) with Playwright's built-in CI support
