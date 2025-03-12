from django.contrib import admin
from userauths import models

class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email']

class ProfileAdmin(admin.ModelAdmin):
    list_editable = ['verified']
    list_display = ['user', 'full_name', 'verified']

admin.site.register(models.User)
admin.site.register(models.Profile)




