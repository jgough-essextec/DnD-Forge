from django.contrib import admin
from django.urls import include, path

from config.health import health_check

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health-check'),
    path('api/', include('characters.urls')),
    path('api/', include('campaigns.urls')),
    path('api/', include('users.urls')),
    path('api/', include('srd.urls')),
    path('api/', include('pdf.urls')),
]
