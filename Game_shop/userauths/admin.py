from django.contrib import admin
from userauths import models

class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email']

class ProfileAdmin(admin.ModelAdmin):
    list_editable = ['verified', 'user_type']
    list_display = ['user', 'full_name', 'user_type', 'verified']
    list_filter = ['user_type', 'verified']
    search_fields = ['user__username', 'user__email', 'full_name']

admin.site.register(models.User, UserAdmin)
admin.site.register(models.Profile, ProfileAdmin)




