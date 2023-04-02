from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import *
from django.contrib.auth.models import User


@receiver(post_save, sender=BillageBillActiveBill)
def create_user_bill_due_amount(sender, instance, created, **kwargs):
    if created:
        bill_splits = LinkedBillSplit.objects.filter(bill_being_split= instance.linked_bill)
        for split in bill_splits:
            due_amount = split.split_percentage * instance.bill_due_amount
            user = split.user
            UserActiveBillDueAmount.objects.create(
                linked_bill = instance.linked_bill,
                active_bill = instance,
                user = user,
                due_amount=due_amount,
                bill_due_date = instance.bill_due_date
                )