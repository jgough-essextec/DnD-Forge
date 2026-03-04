# Story 39.4 — Page 3: Spellcasting Layout

> **Epic 39: PDF Character Sheet Export** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description

As a spellcaster, I want a spellcasting page in my character PDF showing my spellcasting stats, spell slots, and full spell list organized by level. This page is a Django HTML template rendered by WeasyPrint, conditionally included only if the character has spellcasting ability. It covers the spellcasting header (class, ability, save DC, attack bonus), cantrips, spell levels 1-9 with slot display and prepared status, and Warlock Pact Magic handling.

## Technical Context

- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router, WeasyPrint (server-side PDF), Playwright (E2E testing)
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Prior Phases Available**: Phases 1-5 (complete character creation, sheet display, session play, DM/campaign features)
- **Performance Targets**: Bundle <500KB, FCP <1.5s, TTI <3s, Lighthouse >90
- **Accessibility Target**: WCAG 2.1 AA compliance
- **PDF Layout**: Django HTML template rendered by WeasyPrint. CSS Grid/Flexbox for layout. Print CSS in `static/pdf/styles.css`
- **Page 3 Structure**: Spellcasting header, cantrips, spell levels 1-9 with slot indicators and prepared markers
- **Spell Data**: From SRD spell data and character's known/prepared spells from Phase 2 creation and Phase 4 session play, passed as Django template context
- **Density Target**: Compact font size (8-9pt) for spell names, CSS multi-column layout for characters with many spells
- **Non-Casters**: This template is conditionally included — omitted entirely for non-caster characters via `{% if %}` in the parent template
- **Warlock Special Case**: Pact Magic displayed in a visually distinct section, separate from regular spell slots

## Tasks

- [ ] **T39.4.1** — Create Django template `templates/pdf/page3_spellcasting.html`. This is an includable template block conditionally rendered only when `character.is_spellcaster` is true in the template context
- [ ] **T39.4.2** — **Spellcasting header section:** HTML layout with labeled boxes for spellcasting class, spellcasting ability, spell save DC, and spell attack bonus. Use CSS Flexbox for horizontal arrangement across the top
- [ ] **T39.4.3** — **Cantrips section:** render known cantrips as a compact list. No slot indicators since cantrips are at-will
- [ ] **T39.4.4** — **Spell levels 1-9:** for each spell level present, render a "Level [N]" heading, slot indicators (CSS-styled circles showing total slots), and a list of spell names with a prepared/unprepared indicator (filled/empty circle). Domain and always-prepared spells marked with a star indicator
- [ ] **T39.4.5** — **Warlock Pact Magic:** if the character has Pact Magic, render a visually distinct section (different border/background) showing "Pact Magic: [N] x Level [M] Slots (Short Rest)" followed by the Warlock spell list. Use `{% if character.has_pact_magic %}` conditional
- [ ] **T39.4.6** — **CSS multi-column layout:** use CSS `column-count: 2` for spell lists when the character has many spells. Compact font size (8-9pt) for spell names to maximize density. WeasyPrint supports CSS multi-column layout
- [ ] **T39.4.7** — **Conditional inclusion in parent template:** update `templates/pdf/character_sheet.html` to include page 3 only when the character is a spellcaster: `{% if character.is_spellcaster %}{% include "pdf/page3_spellcasting.html" %}{% endif %}`
- [ ] **T39.4.8** — Write test: render the template with a Level 3 Wizard fixture and verify the HTML contains spellcasting ability, DC, cantrips, and prepared spells. Verify a non-caster Fighter fixture does not produce a spellcasting page

## Acceptance Criteria

- Spellcasting page is only included in the PDF when the character has spellcasting ability; non-casters produce no spellcasting page
- Spellcasting header displays the correct class, ability, save DC, and spell attack bonus
- Cantrips are listed in a compact format without slot indicators
- Each spell level (1-9) shows a level heading, slot indicators (circles showing total available slots), and spell names with prepared/unprepared markers
- Domain and always-prepared spells are visually distinguished with a star indicator
- Warlock Pact Magic is displayed in a visually distinct section with short rest recovery note, separate from regular spell slots
- CSS multi-column layout is applied when spell count warrants it for maximum density
- Spell names render at a compact font size (8-9pt) for space efficiency
- All spell data is correctly sourced from the character's known/prepared spells in the template context

## Testing Requirements

### Backend Template Rendering Tests (pytest)
_For verifying Django template produces correct HTML with spell data_

- `should render page3_spellcasting.html without template errors for a Level 3 Wizard`
- `should include spellcasting header with class, ability, save DC, and attack bonus in rendered HTML`
- `should include cantrip names in rendered HTML without slot indicators`
- `should include spell level sections with slot indicators and prepared/unprepared markers`
- `should include star indicator for domain/always-prepared spells (Level 5 Cleric fixture)`
- `should include Warlock Pact Magic section with short rest recovery note for a Warlock fixture`
- `should NOT render page3_spellcasting.html when character.is_spellcaster is false`

### Backend PDF Output Tests (pytest + WeasyPrint)
_For verifying end-to-end PDF generation with spellcasting page_

- `should produce a PDF with spellcasting page containing spell names as searchable text for a Wizard`
- `should produce a PDF without a spellcasting page for a non-caster Fighter`
- `should produce a PDF with Pact Magic section for a Warlock, separate from regular spell sections`

### E2E Tests (Playwright)
_For critical user journeys, multi-step flows, full-page interactions_

- `should download a PDF with spellcasting page for a Level 3 Wizard`
- `should download a PDF without spellcasting page for a non-caster Fighter`

### Test Dependencies
- Level 3 Wizard factory/fixture with prepared spells and cantrips
- Level 5 Cleric factory/fixture with domain spells (always-prepared, star indicator)
- Warlock factory/fixture with Pact Magic slots
- Multiclass Warlock/Wizard factory/fixture for testing separate slot display
- Non-caster Fighter factory/fixture
- High-level Wizard factory/fixture with 50+ spells for multi-column layout testing
- PDF text extraction utility for verifying spell names in generated PDFs

## Identified Gaps

- **Edge Cases**: No specification for how ritual-only spells are indicated. Consider an "(R)" suffix on spell names in the template
- **Edge Cases**: Multiclass casters with multiple spellcasting classes (e.g., Cleric/Wizard) need a defined approach — separate spellcasting headers per class, or a combined view?
- **Error Handling**: Behavior when the character has spellcasting ability but no spells known/prepared (e.g., newly created character). Template should show empty spell list sections gracefully
- **Performance**: High-level casters with 50+ spells may produce dense output. CSS multi-column layout handles this but needs visual QA testing

## Dependencies

- Story 39.1 (PDF generation architecture — WeasyPrint service, base template, print CSS)
- Story 39.2 (Page 1 layout — establishes the CSS patterns used here)
- SRD spell data from Phase 1 (spell names, levels, schools)
- Character spell tracking from Phase 2 (creation) and Phase 4 (session play) — known/prepared spells, spell slots

## Notes

- Django templates replace jsPDF coordinate drawing for the spellcasting page. HTML lists and CSS multi-column layout handle spell density far more naturally than manual coordinate positioning
- Warlock multiclassing requires special handling: Pact Magic slots are separate from regular spell slots. The template should check for Pact Magic independently from regular spellcasting
- WeasyPrint supports CSS `column-count` for multi-column layout, which is ideal for dense spell lists. High-level Wizards with 50+ spells benefit from `column-count: 2`
- Ritual-only spells could be marked with an "(R)" suffix in the spell name for convenience
- The conditional inclusion (`{% if character.is_spellcaster %}`) means non-caster PDFs are simply shorter (2 pages instead of 3), which is cleaner than showing an empty page
