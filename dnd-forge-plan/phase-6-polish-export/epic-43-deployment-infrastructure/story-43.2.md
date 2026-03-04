# Story 43.2 — Production Deployment Configuration

> **Epic 43: Deployment & Infrastructure** | **Phase 6: Polish & Export** (Weeks 11-12)

## Description
As a developer, I need production-ready deployment configuration with Nginx serving static files, Django running under Gunicorn/WSGI, and proper environment variable management.

## Technical Context
- **App**: D&D Character Forge — full-stack Django + React web application for D&D 5e character creation and management
- **Tech Stack**: React 18+, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query (server state), Zustand (UI state), Django REST Framework, PostgreSQL, React Router, WeasyPrint (server-side PDF), Playwright (E2E testing)
- **Architecture**: Django REST API backend, React SPA frontend, PostgreSQL persistence, Django session auth
- **Production stack**: Gunicorn (WSGI), Nginx (static files + reverse proxy), PostgreSQL, React build artifacts served as static files
- **Static files**: Django `collectstatic` + React `npm run build` → Nginx serves from `/static/` and `/`

## Tasks
- [ ] **T43.2.1** — Create `docker-compose.prod.yml` with production overrides: gunicorn, built React assets, production Nginx config
- [ ] **T43.2.2** — Create `backend/Dockerfile.prod` — multi-stage build: install deps, collectstatic, run gunicorn
- [ ] **T43.2.3** — Create `frontend/Dockerfile.prod` — multi-stage: npm build, copy dist to nginx image
- [ ] **T43.2.4** — Create `nginx/nginx.prod.conf` — serve React SPA (with HTML5 history fallback), proxy /api/ to gunicorn, serve static/media files
- [ ] **T43.2.5** — Configure environment variable management: `.env.production` template, Django settings reading from env vars (SECRET_KEY, DATABASE_URL, ALLOWED_HOSTS, DEBUG=False)
- [ ] **T43.2.6** — Add Django security settings for production: SECURE_SSL_REDIRECT, CSRF_TRUSTED_ORIGINS, SESSION_COOKIE_SECURE, etc.
- [ ] **T43.2.7** — Add health check endpoint: `GET /api/health/` returns database connectivity status

## Acceptance Criteria
- Production Docker build completes successfully
- Gunicorn serves Django API with multiple workers
- Nginx serves React SPA with HTML5 history mode fallback (all routes → index.html)
- Static files served by Nginx with cache headers
- All secrets loaded from environment variables, not hardcoded
- Django runs with DEBUG=False, security settings enabled
- Health check endpoint verifies database connectivity

## Testing Requirements

### Integration Tests
- Production build completes without errors
- Health check returns 200 with database status
- React SPA loads with all static assets
- API endpoints respond through Nginx proxy
- 404 routes return React SPA (history mode fallback)

### Test Dependencies
- Docker with production compose file
- Test environment variables

## Identified Gaps
- **Performance**: No specification for gunicorn worker count or connection pooling
- **Security**: SSL/TLS certificate management not specified (Let's Encrypt, etc.)
- **Monitoring**: No logging or monitoring setup specified

## Dependencies
- **Depends on:** Story 43.1 (Docker Compose dev setup)
- **Blocks:** Story 43.3 (CI/CD)

## Notes
- React build output goes to `dist/` — Nginx serves this directory for all non-API routes
- Use gunicorn with `--workers` based on CPU cores (2*cores + 1 is common)
- Django's `collectstatic` must run during Docker build, not at runtime
- Consider Django Whitenoise as alternative to Nginx for static file serving in simpler deployments
