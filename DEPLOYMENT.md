# Deploying D&D Character Forge to Google Cloud Run

This guide covers deploying the app (Django + React) to Google Cloud Run with Cloud SQL PostgreSQL.

## Architecture

Single Cloud Run service running a combined container:

```
Internet --> Cloud Run (nginx:$PORT) --> gunicorn:8001 --> Cloud SQL PostgreSQL
                  |
            React static files
```

- **nginx** listens on Cloud Run's `$PORT` (8080), serves React static files, proxies `/api/` and `/admin/` to gunicorn
- **gunicorn** runs Django on internal port 8001
- **Cloud SQL PostgreSQL** provides the managed database (connected via Unix socket)

## Prerequisites

- Google Cloud SDK (`gcloud`) installed and authenticated
- A GCP project (ours: `llm-test-space-gough`)
- Python 3.12+ locally (for data export/import)
- `cloud-sql-proxy` installed locally (`brew install cloud-sql-proxy`)

## Step 1: Enable GCP APIs

```bash
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  artifactregistry.googleapis.com \
  sql-component.googleapis.com \
  cloudbuild.googleapis.com \
  --project=llm-test-space-gough
```

## Step 2: Create Cloud SQL Instance

```bash
# Create the instance (takes ~5 minutes)
# IMPORTANT: Use --edition=enterprise for db-f1-micro tier
gcloud sql instances create dnd-forge-db \
  --database-version=POSTGRES_16 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --storage-size=10GB \
  --edition=enterprise \
  --project=llm-test-space-gough

# Create database
gcloud sql databases create dnd_forge \
  --instance=dnd-forge-db \
  --project=llm-test-space-gough

# Create user (generate a secure password)
DB_PASSWORD=$(python3 -c "from secrets import token_urlsafe; print(token_urlsafe(24))")
echo "Save this password: $DB_PASSWORD"

gcloud sql users create dnd_app_user \
  --instance=dnd-forge-db \
  --password="$DB_PASSWORD" \
  --project=llm-test-space-gough
```

## Step 3: Create Artifact Registry

```bash
gcloud artifacts repositories create dnd-forge \
  --repository-format=docker \
  --location=us-central1 \
  --project=llm-test-space-gough

gcloud auth configure-docker us-central1-docker.pkg.dev --quiet
```

## Step 4: Export Local Data (if migrating from SQLite)

```bash
cd backend
USE_SQLITE=true python manage.py dumpdata \
  --natural-foreign --natural-primary \
  --exclude=contenttypes --exclude=auth.permission \
  --exclude=sessions.session --exclude=admin.logentry \
  --indent=2 > ../data_export.json
```

Verify the export:
```bash
python3 -c "
import json
with open('../data_export.json') as f:
    data = json.load(f)
from collections import Counter
for model, count in sorted(Counter(item['model'] for item in data).items()):
    print(f'  {model}: {count}')
print(f'Total: {len(data)}')
"
```

## Step 5: Build and Push Docker Image

This project uses Cloud Build to compile on x86-64 remotely (required since local dev is ARM/Apple Silicon and Cloud Run needs linux/amd64).

From the **project root**:
```bash
gcloud builds submit \
  --config=cloudbuild.yaml \
  --project=llm-test-space-gough
```

This reads `cloudbuild.yaml`, which tells Cloud Build to use `Dockerfile.cloudrun` and push to Artifact Registry. The build takes ~2 minutes.

To bump the version tag, edit `cloudbuild.yaml` (change `v1` to `v2`, etc.).

## Step 6: Deploy to Cloud Run

```bash
CLOUD_SQL_CONN="llm-test-space-gough:us-central1:dnd-forge-db"
SECRET_KEY=$(python3 -c "from secrets import token_urlsafe; print(token_urlsafe(50))")

gcloud run deploy dnd-forge \
  --image=us-central1-docker.pkg.dev/llm-test-space-gough/dnd-forge/dnd-forge:v1 \
  --region=us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances=$CLOUD_SQL_CONN \
  --set-env-vars="DJANGO_SECRET_KEY=$SECRET_KEY,DJANGO_DEBUG=False" \
  --set-env-vars="DB_NAME=dnd_forge,DB_USER=dnd_app_user,DB_PASSWORD=<your-password>" \
  --set-env-vars="DB_HOST=/cloudsql/$CLOUD_SQL_CONN,DB_PORT=" \
  --set-env-vars="GUNICORN_WORKERS=2,SECURE_SSL_REDIRECT=False" \
  --memory=1Gi --cpu=1 --min-instances=0 --max-instances=5 --timeout=300 \
  --project=llm-test-space-gough
```

Then update CORS/CSRF with the assigned URL:
```bash
URL=$(gcloud run services describe dnd-forge \
  --region=us-central1 \
  --project=llm-test-space-gough \
  --format="value(status.url)")

gcloud run services update dnd-forge \
  --region=us-central1 \
  --project=llm-test-space-gough \
  --update-env-vars="DJANGO_ALLOWED_HOSTS=${URL##https://},CORS_ALLOWED_ORIGINS=$URL,CSRF_TRUSTED_ORIGINS=$URL"
```

## Step 7: Import Data and Create Users

Use Cloud SQL Auth Proxy to connect locally to the remote database:

```bash
# Start proxy (use a different port than local postgres)
cloud-sql-proxy llm-test-space-gough:us-central1:dnd-forge-db --port=5433 &

# Set env vars for Django
export DB_HOST=127.0.0.1 DB_PORT=5433 DB_NAME=dnd_forge DB_USER=dnd_app_user DB_PASSWORD=<your-password>

# Import data
cd backend
python manage.py loaddata ../data_export.json

# Create new users
python manage.py create_user <username> <password>

# Stop the proxy when done
kill %1
```

## Step 8: Verify

```bash
# Health check (served by nginx directly)
curl https://<your-service-url>/health

# API check (proxied to Django)
curl https://<your-service-url>/api/auth/csrf/

# Check logs
gcloud run services logs read dnd-forge \
  --region=us-central1 \
  --project=llm-test-space-gough \
  --limit=50
```

## Redeploying After Code Changes

```bash
# 1. Build new image (from project root)
gcloud builds submit --config=cloudbuild.yaml --project=llm-test-space-gough

# 2. Deploy new image
gcloud run services update dnd-forge \
  --image=us-central1-docker.pkg.dev/llm-test-space-gough/dnd-forge/dnd-forge:v1 \
  --region=us-central1 \
  --project=llm-test-space-gough
```

## Environment Variables Reference

| Variable | Example | Description |
|---|---|---|
| `DJANGO_SECRET_KEY` | (generated) | Django secret key. **Required in production.** |
| `DJANGO_DEBUG` | `False` | Must be `False` in production. |
| `DJANGO_ALLOWED_HOSTS` | `dnd-forge-xxx.us-central1.run.app` | Comma-separated allowed hosts. |
| `DB_NAME` | `dnd_forge` | PostgreSQL database name. |
| `DB_USER` | `dnd_app_user` | PostgreSQL user. |
| `DB_PASSWORD` | (secret) | PostgreSQL password. |
| `DB_HOST` | `/cloudsql/project:region:instance` | Unix socket path for Cloud SQL. |
| `DB_PORT` | (empty string) | Must be empty for Unix socket connections. |
| `GUNICORN_WORKERS` | `2` | Number of gunicorn workers. |
| `SECURE_SSL_REDIRECT` | `False` | Set to `False` — Cloud Run handles TLS termination. |
| `CORS_ALLOWED_ORIGINS` | `https://dnd-forge-xxx.run.app` | Comma-separated allowed CORS origins. |
| `CSRF_TRUSTED_ORIGINS` | `https://dnd-forge-xxx.run.app` | Comma-separated CSRF trusted origins. |

## Deployment Files

| File | Purpose |
|---|---|
| `Dockerfile.cloudrun` | Multi-stage build: Node (frontend) + Python (backend) + nginx runtime |
| `cloudbuild.yaml` | Cloud Build config — points to `Dockerfile.cloudrun`, sets machine type |
| `nginx.cloudrun.conf` | nginx config template with `${PORT}` placeholder |
| `entrypoint.cloudrun.sh` | Startup script: migrate, start gunicorn, wait for ready, start nginx |
| `.dockerignore` | Excludes node_modules, .git, sqlite, etc. from Cloud Build upload |
| `backend/users/management/commands/create_user.py` | Django management command to create users by username/password |

## Estimated Cost

- Cloud SQL db-f1-micro: ~$7/month
- Cloud Run: ~$0 when idle (scale-to-zero), pennies under light use
- Artifact Registry: ~$0.10/GB
- **Total: ~$8-10/month for team testing**

---

## Things NOT To Do (Lessons Learned)

These are mistakes encountered during the initial deployment. Save yourself the rebuild cycles.

### 1. Do NOT use `python:3.12-slim` without pinning the Debian version

```dockerfile
# BAD — defaults to latest Debian (Trixie as of 2026), which renames packages
FROM python:3.12-slim

# GOOD — pin to Bookworm for stable package names
FROM python:3.12-slim-bookworm
```

**What happened:** `python:3.12-slim` silently moved from Debian Bookworm to Trixie, where `libgdk-pixbuf2.0-0` no longer exists. The build failed with `E: Package 'libgdk-pixbuf2.0-0' has no installation candidate`. Always pin the Debian codename to avoid surprise breakage.

### 2. Do NOT use `npm run build` if it runs `tsc` before `vite build`

```dockerfile
# BAD — tsc fails on type errors in test files, blocking the production build
RUN npm run build   # runs "tsc -b && vite build"

# GOOD — skip type checking for production builds, vite handles what it needs
RUN npx vite build
```

**What happened:** The `build` script in `package.json` runs `tsc -b && vite build`. TypeScript errors in test files (unused imports, type mismatches in test mocks) blocked the entire production build. Vite doesn't need tsc to produce correct output — it only uses types for editor support. Run type checking in CI, not in the Docker build.

### 3. Do NOT use `envsubst` in Python slim images

```bash
# BAD — envsubst is not installed in python:3.12-slim
envsubst '${PORT}' < template > /etc/nginx/nginx.conf

# GOOD — sed is always available
sed "s/\${PORT}/${PORT}/g" template > /etc/nginx/nginx.conf
```

**What happened:** The `envsubst` command (from `gettext-base`) is not included in Python slim images. The container started, hit `envsubst: command not found`, and exited immediately. Cloud Run reported "container failed to start and listen on PORT". Use `sed` instead — it's always available.

### 4. Do NOT start nginx before gunicorn is ready

```bash
# BAD — nginx starts accepting traffic immediately, returns 502 for /api/ requests
gunicorn ... &
nginx -g 'daemon off;' &

# GOOD — wait for gunicorn to be listening before starting nginx
gunicorn ... &
for i in $(seq 1 30); do
    if python -c "import socket; s=socket.socket(); s.connect(('127.0.0.1',8001)); s.close()" 2>/dev/null; then
        break
    fi
    sleep 1
done
nginx -g 'daemon off;' &
```

**What happened:** On cold starts, gunicorn takes a few seconds to boot workers. nginx was ready immediately and started accepting traffic. The first API requests hit nginx, got proxied to gunicorn's port, and received "connection refused" — resulting in 502 errors. Add a readiness loop.

### 5. Do NOT use `gcloud builds submit --tag` with a custom Dockerfile name

```bash
# BAD — --tag flag requires the file to be named exactly "Dockerfile"
gcloud builds submit --tag=us-central1-docker.pkg.dev/.../image:v1

# ALSO BAD — --dockerfile is not a valid flag
gcloud builds submit --tag=... --dockerfile=Dockerfile.cloudrun

# GOOD — use a cloudbuild.yaml that specifies -f
# cloudbuild.yaml:
# steps:
#   - name: 'gcr.io/cloud-builders/docker'
#     args: ['build', '-t', '...', '-f', 'Dockerfile.cloudrun', '.']
gcloud builds submit --config=cloudbuild.yaml
```

**What happened:** `gcloud builds submit --tag` is a convenience shortcut that expects a file named `Dockerfile` in the build context. There is no `--dockerfile` flag. If your Dockerfile has a different name (like `Dockerfile.cloudrun`), you must use a `cloudbuild.yaml` config file instead.

### 6. Do NOT forget `--edition=enterprise` when creating db-f1-micro instances

```bash
# BAD — defaults to ENTERPRISE_PLUS edition, which doesn't support micro tiers
gcloud sql instances create mydb --tier=db-f1-micro ...

# GOOD — explicitly set enterprise edition
gcloud sql instances create mydb --tier=db-f1-micro --edition=enterprise ...
```

**What happened:** The default Cloud SQL edition changed to `ENTERPRISE_PLUS`, which only supports `db-perf-optimized-N-*` tiers. Creating a `db-f1-micro` instance without `--edition=enterprise` fails with `Invalid Tier (db-f1-micro) for (ENTERPRISE_PLUS) Edition`.

### 7. Do NOT build Docker images locally on Apple Silicon for Cloud Run

```bash
# BAD — builds ARM image, Cloud Run needs linux/amd64
docker build -t my-image .
docker push my-image

# ALSO BAD — cross-compilation is slow and fragile
docker buildx build --platform linux/amd64 -t my-image .

# GOOD — build natively in the cloud on x86-64
gcloud builds submit --config=cloudbuild.yaml
```

**What happened (avoided):** Apple Silicon Macs produce ARM images by default. Cloud Run requires `linux/amd64`. Cross-compilation with `docker buildx` is slow and can fail with native dependencies (like WeasyPrint's C libraries). Google Cloud Build runs on x86-64 natively — use it.

### 8. Do NOT set `SECURE_SSL_REDIRECT=True` on Cloud Run

```bash
# BAD — causes infinite redirect loop
--set-env-vars="SECURE_SSL_REDIRECT=True"

# GOOD — Cloud Run terminates TLS, traffic to the container is HTTP
--set-env-vars="SECURE_SSL_REDIRECT=False"
```

**Why:** Cloud Run handles TLS termination. Traffic from Cloud Run's load balancer to your container is plain HTTP on port 8080. If Django's `SECURE_SSL_REDIRECT` is `True`, it sees HTTP and redirects to HTTPS, which hits Cloud Run again as HTTP — infinite loop. The `SECURE_PROXY_SSL_HEADER` setting (already configured) tells Django to trust the `X-Forwarded-Proto` header instead.

### 9. Do NOT forget the `.dockerignore` when using Cloud Build

Without `.dockerignore`, `gcloud builds submit` uploads everything to Cloud Storage — including `node_modules/`, `.git/`, `db.sqlite3`, test artifacts, and screenshots. This makes the upload slow and bloated. Always have a `.dockerignore` that excludes non-essential files.

### 10. Do NOT set `DB_PORT` to any value for Cloud SQL Unix sockets

```bash
# BAD — tries TCP connection on port 5432 to the socket path
--set-env-vars="DB_PORT=5432"

# GOOD — empty string tells psycopg2 to use Unix socket
--set-env-vars="DB_PORT="
```

**Why:** When `DB_HOST` is a Unix socket path (`/cloudsql/...`), the `DB_PORT` must be an empty string. If you set it to `5432`, Django/psycopg2 tries to make a TCP connection to the socket path on port 5432, which fails.

### 11. Do NOT forget `USE_SQLITE=` when running Django commands against Cloud SQL locally

```bash
# BAD — if .env or dotenv sets USE_SQLITE=true, Django silently uses SQLite
DB_HOST=127.0.0.1 DB_PORT=5433 python manage.py loaddata data.json

# GOOD — explicitly unset USE_SQLITE to force PostgreSQL
USE_SQLITE= DB_HOST=127.0.0.1 DB_PORT=5433 DB_NAME=dnd_forge DB_USER=dnd_app_user DB_PASSWORD=<pw> \
  .venv/bin/python manage.py loaddata data.json
```

**What happened:** The Django settings file has a `USE_SQLITE` override that switches the database engine to SQLite. If `load_dotenv()` reads a `.env` file that sets `USE_SQLITE=true`, all `loaddata`, `create_user`, and other management commands will silently operate on the local SQLite database instead of Cloud SQL — even when you set `DB_HOST` and other PostgreSQL env vars. Always set `USE_SQLITE=` (empty) explicitly to ensure PostgreSQL is used. Also use the project's virtualenv Python (`.venv/bin/python`) rather than the system Python to avoid picking up the wrong packages.

### 12. Do NOT use the system Python — always use the virtualenv

```bash
# BAD — may pick up Anaconda, Homebrew, or system Python with wrong packages
python manage.py loaddata data.json

# GOOD — use the project's virtualenv explicitly
.venv/bin/python manage.py loaddata data.json
```

**What happened:** The system `python` resolved to Anaconda Python 3.9, which didn't have `psycopg2` installed and fell back to SQLite. All data was loaded into the local SQLite database while the Cloud SQL database remained empty. Always use `.venv/bin/python` for Django management commands.
