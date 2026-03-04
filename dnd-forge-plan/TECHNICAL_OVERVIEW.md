# D&D Character Forge -- Technical Overview

## Architecture

D&D Character Forge is a **local-first Progressive Web App** with no backend server. All application data (characters, campaigns, preferences) lives in the browser's IndexedDB, accessed through Dexie.js. SRD game reference data (races, classes, spells, equipment) is bundled as static TypeScript files at build time. The app works fully offline once loaded.

```
User Browser
+---------------------------------------------------------------+
|                                                                 |
|   React UI (Tailwind + shadcn/ui)                              |
|       |                                                         |
|   Zustand Stores (characterStore, campaignStore, uiStore)      |
|       |                                                         |
|   Dexie.js  ------>  IndexedDB  (characters, campaigns, prefs) |
|       |                                                         |
|   Static Data Imports  (src/data/*.ts -- SRD content)          |
|                                                                 |
+---------------------------------------------------------------+
```

The data flow is unidirectional: UI components read from Zustand stores, which sync with Dexie.js for persistence. SRD reference data is imported directly as typed constants -- never mutated at runtime.

---

## Tech Stack Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| No backend | IndexedDB via Dexie.js | Offline-first requirement, zero server cost, simplifies deployment. Characters are personal data that does not need cloud sync for MVP. |
| Zustand over Redux | Zustand | Minimal boilerplate, built-in persist middleware for IndexedDB sync, intuitive API. The app has moderate state complexity (wizard steps, active character, UI state) -- Redux is overkill. |
| Static SRD data over runtime API | Build-time ETL to .ts files | Offline support requires bundled data. Static imports give compile-time type safety. No runtime dependency on external APIs. |
| Tailwind + shadcn/ui | Utility-first styling + accessible primitives | Rapid development with consistent design tokens. shadcn/ui provides keyboard-navigable, ARIA-compliant components out of the box. |
| Vite over CRA/Next | Vite | Fastest HMR for development. Pure client-side app does not need SSR. Simple configuration. |
| jsPDF for export | Client-side PDF | Must work offline. No server-side rendering needed. |

---

## Domain Model Summary

### Primary Entities

**Character** -- The central entity. Contains identity (name, race, class, level), ability scores (STR/DEX/CON/INT/WIS/CHA), combat stats (AC, HP, initiative, speed), proficiencies (skills, saves, tools, weapons, armor, languages), equipment and inventory, spellcasting data (if applicable), personality and backstory, and all derived/computed statistics.

**Campaign** -- A DM-owned container for a group of characters. Holds house rules, session notes, and a join code for player invitations.

**SRD Reference Data** (immutable at runtime):
- **Races** -- 9 core races with subraces, ability bonuses, traits, senses, and languages
- **Classes** -- 12 classes with hit dice, proficiencies, features by level, subclass options, and spell slot progression
- **Spells** -- ~320 SRD spells with level, school, components, range, duration, damage, and class lists
- **Equipment** -- Weapons (with damage dice and properties), armor (with AC formulas), adventuring gear, and tools
- **Backgrounds** -- Skill proficiencies, equipment, features, and personality tables
- **Feats** -- Prerequisites and mechanical effects

### Entity Relationships

- A Character belongs to zero or one Campaign
- A Character has one Race (with optional Subrace) and one or more Classes (multiclass)
- A Character references Spells, Equipment, Feats, and a Background from SRD data
- A Campaign has one DM and multiple Characters

---

## Key Technical Challenges

### AC Calculation (14+ Formulas)

Armor Class is not a single formula. It varies by equipped armor, class features, and special abilities:

- **Unarmored:** 10 + DEX modifier
- **Light armor (e.g., Leather):** 11 + DEX modifier
- **Medium armor (e.g., Chain Shirt):** 13 + DEX modifier (max 2)
- **Heavy armor (e.g., Chain Mail):** 16 (no DEX bonus)
- **Shield:** +2 bonus stacks with any armor
- **Barbarian Unarmored Defense:** 10 + DEX + CON
- **Monk Unarmored Defense:** 10 + DEX + WIS
- **Draconic Sorcerer:** 13 + DEX (no armor)
- **Natural armor (Lizardfolk, Tortle):** Fixed or formula-based
- Plus feats, magic items, and spells that modify AC

The calculation engine must evaluate the character's class, equipped items, and active effects to select the correct formula.

### Multiclass Spellcasting

Characters with levels in multiple spellcasting classes use a shared spell slot table based on their combined "caster level," which weights each class differently (full casters count full levels, half-casters count half, third-casters count one-third). The calculation must handle all combinations correctly.

### Offline-First Data Integrity

With no server for conflict resolution, the app uses optimistic concurrency via a `version` field on characters. Auto-save is debounced (500ms after last change) and writes directly to IndexedDB. The Zustand persist middleware keeps store state and IndexedDB in sync.

### Wizard State Preservation

The 7-step character creation wizard must preserve all state across step navigation (back/forward), accidental page refreshes, and browser tab switches. Zustand's persist middleware with session storage handles this.

---

## Component Architecture

### Routing Structure

```
/                          -- Home / Character Gallery
/create                    -- Character Creation Wizard
/create?mode=freeform      -- Freeform Character Editor
/character/:id             -- Character Sheet View (3-tab: Stats | Backstory | Spells)
/character/:id/edit        -- Character Sheet Edit Mode
/character/:id/levelup     -- Level Up Flow
/campaigns                 -- Campaign List (DM)
/campaign/:id              -- Campaign Dashboard with Party Grid
/campaign/:id/encounter    -- Initiative / Combat Tracker
/dice                      -- Standalone Dice Roller
/settings                  -- Preferences, OGL Notice
```

### Component Patterns

- **Visual selection cards** for races and classes in the wizard (image placeholder, name, key traits, expandable detail panel)
- **Tabbed layout** for the 3-page character sheet (Stats, Backstory, Spells)
- **View/Edit mode toggle** on character sheets with inline editing and auto-recalculation
- **Collapsible sections** for dense information (features, spell descriptions, equipment details)
- **Inline dice buttons** (d20 icon) next to any rollable value (skills, saves, attacks)
- **Responsive breakpoints:** Mobile (<640px) single column with bottom nav; Tablet (640-1024px) two column with side panels; Desktop (1024px+) full three-column sheet layout

### State Architecture

```
characterStore     -- Active character data, CRUD operations, auto-save to Dexie
campaignStore      -- Active campaign, party data, session notes
uiStore            -- Wizard step, modal state, theme, view/edit toggle
diceStore          -- Current roll, roll history, animation state
```

---

## Non-Functional Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Lighthouse Score | > 90 (all categories) |
| Bundle Size | < 500KB gzipped (excluding SRD data) |
| SRD Data | Lazy-loaded, < 2MB total |
| Offline Support | Full functionality via PWA service worker |
| Browser Support | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ |
| Auto-save Latency | Debounced, 500ms after last change |
| Max Characters | 100+ per user without performance degradation |

---

## Design System Summary

- **Theme:** Dark fantasy with warm accents -- parchment tones on dark backgrounds
- **Colors:** Dark navy backgrounds (#1a1a2e, #16213e), gold accent (#e8b430), red for damage (#c0392b), green for healing (#27ae60), blue for spells (#2980b9), parchment text (#eee8d5)
- **Typography:** Cinzel (fantasy serif) for headings, Inter for body/stats, JetBrains Mono for dice rolls and calculations
- **Accessibility:** WCAG 4.5:1 contrast minimum, full keyboard navigation, ARIA labels on all controls, screen reader announcements for dice rolls, reduced-motion option
