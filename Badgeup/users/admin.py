from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ("BadgeUp Profile", {"fields": ("avatar", "bio", "points")}),
    )
    list_display = ("username", "email", "first_name", "last_name", "points", "is_staff")
    search_fields = ("username", "email", "first_name", "last_name")
