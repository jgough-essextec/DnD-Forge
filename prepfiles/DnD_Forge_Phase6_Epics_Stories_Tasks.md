# D&D Character Forge — Phase 6: Polish & Export

## Detailed Epics, Stories & Tasks

**Phase Duration:** Weeks 11–12  
**Phase Goal:** Transform the feature-complete app into a production-quality product. Deliver pixel-accurate PDF character sheet export matching the official 5e layout, an optimized print stylesheet, a full WCAG 2.1 AA accessibility pass across every interactive surface, performance optimization to meet all NFR targets (FCP <1.5s, TTI <3s, Lighthouse >90, bundle <500KB gzipped), PWA installation with complete offline functionality, and a final mobile responsive polish pass resolving every deferred UX issue from Phases 1–5.

**Phase 5 Dependencies:** Phase 6 assumes ALL features from Phases 1–5 are complete and functional. This phase does not add new features — it hardens, optimizes, and perfects what exists. Every epic in Phase 6 cuts across the entire codebase.

---

## Pre-Phase 6 Audit: Deferred Items from Earlier Phases

Phase 6 inherits a collection of "do it later" items explicitly deferred during Phases 1–5. These are consolidated here so nothing is missed.

### From Phase 3 Open Questions

- **OQ1 — Manual Override vs. Computed Values:** Show both computed and overridden values with a "Reset to Computed" button and visual indicator. Deferred to Phase 6 polish.
- **OQ2 — Section-Level Edit Toggles:** Inline section editors as an alternative to full-sheet edit mode. Deferred to Phase 6 polish.
- **OQ4 — Gallery Card "Detailed Cards" Toggle:** Show more stats (spell save DC, initiative, class features) on gallery cards via a toggle. Deferred to Phase 6 polish.
- **OQ5 — Pixel-Perfect PDF Export:** Phase 3 implemented "functional print" (all data, clean layout). Phase 6 upgrades to pixel-matched official 5e sheet layout.
- **OQ6 — Diff-Based Undo Optimization:** Phase 3 uses 20 full character snapshots (~400KB per character in memory). Phase 6 should evaluate and implement a diff-based undo system if memory is a concern at scale.

### From Phase 4 Open Questions

- **OQ1 — Three.js Dice Upgrade:** Phase 4 used CSS 3D transforms. Phase 6 can upgrade to Three.js for physics-based dice tumbling if bundle size permits (~150KB addition).

### Non-Functional Requirements from the Tech Spec

| Requirement | Target | Status After Phase 5 |
|-------------|--------|---------------------|
| First Contentful Paint | < 1.5s | Needs measurement and optimization |
| Time to Interactive | < 3s | Needs measurement and optimization |
| Lighthouse Score | > 90 (all categories) | Needs audit |
| Offline Support | Full functionality (PWA) | Not yet implemented |
| Bundle Size | < 500KB (gzipped, excluding SRD data) | Needs measurement |
| SRD Data Size | Lazy-loaded, < 2MB total | Needs verification |
| Browser Support | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ | Needs cross-browser testing |
| Mobile Support | iOS Safari, Chrome Android | Needs device testing |
| Concurrent Characters | 100+ per user | Needs stress testing |
| Auto-save | Debounced, 500ms after last change | Implemented in Phase 3 |

---

## Epic 39: PDF Character Sheet Export

**Goal:** Generate a downloadable PDF character sheet that faithfully reproduces the official D&D 5e three-page layout with all character data populated, clean typography, proper field sizing, and decorative borders — entirely client-side with no server dependency.

### Story 39.1 — PDF Generation Architecture

> As a developer, I need a reliable client-side PDF generation pipeline that can produce multi-page character sheets with precise layout control.

**Tasks:**

- [ ] **T39.1.1** — Evaluate and select the PDF generation approach. Two viable strategies:
  - **Strategy A — html2canvas + jsPDF:** Render hidden HTML "print templates" to canvas, then embed as images in a PDF. Pros: uses existing React components, CSS-accurate. Cons: raster output (not searchable text), large file sizes (~2-5MB per sheet), blurry at low DPI
  - **Strategy B — jsPDF direct drawing:** Build the PDF layout programmatically using jsPDF's drawing API (lines, rectangles, text positioning). Pros: vector output, crisp at any zoom, searchable text, small files (~200KB). Cons: must manually position every element, no CSS
  - **Recommended: Hybrid** — use jsPDF direct drawing for the structural layout (boxes, borders, labels, decorative elements) and populate character data as positioned text. This produces the crispest, smallest PDFs. Use html2canvas only as a fallback for complex elements like spell lists that would be tedious to position manually
- [ ] **T39.1.2** — Create `utils/pdfExport.ts` — the main export module. Entry point: `exportCharacterPDF(character: Character, options: PDFExportOptions): Promise<Blob>`. Options include: pages to include, paper size (US Letter default, A4 option), include avatar, include DM notes
- [ ] **T39.1.3** — Create `utils/pdfLayout.ts` — defines the coordinate system for the three-page layout. All measurements in mm (jsPDF default). US Letter = 215.9mm × 279.4mm. Define constants for all field positions, box dimensions, and text origins
- [ ] **T39.1.4** — Create `utils/pdfStyles.ts` — typography constants: font families (embed custom fonts or use jsPDF standard fonts), sizes for headings/labels/values, line heights, colors. The aesthetic should match the dark fantasy theme adapted for print (black borders on white background, gold accents as dark amber)
- [ ] **T39.1.5** — Font embedding: jsPDF's default fonts (Helvetica, Times, Courier) don't include Cinzel or Inter. Either embed Cinzel as a base64 TTF (adds ~100KB to bundle) or accept a close substitute (Times New Roman for headings, Helvetica for body). Recommend embedding Cinzel for the authentic D&D feel since it's used throughout the app

### Story 39.2 — Page 1: Core Stats Layout

> As a player exporting my character sheet, I need Page 1 to show all combat-relevant stats in a familiar layout.

**Tasks:**

- [ ] **T39.2.1** — **Character header:** name (large, centered), class & level, background, player name, race, alignment, experience points — arranged in a two-row header block with labeled fields
- [ ] **T39.2.2** — **Ability scores column (left):** six vertical blocks, each containing: score (large number in a box), modifier (derived, in a circle or shield shape below), ability name label. Positioned along the left margin
- [ ] **T39.2.3** — **Saving throws section:** six rows (one per ability), each with: filled/empty proficiency circle, modifier value, ability name. Adjacent to the ability score column
- [ ] **T39.2.4** — **Skills section:** 18 rows, each with: filled/empty proficiency circle (double-filled for expertise), modifier value, skill name. Grouped visually below saving throws
- [ ] **T39.2.5** — **Inspiration & proficiency bonus:** two small boxes at the top of the saves/skills column. Proficiency bonus auto-populated
- [ ] **T39.2.6** — **Passive Perception:** labeled box below skills showing the computed value
- [ ] **T39.2.7** — **Combat stats row (center-top):** three prominent boxes: AC (with armor type note), Initiative, Speed. Positioned prominently
- [ ] **T39.2.8** — **Hit Points block (center):** HP Maximum (labeled), Current HP (large box), Temporary HP (smaller box). Below: Hit Dice (total and type), Death Saves (three success circles, three failure circles)
- [ ] **T39.2.9** — **Attacks & Spellcasting table (center-bottom):** table with columns: Name, Atk Bonus, Damage/Type. Pre-populated with character's equipped weapons and cantrip attacks. Space for additional rows
- [ ] **T39.2.10** — **Personality block (right column):** four labeled boxes stacked vertically: Personality Traits, Ideals, Bonds, Flaws. Text auto-sized to fit (reduce font size for long entries)
- [ ] **T39.2.11** — **Features & Traits (right column, bottom):** scrollable text block listing all racial traits, class features, and feat descriptions. Truncate with "..." if content exceeds available space, with a note: "See full sheet for complete features"
- [ ] **T39.2.12** — **Proficiencies & Languages (bottom-left):** labeled box listing armor, weapon, tool, and language proficiencies

### Story 39.3 — Page 2: Backstory & Description Layout

> As a player, I need Page 2 of my PDF to contain all the roleplay and backstory information.

**Tasks:**

- [ ] **T39.3.1** — **Character appearance block:** labeled fields for age, height, weight, eyes, skin, hair. Character portrait area (square, top-right) — populated with avatar image if one exists, otherwise a placeholder silhouette
- [ ] **T39.3.2** — **Backstory block:** large text area with the character's backstory. Auto-size font to fit, with a minimum readable size of 8pt. Overflow handled by continuing onto additional pages if needed
- [ ] **T39.3.3** — **Allies & Organizations:** labeled text block with organization names and descriptions
- [ ] **T39.3.4** — **Additional Features & Traits:** continuation of features that didn't fit on Page 1
- [ ] **T39.3.5** — **Treasure:** currency summary (CP, SP, EP, GP, PP with amounts) and notable treasure items
- [ ] **T39.3.6** — **Equipment list:** full inventory with item names, quantities, and weights. Total weight at the bottom with carrying capacity reference

### Story 39.4 — Page 3: Spellcasting Layout

> As a spellcaster, I need Page 3 to show my spellcasting stats, spell slots, and full spell list organized by level.

**Tasks:**

- [ ] **T39.4.1** — **Spellcasting header:** spellcasting class, spellcasting ability, spell save DC, spell attack bonus — all in labeled boxes across the top
- [ ] **T39.4.2** — **Cantrips section:** list of known cantrips with names. Compact format since cantrips don't use slots
- [ ] **T39.4.3** — **Spell levels 1–9:** for each level, show: "Level [N]" header, slots total (circle row: filled = max slots), then a list of spell names with a checkbox/circle for "Prepared" status. Mark prepared spells as filled, unprepared as empty. Domain/always-prepared spells marked with a star
- [ ] **T39.4.4** — **Warlock Pact Magic:** separate section at the top of the spell list, visually distinct. Shows "Pact Magic: [N] × Level [M] Slots (Short Rest)" followed by Warlock spell list
- [ ] **T39.4.5** — **Spell list density:** fit as many spells per column as possible. Use two columns for spell lists if the character has many spells. Font size 7–8pt for spell names to maximize space
- [ ] **T39.4.6** — **Non-casters:** if the character has no spellcasting, Page 3 shows "No Spellcasting" centered, or the page is omitted entirely based on export options

### Story 39.5 — PDF Export Options & UI

> As a player, I need a clear export dialog that lets me choose what to include in my PDF and download it.

**Tasks:**

- [ ] **T39.5.1** — Create `components/export/PDFExportModal.tsx` — triggered by the "Export PDF" button on the character sheet quick-action bar and gallery card context menu
- [ ] **T39.5.2** — Export options dialog:
  - Page selection: checkboxes for "Page 1: Core Stats" (default on), "Page 2: Backstory & Description" (default on), "Page 3: Spellcasting" (default on for casters, off for non-casters)
  - Paper size: US Letter (default) or A4
  - Include avatar image: toggle (default on if avatar exists)
  - Include DM notes: toggle (default off, only visible in DM context)
  - Color scheme: "Classic" (black & white with amber accents) or "Minimal" (pure black & white, less ink)
- [ ] **T39.5.3** — **PDF preview:** render a low-resolution thumbnail preview of Page 1 in the modal so the player sees what they'll get before exporting. Use html2canvas at 0.5× scale on a hidden PDF preview component
- [ ] **T39.5.4** — **"Export PDF" button:** generates the PDF, shows a progress indicator ("Generating PDF..."), then triggers a browser download. Filename: `[CharacterName]_Level[N]_[Class].pdf` (sanitized)
- [ ] **T39.5.5** — **"Print" button:** alternative action that opens the browser print dialog with the PDF content rendered in a print-friendly layout (same content, using `@media print` styles instead of PDF generation)
- [ ] **T39.5.6** — **Batch export:** from the gallery, select multiple characters and "Export All as PDFs." Generates individual PDFs in a ZIP file (using JSZip library) or downloads them sequentially
- [ ] **T39.5.7** — Error handling: if PDF generation fails (e.g., out of memory on very large characters), show a graceful error: "PDF generation failed. Try exporting fewer pages or reducing backstory length." Fallback to the print stylesheet

### Story 39.6 — Campaign Export to PDF

> As a DM, I need to export a campaign summary PDF showing all party members' key stats.

**Tasks:**

- [ ] **T39.6.1** — "Export Party Summary" option on the campaign dashboard. Generates a single PDF with: campaign name, description, and a one-page-per-character summary (condensed: name, race, class, level, ability scores, AC, HP, key features, spell save DC)
- [ ] **T39.6.2** — **Party overview page:** first page of the campaign PDF is a summary table showing all characters' key stats (same data as the party stats grid). Useful as a DM quick-reference printout
- [ ] **T39.6.3** — Option to include full character sheets (3 pages each) after the summary, creating a comprehensive campaign binder PDF

---

## Epic 40: Print Stylesheet Optimization

**Goal:** Perfect the `@media print` CSS so that printing directly from the browser produces a clean, professional character sheet without needing the PDF export — as a fast alternative for players who just want a quick printout.

### Story 40.1 — Print Layout Refinement

> As a player who clicks "Print" in the browser, I need a clean, ink-efficient printout with no UI chrome.

**Tasks:**

- [ ] **T40.1.1** — Audit and refine `styles/character-sheet-print.css` (created in Phase 3). Ensure ALL of the following are hidden in print: navigation bar, sidebar, edit buttons, mode toggles, floating action buttons, dice roller panel, conditions tracker badges (show as text instead), roll history, session play widgets, hover/focus styles
- [ ] **T40.1.2** — Force white background with dark text across all elements. Override the dark fantasy theme entirely for print. Remove all background textures, gradients, and decorative shadows
- [ ] **T40.1.3** — Page break control: each character sheet page (Stats, Backstory, Spells) starts on a new printed page. Use `page-break-before: always` on page containers. Prevent orphaned headers: `break-after: avoid` on section headings
- [ ] **T40.1.4** — Typography: switch from screen-optimized sizes to print-optimized. Use pt-based font sizes (10pt body, 14pt headings, 8pt labels). Ensure Cinzel headings render in print (include `@font-face` with `print` in media query, or fall back to a serif system font)
- [ ] **T40.1.5** — Table printing: ensure the attacks table, equipment list, and spell lists don't break mid-row across pages. Use `break-inside: avoid` on table rows
- [ ] **T40.1.6** — Ink-saving mode: a print-specific class that reduces border weights, removes decorative elements, and uses lighter grays instead of solid blacks. Toggled via a "Low Ink" checkbox in the print options dialog

### Story 40.2 — Print-Specific Layouts

> As a developer, I need print layouts that differ from screen layouts to maximize paper real estate.

**Tasks:**

- [ ] **T40.2.1** — **Page 1 print layout:** force the three-column desktop layout regardless of the user's screen size. Left column: ability scores, saves, skills. Center: combat stats, HP, attacks. Right: personality, features
- [ ] **T40.2.2** — **Page 2 print layout:** two-column layout. Left: appearance fields + backstory. Right: allies/orgs + equipment + treasure. Portrait in top-right corner
- [ ] **T40.2.3** — **Page 3 print layout:** multi-column spell list layout. Two or three columns of spell names to maximize density. Spell slot circles rendered as printable outlines
- [ ] **T40.2.4** — **Gallery print:** printing from the gallery page produces a compact roster — one character summary per third-page (3 characters per printed page). Shows name, race, class, level, AC, HP, key stats
- [ ] **T40.2.5** — **Campaign dashboard print:** printing the party stats grid produces a clean data table with all player stats. Useful as a DM reference sheet

### Story 40.3 — Cross-Browser Print Testing

> As a player using any modern browser, I need consistent print output.

**Tasks:**

- [ ] **T40.3.1** — Test and fix print output in Chrome (primary), Firefox, Safari, and Edge. Document known discrepancies (e.g., Safari handles `break-inside` differently)
- [ ] **T40.3.2** — Test print preview vs. actual printed output for paper-size accuracy. Verify margins don't clip content
- [ ] **T40.3.3** — Mobile print: verify "Print" action works from mobile browsers (Chrome Android, iOS Safari). On mobile, "Print" may use the OS share sheet for "Print" or "Save as PDF"

---

## Epic 41: Accessibility Audit & Remediation

**Goal:** Achieve WCAG 2.1 AA compliance across the entire application. Every interactive element must be keyboard navigable, all content must meet color contrast requirements, screen readers must be able to navigate the full character sheet, and all animations must respect reduced motion preferences.

### Story 41.1 — Keyboard Navigation Audit

> As a player who uses a keyboard, I need to navigate the entire app without a mouse.

**Tasks:**

- [ ] **T41.1.1** — **Tab order audit:** verify that Tab key navigation follows a logical reading order on every page. Fix any elements that break the tab sequence (e.g., floating panels, modals that don't trap focus, absolutely positioned elements)
- [ ] **T41.1.2** — **Focus trap for modals:** all modals (creation wizard, level-up, rest, dice roller, PDF export, campaign management) must trap focus within the modal while open. Esc closes the modal. Focus returns to the triggering element on close
- [ ] **T41.1.3** — **Keyboard shortcuts:** document and implement keyboard shortcuts for core actions:
  - `D` — Open dice roller
  - `R` — Quick roll d20
  - `E` — Toggle edit mode (on character sheet)
  - `S` — Short rest
  - `L` — Long rest
  - `N` — Next turn (in combat tracker)
  - `/` — Focus search input (gallery, skill matrix)
  - `Esc` — Close modal/panel
  - Show shortcuts in a "Keyboard Shortcuts" help dialog (`?` key)
- [ ] **T41.1.4** — **Interactive elements:** verify all clickable elements (proficiency circles, spell slot circles, condition badges, roll buttons, gallery cards, stat blocks) are reachable and activatable via keyboard (Enter or Space)
- [ ] **T41.1.5** — **Drag-and-drop alternatives:** the creation wizard's ability score assignment and initiative reordering use drag-and-drop (@dnd-kit). Provide keyboard alternatives: arrow keys to reorder, or a "Move Up/Move Down" button pair
- [ ] **T41.1.6** — **Focus visible indicators:** verify that every focusable element has a clearly visible focus outline. The dark theme requires high-contrast focus rings (gold or white outline, 2px minimum). Never use `outline: none` without a replacement

### Story 41.2 — Screen Reader Compatibility

> As a player using a screen reader, I need the character sheet and all interactive elements to be properly announced.

**Tasks:**

- [ ] **T41.2.1** — **ARIA labels on all form controls:** audit every input, select, checkbox, toggle, and button. Each must have an accessible label via `aria-label`, `aria-labelledby`, or a visible `<label>` element. No unlabeled inputs
- [ ] **T41.2.2** — **Ability score blocks:** announce as "Strength: Score 16, Modifier +3" not just "16" and "+3" as separate elements. Use `aria-label` on the block container
- [ ] **T41.2.3** — **Skills list:** each skill row should announce: "[skill name], modifier [value], [proficient/not proficient/expertise]". The proficiency circle alone conveys no meaning to a screen reader — add `aria-label="Proficient"` or `aria-label="Not proficient"`
- [ ] **T41.2.4** — **Dice roll announcements:** use `aria-live="assertive"` on the roll result area. When a die is rolled, announce: "Rolled [expression]: [result]. [Context: e.g., 'Athletics check']". Critical hits/fumbles get enhanced announcements
- [ ] **T41.2.5** — **Spell slot circles:** announce as "Level 1 spell slots: 2 of 4 remaining" not as a series of unlabeled circles. Use `role="group"` with `aria-label` on the slot row
- [ ] **T41.2.6** — **Death save circles:** announce as "Death saves: 1 success, 2 failures" on the group. Individual circles announce "Success 1 of 3, filled" or "Failure 2 of 3, empty"
- [ ] **T41.2.7** — **Gallery cards:** each card is a semantic `<article>` with `aria-label="[Character name], Level [N] [Race] [Class]"`. Sort and filter controls have descriptive labels
- [ ] **T41.2.8** — **Combat tracker:** current turn combatant announced via `aria-live="polite"` when turn advances: "Current turn: [Name], [Type]". Initiative order is a list with semantic `role="list"`
- [ ] **T41.2.9** — **Modals and dialogs:** use `role="dialog"` with `aria-labelledby` pointing to the modal title. `aria-modal="true"` to indicate the rest of the page is inert
- [ ] **T41.2.10** — **Tables:** data tables (party stats grid, skill matrix, attacks table) use proper `<th>` headers with `scope="col"` or `scope="row"`. Complex tables use `aria-describedby` for context

### Story 41.3 — Color Contrast & Visual Accessibility

> As a player with low vision or color blindness, I need the app to have sufficient contrast and not rely solely on color to convey information.

**Tasks:**

- [ ] **T41.3.1** — **Contrast audit:** test every text/background combination against WCAG 2.1 AA requirements (4.5:1 for normal text, 3:1 for large text). The dark fantasy theme poses specific challenges:
  - `text-primary (#eee8d5) on bg-primary (#1a1a2e)` = ~11.2:1 ✓
  - `text-secondary (#93a1a1) on bg-primary (#1a1a2e)` = ~5.8:1 ✓
  - `text-muted (#657b83) on bg-primary (#1a1a2e)` = ~3.5:1 ✗ — needs to be lightened to ~#7d9199 for 4.5:1
  - `accent-gold (#e8b430) on bg-primary (#1a1a2e)` = ~7.1:1 ✓ for large text, verify for small text
  - Audit all condition badge colors (red, orange, yellow, green) on their backgrounds
- [ ] **T41.3.2** — **Color-blind safe indicators:** proficiency circles, spell slot circles, and condition badges must not rely solely on color. Add shape distinctions: filled circle (proficient), empty circle (not proficient), double-ring (expertise). Condition badges include text labels alongside colors
- [ ] **T41.3.3** — **HP bar accessibility:** the green/yellow/red HP gradient must include a text overlay showing the numeric value. Don't rely on color alone to communicate HP status
- [ ] **T41.3.4** — **Dice result indicators:** critical hit (nat 20) and fumble (nat 1) use gold/red highlights. Add text labels: "CRITICAL!" and "FUMBLE!" in addition to the color change
- [ ] **T41.3.5** — **High contrast mode:** a user preference toggle that increases all border weights, text contrast, and reduces transparency/overlay effects. Stored in preferences, applied via a CSS class on the root element

### Story 41.4 — Reduced Motion & Animation Preferences

> As a player sensitive to motion, I need all animations to respect my system preference or an in-app toggle.

**Tasks:**

- [ ] **T41.4.1** — Audit all animations in the app: dice tumble animation, page transitions (framer-motion), hover effects, loading spinners, toast notifications, modal open/close, condition badge pulse, level-up celebration, HP bar changes, death save fills
- [ ] **T41.4.2** — Wrap all animations in a `prefers-reduced-motion` media query check. When reduced motion is preferred: dice show results instantly (no tumble), page transitions are instant (no slide), modals appear/disappear without animation, HP changes are instant (no animated counting), toasts appear without slide-in
- [ ] **T41.4.3** — In-app "Reduce Motion" toggle in settings (Phase 3 Story 25.3). This overrides the system preference for users who want reduced motion only in this app. Store in preferences, apply via a CSS class and a React context value that animation components check
- [ ] **T41.4.4** — Loading states: replace spinning loaders with static "Loading..." text or a simple progress bar when reduced motion is active

### Story 41.5 — Form Accessibility

> As a player filling out forms (creation wizard, edit mode, campaign creation), I need clear labels, error messages, and required field indicators.

**Tasks:**

- [ ] **T41.5.1** — **Error messages:** all form validation errors must be associated with their input via `aria-describedby`. Error text must be visible (not just a red border). Screen reader announcement: when an error appears, use `aria-live="polite"` on the error container
- [ ] **T41.5.2** — **Required fields:** mark required fields with both a visual indicator (asterisk) and `aria-required="true"`. Group related required fields with `<fieldset>` and `<legend>` where appropriate
- [ ] **T41.5.3** — **Wizard step progress:** the creation wizard's step sidebar must announce current step: "Step 3 of 7: Ability Scores." Use `aria-current="step"` on the active step
- [ ] **T41.5.4** — **Auto-complete and search inputs:** the skill matrix search, SRD monster search, spell browser search, and NPC autocomplete must use `role="combobox"` with proper `aria-expanded`, `aria-activedescendant`, and `aria-controls` attributes
- [ ] **T41.5.5** — **Touch targets:** verify all interactive elements have a minimum tap target of 44×44px (WCAG 2.5.5). Proficiency circles, spell slot circles, and condition badges are the most likely violators — increase hit areas with padding or invisible touch-target expansions

---

## Epic 42: Performance Optimization

**Goal:** Meet all non-functional performance requirements — FCP <1.5s, TTI <3s, Lighthouse >90, bundle <500KB gzipped, SRD data lazy-loaded <2MB — through code splitting, lazy loading, memoization, virtual scrolling, and build optimization.

### Story 42.1 — Bundle Size Analysis & Reduction

> As a developer, I need the production bundle to be under 500KB gzipped (excluding SRD data) for fast initial loads.

**Tasks:**

- [ ] **T42.1.1** — Run `npx vite-bundle-visualizer` (or `rollup-plugin-visualizer`) to generate a treemap of the production bundle. Identify the largest dependencies. Expected heavy hitters: React (~45KB), jsPDF (~200KB), html2canvas (~100KB), framer-motion (~60KB), Three.js (~150KB if added), Dexie (~25KB), SRD data files
- [ ] **T42.1.2** — **Code splitting with lazy imports:** split the app into route-based chunks:
  - Core chunk: React, router, Zustand, Tailwind runtime, shared components
  - Gallery chunk: gallery components (loaded on `/`)
  - Sheet chunk: character sheet components (loaded on `/character/:id`)
  - Wizard chunk: creation wizard components (loaded on `/character/new`)
  - DM chunk: campaign dashboard, combat tracker, session log (loaded on `/campaign/*`)
  - Dice chunk: dice roller, animations (loaded on first dice roll trigger)
  - PDF chunk: jsPDF, html2canvas, PDF layout (loaded on export action)
  Use `React.lazy()` and `Suspense` with route-level splitting
- [ ] **T42.1.3** — **Tree-shaking audit:** verify that unused exports from large libraries are tree-shaken. Check: lucide-react (import only used icons, not the entire set), lodash (use `lodash-es` for tree-shaking), shadcn/ui (only import used components)
- [ ] **T42.1.4** — **Font optimization:** Cinzel and Inter are Google Fonts loaded externally. Options: (a) self-host with `font-display: swap` and subset to only the characters used (Latin), (b) use system font stack as fallback during load. Cinzel: subset to uppercase + digits for headings only (~30KB instead of ~100KB)
- [ ] **T42.1.5** — **Image optimization:** avatar images are stored as base64 in IndexedDB. Ensure the resize/crop step (Phase 3) produces optimized JPEGs at ≤100KB per avatar. Race/class placeholder images: use inline SVGs instead of PNGs

### Story 42.2 — SRD Data Lazy Loading

> As a developer, I need SRD data to load on demand, not at initial page load, to keep TTI under 3 seconds.

**Tasks:**

- [ ] **T42.2.1** — **Data splitting strategy:** separate SRD data into tiers:
  - **Tier 1 (always loaded, ~50KB):** races.json (names + key traits only), classes.json (names + hit die + key info only), ability score tables, proficiency bonus table, conditions list, XP thresholds. This is enough to render the gallery and basic sheet
  - **Tier 2 (loaded on demand, ~200KB each):** full race details (loaded when race step opens), full class features (loaded when class step opens or sheet features section renders), equipment.json (loaded when equipment step or inventory renders)
  - **Tier 3 (loaded on demand, ~500KB):** spells.json (loaded when spell step opens or spell page renders). This is typically the largest single file
  - **Tier 4 (loaded on demand, ~300KB):** monsters.json index (loaded when DM starts an encounter). Full monster stat blocks loaded individually
- [ ] **T42.2.2** — Implement a `DataLoader` utility that uses dynamic `import()` for JSON files. Cache loaded data in memory (Zustand store) so subsequent accesses are instant. Show skeleton loading states while data loads
- [ ] **T42.2.3** — **Preloading hints:** when the user navigates to the creation wizard, preload Tier 2 data in the background (using `requestIdleCallback`). When navigating to a character sheet, preload the spell data if the character is a caster
- [ ] **T42.2.4** — Measure total SRD data payload: target <2MB for all tiers combined. If over, compress JSON files (Vite can gzip static assets) or trim unused fields from the source data

### Story 42.3 — Rendering Performance

> As a player with many characters or a DM with a large party, I need the app to remain responsive even with 100+ characters.

**Tasks:**

- [ ] **T42.3.1** — **Gallery virtualization:** when the gallery has 50+ characters, use virtual scrolling (react-window or @tanstack/virtual) to only render visible cards. Measure: gallery with 100 characters should maintain 60fps scroll
- [ ] **T42.3.2** — **Memoization audit:** review all components for unnecessary re-renders. Use `React.memo()` on: CharacterCard, AbilityScoreBlock, SkillRow, SpellCard, CombatantRow, all table cells. Use `useMemo()` for: derived calculations, filtered/sorted lists, spell slot computations
- [ ] **T42.3.3** — **Calculation engine caching:** the calculation engine recomputes derived stats on every render. Implement a memoization layer: cache results keyed on the character's version/timestamp. Invalidate when character data changes
- [ ] **T42.3.4** — **IndexedDB read optimization:** batch reads for the gallery (load all characters in one query, not one query per card). Use Dexie's `.toArray()` for bulk reads. For the campaign dashboard, load all party characters in a single query
- [ ] **T42.3.5** — **Debounce expensive operations:** spell search filtering, skill matrix highlighting, and gallery search should debounce input by 150ms to avoid re-filtering on every keystroke
- [ ] **T42.3.6** — **Image lazy loading:** avatar images in the gallery use `loading="lazy"` on `<img>` tags. Only decode images when they scroll into view

### Story 42.4 — Core Web Vitals & Lighthouse

> As a developer, I need Lighthouse scores above 90 in all categories.

**Tasks:**

- [ ] **T42.4.1** — Run Lighthouse audit (Performance, Accessibility, Best Practices, SEO) on the production build. Establish baseline scores for: home page (gallery), character sheet, creation wizard, campaign dashboard
- [ ] **T42.4.2** — **FCP optimization (<1.5s):** ensure critical CSS is inlined or loaded synchronously. Fonts use `font-display: swap`. No render-blocking scripts. Use Vite's `build.cssCodeSplit` for per-route CSS
- [ ] **T42.4.3** — **LCP optimization:** identify the Largest Contentful Paint element on each page (likely the gallery grid or character sheet header). Ensure it renders in <2.5s. Preload hero fonts and critical images
- [ ] **T42.4.4** — **CLS optimization (<0.1):** prevent layout shifts from: font loading (use `font-display: swap` with fallback dimensions), image loading (set explicit width/height on avatar images), dynamic content injection (reserve space for lazy-loaded components with skeleton placeholders)
- [ ] **T42.4.5** — **INP optimization (<200ms):** profile interaction responsiveness. Dice rolls, button clicks, and form inputs must respond within 200ms. Heavy operations (PDF generation, bulk import) use Web Workers or show a blocking modal with progress indicator
- [ ] **T42.4.6** — **Best Practices:** ensure HTTPS (handled by deployment), no console errors in production, no deprecated APIs, Content-Security-Policy headers, proper cache headers for static assets
- [ ] **T42.4.7** — **SEO (if applicable):** proper `<meta>` tags, `<title>` per page, Open Graph tags for share links, robots.txt, sitemap.xml. Add structured data for the app (WebApplication schema)

### Story 42.5 — Stress Testing

> As a developer, I need to verify the app handles edge cases at scale.

**Tasks:**

- [ ] **T42.5.1** — **100+ characters test:** create a script that generates 100+ characters with varied classes, races, levels, and equipment. Load the gallery and measure: initial render time, scroll performance, search filter responsiveness, IndexedDB query time
- [ ] **T42.5.2** — **Large campaign test:** create a campaign with 8 characters, 20 session notes, 50 NPC entries, and 100 loot items. Measure dashboard load time and interaction responsiveness
- [ ] **T42.5.3** — **Long combat test:** run an encounter with 8 party members + 20 monsters. Cycle through 10 rounds of combat. Measure: turn advance speed, HP update responsiveness, condition management, memory usage over time
- [ ] **T42.5.4** — **Memory leak detection:** use Chrome DevTools Memory tab to take heap snapshots before and after: creating 10 characters, opening/closing 10 modals, running 100 dice rolls, navigating through 20 character sheets. Verify no growing memory allocations
- [ ] **T42.5.5** — **IndexedDB storage limits:** test with characters that have very long backstories (10,000+ chars), large inventories (100+ items), and extensive spell lists. Verify no storage quota errors

---

## Epic 43: Progressive Web App (PWA)

**Goal:** Make the app installable on any device (desktop, mobile) with full offline functionality. All features must work without an internet connection after the initial load, since the app is local-first with IndexedDB storage.

### Story 43.1 — Service Worker & Offline Caching

> As a player at a table with no Wi-Fi, I need the app to work completely offline after my first visit.

**Tasks:**

- [ ] **T43.1.1** — Install and configure `vite-plugin-pwa` in `vite.config.ts`. Configuration:
  - `registerType: 'prompt'` — show a prompt when updates are available rather than auto-reloading
  - `workbox.globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}']` — pre-cache all static assets including SRD data files and fonts
  - `includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'fonts/*', 'icons/*']` — ensure all PWA assets are cached
- [ ] **T43.1.2** — **Service worker strategy:** use "pre-cache app shell + runtime cache data" approach:
  - Pre-cache: all JS/CSS bundles, HTML, fonts, icons, and Tier 1 SRD data
  - Runtime cache (CacheFirst): Tier 2/3/4 SRD data files (cached on first request, served from cache thereafter)
  - Runtime cache (NetworkFirst): no external API calls to cache in the current architecture, but structure is ready for future sync features
- [ ] **T43.1.3** — **Offline verification:** after installing the service worker, toggle airplane mode and verify: gallery loads, character sheets render, dice roller works, creation wizard completes (all SRD data must be cached), campaign dashboard loads, combat tracker functions, PDF export works (jsPDF is client-side)
- [ ] **T43.1.4** — **SRD data pre-caching:** the SRD JSON files (~2MB total) must be pre-cached on service worker install, not lazily. Otherwise the first offline visit after install will fail if the user hasn't visited every page. Add all SRD files to the workbox pre-cache manifest
- [ ] **T43.1.5** — **Update flow:** when a new version is deployed, the service worker detects the update. Show a non-intrusive toast: "A new version of D&D Character Forge is available. [Reload to update]". Clicking reloads and activates the new service worker. Never auto-reload (the user might be mid-session)

### Story 43.2 — Web App Manifest

> As a player, I need to install the app on my device's home screen with a proper icon and app name.

**Tasks:**

- [ ] **T43.2.1** — Create `manifest.webmanifest` (auto-generated by vite-plugin-pwa) with:
  ```json
  {
    "name": "D&D Character Forge",
    "short_name": "Char Forge",
    "description": "Create, manage, and play D&D 5e characters",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#1a1a2e",
    "theme_color": "#e8b430",
    "orientation": "any",
    "categories": ["games", "entertainment", "utilities"]
  }
  ```
- [ ] **T43.2.2** — **App icons:** generate icon set from a single source image (d20 die or the app logo):
  - 192×192 PNG (Android home screen)
  - 512×512 PNG (Android splash screen)
  - 180×180 PNG (Apple touch icon)
  - 32×32 and 16×16 favicon
  - Maskable icon variant (safe zone for adaptive icons on Android)
  - SVG favicon for modern browsers
- [ ] **T43.2.3** — **iOS-specific meta tags:** Apple doesn't fully support the web app manifest. Add:
  ```html
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Char Forge">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  ```
- [ ] **T43.2.4** — **Splash screens:** generate Apple splash screen images for common iOS device sizes (iPhone, iPad). Or use the `theme_color` + icon fallback which is simpler and covers most cases
- [ ] **T43.2.5** — **Install prompt:** create an `InstallPWA` component that detects the `beforeinstallprompt` event (Chrome/Edge) and shows a custom install banner: "Install D&D Character Forge for offline access!" with "Install" and "Not now" buttons. Don't show on subsequent visits if dismissed

### Story 43.3 — Offline UX Indicators

> As a player, I need to know when I'm offline and be assured that my data is safe.

**Tasks:**

- [ ] **T43.3.1** — **Network status indicator:** a small badge in the app header that shows online/offline status. Online: hidden (no indicator needed). Offline: show a subtle "Offline" badge with a cloud-slash icon. Use `navigator.onLine` and the `online`/`offline` events
- [ ] **T43.3.2** — **Data safety messaging:** when offline, if the user makes changes (edit character, create new character, run combat), show a subtle reassurance: "Changes saved locally." No data is lost because the app is local-first — there's nothing to sync. This message preempts anxiety about offline data loss
- [ ] **T43.3.3** — **Feature availability:** all features work offline in the current architecture (no backend). If future phases add sync features, those specific actions should be grayed out with "Available when online" tooltips. For Phase 6, nothing needs to be disabled
- [ ] **T43.3.4** — **First-time offline experience:** if a user installs the PWA and goes offline before SRD data is fully cached, show a helpful message: "Some game data is still loading. Please connect to the internet briefly to complete the setup." Track caching progress and show a completion indicator

---

## Epic 44: Mobile Responsive Final Polish

**Goal:** Final pass on every screen at every breakpoint (mobile <640px, tablet 640–1024px, desktop 1024–1440px, wide >1440px) resolving all layout issues, touch target sizes, scrolling behaviors, and mobile-specific UX patterns.

### Story 44.1 — Mobile Layout Audit & Fixes

> As a player on a phone, I need every screen in the app to be usable without horizontal scrolling or overlapping elements.

**Tasks:**

- [ ] **T44.1.1** — **Systematic audit:** test every page at 360px width (smallest common phone), 390px (iPhone 14), and 428px (iPhone 14 Pro Max). Screens to test: gallery, character sheet (all 3 pages), creation wizard (all steps), edit mode, dice roller, session compact view, campaign list, campaign dashboard, combat tracker, session log, NPC tracker, loot tracker, PDF export modal, settings
- [ ] **T44.1.2** — **Gallery mobile polish:** card grid should be single column at <640px. Card height consistent. Long character names truncate with ellipsis. Filter/sort controls collapse into a dropdown or bottom sheet rather than taking up screen space
- [ ] **T44.1.3** — **Creation wizard mobile:** step sidebar becomes a horizontal progress bar at the top. Step content scrolls vertically. "Back" and "Next" buttons are sticky at the bottom for easy thumb reach. Race and class cards stack in a single column
- [ ] **T44.1.4** — **Character sheet mobile:** verify the Phase 3 mobile layout (Story 24.3) works with all Phase 4 additions (dice roller, HP widget, spell slot tracker, conditions strip). The floating action bar at the bottom must not overlap with content
- [ ] **T44.1.5** — **Combat tracker mobile:** the initiative list should be the primary view (full width). Combatant details expand inline on tap. "Next Turn" button is a large, full-width button at the bottom. HP editing opens a bottom sheet

### Story 44.2 — Tablet Layout Audit & Fixes

> As a player using a tablet at the game table, I need the app to use the extra screen space effectively.

**Tasks:**

- [ ] **T44.2.1** — **Tablet audit:** test at 768px (iPad Mini), 810px (iPad), and 1024px (iPad Pro 11"). All screens should use two-column layouts where appropriate
- [ ] **T44.2.2** — **Campaign dashboard tablet:** party stats grid should show all columns without horizontal scrolling. If too wide, hide the least important columns (conditions, notes) and make them expandable
- [ ] **T44.2.3** — **Combat tracker tablet:** side-by-side layout — initiative list on the left (60%), selected combatant detail on the right (40%). No full-screen modals for HP editing — use the detail panel
- [ ] **T44.2.4** — **Dice roller tablet:** side panel (right edge, 30% width) rather than a full-screen overlay. Stays visible while the character sheet is open for seamless rolling

### Story 44.3 — Touch Interaction Polish

> As a player using a touchscreen, I need all interactions to feel native and responsive.

**Tasks:**

- [ ] **T44.3.1** — **Touch targets:** final audit of all interactive elements for the 44×44px minimum. Known small targets: proficiency circles (~24px), spell slot circles (~20px), death save circles, condition badge X buttons, skill matrix cells. Expand touch areas with transparent padding
- [ ] **T44.3.2** — **Swipe gestures:** verify bottom-sheet swipe-to-dismiss works smoothly (dice roller on mobile, HP widget). No conflict with browser's swipe-to-go-back gesture on iOS Safari
- [ ] **T44.3.3** — **Long-press behaviors:** document and test all long-press interactions (die quantity selector, re-roll from history, stat breakdown tooltip). Ensure they don't conflict with the OS context menu. Use a 300ms delay and haptic feedback (where supported via `navigator.vibrate`)
- [ ] **T44.3.4** — **Scroll behavior:** no scroll-jacking. Content scrolls naturally. Nested scrollable areas (spell list within a page, roll history within the dice panel) have clear scroll boundaries and don't leak scroll events to the parent
- [ ] **T44.3.5** — **Input handling:** numeric inputs (HP damage, XP amount, gold) use `inputmode="numeric"` to trigger the numeric keyboard on mobile. Dice expression input uses `inputmode="text"` with autocomplete suggestions

### Story 44.4 — Landscape Mode

> As a player holding their phone sideways, I need the app to adapt to landscape orientation.

**Tasks:**

- [ ] **T44.4.1** — **Landscape mobile (640×360):** verify no layout breaks. The session compact view should switch to a two-column layout (HP/actions left, stats/spells right). The dice roller panel should use landscape width efficiently
- [ ] **T44.4.2** — **Landscape tablet (1024×768):** should render the desktop layout at this size. Verify no elements are clipped or overlapping
- [ ] **T44.4.3** — **Orientation change:** test rotating the device mid-interaction (e.g., while the dice roller is open, while editing a character). UI should reflow without losing state or closing modals

---

## Epic 45: Cross-Browser Testing & Bug Fixes

**Goal:** Verify the app works correctly on all supported browsers (Chrome 90+, Firefox 90+, Safari 15+, Edge 90+, iOS Safari, Chrome Android) and fix any browser-specific bugs.

### Story 45.1 — Cross-Browser Functional Testing

> As a developer, I need the app to work on all target browsers.

**Tasks:**

- [ ] **T45.1.1** — **Test matrix:** test core flows on each browser: character creation, character sheet rendering, dice rolling, HP tracking, rest automation, level-up, campaign management, combat tracker, PDF export, import/export
- [ ] **T45.1.2** — **Safari-specific issues:** test IndexedDB reliability (Safari has historically had bugs with IndexedDB). Test `crypto.getRandomValues()` for dice. Test CSS: `backdrop-filter` (used for modals), `gap` in flexbox, CSS custom properties. Test PWA installation on iOS Safari
- [ ] **T45.1.3** — **Firefox-specific issues:** test `@media print` rendering (Firefox handles page breaks differently). Test CSS: `overflow: auto` with nested flex containers, scrollbar styling
- [ ] **T45.1.4** — **Edge-specific issues:** Edge uses Chromium so most things should work identically to Chrome. Test PWA installation. Test PDF download behavior
- [ ] **T45.1.5** — **Mobile browser testing:** Chrome Android (primary), iOS Safari (critical), Samsung Internet. Test touch interactions, viewport behavior, virtual keyboard handling (numeric inputs shouldn't cause layout shifts)
- [ ] **T45.1.6** — **CSS compatibility:** audit for any CSS features that need vendor prefixes or aren't supported in older targets: container queries, `has()` selector, `@layer`, nesting. Use PostCSS autoprefixer in the Vite build

### Story 45.2 — E2E Test Suite

> As a developer, I need automated tests that verify critical user flows work correctly.

**Tasks:**

- [ ] **T45.2.1** — Set up Playwright test suite with fixtures for: a pre-created character (Level 5 Fighter), a pre-created caster (Level 3 Wizard), a campaign with 4 characters
- [ ] **T45.2.2** — **E2E test: Character creation.** Walk through the full wizard for each of the 12 classes. Verify the created character has correct: ability scores, proficiencies, HP, AC, features, spells (if caster). Assert the character appears in the gallery
- [ ] **T45.2.3** — **E2E test: Character sheet.** Open a character, verify all three pages render. Switch to edit mode, change an ability score, verify cascade recalculation. Switch back to view mode
- [ ] **T45.2.4** — **E2E test: Dice rolling.** Open dice roller, roll a d20, verify a result appears in [1,20]. Roll with advantage, verify two dice and the higher is kept. Roll a skill check from the sheet, verify the modifier is applied
- [ ] **T45.2.5** — **E2E test: Session play.** Take damage, verify HP decreases and temp HP is consumed first. Expend a spell slot, verify the circle changes. Add a condition, verify the badge appears. Short rest, verify hit dice spending and feature recovery. Long rest, verify full recovery
- [ ] **T45.2.6** — **E2E test: Level up.** Level up a character, verify HP increases, new features appear, spell slots update (for casters), ASI/feat selection works at appropriate levels
- [ ] **T45.2.7** — **E2E test: PDF export.** Export a character sheet, verify a PDF file is downloaded and is a valid PDF (check file header bytes). Verify the PDF contains the character's name (using a PDF text extraction utility)
- [ ] **T45.2.8** — **E2E test: Campaign flow.** Create a campaign, add characters, start an encounter, roll initiative, advance turns, end encounter, verify XP distribution
- [ ] **T45.2.9** — **E2E test: Import/export.** Export a character as JSON, delete the character, import the JSON, verify the character is restored with all data intact
- [ ] **T45.2.10** — **E2E test: Offline.** Install the PWA, go offline (Playwright network emulation), verify the app loads and basic operations work (open gallery, view a character, roll dice)

---

## Epic 46: Final Polish & UX Refinements

**Goal:** Address all the small UX improvements deferred from earlier phases. This is the "make it feel great" epic — micro-interactions, loading states, empty states, error states, and delightful details.

### Story 46.1 — Loading States & Skeleton Screens

> As a player, I need visual feedback while content loads so the app doesn't feel broken.

**Tasks:**

- [ ] **T46.1.1** — **Gallery skeleton:** while characters load from IndexedDB, show skeleton card placeholders (grey pulsing rectangles matching the card layout). Transition: skeleton fades to real content
- [ ] **T46.1.2** — **Character sheet skeleton:** while a character loads, show the three-page layout structure with skeleton placeholders for each section. Ability score blocks pulse, text areas show grey lines
- [ ] **T46.1.3** — **Campaign dashboard skeleton:** party grid shows skeleton rows with pulsing cells. Tab content areas show loading indicators
- [ ] **T46.1.4** — **SRD data loading:** when navigating to the creation wizard or spell page for the first time, show: "Loading game data..." with a progress bar based on the number of data files fetched
- [ ] **T46.1.5** — **PDF generation loading:** show a modal with: "Generating your character sheet..." and a determinate progress bar (Page 1... Page 2... Page 3... Compiling...)

### Story 46.2 — Empty States

> As a new user or a DM with a fresh campaign, I need helpful empty states that guide me on what to do next.

**Tasks:**

- [ ] **T46.2.1** — Audit all empty states across the app and ensure each has: an illustrative icon or graphic, a descriptive message, and a primary action CTA. States to cover:
  - Gallery: "No characters yet" → "Create Your First Character"
  - Campaign list: "No campaigns yet" → "Create Your First Campaign"
  - Campaign party: "No characters in this campaign" → "Add Characters"
  - Session log: "No sessions recorded" → "Add Your First Session"
  - NPC tracker: "No NPCs tracked" → "Add an NPC"
  - Loot tracker: "No loot recorded" → "Add Loot"
  - Roll history: "No rolls yet" → "Roll some dice!"
  - Encounter list: "No encounters yet" → "Start an Encounter"
  - Spell page (non-caster): "This character doesn't cast spells" → (no action)
  - DM notes: "No DM notes for this character" → "Add Notes"

### Story 46.3 — Error States & Recovery

> As a player, when something goes wrong, I need clear error messages and a way to recover.

**Tasks:**

- [ ] **T46.3.1** — **Global error boundary:** wrap the app in a React error boundary that catches unhandled errors. Show a friendly error page: "Something went wrong. Your data is safe in your browser." with a "Reload App" button and a "Report Bug" link (mailto or GitHub issues link)
- [ ] **T46.3.2** — **IndexedDB errors:** handle storage quota exceeded, database corruption, and version mismatch errors. Show: "Storage error. Try clearing some old characters or exporting your data for backup." Include a "Export All Data" emergency button that works even in the error state
- [ ] **T46.3.3** — **Import errors:** enhance the Phase 3 import error display with specific, actionable messages: "This file was exported from a newer version of D&D Character Forge. Please update the app." or "This file contains an unrecognized class: [name]. The character will be imported without class features."
- [ ] **T46.3.4** — **Network errors (future-proofing):** although the app is currently offline-first, structure error handling for future sync features. `utils/errorHandler.ts` with categories: STORAGE, NETWORK, VALIDATION, RENDER

### Story 46.4 — Micro-Interactions & Delight

> As a player, I want the app to feel alive and responsive with satisfying micro-interactions.

**Tasks:**

- [ ] **T46.4.1** — **Button feedback:** all primary buttons have a subtle press animation (scale 0.98 on mousedown, return on mouseup). Disabled buttons are clearly dimmed with `cursor: not-allowed`
- [ ] **T46.4.2** — **Toast notifications:** standardize all toast messages across the app. Success: green accent, 3 second duration, bottom-right position (desktop), bottom-center (mobile). Error: red accent, persistent until dismissed. Info: blue accent, 5 seconds
- [ ] **T46.4.3** — **HP change animation:** when HP changes, the number briefly flashes: green pulse for healing, red pulse for damage. The HP bar smoothly animates from old to new width (unless reduced motion is on)
- [ ] **T46.4.4** — **Level-up celebration:** when a level-up is confirmed, show a brief gold particle effect around the character name and a satisfying "ding" sound (if sounds are enabled). Display: "Welcome to Level [N]!" in a prominent banner that auto-dismisses
- [ ] **T46.4.5** — **Natural 20 celebration:** beyond the gold glow from Phase 4, add a brief screen-edge flash effect and an optional "Critical!" sound. Keep it brief (under 1 second) to not slow down gameplay
- [ ] **T46.4.6** — **Character card hover:** on desktop, gallery cards have a subtle lift effect (translateY(-2px) + shadow increase) on hover. The avatar gently scales up. Click produces a satisfying press
- [ ] **T46.4.7** — **Transition polish:** audit all page transitions and modal animations for smoothness. Target 60fps on all animations. Remove any janky transitions (layout-triggering properties like `width`, `height`, `top` in transitions — use `transform` and `opacity` only)

### Story 46.5 — Manual Override System

> As a player with homebrew modifications, I need to manually override computed values while still seeing what the calculated value would be.

**Tasks:**

- [ ] **T46.5.1** — **Override indicator:** any field that is manually overridden shows a small "override" icon (a broken chain link or a pen icon). Tooltip: "This value is manually set. Calculated value: [N]. Click to reset."
- [ ] **T46.5.2** — **Override system:** when a player edits a normally-computed field (AC, initiative, skill modifier, etc.) in edit mode, store both the override value and the computed value. Display the override. Recalculation still runs but doesn't overwrite the override
- [ ] **T46.5.3** — **"Reset to Computed" action:** clicking the override indicator resets the field to the calculated value and removes the override flag
- [ ] **T46.5.4** — **Override persistence:** overrides survive level-ups and other changes. But if the computed value changes (e.g., ability score increases), show a notification: "[Field] has a manual override of [X], but the calculated value changed to [Y]. Would you like to update?"

### Story 46.6 — Settings & Preferences Polish

> As a player, I need all settings and preferences to be discoverable and well-organized.

**Tasks:**

- [ ] **T46.6.1** — **Settings page audit:** verify all user preferences from across the app are accessible from the settings page:
  - Dice: animation speed (Fast/Normal/Dramatic), sound effects toggle, default advantage/disadvantage lock
  - Display: detailed gallery cards toggle, theme (dark only for now, but structure for future light theme), reduced motion
  - Accessibility: high contrast mode, screen reader optimization hints
  - Data: auto-save interval, undo history depth, export all data, clear all data
  - PWA: check for updates, clear cache, about/version
- [ ] **T46.6.2** — **Settings persistence:** all preferences stored in IndexedDB preferences table. Applied immediately on change (no "Save" button needed). Survive app restarts and PWA reinstalls
- [ ] **T46.6.3** — **First-run experience:** on first visit, show a brief welcome modal: "Welcome to D&D Character Forge!" with a 3-step intro: (1) Create characters with the guided wizard, (2) Use them at the table with dice, HP, and spell tracking, (3) DMs can manage campaigns and run combat. "Get Started" button. Don't show again (store dismissal in preferences)

---

## Phase 6 Completion Criteria

Before release, ALL of the following must be true:

1. **PDF Export:** Three-page character sheet PDF matching the official 5e layout. All character data populated correctly. Typography is clean and readable. Paper size options (US Letter, A4). Page selection (include/exclude pages). Avatar embedding. Download with descriptive filename. Works offline
2. **PDF Quality:** Vector text (searchable and selectable). File size <500KB per character. Crisp at any zoom level. Decorative borders and field labels present
3. **Campaign PDF:** Party summary PDF with one-page-per-character condensed view. DM quick-reference table on first page
4. **Print Stylesheet:** Browser print produces clean output matching the PDF layout. No UI chrome visible. Proper page breaks. Ink-saving option. Works in Chrome, Firefox, Safari, Edge
5. **Keyboard Navigation:** entire app navigable via keyboard. Tab order logical. Focus trapped in modals. Focus visible on all elements. Keyboard shortcuts for common actions. Drag-and-drop alternatives exist
6. **Screen Reader:** all form controls labeled. Ability scores, skills, spell slots, death saves all announced meaningfully. Dice rolls announced via aria-live. Gallery cards, combat tracker, and data tables semantically structured
7. **Color Contrast:** all text/background combinations meet WCAG 2.1 AA (4.5:1 normal, 3:1 large). Color-blind safe indicators (not color-only). HP bar has numeric overlay. High contrast mode toggle
8. **Reduced Motion:** all animations respect `prefers-reduced-motion`. In-app toggle available. Dice results instant. Page transitions instant. No vestibular triggers
9. **Form Accessibility:** error messages associated with inputs. Required fields marked. Wizard progress announced. Search inputs use combobox pattern. Touch targets ≥44×44px
10. **Bundle Size:** production bundle <500KB gzipped (excluding SRD data). Code split by route. Tree-shaking verified. Fonts subsetted
11. **SRD Data:** lazy-loaded in tiers. Total <2MB. Pre-cached by service worker for offline use
12. **Performance:** FCP <1.5s, TTI <3s, Lighthouse >90 all categories. Gallery with 100+ characters scrolls at 60fps. IndexedDB reads batched. Calculation engine memoized
13. **Stress Tested:** 100+ characters, 8-player campaign with 20 sessions, 28-combatant encounter, all verified performant. No memory leaks over extended use
14. **PWA Installed:** installable on Chrome, Edge, Safari (iOS). Service worker pre-caches all assets and SRD data. Full functionality offline. Update prompt when new version available. App icons at all required sizes
15. **Offline UX:** network status indicator. "Changes saved locally" reassurance. No features disabled offline. First-time cache completion tracking
16. **Mobile Polish:** all screens tested at 360px, 390px, 428px, 768px, 1024px. No horizontal scrolling. No overlapping elements. Touch targets adequate. Landscape mode supported. Numeric keyboards for number inputs
17. **Cross-Browser:** Chrome 90+, Firefox 90+, Safari 15+, Edge 90+, iOS Safari, Chrome Android all tested and functional. Known discrepancies documented
18. **E2E Tests:** Playwright suite covering: character creation (all 12 classes), sheet rendering, dice rolling, session play (damage/heal/conditions/rest/level-up), PDF export, campaign flow, import/export, offline operation
19. **Loading States:** skeleton screens on gallery, character sheet, campaign dashboard, SRD data loading, PDF generation
20. **Empty States:** all zero-content states have helpful messages and CTAs
21. **Error Handling:** global error boundary, IndexedDB error recovery, import error messaging, emergency data export
22. **Manual Overrides:** computed fields can be manually overridden with visual indicator and reset option
23. **Settings Complete:** all preferences organized, accessible, and persistent. First-run welcome experience
24. **Micro-Interactions:** button press feedback, HP change animation, level-up celebration, nat-20 celebration, card hover effects, smooth 60fps transitions

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Epics | 8 (Epic 39–46) |
| Stories | 28 |
| Tasks | ~155 |
| PDF Pages Laid Out | 3 (Core Stats, Backstory, Spellcasting) |
| Accessibility Checks | ~45 individual items |
| Performance Targets | 6 NFRs to meet |
| Browsers Tested | 6 (Chrome, Firefox, Safari, Edge, iOS Safari, Chrome Android) |
| Breakpoints Verified | 7 (360px, 390px, 428px, 640px, 768px, 1024px, 1440px) |
| E2E Test Scenarios | 10 critical flows |
| PWA Icon Sizes | 6+ |
| Empty States | 10+ |
| Loading Skeletons | 5 major screens |
| Keyboard Shortcuts | 9 |

---

## Dependency Graph

```
Epic 39 (PDF Export) ← independent, build first (highest user value)
  │
Epic 40 (Print Stylesheet) ← shares layout knowledge with PDF
  │
Epic 41 (Accessibility) ← cross-cutting, can begin in parallel
  │   ├── Story 41.1 (Keyboard) ← independent
  │   ├── Story 41.2 (Screen Reader) ← independent
  │   ├── Story 41.3 (Color Contrast) ← independent
  │   ├── Story 41.4 (Reduced Motion) ← independent
  │   └── Story 41.5 (Form Accessibility) ← independent
  │
Epic 42 (Performance) ← should follow feature work to measure accurately
  │   ├── Story 42.1 (Bundle) ← do first, affects all load times
  │   ├── Story 42.2 (SRD Lazy Load) ← do second
  │   ├── Story 42.3 (Rendering) ← do third
  │   ├── Story 42.4 (Lighthouse) ← measure after optimizations
  │   └── Story 42.5 (Stress Test) ← measure after optimizations
  │
Epic 43 (PWA) ← depends on performance work (don't cache bloated bundles)
  │   ├── Story 43.1 (Service Worker) ← core PWA
  │   ├── Story 43.2 (Manifest) ← core PWA
  │   └── Story 43.3 (Offline UX) ← after service worker works
  │
Epic 44 (Mobile Polish) ← independent, can be done in parallel
  │
Epic 45 (Cross-Browser) ← do after all other changes are complete
  │   ├── Story 45.1 (Manual testing) ← first
  │   └── Story 45.2 (E2E tests) ← automate after manual verification
  │
Epic 46 (Final Polish) ← last, addresses all remaining rough edges
      ├── Story 46.1 (Loading states)
      ├── Story 46.2 (Empty states)
      ├── Story 46.3 (Error states)
      ├── Story 46.4 (Micro-interactions)
      ├── Story 46.5 (Manual overrides)
      └── Story 46.6 (Settings polish)
```

**Recommended build order:**

1. **Week 11, Day 1–2:** Epic 39 Stories 39.1–39.4 (PDF generation architecture + three-page layout)
2. **Week 11, Day 3:** Epic 39 Stories 39.5–39.6 (PDF export UI + campaign PDF) + Epic 40 (Print stylesheet)
3. **Week 11, Day 4–5:** Epic 41 (Accessibility audit — all 5 stories in parallel sweep)
4. **Week 12, Day 1–2:** Epic 42 (Performance optimization — bundle, lazy load, rendering, Lighthouse)
5. **Week 12, Day 2–3:** Epic 43 (PWA — service worker, manifest, offline UX)
6. **Week 12, Day 3–4:** Epic 44 (Mobile responsive final polish) + Epic 45 Story 45.1 (Cross-browser manual testing)
7. **Week 12, Day 5:** Epic 45 Story 45.2 (E2E tests) + Epic 46 (Final polish, loading/empty/error states, micro-interactions, settings)

---

## Open Questions for Phase 6

1. **PDF Library Choice:** jsPDF + html2canvas is specified in the tech spec, but `@react-pdf/renderer` offers a React-native PDF layout approach (JSX → PDF). It produces cleaner vector output but has a steeper learning curve and larger bundle (~250KB). **Recommendation:** Stick with jsPDF for Phase 6 using the hybrid approach (programmatic layout + html2canvas fallback). Evaluate @react-pdf/renderer for a future upgrade if PDF quality needs improvement.

2. **Three.js Dice Upgrade:** Phase 4 deferred this. Adding Three.js adds ~150KB to the bundle. With the 500KB target, this may be tight. **Recommendation:** Skip for Phase 6. The CSS 3D dice are sufficient and much lighter. If the bundle has room after optimization, add as an optional "Enhanced Dice" mode that lazy-loads Three.js on first use.

3. **Light Theme:** The spec only defines a dark theme. Should Phase 6 add a light theme option? **Recommendation:** No. Structuring the CSS for future theming (CSS custom properties for all colors) is good, but building and testing a full light theme doubles the visual QA effort. Defer to post-MVP. Ensure the high contrast mode (Story 41.3.5) serves users who find the dark theme difficult.

4. **Automated Accessibility Testing:** Should Phase 6 include automated a11y tests (axe-core, jest-axe) in the CI pipeline? **Recommendation:** Yes. Add `@axe-core/playwright` to the E2E suite and `jest-axe` to component tests. Automated tests catch ~30% of a11y issues; manual testing (which is planned) catches the rest.

5. **Analytics / Error Reporting:** Should Phase 6 include any telemetry (anonymous usage analytics, error reporting)? **Recommendation:** No for the local-first MVP. The app has no backend. If deployed to Vercel/Netlify, add Sentry for error reporting (client-side only, no PII) as a lightweight opt-in. No usage analytics — respect the local-first, privacy-first ethos.

6. **App Store Distribution:** PWAs can be packaged for app stores via tools like PWABuilder (Microsoft Store) or Trusted Web Activities (Google Play). **Recommendation:** Defer to post-MVP. The PWA installation flow covers most users. App store distribution adds review processes and maintenance overhead.
