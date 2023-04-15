from django.contrib import admin
from .models import *

# Register your models here.

#Billage
admin.site.register(Billage)

#Bills
admin.site.register(LinkedBill)
admin.site.register(LinkedBillSplit)
admin.site.register(BillageBill)
admin.site.register(UserBillDetailsHistory)
admin.site.register(UserActiveBillDue)

#Payments
admin.site.register(UserPaymentMethod)
admin.site.register(UserBankAccount)
admin.site.register(UserCreditCard)
