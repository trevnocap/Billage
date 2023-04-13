from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import Argon2PasswordHasher
from django.contrib.auth.models import User

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'BillageApp.Billage.Billage.settings')
django.setup()

class Command(BaseCommand):
    help = 'Rehashes all user passwords using the Argon2 algorithm'

    def handle(self, *args, **options):
        hasher = Argon2PasswordHasher()
        for user in User.objects.all():
            user.password = hasher.encode(user.password)
            user.save()
        self.stdout.write(self.style.SUCCESS('Passwords rehashed successfully'))
