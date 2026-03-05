# D&D Character Forge

A full-featured Dungeons & Dragons 5th Edition character management application built with React and Django. Create characters with a guided wizard, manage campaigns, track combat, and export professional PDF character sheets.



---

## Features

### For Players
- **Character Creation Wizard** — step-by-step builder implementing D&D 5e rules (13 classes, races, backgrounds, point buy / standard array / dice rolling)
- **Character Sheet** — full two-page sheet with auto-save, undo/redo, and live calculations (AC, HP, modifiers, proficiency)
- **Level Up** — guided advancement with ability score improvements, feat selection, and spell progression
- **Character Gallery** — browse, search, filter, duplicate, archive, and import/export characters
- **Dice Roller** — standalone roller with history
- **PDF Export** — download a professional character sheet via WeasyPrint
- **Campaign Join** — enter a join code to add your character to a DM's campaign
- **Character Sharing** — generate time-limited public links

### For Dungeon Masters
- **Campaign Dashboard** — party overview with character levels, HP, and death saves
- **Combat Tracker** — initiative roller, round tracking, action economy
- **Session Notes** — per-character notes, NPC tracker, loot log
- **XP System** — award XP individually or to the party, with milestone leveling
- **Encounter Management** — create and run combat encounters

### Shared
- Session-based authentication with CSRF protection
- Dark/light theme with user preferences
- Mobile-responsive (5.9" to 27"+)
- WCAG accessibility compliance
- Keyboard shortcuts throughout

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| State | Zustand (client), TanStack Query (server), React Context (auth) |
| Backend | Django 5, Django REST Framework, PostgreSQL 16 |
| PDF | WeasyPrint (HTML/CSS to PDF) |
| Testing | Vitest + Testing Library (220 test files), Pytest (8 test files), Playwright (E2E) |
| Deployment | Google Cloud Run, Cloud SQL, Cloud Build, nginx |
| Infrastructure | Docker Compose (local dev), multi-stage Dockerfile (production) |

---

## Quick Start

### Local Development (SQLite)

```bash
# Backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
USE_SQLITE=true python manage.py migrate
USE_SQLITE=true python manage.py runserver

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`, the backend API on `http://localhost:8000/api/`.

### Docker Compose

```bash
docker-compose up
# App: http://localhost  |  API: http://localhost/api/  |  Admin: http://localhost/admin/
```

### Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for full Google Cloud Run deployment instructions.

---

## Project Structure

```
├── frontend/src/
│   ├── components/          # UI organized by domain
│   │   ├── wizard/          #   Character creation wizard
│   │   ├── character/       #   Character sheet & editing
│   │   ├── campaigns/       #   Campaign management
│   │   ├── dm/              #   DM tools (combat, notes, XP)
│   │   ├── session/         #   In-session tracking
│   │   ├── gallery/         #   Character gallery
│   │   └── shared/          #   Reusable components
│   ├── data/                # D&D 5e reference data (classes, races, spells, etc.)
│   ├── hooks/               # 26 custom React hooks
│   ├── pages/               # 20 route pages
│   ├── utils/               # Calculations, dice engine, combat logic
│   └── stores/              # Zustand state stores
├── backend/
│   ├── characters/          # Character CRUD, sharing, import/export
│   ├── campaigns/           # Campaign management, join codes, encounters
│   ├── users/               # Auth, preferences, custom user model
│   ├── pdf/                 # PDF generation service
│   └── config/              # Django settings
├── prepfiles/               # Original planning documents (see below)
├── Dockerfile.cloudrun      # Production multi-stage build
├── DEPLOYMENT.md            # Cloud Run deployment guide
└── docker-compose.yml       # Local development stack
```

---

## Testing

```bash
# Frontend — 220 test files, ~4,000+ tests
cd frontend && npm test

# Backend — 8 test files, 105 tests
cd backend && pytest

# E2E (requires running app)
cd frontend && npx playwright test
```

---

## How This Was Built

This application was built using **Claude Opus 4.6** via **Claude Code** (Anthropic's CLI agent). No code was written by hand.

### Process

1. **Specification** — Claude researched D&D 5e character creation rules and produced a 41,000-word technical specification covering game mechanics, edge cases, and system interactions.

2. **Architecture** — Claude was instructed to decompose the spec into a phased build plan as a senior technical architect would. It produced six phases, broken into epics, stories, tasks, subtasks, and test specifications — 6,000+ lines of planning documents across eight files.

   | Phase | Scope |
   |-------|-------|
   | 1. Foundation | Auth, schema, API scaffolding |
   | 2. Character Creation Wizard | Guided builder with full 5e rules |
   | 3. Character Sheet & Management | Viewing, editing, gallery, sharing |
   | 4. Session Play | Dice roller, combat tracker, conditions |
   | 5. DM Features | Campaign dashboard, XP, encounters |
   | 6. Polish & Export | PDF export, accessibility, performance |

3. **Self-review** — Claude reviewed its own plans for gaps and inconsistencies. It identified missing items (ETL pipeline for SRD data, uncovered race/subrace combinations, permission edge cases) and corrected them before code generation began.

4. **Parallel construction** — The planning documents were loaded into Claude Code. Specialized agents (frontend, backend, DBA, QA, tech lead) built concurrently, with the orchestrator managing the dependency graph across phases.

5. **Deployment** — Claude configured and deployed the application to Google Cloud Run with Cloud SQL PostgreSQL, including data migration and verification.

### Output

| Metric | Value |
|--------|-------|
| Timeline | 2 days |
| Commits | 110 |
| Application code | ~70,000 lines (React + Django) |
| Test code | ~66,000 lines across 228 test files |
| Planning documents | 6,097 lines across 8 files |
| Infrastructure | Cloud Run + Cloud SQL, Docker Compose for local dev |

The original planning documents are preserved in [`prepfiles/`](prepfiles/).

---

## License

This project is for personal and educational use.
