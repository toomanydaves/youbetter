from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class PeepsUserAdmin(UserAdmin):
    pass

# Register your models here.
admin.site.register(User, PeepsUserAdmin)
