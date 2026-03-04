"""
Health check endpoint for monitoring and container orchestration.
Returns database connectivity status.
"""

from django.db import connection
from django.http import JsonResponse


def health_check(request):
    """
    GET /api/health/
    Returns JSON with service health status and database connectivity.
    """
    db_status = "connected"
    status_code = 200

    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception:
        db_status = "unavailable"
        status_code = 503

    return JsonResponse(
        {
            "status": "healthy" if status_code == 200 else "unhealthy",
            "database": db_status,
        },
        status=status_code,
    )
