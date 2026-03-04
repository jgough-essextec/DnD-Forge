# D&D Character Forge -- Project Plan

## App Summary

D&D Character Forge is a full-stack web application for Dungeons & Dragons 5th Edition character creation, management, and session play. It uses a **Django REST API backend** with **PostgreSQL** for data persistence and a **React SPA frontend**. It targets two user personas: **Players** (who create and manage characters through a guided wizard or freeform editor) and **Dungeon Masters** (who manage campaigns, track party composition, and run combat encounters). Users authenticate via Django session auth, and all character/campaign data is persisted server-side in PostgreSQL.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Backend Framework | Django 5+ | Web framework with ORM, auth, admin, and management commands |
| API Layer | Django REST Framework | REST API with serializers, viewsets, pagination, and filtering |
| Database | PostgreSQL | Relational data persistence for characters, campaigns, and users |
| Auth | Django session authentication | User registration, login, and session management |
| PDF Generation | WeasyPrint | Server-side PDF rendering from HTML/CSS templates |
| Frontend Framework | React 18+ with TypeScript | Component-based UI with strong typing |
| Build Tool | Vite | Fast HMR and optimized production builds |
| Styling | Tailwind CSS | Utility-first CSS framework |
| Component Library | shadcn/ui | Accessible, composable UI components |
| Server State | React Query (TanStack Query) | API data fetching, caching, and optimistic updates |
| UI State | Zustand | Lightweight store for ephemeral UI state (wizard, modals, theme) |
| Routing | React Router v6 | Client-side page navigation |
| Backend Testing | pytest + Django TestCase | Unit and integration tests for API and business logic |
| Frontend Testing | Vitest + React Testing Library | Fast unit and integration tests |
| E2E Testing | Playwright | Cross-browser end-to-end test automation |
| Deployment | Docker (Django + PostgreSQL + Nginx) | Containerized deployment |

---

## Phase Roadmap

| Phase | Name | Weeks | Epics | Description |
|-------|------|-------|-------|-------------|
| 1 | Foundation | 1-2 | 1-7 | Project scaffolding, type system, SRD data ETL pipeline, calculation engine, database layer (Django ORM + PostgreSQL), state management (React Query + Zustand), dice engine |
| 2 | Character Creation Wizard | 3-4 | 8-16 | Guided and freeform character creation with all D&D 5e steps (race, class, ability scores, background, equipment, spells, review) |
| 3 | Character Sheet & Management | 5-6 | 17-25 | 3-page digital character sheet, character gallery, import/export, edit mode, responsive design |
| 4 | Session Play Features | 7-8 | 26-32 | Dice roller with animations, HP/spell slot/condition tracking, rest automation, level up flow, compact mobile view |
| 5 | DM Features | 9-10 | 33-38 | Campaign management, party overview dashboard, combat/initiative tracker, DM notes, XP/milestone management |
| 6 | Polish & Export | 11-12 | 39-48 | PDF export (WeasyPrint) with official sheet layout, accessibility audit, performance optimization, deployment and infrastructure, mobile polish, E2E testing, auth |

---

## Directory Navigation

```
dnd-forge-plan/
|
|-- README.md                          <-- You are here. Navigation hub.
|-- TECHNICAL_OVERVIEW.md              <-- Condensed architecture and tech decisions.
|-- ETL_STRATEGY.md                    <-- SRD data pipeline strategy.
|-- OUTSTANDING_QUESTIONS.md           <-- Open questions tracker.
|
|-- phase-1-foundation/                <-- Weeks 1-2, Epics 1-7
|   |-- PHASE_OVERVIEW.md
|   |-- epic-01-project-scaffolding/
|   |-- epic-02-type-system/
|   |-- epic-03-srd-game-data/
|   |-- epic-04-calculation-engine/
|   |-- epic-05-database-layer/          (Django ORM + PostgreSQL)
|   |-- epic-06-state-management/        (React Query + Zustand)
|   +-- epic-07-dice-engine/
|
|-- phase-2-character-creation/        <-- Weeks 3-4, Epics 8-16
|   |-- PHASE_OVERVIEW.md
|   |-- epic-08-wizard-framework/
|   |-- epic-09-race-selection/
|   |-- epic-10-class-selection/
|   |-- epic-11-ability-scores/
|   |-- epic-12-background-personality/
|   |-- epic-13-equipment-selection/
|   |-- epic-14-spellcasting/
|   |-- epic-15-review-finalize/
|   +-- epic-16-shared-wizard-components/
|
|-- phase-3-character-sheet/           <-- Weeks 5-6, Epics 17-25
|   |-- PHASE_OVERVIEW.md
|   |-- epic-17-sheet-page1-core-stats/
|   |-- epic-18-sheet-page2-backstory/
|   |-- epic-19-sheet-page3-spellcasting/
|   |-- epic-20-view-edit-mode/
|   |-- epic-21-character-gallery/
|   |-- epic-22-json-import-export/
|   |-- epic-23-avatar-portrait/
|   |-- epic-24-responsive-design/
|   +-- epic-25-routing-navigation/
|
|-- phase-4-session-play/              <-- Weeks 7-8, Epics 26-32
|   |-- PHASE_OVERVIEW.md
|   |-- epic-26-dice-roller/
|   |-- epic-27-hp-tracker/
|   |-- epic-28-spell-slot-tracker/
|   |-- epic-29-conditions-tracker/
|   |-- epic-30-rest-automation/
|   |-- epic-31-level-up-flow/
|   +-- epic-32-session-compact-view/
|
|-- phase-5-dm-features/               <-- Weeks 9-10, Epics 33-38
|   |-- PHASE_OVERVIEW.md
|   |-- epic-33-campaign-crud/
|   |-- epic-34-campaign-dashboard/
|   |-- epic-35-initiative-combat-tracker/
|   |-- epic-36-dm-notes/
|   |-- epic-37-xp-milestone/
|   +-- epic-38-campaign-routing/
|
+-- phase-6-polish-export/             <-- Weeks 11-12, Epics 39-46
    |-- PHASE_OVERVIEW.md
    |-- epic-39-pdf-export/
    |-- epic-40-print-stylesheet/
    |-- epic-41-accessibility/
    |-- epic-42-performance/
    |-- epic-43-deployment-infrastructure/
    |-- epic-44-mobile-responsive/
    |-- epic-45-cross-browser-testing/
    |-- epic-46-final-polish/
    |-- epic-47-reserved/
    +-- epic-48-auth/
```

---

## Usage Instructions

### How to navigate this plan

- **Start here** with this README for an overview of the full project scope and timeline.
- **TECHNICAL_OVERVIEW.md** covers architecture decisions, the domain model, key technical challenges, and component patterns. Read this to understand *how* the app is built.
- **ETL_STRATEGY.md** covers the data pipeline that extracts D&D 5e SRD content and transforms it into typed static data files bundled with the app. Read this to understand *where game data comes from*.
- **OUTSTANDING_QUESTIONS.md** is a living document for tracking unresolved decisions. Add questions as they arise during implementation.
- **Phase directories** (phase-1/ through phase-6/) contain the detailed epics, user stories, and task breakdowns for each two-week phase. Work through them sequentially -- each phase produces a working, testable increment.

### What each file type contains

- **PHASE_OVERVIEW.md** -- High-level summary of the phase, its goals, and the epics it contains.
- **Epic directories** (e.g., epic-01-project-scaffolding/) -- Each epic has its own directory containing user stories with acceptance criteria and granular task checklists. Tasks are prefixed with an ID (e.g., T3.0.1) for tracking.

### Implementation order

Follow the phases in order. Within each phase, epics are sequenced so that dependencies are satisfied. The general principle: **types first, then data, then logic, then UI**.
