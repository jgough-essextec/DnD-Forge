# D&D Character Forge -- Technical Overview

## Architecture

D&D Character Forge is a **Django REST API backend + React SPA frontend + PostgreSQL database** application for Dungeons & Dragons 5th Edition character creation, management, and session play. User data (characters, campaigns, preferences) is persisted in PostgreSQL via the Django ORM. SRD game reference data (races, classes, spells, equipment) is available both as static TypeScript files bundled with the frontend (for fast client-side access) and as Django fixtures loaded into the database (for backend validation and queries). Authentication is handled by Django session auth.

```
+------------------+          +----------------------------+       +------------+
|  React SPA       |  REST    |  Django REST API           |       | PostgreSQL |
|  (Vite + TS)     | <------> |  (DRF ViewSets + Routers)  | <---> |  Database  |
|                  |  JSON    |                            |       |            |
|  Tailwind/shadcn |          |  Django Auth (sessions)    |       +------------+
|  React Query     |          |  WeasyPrint (PDF export)   |
|  Zustand (UI)    |          |  Django ORM                |
|                  |          |                            |
|  Static SRD Data |          |  SRD Fixtures              |
|  (src/data/*.ts) |          |  (backend validation)      |
+------------------+          +----------------------------+
```

The data flow is: React components use React Query to fetch/mutate data via the Django REST API, which persists to PostgreSQL. Zustand stores handle ephemeral UI-only state (wizard step, modal state, theme). SRD reference data is imported directly as typed constants on the frontend for fast access -- never mutated at runtime.

---

## Tech Stack Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backend framework | Django 5+ with Django REST Framework | Mature, batteries-included framework with excellent ORM, auth, admin, and serialization. DRF provides browsable API, pagination, filtering, and serializer validation out of the box. |
| Database | PostgreSQL | Robust relational database with strong JSON support, excellent Django integration, and managed hosting options on all major cloud providers. |
| Server state management | React Query (TanStack Query) | Handles caching, background refetching, optimistic updates, and loading/error states for API data. Eliminates manual fetch logic in components. |
| UI-only state | Zustand | Lightweight store for ephemeral UI state (wizard step, modal state, theme, view/edit toggle). Not used for server-persisted data. |
| Static SRD data (frontend) | Build-time ETL to .ts files | Static imports give compile-time type safety and fast client-side lookups. No round-trip to the API for reference data that never changes. |
| SRD data (backend) | Django fixtures + management commands | SRD data loaded into PostgreSQL for server-side validation, query filtering, and API endpoints. |
| Auth | Django session authentication | Simple, secure, built-in. Session cookies handled automatically by the browser. No token management required on the frontend. |
| Tailwind + shadcn/ui | Utility-first styling + accessible primitives | Rapid development with consistent design tokens. shadcn/ui provides keyboard-navigable, ARIA-compliant components out of the box. |
| Vite over CRA/Next | Vite | Fastest HMR for development. React SPA does not need SSR. Simple configuration. |
| PDF export | WeasyPrint (server-side) | Produces high-fidelity PDF from HTML/CSS templates rendered on the Django backend. Supports CSS print media, custom fonts, and complex layouts. |
| Testing (backend) | pytest + Django TestCase | pytest for ergonomic test writing; Django TestCase for database fixtures, client simulation, and transaction rollback. |
| Testing (frontend) | Vitest + React Testing Library | Fast unit/integration tests with jsdom. RTL encourages testing user behavior over implementation details. |
| Testing (E2E) | Playwright | Cross-browser end-to-end test automation against the full stack. |
| Deployment | Docker (Django + PostgreSQL + Nginx) | Containerized deployment for consistent environments across development and production. |

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

### API-Backed Data Persistence

Character data is persisted via the Django REST API to PostgreSQL. React Query handles optimistic updates with automatic rollback on error. Auto-save is debounced (500ms after last change) and issues a PATCH request to the API. The Django ORM provides transaction safety and the `updated_at` timestamp field enables conflict detection for concurrent edits.

### Wizard State Preservation

The 7-step character creation wizard must preserve all state across step navigation (back/forward), accidental page refreshes, and browser tab switches. Draft wizard state is held in Zustand with session storage persistence for resilience against accidental refreshes. On finalization, the completed character is sent to the Django API for persistence.

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
React Query        -- Server state: characters, campaigns, SRD data from API
                      Handles caching, background refetch, optimistic updates
Zustand stores:
  uiStore          -- Wizard step, modal state, theme, view/edit toggle
  diceStore        -- Current roll, roll history, animation state
```

### API Endpoints Overview

```
Auth:
  POST   /api/auth/login/          -- Session login
  POST   /api/auth/logout/         -- Session logout
  GET    /api/auth/user/           -- Current user profile

Characters:
  GET    /api/characters/          -- List user's characters
  POST   /api/characters/          -- Create character
  GET    /api/characters/:id/      -- Retrieve character
  PATCH  /api/characters/:id/      -- Update character (auto-save)
  DELETE /api/characters/:id/      -- Delete character
  GET    /api/characters/:id/pdf/  -- Download character sheet PDF (WeasyPrint)

Campaigns:
  GET    /api/campaigns/           -- List user's campaigns
  POST   /api/campaigns/           -- Create campaign
  GET    /api/campaigns/:id/       -- Retrieve campaign with party
  PATCH  /api/campaigns/:id/       -- Update campaign
  DELETE /api/campaigns/:id/       -- Delete campaign
  POST   /api/campaigns/:id/join/  -- Join campaign via code

SRD Reference Data:
  GET    /api/srd/races/           -- List races
  GET    /api/srd/classes/         -- List classes
  GET    /api/srd/spells/          -- List spells (paginated, filterable)
  GET    /api/srd/equipment/       -- List equipment
  GET    /api/srd/backgrounds/     -- List backgrounds
  GET    /api/srd/feats/           -- List feats
```

---

## Non-Functional Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| API Response Latency (p95) | < 200ms for CRUD operations |
| API Response Latency (PDF) | < 2s for PDF generation |
| Frontend Bundle Size | < 500KB gzipped (excluding SRD data) |
| SRD Data (frontend) | Lazy-loaded, < 2MB total |
| Browser Support | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ |
| Auto-save Latency | Debounced, 500ms after last change, PATCH to API |
| Max Characters | 100+ per user without performance degradation |
| Database Query Time | < 50ms for typical ORM queries |
| Concurrent Users | Support 100+ concurrent users per deployment |

---

## Design System Summary

- **Theme:** Dark fantasy with warm accents -- parchment tones on dark backgrounds
- **Colors:** Dark navy backgrounds (#1a1a2e, #16213e), gold accent (#e8b430), red for damage (#c0392b), green for healing (#27ae60), blue for spells (#2980b9), parchment text (#eee8d5)
- **Typography:** Cinzel (fantasy serif) for headings, Inter for body/stats, JetBrains Mono for dice rolls and calculations
- **Accessibility:** WCAG 4.5:1 contrast minimum, full keyboard navigation, ARIA labels on all controls, screen reader announcements for dice rolls, reduced-motion option
