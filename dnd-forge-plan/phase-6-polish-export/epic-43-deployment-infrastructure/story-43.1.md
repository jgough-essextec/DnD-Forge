# Story 43.1 — Docker Compose Development Setup

> **Epic 43: Deployment & Infrastructure** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description
As a developer, I need a Docker Compose configuration that runs the full stack locally: Django API, PostgreSQL database, React dev server, and Nginx reverse proxy.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router, WeasyPrint (server-side PDF), Playwright (E2E testing)
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Domain**: D&D 5th Edition SRD
- **Docker services**: django (WSGI app), postgres (database), react-dev (Vite dev server), nginx (reverse proxy routing /api/ to Django, / to React)
- **Development workflow**: `docker compose up` starts all services, hot reload for both Django and React, database persists via named volume

## Tasks
- [ ] **T43.1.1** — Create `docker-compose.yml` with services: `django`, `postgres`, `react`, `nginx`
- [ ] **T43.1.2** — Create `backend/Dockerfile` — Python 3.12, pip install requirements, Django dev server or gunicorn
- [ ] **T43.1.3** — Create `frontend/Dockerfile.dev` — Node 20, npm install, Vite dev server with HMR
- [ ] **T43.1.4** — Create `nginx/nginx.conf` — reverse proxy: `/api/` → Django:8000, `/` → React:5173
- [ ] **T43.1.5** — Configure PostgreSQL service with named volume for persistence, env vars for credentials
- [ ] **T43.1.6** — Add `docker-compose.override.yml` for development-specific settings (debug mode, volume mounts for live reload)
- [ ] **T43.1.7** — Write startup script that runs migrations on first boot: `python manage.py migrate`

## Acceptance Criteria
- `docker compose up` starts all 4 services without errors
- Django API is accessible at `http://localhost/api/`
- React dev server serves at `http://localhost/` with hot reload
- PostgreSQL data persists across container restarts via named volume
- Django code changes trigger auto-reload inside container
- React code changes trigger HMR via Vite
- Database migrations run automatically on startup

## Testing Requirements

### Unit Tests (Vitest)
_N/A — infrastructure story, no unit tests_

### Integration Tests
- `docker compose up` completes without errors (health checks pass)
- Django health endpoint `/api/health/` returns 200
- React app loads at `/`
- PostgreSQL accepts connections from Django
- Nginx proxies correctly between services

### Test Dependencies
- Docker and Docker Compose installed
- Ports 80, 5432 available

## Identified Gaps
- **Performance**: No specification for Docker resource limits
- **Error Handling**: No specification for container restart policies in development
- **Security**: Development credentials in docker-compose should not be used in production

## Dependencies
- **Depends on:** Story 1.3 (dependencies installed), Story 5.1 (Django models defined)
- **Blocks:** Story 43.2 (production config), Story 43.3 (CI/CD)

## Notes
- Use multi-stage builds in Dockerfiles for production optimization (handled in 43.2)
- WeasyPrint requires system dependencies (libpango, libcairo) — install in Django Dockerfile
- Hot reload in Docker: mount source code as volumes in development
- Use `.env` file for database credentials and Django secret key
