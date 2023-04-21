from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import *
from django.contrib.auth.models import User


@receiver(post_save, sender=BillageBill)
def create_user_bill_due_amount(sender, instance, created, **kwargs):
    if created:
        bill_splits = LinkedBillSplit.objects.filter(bill_being_split= instance.linked_bill)
        for split in bill_splits:
            due_amount = split.split_percentage * instance.bill_due_amount
            user = split.user
            UserActiveBillDue.objects.create(
                linked_bill = instance.linked_bill,
                active_bill = instance,
                user = user,
                due_amount=due_amount,
                bill_due_date = instance.bill_due_date,
                payment_method = split.payment_method
                )
            
@receiver(post_save, sender = UserActiveBillDue)
def handle_bill_status_change(sender, instance, **kwargs):
    if instance.pk and instance.bill_status != 'pending payment':
        bill_history = UserBillDetailsHistory(
            user = instance.user,
            linked_bill = instance.linked_bill,
            payment_method = instance.payment_method,
            due_amount = instance.due_amount,
            bill_due_date = instance.bill_due_date,
            bill_status = instance.bill_status,
        )
        
        bill_history.save()
        instance.delete()


from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from django.utils import timezone

@receiver(user_logged_in)
def log_user_login(sender, user, request, **kwargs):
    user.last_login = timezone.now()
    user.save()
