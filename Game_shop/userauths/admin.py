from django.contrib import admin
from userauths import models
from .models import SupportRequest

class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email']

class ProfileAdmin(admin.ModelAdmin):
    list_editable = ['verified', 'user_type']
    list_display = ['user', 'full_name', 'user_type', 'verified']
    list_filter = ['user_type', 'verified']
    search_fields = ['user__username', 'user__email', 'full_name']

@admin.register(SupportRequest)
class SupportRequestAdmin(admin.ModelAdmin):
    list_display = ['subject', 'user_email', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['subject', 'user_email', 'message']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

admin.site.register(models.User, UserAdmin)
admin.site.register(models.Profile, ProfileAdmin)




