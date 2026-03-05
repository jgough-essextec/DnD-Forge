#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-8080}"
export PORT

# Substitute $PORT into nginx config
sed "s/\${PORT}/${PORT}/g" /etc/nginx/nginx.cloudrun.conf.template > /etc/nginx/nginx.conf

# Run Django migrations
echo "Running migrations..."
python manage.py migrate --noinput

# Start gunicorn in the background
echo "Starting gunicorn on port 8001..."
gunicorn config.wsgi:application \
    --bind 127.0.0.1:8001 \
    --workers "${GUNICORN_WORKERS:-2}" \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - &
GUNICORN_PID=$!

# Wait for gunicorn to be ready before starting nginx
echo "Waiting for gunicorn..."
for i in $(seq 1 30); do
    if python -c "import socket; s=socket.socket(); s.connect(('127.0.0.1',8001)); s.close()" 2>/dev/null; then
        echo "Gunicorn is ready."
        break
    fi
    sleep 1
done

# Start nginx in the foreground
echo "Starting nginx on port ${PORT}..."
nginx -g 'daemon off;' &
NGINX_PID=$!

# Trap signals for clean shutdown
shutdown() {
    echo "Shutting down..."
    kill -TERM "$NGINX_PID" "$GUNICORN_PID" 2>/dev/null || true
    wait "$NGINX_PID" "$GUNICORN_PID" 2>/dev/null || true
    exit 0
}
trap shutdown SIGTERM SIGINT

# Wait for either process to exit
wait -n "$GUNICORN_PID" "$NGINX_PID"
echo "A process exited unexpectedly. Shutting down."
shutdown
