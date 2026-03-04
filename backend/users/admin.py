from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ["username", "email", "display_name", "is_active", "date_joined"]
    fieldsets = UserAdmin.fieldsets + (
        ("Profile", {"fields": ("display_name", "avatar_url", "preferences")}),
    )
