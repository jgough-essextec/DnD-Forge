 Here is Claude's plan:
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
 Plan: Build D&D Character Forge — Agent Orchestration

 Context

 The D&D Character Forge project has 209 story files across 6 phases, 47 epics — but zero application code. This plan orchestrates teams of Claude
 Code agents to build the entire application from scratch across 19 sequential Rounds, respecting dependency chains and maximizing parallelism.

 Target Stack: Django 5+ / DRF / PostgreSQL backend, React 18+ / TypeScript / Vite / Tailwind / shadcn/ui frontend, React Query + Zustand state,
 WeasyPrint PDF, Playwright E2E.

 Project root: /Users/jonathangough/Dropbox/Mac/Documents/projects/DnDv2/
 Plan files (read-only reference): dnd-forge-plan/

 ---
 Directory Layout (created in Round 1)

 DnDv2/
   frontend/              # React 18+ / Vite / TypeScript
     src/
       components/        # React components by feature
       data/              # Generated SRD data (.ts files)
       hooks/             # React Query hooks, custom hooks
       stores/            # Zustand stores (UI-only state)
       utils/             # Calculation engine, dice, helpers
       types/             # TypeScript interfaces
       styles/            # Global CSS, Tailwind config
       lib/               # API client (axios), constants
     vitest.config.ts
     playwright.config.ts
   backend/               # Django 5+ / DRF
     manage.py
     config/              # settings.py, urls.py, wsgi.py
     characters/          # Character app (models, views, serializers)
     campaigns/           # Campaign app
     users/               # User/auth app + preferences
     srd/                 # SRD fixtures + management commands
   etl/                   # Build-time SRD data pipeline
     source-data/         # Cloned 5e-database (gitignored)
     supplements/         # Hand-authored backgrounds, feats
     transformers/        # Per-entity transform modules
   docker-compose.yml     # PostgreSQL for local dev
   ORCHESTRATION_STATUS.md  # Progress tracking

 ---
 Branch & Merge Strategy

 - Branch naming: round-{NN}/{epic-ids}-{short-name}
 - Merge order: After each round, merge backend branches first, then frontend, then QA. This minimizes conflicts since backend and frontend have
 separate file trees.
 - Conflict avoidance: Agents in the same round write to non-overlapping directories.
 - Commits: Each agent commits to its branch. Orchestrator merges into main between rounds.

 ---
 Checkpoint Procedure (run between every round)

 cd frontend && npm run build                    # Zero TS/build errors
 cd frontend && npx tsc --noEmit                 # Type check
 cd backend && python manage.py check            # Django system check
 cd backend && pytest -v                         # Backend tests pass
 cd frontend && npx vitest run                   # Frontend tests pass

 Phase gates (after Rounds 5, 8, 11, 13, 16, 19) additionally run Playwright E2E and manual verification.

 ---
 Status Tracking

 Create ORCHESTRATION_STATUS.md in project root after Round 1. Format:

 ## Current Round: N
 ### Round 1: Project Bootstrap
 - [x] Agent A: Epic 1 scaffolding — COMPLETE
 - Checkpoint: PASSED
 ### Round 2: ...

 Each agent reads this file to confirm prerequisites. Orchestrator updates between rounds.

 ---
 PHASE 1: FOUNDATION (Rounds 1–5)

 Round 1: Project Bootstrap

 ┌───────┬───────────┬──────────────────────────┬─────────────────────────────┐
 │ Agent │   Type    │        Assignment        │           Branch            │
 ├───────┼───────────┼──────────────────────────┼─────────────────────────────┤
 │ A     │ tech-lead │ Epic 1 (stories 1.1–1.5) │ round-01/epic-1-scaffolding │
 └───────┴───────────┴──────────────────────────┴─────────────────────────────┘

 Read: dnd-forge-plan/phase-1-foundation/epic-01-project-scaffolding/story-1.*.md, TECHNICAL_OVERVIEW.md, ETL_STRATEGY.md

 Build:
 - Frontend: npm create vite@latest → React+TS in frontend/, configure tsconfig (strict, @/ alias), install Tailwind+shadcn/ui (dark fantasy theme:
 navy #1a1a2e, gold #e8b430, parchment #eee8d5), install all runtime deps (react-router, @tanstack/react-query, zustand, axios, framer-motion,
 @dnd-kit/core, lucide-react), configure Vitest+RTL+Playwright, set up React Router with lazy placeholder pages
 - Backend: django-admin startproject config in backend/, create apps (characters, campaigns, users, srd), install deps (Django, DRF,
 django-cors-headers, psycopg2-binary, WeasyPrint), configure PostgreSQL+CORS+DRF, configure pytest
 - Docker: docker-compose.yml with PostgreSQL service
 - Create ORCHESTRATION_STATUS.md

 Checkpoint: Dev servers start, TypeScript compiles, Django check passes, migrations run, smoke tests pass.

 ---
 Round 2: Type System + Authentication

 Sub-round 2A (4 agents parallel):

 ┌───────┬──────────────┬──────────────────────────────────────────────────┬──────────────────────────────────┐
 │ Agent │     Type     │                    Assignment                    │              Branch              │
 ├───────┼──────────────┼──────────────────────────────────────────────────┼──────────────────────────────────┤
 │ B     │ frontend-dev │ Epic 2 stories 2.1–2.3 (core/race/class types)   │ round-02/types-core-race-class   │
 ├───────┼──────────────┼──────────────────────────────────────────────────┼──────────────────────────────────┤
 │ C     │ frontend-dev │ Epic 2 stories 2.4–2.5 (equipment/spell types)   │ round-02/types-equipment-spells  │
 ├───────┼──────────────┼──────────────────────────────────────────────────┼──────────────────────────────────┤
 │ D     │ frontend-dev │ Epic 2 stories 2.6–2.7 (background/combat types) │ round-02/types-background-combat │
 ├───────┼──────────────┼──────────────────────────────────────────────────┼──────────────────────────────────┤
 │ E     │ backend-dev  │ Epic 48 stories 48.1–48.6 (auth full stack)      │ round-02/epic-48-auth            │
 └───────┴──────────────┴──────────────────────────────────────────────────┴──────────────────────────────────┘

 - Agents B/C/D write to non-overlapping files in frontend/src/types/
 - Agent E builds: custom User model, DRF auth endpoints (login/logout/register), JWT or session middleware, frontend auth hooks + context +
 protected routes + login/register forms

 Sub-round 2B (1 agent, after 2A merges):

 ┌───────┬──────────────┬────────────────────────────────────────────────────────────────┬───────────────────────────────────┐
 │ Agent │     Type     │                           Assignment                           │              Branch               │
 ├───────┼──────────────┼────────────────────────────────────────────────────────────────┼───────────────────────────────────┤
 │ F     │ frontend-dev │ Epic 2 stories 2.8–2.10 (master Character, Campaign, UI types) │ round-02/types-master-campaign-ui │
 └───────┴──────────────┴────────────────────────────────────────────────────────────────┴───────────────────────────────────┘

 - Story 2.8 (Character master type) imports and aggregates all types from B/C/D
 - Creates barrel export frontend/src/types/index.ts

 Checkpoint: Full type system compiles. Auth endpoints respond. types/index.ts exports everything.

 ---
 Round 3: SRD Data + Dice Engine

 ┌───────┬──────────────┬─────────────────────────────────────────────────────┬────────────────────────────────┐
 │ Agent │     Type     │                     Assignment                      │             Branch             │
 ├───────┼──────────────┼─────────────────────────────────────────────────────┼────────────────────────────────┤
 │ G     │ frontend-dev │ Epic 3 stories 3.1–3.3 (race/class/spell data)      │ round-03/srd-race-class-spell  │
 ├───────┼──────────────┼─────────────────────────────────────────────────────┼────────────────────────────────┤
 │ H     │ frontend-dev │ Epic 3 stories 3.4–3.7 (equipment/bg/feat/ref data) │ round-03/srd-equip-bg-feat-ref │
 ├───────┼──────────────┼─────────────────────────────────────────────────────┼────────────────────────────────┤
 │ I     │ frontend-dev │ Epic 7 story 7.1 (dice engine)                      │ round-03/epic-7-dice           │
 └───────┴──────────────┴─────────────────────────────────────────────────────┴────────────────────────────────┘

 - Also read: ETL_STRATEGY.md for data format, source strategy, and pipeline architecture
 - Agents G/H build typed as const data files in frontend/src/data/ plus Django fixtures in backend/srd/fixtures/
 - Agent I builds frontend/src/utils/dice.ts — crypto.getRandomValues(), notation parsing, 4d6-drop-lowest, advantage/disadvantage

 Checkpoint: All data files compile against type interfaces. import { races } from '@/data' works. Django fixtures load via manage.py loaddata. Dice
  tests pass (10K d20 distribution test).

 ---
 Round 4: Calculation Engine

 ┌───────┬──────────────┬───────────────────────────────────────────────────────────┬────────────────────────────────┐
 │ Agent │     Type     │                        Assignment                         │             Branch             │
 ├───────┼──────────────┼───────────────────────────────────────────────────────────┼────────────────────────────────┤
 │ J     │ frontend-dev │ Epic 4 stories 4.1–4.2 (ability + skill calcs)            │ round-04/calc-ability-skill    │
 ├───────┼──────────────┼───────────────────────────────────────────────────────────┼────────────────────────────────┤
 │ K     │ frontend-dev │ Epic 4 stories 4.3–4.4 (combat + spellcasting calcs)      │ round-04/calc-combat-spell     │
 ├───────┼──────────────┼───────────────────────────────────────────────────────────┼────────────────────────────────┤
 │ L     │ frontend-dev │ Epic 4 stories 4.5–4.8 (levelup/currency/rest/validation) │ round-04/calc-levelup-rest-val │
 └───────┴──────────────┴───────────────────────────────────────────────────────────┴────────────────────────────────┘

 - Write to frontend/src/utils/calculations/{topic}.ts with __tests__/{topic}.test.ts
 - Key functions: getModifier(), getArmorClass() (14 formulas), getSpellSlots(), getMulticlassSpellSlots(), getLevelUpChanges(),
 getShortRestRecovery(), getLongRestRecovery(), validateCharacter()
 - Barrel export at frontend/src/utils/calculations/index.ts

 Checkpoint: >150 unit tests pass. >95% coverage on calculations/. Smoke test: Level 5 Human Fighter with Chain Mail+Shield → AC 18, HP ~44 (CON
 14).

 ---
 Round 5: Django API + React State + Phase 1 QA

 ┌───────┬──────────────┬────────────────────────────────────────────────────────────┬────────────────────────────┐
 │ Agent │     Type     │                         Assignment                         │           Branch           │
 ├───────┼──────────────┼────────────────────────────────────────────────────────────┼────────────────────────────┤
 │ M     │ backend-dev  │ Epic 5 stories 5.1–5.4 (Django models, DRF ViewSets, CRUD) │ round-05/epic-5-django-api │
 ├───────┼──────────────┼────────────────────────────────────────────────────────────┼────────────────────────────┤
 │ N     │ frontend-dev │ Epic 6 stories 6.1–6.4 (React Query hooks, Zustand stores) │ round-05/epic-6-state-mgmt │
 └───────┴──────────────┴────────────────────────────────────────────────────────────┴────────────────────────────┘

 After M+N merge:

 ┌───────┬─────────────┬────────────────────────┬─────────────────────┐
 │ Agent │    Type     │       Assignment       │       Branch        │
 ├───────┼─────────────┼────────────────────────┼─────────────────────┤
 │ O     │ qa-engineer │ Phase 1 integration QA │ round-05/phase-1-qa │
 └───────┴─────────────┴────────────────────────┴─────────────────────┘

 - Agent M: Character/Campaign/UserPreferences Django models with UUID PKs, DRF serializers+ViewSets, IsOwner permission, auto-save PATCH endpoint,
 all API URLs wired
 - Agent N: React Query hooks (useCharacters, useCharacter, useCreateCharacter, useUpdateCharacter, useDeleteCharacter, useCampaigns), Zustand
 stores (wizardStore with sessionStorage, uiStore, diceStore), axios API client in frontend/src/lib/api.ts
 - Agent O: Start Docker, run Django migrations, load fixtures, verify frontend↔backend API communication, run full pytest+Vitest suites, write
 Playwright smoke tests

 PHASE 1 GATE: npm run build passes, all tests pass, API CRUD works E2E, auth flow works, SRD data loads, calculations correct.

 ---
 PHASE 2: CHARACTER CREATION (Rounds 6–8)

 Round 6: Wizard Framework + Shared Components

 ┌───────┬──────────────┬─────────────────────────────────────────────────────────┬─────────────────────────┐
 │ Agent │     Type     │                       Assignment                        │         Branch          │
 ├───────┼──────────────┼─────────────────────────────────────────────────────────┼─────────────────────────┤
 │ A     │ frontend-dev │ Epic 8 stories 8.1–8.3 (wizard shell, intro, freeform)  │ round-06/epic-8-wizard  │
 ├───────┼──────────────┼─────────────────────────────────────────────────────────┼─────────────────────────┤
 │ B     │ frontend-dev │ Epic 16 stories 16.1–16.3 (shared selection components) │ round-06/epic-16-shared │
 └───────┴──────────────┴─────────────────────────────────────────────────────────┴─────────────────────────┘

 - Agent A: components/wizard/WizardShell.tsx (progress bar, step nav, validation gating), WizardIntroStep.tsx (mode selection), FreeformEditor.tsx
 - Agent B: components/shared/ — SelectionCardGrid, DetailPanel, SearchFilter, CountSelector, TooltipHelp, ModifierDisplay, StatBlock

 Checkpoint: Wizard shell renders with navigation. Shared components render in isolation.

 ---
 Round 7: All Wizard Steps (Maximum Parallelism)

 ┌───────┬──────────────┬────────────────────────────────────────────────────┬─────────────────────────────┐
 │ Agent │     Type     │                     Assignment                     │           Branch            │
 ├───────┼──────────────┼────────────────────────────────────────────────────┼─────────────────────────────┤
 │ C     │ frontend-dev │ Epic 9 stories 9.1–9.5 (race selection)            │ round-07/epic-9-race        │
 ├───────┼──────────────┼────────────────────────────────────────────────────┼─────────────────────────────┤
 │ D     │ frontend-dev │ Epic 10 stories 10.1–10.6 (class selection)        │ round-07/epic-10-class      │
 ├───────┼──────────────┼────────────────────────────────────────────────────┼─────────────────────────────┤
 │ E     │ frontend-dev │ Epic 11 stories 11.1–11.6 (ability scores)         │ round-07/epic-11-abilities  │
 ├───────┼──────────────┼────────────────────────────────────────────────────┼─────────────────────────────┤
 │ F     │ frontend-dev │ Epic 12 stories 12.1–12.4 (background/personality) │ round-07/epic-12-background │
 ├───────┼──────────────┼────────────────────────────────────────────────────┼─────────────────────────────┤
 │ G     │ frontend-dev │ Epic 13 stories 13.1–13.3 (equipment)              │ round-07/epic-13-equipment  │
 ├───────┼──────────────┼────────────────────────────────────────────────────┼─────────────────────────────┤
 │ H     │ frontend-dev │ Epic 14 stories 14.1–14.5 (spellcasting)           │ round-07/epic-14-spells     │
 └───────┴──────────────┴────────────────────────────────────────────────────┴─────────────────────────────┘

 Critical context for ALL agents: Each step component lives in components/wizard/steps/{step-name}/, uses shared components from components/shared/,
  reads SRD data from data/, uses stores/wizardStore.ts, uses calculation functions from utils/calculations/.

 - C: Race cards (9 races), subrace panel, Dragonborn ancestry / Half-Elf bonuses / High Elf cantrip / Variant Human feat
 - D: Class cards (12 classes), detail panel, skill proficiency selection (variable count), L1 subclass (Cleric/Sorcerer/Warlock), fighting styles
 - E: Method selector (Standard Array / Point Buy / Rolling), @dnd-kit drag-drop for Standard Array, sliders for Point Buy, dice animation for
 Rolling
 - F: Background cards, skill overlap detection, personality characteristics (traits/ideals/bonds/flaws), character identity fields
 - G: Starting equipment packages with nested choices, gold buy mode, weight/encumbrance, AC preview
 - H: Conditional rendering (casters only), cantrip selection, spell selection/preparation, spell browser with search/filter

 Checkpoint: Integration test: create Human Fighter (simplest) and High Elf Wizard (most complex) through all steps. Wizard state persists across
 navigation.

 ---
 Round 8: Review Step + Phase 2 QA

 ┌───────┬──────────────┬──────────────────────────────────────────────────────────────────┬─────────────────────────┐
 │ Agent │     Type     │                            Assignment                            │         Branch          │
 ├───────┼──────────────┼──────────────────────────────────────────────────────────────────┼─────────────────────────┤
 │ I     │ frontend-dev │ Epic 15 stories 15.1–15.4 (review, validation, save, quick-edit) │ round-08/epic-15-review │
 └───────┴──────────────┴──────────────────────────────────────────────────────────────────┴─────────────────────────┘

 After I merges:

 ┌───────┬─────────────┬────────────────┬─────────────────────┐
 │ Agent │    Type     │   Assignment   │       Branch        │
 ├───────┼─────────────┼────────────────┼─────────────────────┤
 │ J     │ qa-engineer │ Phase 2 E2E QA │ round-08/phase-2-qa │
 └───────┴─────────────┴────────────────┴─────────────────────┘

 - Agent I: 3-page character sheet preview, validation summary, save via POST /api/characters/ mutation, "quick edit" links to specific steps
 - Agent J: Create character for ALL 12 classes, verify derived stats, verify API persistence, test wizard state recovery, write Playwright E2E

 PHASE 2 GATE: All 12 classes create valid characters. Wizard persists state. Characters save to PostgreSQL. All tests pass.

 ---
 PHASE 3: CHARACTER SHEET (Rounds 9–11)

 Round 9: Sheet Infrastructure

 ┌───────┬──────────────┬─────────────────────────────────────────────────────────────┬────────────────────────────┐
 │ Agent │     Type     │                         Assignment                          │           Branch           │
 ├───────┼──────────────┼─────────────────────────────────────────────────────────────┼────────────────────────────┤
 │ A     │ frontend-dev │ Epic 25 stories 25.1–25.3 (routing, nav, transitions)       │ round-09/epic-25-routing   │
 ├───────┼──────────────┼─────────────────────────────────────────────────────────────┼────────────────────────────┤
 │ B     │ frontend-dev │ Epic 20 stories 20.1–20.4 (view/edit mode, auto-save, undo) │ round-09/epic-20-view-edit │
 ├───────┼──────────────┼─────────────────────────────────────────────────────────────┼────────────────────────────┤
 │ C     │ frontend-dev │ Epic 23 stories 23.1–23.2 (avatar upload, display)          │ round-09/epic-23-avatar    │
 └───────┴──────────────┴─────────────────────────────────────────────────────────────┴────────────────────────────┘

 - A: Full route config for /character/:id, nav bar, breadcrumbs, 404 page, tab navigation for 3 sheet pages
 - B: View/edit mode toggle, auto-save (debounced 500ms PATCH), undo/redo (50 snapshots), cascade recalculation on edits
 - C: Image upload to Django API (JPEG/PNG <=2MB), crop/resize, default avatar by race/class, <CharacterAvatar> component; backend: avatar upload
 endpoint

 Checkpoint: Routes resolve. Mode toggle works. Avatar uploads end-to-end.

 ---
 Round 10: Character Sheet Pages

 ┌───────┬──────────────┬──────────────────────────────────────────────────┬────────────────────────┐
 │ Agent │     Type     │                    Assignment                    │         Branch         │
 ├───────┼──────────────┼──────────────────────────────────────────────────┼────────────────────────┤
 │ D     │ frontend-dev │ Epic 17 stories 17.1–17.10 (Page 1: core stats)  │ round-10/epic-17-page1 │
 ├───────┼──────────────┼──────────────────────────────────────────────────┼────────────────────────┤
 │ E     │ frontend-dev │ Epic 18 stories 18.1–18.5 (Page 2: backstory)    │ round-10/epic-18-page2 │
 ├───────┼──────────────┼──────────────────────────────────────────────────┼────────────────────────┤
 │ F     │ frontend-dev │ Epic 19 stories 19.1–19.4 (Page 3: spellcasting) │ round-10/epic-19-page3 │
 └───────┴──────────────┴──────────────────────────────────────────────────┴────────────────────────┘

 - D (largest assignment): Identity banner, 6 ability score blocks, saving throws, 18 skills with modifiers, combat stats (AC/Init/Speed), HP block,
  hit dice, death saves, attacks section, personality traits, features list. All computed via calculation engine. View mode: click-to-roll on
 rollable values. Edit mode: inline editing.
 - E: Appearance details, backstory text, allies & orgs, features overflow, equipment/inventory with weight, currency display
 - F: Spellcasting header (class/ability/DC/attack), spell slot tracker per level, cantrips list, spell lists by level with prepared/known toggles,
 spell detail expansion. Conditional: only for casters.

 Checkpoint: All 3 pages render correctly. Calculations match hand-calculated values. Tab navigation works.

 ---
 Round 11: Gallery + Export + Responsive + QA

 ┌───────┬──────────────┬─────────────────────────────────────────────────────────────────────┬────────────────────────────────┐
 │ Agent │     Type     │                             Assignment                              │             Branch             │
 ├───────┼──────────────┼─────────────────────────────────────────────────────────────────────┼────────────────────────────────┤
 │ G     │ frontend-dev │ Epic 21 stories 21.1–21.3 (gallery, search, actions)                │ round-11/epic-21-gallery       │
 ├───────┼──────────────┼─────────────────────────────────────────────────────────────────────┼────────────────────────────────┤
 │ H     │ frontend-dev │ Epic 22 stories 22.1–22.3 (export, import, share)                   │ round-11/epic-22-import-export │
 ├───────┼──────────────┼─────────────────────────────────────────────────────────────────────┼────────────────────────────────┤
 │ I     │ frontend-dev │ Epic 24 stories 24.1–24.4 (responsive: mobile/tablet/desktop/print) │ round-11/epic-24-responsive    │
 └───────┴──────────────┴─────────────────────────────────────────────────────────────────────┴────────────────────────────────┘

 After G+H+I merge:

 ┌───────┬─────────────┬─────────────┬─────────────────────┐
 │ Agent │    Type     │ Assignment  │       Branch        │
 ├───────┼─────────────┼─────────────┼─────────────────────┤
 │ J     │ qa-engineer │ Phase 3 E2E │ round-11/phase-3-qa │
 └───────┴─────────────┴─────────────┴─────────────────────┘

 - G: Gallery home / with character cards, search/filter/sort, grid/list toggle, duplicate/archive/delete actions, empty state
 - H: JSON export via API endpoint, import with 5-stage validation, share via API tokens; backend: export/import endpoints
 - I: Mobile (<640px) single column + bottom nav, tablet (640–1024px) two column, desktop (1024px+) full 3-column layout

 PHASE 3 GATE: Full lifecycle: create → view → edit → save → gallery. Import/export roundtrip. All breakpoints. All tests pass.

 ---
 PHASE 4: SESSION PLAY (Rounds 12–13)

 Round 12: Dice Roller + Session Trackers

 ┌───────┬──────────────┬────────────────────────────────────────────────────────────────────────────────────┬─────────────────────────────┐
 │ Agent │     Type     │                                     Assignment                                     │           Branch            │
 ├───────┼──────────────┼────────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────┤
 │ A     │ frontend-dev │ Epic 26 stories 26.1–26.5 (dice panel, animation, history, sheet integration)      │ round-12/epic-26-dice       │
 ├───────┼──────────────┼────────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────┤
 │ B     │ frontend-dev │ Epic 27 stories 27.1–27.3 (HP tracker: damage/heal/temp/death saves)               │ round-12/epic-27-hp         │
 ├───────┼──────────────┼────────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────┤
 │ C     │ frontend-dev │ Epic 28 stories 28.1–28.3 (spell slots: expend/recover/pact magic/arcane recovery) │ round-12/epic-28-spells     │
 ├───────┼──────────────┼────────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────┤
 │ D     │ frontend-dev │ Epic 29 stories 29.1–29.3 (conditions: display/add-remove/exhaustion)              │ round-12/epic-29-conditions │
 └───────┴──────────────┴────────────────────────────────────────────────────────────────────────────────────┴─────────────────────────────┘

 Checkpoint: All 4 trackers work independently. Click skill on sheet → roll d20+modifier in dice panel.

 ---
 Round 13: Rest + Level Up + Compact View + QA

 ┌───────┬──────────────┬──────────────────────────────────────────────────────────────────────────────┬──────────────────────────┐
 │ Agent │     Type     │                                  Assignment                                  │          Branch          │
 ├───────┼──────────────┼──────────────────────────────────────────────────────────────────────────────┼──────────────────────────┤
 │ E     │ frontend-dev │ Epic 30 stories 30.1–30.3 (short rest, long rest, feature tracking)          │ round-13/epic-30-rest    │
 ├───────┼──────────────┼──────────────────────────────────────────────────────────────────────────────┼──────────────────────────┤
 │ F     │ frontend-dev │ Epic 31 stories 31.1–31.7 (level up: HP/features/subclass/ASI/spells/review) │ round-13/epic-31-levelup │
 ├───────┼──────────────┼──────────────────────────────────────────────────────────────────────────────┼──────────────────────────┤
 │ G     │ frontend-dev │ Epic 32 stories 32.1–32.2 (session compact view, pinned skills)              │ round-13/epic-32-compact │
 └───────┴──────────────┴──────────────────────────────────────────────────────────────────────────────┴──────────────────────────┘

 After E+F+G merge:

 ┌───────┬─────────────┬─────────────┬─────────────────────┐
 │ Agent │    Type     │ Assignment  │       Branch        │
 ├───────┼─────────────┼─────────────┼─────────────────────┤
 │ H     │ qa-engineer │ Phase 4 E2E │ round-13/phase-4-qa │
 └───────┴─────────────┴─────────────┴─────────────────────┘

 - F is the most complex single agent assignment: multi-step level-up wizard for all 12 classes × 20 levels. Reuses Phase 2 components
 (SubclassSelector, FeatPicker, spell browser).

 PHASE 4 GATE: Full session scenario: take damage → cast spell → gain condition → short rest → long rest → level up. All tests pass.

 ---
 PHASE 5: DM FEATURES (Rounds 14–16)

 Round 14: Campaign Foundation

 ┌───────┬──────────────┬──────────────────────────────────────────────────────────────────────────┬───────────────────────────┐
 │ Agent │     Type     │                                Assignment                                │          Branch           │
 ├───────┼──────────────┼──────────────────────────────────────────────────────────────────────────┼───────────────────────────┤
 │ A     │ backend-dev  │ Epic 33 stories 33.1–33.5 (Campaign Django models + DRF + frontend CRUD) │ round-14/epic-33-campaign │
 ├───────┼──────────────┼──────────────────────────────────────────────────────────────────────────┼───────────────────────────┤
 │ B     │ frontend-dev │ Epic 38 story 38.1 (campaign route scaffolding)                          │ round-14/epic-38-routes   │
 └───────┴──────────────┴──────────────────────────────────────────────────────────────────────────┴───────────────────────────┘

 - A: Django models (Campaign, HouseRules, Encounter, Combatant, SessionNote, NPCEntry, LootEntry), DRF ViewSets/serializers, join code generation,
 character-campaign assignment; frontend: campaign create/edit modals, campaign list, character assignment UI
 - B: Routes /campaigns, /campaign/:id, /campaign/:id/encounter/:eid, /join/:code, placeholder pages, DM vs player context

 Checkpoint: Campaign CRUD end-to-end. Characters assignable. Join codes work.

 ---
 Round 15: DM Feature Panels

 ┌───────┬──────────────┬─────────────────────────────────────────────────────────────────────────────────┬────────────────────────────┐
 │ Agent │     Type     │                                   Assignment                                    │           Branch           │
 ├───────┼──────────────┼─────────────────────────────────────────────────────────────────────────────────┼────────────────────────────┤
 │ C     │ frontend-dev │ Epic 34 stories 34.1–34.5 (dashboard: party stats/skills/languages/composition) │ round-15/epic-34-dashboard │
 ├───────┼──────────────┼─────────────────────────────────────────────────────────────────────────────────┼────────────────────────────┤
 │ D     │ frontend-dev │ Epic 35 stories 35.1–35.6 (combat tracker: setup/initiative/combat/HP/end)      │ round-15/epic-35-combat    │
 ├───────┼──────────────┼─────────────────────────────────────────────────────────────────────────────────┼────────────────────────────┤
 │ E     │ frontend-dev │ Epic 36 stories 36.1–36.4 (notes: per-character/session log/NPC/loot)           │ round-15/epic-36-notes     │
 └───────┴──────────────┴─────────────────────────────────────────────────────────────────────────────────┴────────────────────────────┘

 - D: Integrates Phase 4 dice roller for initiative, HP tracker for combatant management, conditions for combat effects. Extracts XP calculation
 utility for reuse by Epic 37.

 Checkpoint: Dashboard shows party data. Combat tracker supports full encounter. Notes persist.

 ---
 Round 16: XP + Routing + Phase 5 QA

 ┌───────┬──────────────┬───────────────────────────────────────────────────────────────────────────┬──────────────────────────┐
 │ Agent │     Type     │                                Assignment                                 │          Branch          │
 ├───────┼──────────────┼───────────────────────────────────────────────────────────────────────────┼──────────────────────────┤
 │ F     │ frontend-dev │ Epic 37 stories 37.1–37.3 (XP awards, milestone, progress)                │ round-16/epic-37-xp      │
 ├───────┼──────────────┼───────────────────────────────────────────────────────────────────────────┼──────────────────────────┤
 │ G     │ frontend-dev │ Epic 38 stories 38.2–38.4 (DM/player context, join flow, campaign export) │ round-16/epic-38-routing │
 └───────┴──────────────┴───────────────────────────────────────────────────────────────────────────┴──────────────────────────┘

 After F+G merge:

 ┌───────┬─────────────┬─────────────┬─────────────────────┐
 │ Agent │    Type     │ Assignment  │       Branch        │
 ├───────┼─────────────┼─────────────┼─────────────────────┤
 │ H     │ qa-engineer │ Phase 5 E2E │ round-16/phase-5-qa │
 └───────┴─────────────┴─────────────┴─────────────────────┘

 PHASE 5 GATE: Full DM workflow: create campaign → add characters → run encounter → award XP → write notes. Permission boundaries enforced. All
 tests pass.

 ---
 PHASE 6: POLISH & EXPORT (Rounds 17–19)

 Round 17: PDF + Print + Accessibility

 ┌───────┬──────────────┬────────────────────────────────────────────────────────────────────────────────┬────────────────────────┐
 │ Agent │     Type     │                                   Assignment                                   │         Branch         │
 ├───────┼──────────────┼────────────────────────────────────────────────────────────────────────────────┼────────────────────────┤
 │ A     │ backend-dev  │ Epic 39 stories 39.1–39.6 (WeasyPrint PDF: templates, rendering, API)          │ round-17/epic-39-pdf   │
 ├───────┼──────────────┼────────────────────────────────────────────────────────────────────────────────┼────────────────────────┤
 │ B     │ frontend-dev │ Epic 40 stories 40.1–40.3 (print stylesheet)                                   │ round-17/epic-40-print │
 ├───────┼──────────────┼────────────────────────────────────────────────────────────────────────────────┼────────────────────────┤
 │ C     │ frontend-dev │ Epic 41 stories 41.1–41.5 (a11y: keyboard/screen reader/contrast/motion/forms) │ round-17/epic-41-a11y  │
 └───────┴──────────────┴────────────────────────────────────────────────────────────────────────────────┴────────────────────────┘

 - A: Django HTML/CSS templates for 3-page character sheet, WeasyPrint pipeline, GET /api/characters/:id/pdf/, campaign summary PDF, frontend export
  button + options dialog
 - B: @media print CSS, page breaks, ink-saving mode, cross-browser print
 - C: Full keyboard nav, ARIA labels + live regions, 4.5:1 contrast, prefers-reduced-motion, form labels + error announcements

 Checkpoint: PDF exports correct 3-page sheet. Print works in all browsers. Keyboard reaches every element.

 ---
 Round 18: Performance + Deployment

 ┌───────┬──────────────┬─────────────────────────────────────────────────────────────────────┬─────────────────────────┐
 │ Agent │     Type     │                             Assignment                              │         Branch          │
 ├───────┼──────────────┼─────────────────────────────────────────────────────────────────────┼─────────────────────────┤
 │ D     │ frontend-dev │ Epic 42 stories 42.1–42.5 (bundle/lazy-load/memo/lighthouse/stress) │ round-18/epic-42-perf   │
 ├───────┼──────────────┼─────────────────────────────────────────────────────────────────────┼─────────────────────────┤
 │ E     │ backend-dev  │ Epic 43 stories 43.1–43.3 (Docker Compose, prod config, CI/CD)      │ round-18/epic-43-deploy │
 └───────┴──────────────┴─────────────────────────────────────────────────────────────────────┴─────────────────────────┘

 - D: Code splitting (React.lazy for Gallery/Sheet/Wizard/DM/Dice), tree-shaking audit, SRD lazy loading, font subsetting (Cinzel → ~30KB),
 memoization, Lighthouse target >90, stress test 100+ characters
 - E: Multi-service Docker Compose (Django+Gunicorn, PostgreSQL, Nginx, Redis), production settings, GitHub Actions CI
 (pytest+Vitest+Playwright+migrations), health checks

 Checkpoint: Lighthouse >90. Bundle <500KB gzipped. Docker starts all services. CI passes.

 ---
 Round 19: Mobile + Polish + Cross-Browser

 ┌───────┬──────────────┬─────────────────────────────────────────────────────────────────────────────────────────────┬──────────────────────────┐
 │ Agent │     Type     │                                         Assignment                                          │          Branch          │
 ├───────┼──────────────┼─────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────┤
 │ F     │ frontend-dev │ Epic 44 stories 44.1–44.4 (mobile/tablet/touch/landscape)                                   │ round-19/epic-44-mobile  │
 ├───────┼──────────────┼─────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────┤
 │ G     │ frontend-dev │ Epic 46 stories 46.1–46.6 (skeletons/empty                                                  │ round-19/epic-46-polish  │
 │       │              │ states/errors/micro-interactions/overrides/settings)                                        │                          │
 ├───────┼──────────────┼─────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────┤
 │ H     │ qa-engineer  │ Epic 45 stories 45.1–45.2 (cross-browser manual + Playwright E2E suite)                     │ round-19/epic-45-testing │
 └───────┴──────────────┴─────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────┘

 PHASE 6 / RELEASE GATE: FCP <1.5s, TTI <3s, Lighthouse >90, WCAG 2.1 AA, all breakpoints verified, 6 browsers tested, full E2E suite passes, Docker
  deploys, CI green.

 ---
 Summary

 ┌────────────────────────┬─────────────────────┐
 │         Metric         │        Count        │
 ├────────────────────────┼─────────────────────┤
 │ Total Rounds           │ 19 (+ sub-round 2B) │
 ├────────────────────────┼─────────────────────┤
 │ Total Agent Sessions   │ ~61                 │
 ├────────────────────────┼─────────────────────┤
 │ Max Parallel per Round │ 6 (Round 7)         │
 ├────────────────────────┼─────────────────────┤
 │ Stories Covered        │ 209                 │
 ├────────────────────────┼─────────────────────┤
 │ Phase 1 Rounds         │ 5                   │
 ├────────────────────────┼─────────────────────┤
 │ Phase 2 Rounds         │ 3                   │
 ├────────────────────────┼─────────────────────┤
 │ Phase 3 Rounds         │ 3                   │
 ├────────────────────────┼─────────────────────┤
 │ Phase 4 Rounds         │ 2                   │
 ├────────────────────────┼─────────────────────┤
 │ Phase 5 Rounds         │ 3                   │
 ├────────────────────────┼─────────────────────┤
 │ Phase 6 Rounds         │ 3                   │
 └────────────────────────┴─────────────────────┘

 ---
 Agent Prompt Template

 Every agent must receive ALL of this context (they start with zero knowledge):

 You are a {agent-type} agent working on D&D Character Forge.

 ## PROJECT
 Full-stack: Django 5+ REST API + React 18+ TypeScript SPA + PostgreSQL
 Root: /Users/jonathangough/Dropbox/Mac/Documents/projects/DnDv2/

 ## YOUR ASSIGNMENT
 Round {N}, Agent {X}: {description}
 Branch: round-{NN}/{branch-name}

 ## STORY FILES TO READ FIRST
 {absolute paths to story .md files}

 ## REFERENCE FILES
 {TECHNICAL_OVERVIEW.md, ETL_STRATEGY.md, relevant EPIC_OVERVIEW.md}

 ## EXISTING CODE CONTEXT
 {what directories/files exist from prior rounds}

 ## DELIVERABLES
 {specific files to create, tests to write}

 ## TESTING
 {commands to run, coverage targets}

 ## CONSTRAINTS
 - Do NOT modify files outside your assigned directories
 - Do NOT modify dnd-forge-plan/ (read-only reference)
 - Commit to your branch with descriptive messages
 - Do NOT merge into main

 ---
 Cross-Cutting Integration Points

 ┌───────────────────────────────────┬─────────────────────────────────────────────────────────┬────────────────────────────────────────────┐
 │              Concern              │                          When                           │                    How                     │
 ├───────────────────────────────────┼─────────────────────────────────────────────────────────┼────────────────────────────────────────────┤
 │ Auth                              │ Round 2 (build), Round 5 (integrate with API)           │ Django session auth + frontend AuthContext │
 ├───────────────────────────────────┼─────────────────────────────────────────────────────────┼────────────────────────────────────────────┤
 │ API wiring                        │ Round 5: backend endpoints + frontend React Query hooks │ All subsequent rounds use these hooks      │
 ├───────────────────────────────────┼─────────────────────────────────────────────────────────┼────────────────────────────────────────────┤
 │ Frontend↔Backend first connection │ Round 5 QA agent verifies E2E                           │ Axios client with session cookies          │
 ├───────────────────────────────────┼─────────────────────────────────────────────────────────┼────────────────────────────────────────────┤
 │ Second backend round              │ Round 14 (Campaign models/APIs)                         │ Extends existing Django apps               │
 ├───────────────────────────────────┼─────────────────────────────────────────────────────────┼────────────────────────────────────────────┤
 │ Third backend round               │ Round 17 (WeasyPrint PDF)                               │ New Django view + templates                │
 ├───────────────────────────────────┼─────────────────────────────────────────────────────────┼────────────────────────────────────────────┤
 │ Fourth backend round              │ Round 18 (Docker/deployment)                            │ Infrastructure wrapping existing code      │
 └───────────────────────────────────┴─────────────────────────────────────────────────────────┴────────────────────────────────────────────┘
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
