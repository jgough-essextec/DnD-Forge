# Story 43.3 — CI/CD Pipeline & Health Checks

> **Epic 43: Deployment & Infrastructure** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description
As a developer, I need a GitHub Actions CI/CD pipeline that runs all tests (pytest, Vitest, Playwright), checks migrations, and builds Docker images on every push.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router, WeasyPrint (server-side PDF), Playwright (E2E testing)
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **CI/CD**: GitHub Actions with PostgreSQL service container, parallel test jobs, Docker build verification
- **Test matrix**: pytest (Django), Vitest (React), Playwright (E2E), migration check, lint/typecheck

## Tasks
- [ ] **T43.3.1** — Create `.github/workflows/ci.yml` with jobs: backend-tests, frontend-tests, e2e-tests, docker-build
- [ ] **T43.3.2** — Backend test job: start PostgreSQL service container, run `pip install`, `python manage.py migrate`, `pytest --cov`
- [ ] **T43.3.3** — Frontend test job: `npm install`, `npx vitest run`, `npx tsc --noEmit` (typecheck)
- [ ] **T43.3.4** — E2E test job: start full stack via Docker Compose, run `npx playwright test`
- [ ] **T43.3.5** — Migration check job: `python manage.py makemigrations --check --dry-run` — fails if unapplied model changes exist
- [ ] **T43.3.6** — Docker build verification: `docker compose -f docker-compose.prod.yml build` — ensures production build succeeds
- [ ] **T43.3.7** — Add branch protection rules documentation: require CI pass before merge to main

## Acceptance Criteria
- GitHub Actions workflow triggers on push and PR to main
- Backend tests run with real PostgreSQL (service container)
- Frontend tests run and pass (Vitest + TypeScript check)
- E2E tests run against full Docker stack
- Migration consistency is verified (no unapplied changes)
- Production Docker build is verified
- All jobs can run in parallel where independent

## Testing Requirements

### CI Pipeline Tests
- Pipeline completes successfully on a clean PR
- Failed tests cause pipeline to fail (non-zero exit)
- Migration check catches new model changes without migration
- Docker build catches Dockerfile errors

### Test Dependencies
- GitHub Actions runner (ubuntu-latest)
- PostgreSQL 16 service container
- Node 20 for frontend
- Python 3.12 for backend
- Docker for build verification

## Identified Gaps
- **Performance**: No caching strategy for pip/npm dependencies in CI
- **Security**: Secrets management for production deployment not specified
- **Deployment**: Actual deployment step (push to registry, deploy to server) not specified — this is CI only

## Dependencies
- **Depends on:** Story 43.1 (Docker setup), Story 43.2 (production config), Story 1.4 (testing framework)
- **Blocks:** None — this is the final infrastructure story

## Notes
- Use GitHub Actions caching for pip and npm to speed up CI (~2-3 min savings)
- E2E tests are the slowest job — run in parallel with unit test jobs
- Consider adding code coverage thresholds (e.g., >80%) as a CI check
- Migration check prevents deploying code with missing migrations
