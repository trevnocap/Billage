from django.contrib import admin

# Register your models here.

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

def reset_password(modeladmin, request, queryset):
    for user in queryset:
        user.set_password("3068Tamarak")
        user.save()
        
reset_password.short_description = "Reset password(s)"

class CustomUserAdmin(UserAdmin):
    actions = [reset_password]

admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)