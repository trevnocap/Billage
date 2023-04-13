from django.core.management.base import BaseCommand
from django.utils import timezone
from ...models import ShareableLink

class Command(BaseCommand):
    help = 'Remove expired shareable links'

    def handle(self, *args, **options):
        expired_links = ShareableLink.objects.filter(expires_at__lt=timezone.now())
        count = expired_links.count()
        expired_links.delete()
        self.stdout.write(self.style.SUCCESS(f'Successfully deleted {count} expired links'))
