# D&D Character Forge -- Outstanding Questions

This document tracks open questions and unresolved decisions across the project. Add questions as they arise during implementation. Move resolved questions to a "Resolved" subsection within each category, preserving the decision and rationale for future reference.

---

## Architecture & Infrastructure

Questions about the overall system architecture, build pipeline, deployment, hosting, and infrastructure decisions.

- **Django deployment strategy:** Docker Compose for local dev is clear, but what is the production deployment target? Options include: managed container services (AWS ECS/Fargate, GCP Cloud Run, Azure Container Apps), a VPS with Docker Compose, or a PaaS like Railway/Render. Each has different cost/complexity tradeoffs.
- **Managed vs. self-hosted PostgreSQL:** Should we use a managed database service (AWS RDS, GCP Cloud SQL, Supabase) or run PostgreSQL in the same Docker Compose stack? Managed is simpler for backups and scaling but adds cost.
- **CORS configuration:** How should CORS be configured for development (Vite dev server on :5173, Django on :8000) vs. production (single domain or separate subdomains for API and frontend)? Use django-cors-headers with environment-specific allowed origins?
- **WeasyPrint system dependencies:** WeasyPrint requires system-level libraries (cairo, pango, gdk-pixbuf). How do we manage these in the Docker image? A pre-built base image or install in Dockerfile? This affects image size and build time.
- **Static file serving in production:** Should Django serve the React SPA build via WhiteNoise, or should Nginx serve static files directly and proxy API requests to Django?
- **Environment configuration:** How to manage secrets and environment variables (DATABASE_URL, SECRET_KEY, ALLOWED_HOSTS) across local dev, CI, staging, and production? Use django-environ or python-decouple?

---

## D&D 5e Rules Interpretation

Questions about how specific D&D 5e rules should be implemented when the rules are ambiguous, have edge cases, or differ between the 2014 and 2024 rulesets.

-

---

## UI/UX Design Decisions

Questions about user interface layout, interaction patterns, visual design, and user experience flows that need resolution before or during implementation.

-

---

## Data Model Questions

Questions about the TypeScript type system, database schema, entity relationships, and data representation choices.

- **Database migration strategy:** How do we handle schema evolution as features are added? Django migrations handle the mechanics, but what is the process for reviewing migrations in PRs and applying them in production deployments?
- **SRD data: static frontend files vs. Django fixtures vs. both?** Currently planned as both, but is the duplication worth it? Could the frontend fetch SRD data from the API instead of bundling static files? Tradeoff: API fetches add latency and loading states vs. static files add bundle size.
- **JSON fields vs. normalized tables for character data:** Should complex nested character data (e.g., equipment list, spell selections, ability score overrides) be stored as PostgreSQL JSONB fields or fully normalized relational tables? JSONB is simpler but harder to query across characters.
- **Character versioning:** Should we keep a history of character changes (audit log), or is the current state sufficient? Django-simple-history or manual snapshots?

---

## Performance & Optimization

Questions about bundle size, lazy loading strategy, API performance, rendering optimization, and caching decisions.

- **API response caching:** Should we add server-side caching (Redis, Django cache framework) for SRD API endpoints? These are read-only and rarely change. HTTP cache headers (ETag, Cache-Control) may be sufficient.
- **React Query stale time tuning:** What stale times should be configured for different data types? SRD data can be cached for hours/days; character data should refetch more frequently for multi-device use.

---

## Accessibility

Questions about keyboard navigation patterns, screen reader behavior, ARIA implementation details, color contrast choices, and reduced-motion handling.

-

---

## Testing Strategy

Questions about test coverage targets, testing approach for specific features (dice randomness, PDF output, API integration), and test infrastructure decisions.

- **API test database strategy:** Use a separate test database with fixtures, or use Django's default test runner with transaction rollback? pytest-django's `--reuse-db` flag for faster test runs?
- **E2E test environment:** Should Playwright tests run against Docker Compose (full stack) or against Django dev server + Vite dev server? How to seed test data -- API calls in test setup or Django fixtures?

---

## Deployment & Distribution

Questions about hosting, CI/CD pipeline, update mechanisms, and distribution channels.

- **CI/CD pipeline:** GitHub Actions for linting, testing (backend + frontend), building Docker images, and deploying? What are the stages and gates?
- **Database backup strategy:** Automated PostgreSQL backups -- managed service snapshots, pg_dump cron, or a backup service?
- **Zero-downtime deployments:** How to handle Django migrations during deployment without downtime? Blue-green deployments, rolling updates, or maintenance windows?

---

## API Design

Questions about REST API conventions, serialization, and client-server communication patterns.

- **REST conventions:** Should we follow strict REST resource naming, or use action-based endpoints where it makes sense (e.g., `/characters/:id/level-up/` vs. PATCH with level data)?
- **Pagination strategy:** Cursor-based or offset-based pagination for list endpoints? What page size defaults?
- **Filtering and search:** Use django-filter for query parameter filtering on list endpoints? Which fields should be filterable (e.g., spells by class, level, school)?
- **Serializer depth:** How much nested data to include in list views vs. detail views? Separate serializers for list/detail, or use query parameter to control depth?
- **Error response format:** Standardize error response structure across all endpoints. Use DRF default format or a custom error handler?

---

## Authentication & Authorization

Questions about user authentication, authorization, and account management.

- **Auth strategy:** Django session auth is the current plan. Should we also support JWT (for potential mobile app clients in the future) or social auth (Google, Discord)?
- **Registration flow:** Email-based registration with verification, or username-only for simplicity? Password reset via email?
- **Character/campaign ownership:** Django model-level permissions, or DRF permission classes with object-level checks? How to handle campaign member access (players can view party members' characters)?
- **Admin access:** Use Django admin for user management and data inspection, or build custom admin views?
