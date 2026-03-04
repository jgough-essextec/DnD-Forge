# Story 39.2 — Page 1: Core Stats Layout

> **Epic 39: PDF Character Sheet Export** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a user, I want the first page of my character PDF to show core stats in the classic D&D sheet layout. This page is a Django HTML template rendered by WeasyPrint, using CSS Grid and Flexbox to reproduce the official 5e character sheet front page: character header, ability scores column, saving throws, skills, combat stats, hit points, attacks table, personality traits, and features/proficiencies.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router, WeasyPrint (server-side PDF), Playwright (E2E testing)
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **PDF Layout**: Django HTML template rendered by WeasyPrint. CSS Grid/Flexbox for layout. Print CSS in `static/pdf/styles.css`
- **Page 1 Structure**: Three-column layout matching official 5e sheet — Left (ability scores, saves, skills), Center (combat stats, HP, attacks), Right (personality, features)
- **Typography**: Cinzel for headings, sans-serif for body, defined in print CSS
- **Data Source**: Character model from Phases 1-3 with computed values passed as Django template context

## Tasks

- [ ] **T39.2.1** — Create Django template `templates/pdf/page1_core_stats.html`. This is an includable template block that renders the full page 1 layout. It receives the character object and all computed stats via template context
- [ ] **T39.2.2** — Create CSS layout for page 1 in `static/pdf/styles.css` — CSS Grid-based three-column layout matching the classic character sheet: left column (ability scores, saves, skills), center column (combat stats, HP, attacks), right column (personality, features)
- [ ] **T39.2.3** — Style ability score blocks: each block displays the score (large number in a bordered box), the modifier (in a smaller overlay circle), and the ability name label. Use CSS Grid for the six vertical blocks along the left column
- [ ] **T39.2.4** — Add header section to the template: character name (large, centered), class/level, background, race, alignment, XP — arranged in a two-row header block with labeled fields using CSS Flexbox
- [ ] **T39.2.5** — Implement saving throws and skills list in the template. Saving throws: six rows with proficiency indicator (filled/empty circle via CSS), modifier, ability name. Skills: 18 rows with proficiency indicator (filled/empty/double-ring for expertise), modifier, skill name. Passive Perception box below skills
- [ ] **T39.2.6** — Implement combat stats section: AC (with armor type note), Initiative, Speed in prominent bordered boxes. Hit Points block: HP max, current HP, temp HP, hit dice, death saves (three success/failure circles)
- [ ] **T39.2.7** — Implement attacks table: HTML `<table>` with columns Name, Atk Bonus, Damage/Type, pre-populated from character's equipped weapons
- [ ] **T39.2.8** — Implement right column: personality traits, ideals, bonds, flaws in stacked labeled boxes. Features and traits list below. Proficiencies and languages box at the bottom left
- [ ] **T39.2.9** — Write test: render the template with a sample Level 5 Fighter character context, convert to PDF via WeasyPrint, and verify the PDF output contains expected text strings (character name, ability scores, skill names)

## Acceptance Criteria

- Page 1 Django template renders all core stats in an organized three-column layout matching the classic 5e character sheet
- All six ability scores display both the score value and the computed modifier in styled blocks
- Saving throws show proficiency indicators (filled/empty) and correct modifiers for all six abilities
- All 18 skills render with proficiency indicators (filled/empty/double for expertise) and computed modifiers
- Skills list is complete and in alphabetical order matching the standard 5e sheet
- Combat stats (AC, Initiative, Speed) are prominently displayed in bordered boxes
- Hit points block shows max HP, current HP, temp HP, hit dice, and death saves
- Attacks table is populated from the character's equipped weapons
- Personality traits, ideals, bonds, and flaws render in labeled boxes
- Features, proficiencies, and languages are listed
- All computed values (modifiers, AC, initiative, passive perception, proficiency bonus) are correct in the rendered output
- WeasyPrint renders the template to a valid PDF page without errors

## Testing Requirements

### Backend Template Rendering Tests (pytest)
_For verifying Django template produces correct HTML with character data_

- `should render page1_core_stats.html without template errors for a fully populated Level 5 Fighter`
- `should include all six ability score values and computed modifiers in the rendered HTML`
- `should include all 18 skill names with correct modifiers in the rendered HTML`
- `should include saving throw values with proficiency indicators in the rendered HTML`
- `should include combat stats (AC, Initiative, Speed) in the rendered HTML`
- `should include character header fields (name, class, level, race, alignment) in the rendered HTML`
- `should render correctly for a character with no equipped weapons (empty attacks table)`
- `should render correctly for a multiclass character with combined class name in the header`

### Backend PDF Output Tests (pytest + WeasyPrint)
_For verifying end-to-end PDF generation from the page 1 template_

- `should produce a valid PDF containing the character name as searchable text`
- `should produce a PDF where page 1 contains ability score values matching the fixture data`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should download a PDF for a Level 5 Fighter and verify it contains combat-relevant stat text`

### Test Dependencies
- Level 5 Fighter factory/fixture with all ability scores, skills, proficiencies, and equipment populated
- Level 3 Wizard factory/fixture for testing spellcasting attack entries in the attacks table
- Multiclass character fixture for testing header display
- PDF text extraction utility (e.g., `pdfplumber` or `PyPDF2`) for verifying text content in generated PDFs

## Identified Gaps

- **Error Handling**: No specification for behavior when the template encounters missing data (e.g., null ability scores). Template should use `{{ value|default:"--" }}` filters for safety
- **Edge Cases**: Behavior for characters with very long feature lists that overflow the page 1 allocated space. CSS `overflow: hidden` or continuation to page 2 needs a defined approach
- **Edge Cases**: Multiclass characters with multiple class names in the header need a defined display format (e.g., "Fighter 3 / Wizard 2")
- **Accessibility**: PDF accessibility (tagged PDF, reading order) not addressed. WeasyPrint has limited support for PDF/UA tagging

## Dependencies

- Story 39.1 (PDF generation architecture — WeasyPrint service, base template, print CSS must be in place)
- Character calculation engine from Phase 3 (derived stats: modifiers, AC, initiative, proficiency bonus, passive perception)
- Character data model with all fields populated (Django ORM)

## Notes

- HTML/CSS templates replace jsPDF coordinate-based drawing entirely. Use CSS Grid for the three-column page layout and Flexbox for individual sections. WeasyPrint supports CSS3 paged media, Grid, and Flexbox
- Proficiency indicators can be implemented with CSS-styled spans: filled circle (proficient), empty circle (not proficient), double-ring (expertise). Use `border-radius: 50%` and `background` properties
- The layout should closely match the official 5e character sheet for player familiarity
- For long personality traits or feature lists, CSS `overflow: hidden` with `text-overflow: ellipsis` provides a cleaner approach than JavaScript-based font resizing. Alternatively, use a smaller base font size (8pt) for these sections to accommodate more content
