from django.core.management.base import BaseCommand
from ...models import UserActiveBillDue

class Command(BaseCommand):
    help = 'Chanages bill status on all useractivebill objects to paid'

    def handle(self, *args, **options):

        try:
            bills = UserActiveBillDue.objects.all()
            for bill in bills:
                bill.bill_status = 'paid'
                bill.save()
                self.stdout.write(self.style.SUCCESS('Successfully changed the bill status to paid.'))
        except UserActiveBillDue.DoesNotExist:
            self.stdout.write(self.style.ERROR('Bill does not exist.'))