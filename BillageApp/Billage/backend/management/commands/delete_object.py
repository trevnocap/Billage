from django.core.management.base import BaseCommand
from ...models import UserBillDetailsHistory

class Command(BaseCommand):
    help = 'Chanages bill status on all useractivebill objects to paid'

    def handle(self, *args, **options):
        object_id = input('Provide Object ID: ')

        try:
            bill = UserBillDetailsHistory.objects.get(pk=object_id)
            bill.delete()
            self.stdout.write(self.style.SUCCESS('Successfully Deleted'))
        except UserBillDetailsHistory.DoesNotExist:
            self.stdout.write(self.style.ERROR('Bill does not exist.'))