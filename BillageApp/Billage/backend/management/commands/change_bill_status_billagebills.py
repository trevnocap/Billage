from django.core.management.base import BaseCommand
from ...models import BillageBill

class Command(BaseCommand):
    help = 'Chanages bill status on all useractivebill objects to paid'

    def handle(self, *args, **options):
        active_bills = BillageBill.objects.all()
        for bill in active_bills:
            if bill.bill_status != 'paid':
                bill.bill_status = 'paid'
                bill.save()
        self.stdout.write(self.style.SUCCESS(f'Successfully changed all active bills to paid '))