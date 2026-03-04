# Epic 43: Deployment & Infrastructure

> **Phase 6: Polish & Export** | Weeks 11-12

## Goal

Establish a production-ready deployment pipeline for the full-stack Django + React web application using Docker Compose for local development and production deployment, hardened production configuration, and automated CI/CD for testing and deployment.

## Stories

| Story | Title | Tasks | Focus |
|-------|-------|-------|-------|
| 43.1 | Docker Compose Setup | 5 | Multi-container configuration (Django, PostgreSQL, Redis, Nginx), Dockerfile optimization, volume mounts, environment variable management, dev/prod compose profiles |
| 43.2 | Production Configuration | 5 | Django production settings, Nginx reverse proxy, HTTPS/TLS, static file serving, CORS configuration, database connection pooling, logging, health checks |
| 43.3 | CI/CD Pipeline | 4 | GitHub Actions workflow, automated pytest + Vitest + Playwright runs, Docker image building, deployment automation, environment promotion |

## Technical Approach

- **Docker Compose:** Multi-service setup — Django (Gunicorn), PostgreSQL 15+, Redis (caching/sessions), Nginx (reverse proxy + static files)
- **Dockerfile Optimization:** Multi-stage builds for both Django (Python slim) and React (Node build + Nginx serve), layer caching for pip/npm dependencies
- **Production Django:** `DEBUG=False`, `ALLOWED_HOSTS`, `SECURE_*` settings, WhiteNoise or Nginx for static files, Gunicorn with multiple workers
- **Database:** PostgreSQL connection pooling via pgBouncer or Django-level pooling, automated migrations on deploy
- **CI/CD:** GitHub Actions with separate jobs for backend tests (pytest), frontend tests (Vitest), E2E tests (Playwright), Docker image build, and deployment
- **Environment Management:** `.env` files for secrets, separate dev/staging/prod configurations

## Dependencies

- Epic 42 (Performance) should be complete first — optimize before deploying
- All application features from Phases 1-5 complete
- Docker and Docker Compose available in development and deployment environments

## Key Deliverables

- `docker-compose.yml` — development configuration with hot-reload
- `docker-compose.prod.yml` — production configuration with Gunicorn, Nginx, and optimized settings
- `Dockerfile` (backend) — multi-stage Django build with WeasyPrint dependencies
- `Dockerfile` (frontend) — multi-stage React build with Nginx serving
- `nginx/nginx.conf` — reverse proxy configuration with static file serving and HTTPS
- `.github/workflows/ci.yml` — CI pipeline: lint, test, build
- `.github/workflows/deploy.yml` — CD pipeline: build images, push, deploy
- Health check endpoints (`/api/health/`) for monitoring
- Environment-specific settings (`settings/base.py`, `settings/dev.py`, `settings/prod.py`)

## Testing Summary

| Story | Unit | Functional | E2E | Total |
|-------|------|-----------|-----|-------|
| 43.1 — Docker Compose Setup | 2 | 5 | 4 | 11 |
| 43.2 — Production Configuration | 3 | 5 | 3 | 11 |
| 43.3 — CI/CD Pipeline | 2 | 4 | 3 | 9 |
| **Totals** | **7** | **14** | **10** | **31** |

> **Testing Note:** Tests for this epic are primarily integration tests using pytest for Django health checks and configuration validation, shell scripts or Docker Compose `--dry-run` for container orchestration, and GitHub Actions workflow validation. E2E tests verify the full stack running in Docker.

### Key Gaps Found
- Database migration strategy for zero-downtime deployments not specified
- Secret rotation policy and secure secret injection (e.g., Docker secrets vs. environment variables) not defined
- Container resource limits (memory, CPU) for production not specified
- Rollback strategy for failed deployments not addressed
- Monitoring and alerting infrastructure (e.g., Sentry, Prometheus) not included in scope
- SSL certificate management (Let's Encrypt auto-renewal) not detailed
