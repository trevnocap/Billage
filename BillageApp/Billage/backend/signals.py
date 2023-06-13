from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import *
from django.contrib.auth.models import User

#When a BillageBill is created a the corresponding useractivebills are also created
@receiver(post_save, sender=BillageBill)
def create_useractivebill(sender, instance, created, **kwargs):
    if created:
        bill_splits = LinkedBillSplit.objects.filter(bill_being_split= instance.linked_bill)
        for split in bill_splits:
            due_amount = split.split_percentage * instance.bill_due_amount
            user = split.user
            UserActiveBillDue.objects.create(
                linked_bill = instance.linked_bill,
                billage_bill = instance,
                user = user,
                due_amount=due_amount,
                bill_due_date = instance.bill_due_date,
                payment_method = split.payment_method
                )

#When a useractivebill status is changed for soemthing other than pending payment, the history object is created
@receiver(post_save, sender = UserActiveBillDue)
def handle_bill_status_change(sender, instance, **kwargs):
    if instance.bill_status != 'pending payment':
        bill_history = UserBillDetailsHistory(
            user = instance.user,
            linked_bill = instance.linked_bill,
            billage_bill = instance.billage_bill,
            payment_method = instance.payment_method,
            due_amount = instance.due_amount,
            bill_due_date = instance.bill_due_date,
            bill_status = instance.bill_status,
        )
        
        bill_history.save()
        instance.delete()
        
#If the status of an existing Billage bill is updated, the corresponding useractivebills are updated to the same status        
@receiver(post_save, sender = BillageBill)
def update_useractivebills_for_billagebill_status_change(sender, instance, created, **kwargs):
    if not created:
        userbills = UserActiveBillDue.objects.filter(billage_bill_id = instance.pk)
        
        if not userbills:
            return 'No user bills'
        
        for bill in userbills:
            bill.bill_status = instance.bill_status
            bill.save()


#If a Linked Bill is set to inactive, all useractivebills and billagebills are canceled
@receiver(post_save, sender = LinkedBill)
def update_active_bills_for_deleted_linkedbill(sender, instance, created, **kwargs):
    if not created:
        linked_bill = LinkedBill.objects.get(pk=instance.pk)
        
        if linked_bill.is_active == True:
            return
        
        UserActiveBillDue.objects.exclude(bill_status = 'paid').filter(linked_bill=linked_bill).update(bill_status = 'canceled')
        BillageBill.objects.exclude(bill_status = 'paid').filter(linked_bill=linked_bill).update(bill_status = 'canceled')
    
    



from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from django.utils import timezone

@receiver(user_logged_in)
def log_user_login(sender, user, request, **kwargs):
    user.last_login = timezone.now()
    user.save()
