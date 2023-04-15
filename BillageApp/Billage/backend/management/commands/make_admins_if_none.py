from django.core.management.base import BaseCommand
from ...models import Billage

class Command(BaseCommand):
    help = 'Creates an admin in each billage if doesnt exist'

    def handle(self, *args, **options):
        count = 0
        billages = Billage.objects.all()
        for billage in billages:
            if billage.get_admins() is None:
                admin = billage.billage_members.first()
                if admin is not None:
                    count += 1
                    billage.billage_admins.add(admin)
                    billage.save()
        self.stdout.write(self.style.SUCCESS(f'Successfully made {count} admins in {count} different Billages'))
