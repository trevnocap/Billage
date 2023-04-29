from django.core.management.base import BaseCommand
from ...models import UserActiveBillDue

class Command(BaseCommand):
    help = 'Chanages bill status on all useractivebill objects to paid'

    def handle(self, *args, **options):
        linked_bill = input('Linked_bill ID to update: ')
        bill_status = input('Status (paid, pending payment, canceled, failed payment): ')

        try:
            bills = UserActiveBillDue.objects.filter(linked_bill=linked_bill)
            for bill in bills:
                bill.bill_status = bill_status
                bill.save()
                self.stdout.write(self.style.SUCCESS('Successfully changed the bill status to paid.'))
        except UserActiveBillDue.DoesNotExist:
            self.stdout.write(self.style.ERROR('Bill does not exist.'))