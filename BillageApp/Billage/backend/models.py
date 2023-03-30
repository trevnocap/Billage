#Notes: Need a model that stores historical splits on the BillageBillDetails model. Right now the model is keyed to the linkedBill model which keys to the split model.
        #If the split model is ever changed, all the historical BillBillDetails Objects will link to incorrect splits
        
import random, string, uuid

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator, MinLengthValidator, MaxLengthValidator


def create_billage_id():
    while True:
        billage_id = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        if not Billage.objects.filter(billage_id=billage_id).exists():
            billage_id = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        
            return billage_id
        
# Create your models here
                    
#Billage Group Models

#Defines a billage group and its members in which bills can be linked to
class Billage(models.Model):
    billage_id = models.CharField(primary_key=True, max_length = 8, default=create_billage_id, editable=False)
    billage_image = models.ImageField(default="villageicon.png")
    billage_members = models.ManyToManyField(User)
    billage_name = models.CharField(max_length=50, null=False)
    date_created = models.DateTimeField(auto_now_add=True, null=True)
    
    def __str__(self):
        return self.billage_name
    

#Payment Models    
    
#Defines the users payment method basic details and is used to link payment methods to bills            
class UserPaymentMethod(models.Model):
    PAYMENT_TYPES = (
        ('bank_account','bank_account'),
        ('credit_card','credit_card'),
    )
    payment_method_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user =  models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=20)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPES)
    
    def __str__(self):
        return f"{self.user.username} - {self.payment_type}"
 
 
 #Stores bank account details   
 #replace with stripe later, just for development   
class UserBankAccount(models.Model):
    bankaccount_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment_method_id = models.OneToOneField(UserPaymentMethod, on_delete=models.CASCADE)
    account_owner_firstname = models.CharField(max_length=25, null=False, blank=False)
    account_owner_lastname = models.CharField(max_length=50, null=False, blank=False)
    bank_routing_number = models.CharField(max_length= 9, validators=[
        MinLengthValidator(9),
        RegexValidator(r'^\d+$', 'Only numbers are allowed'),
    ])
    bank_account_number = models.CharField(max_length=17 ,validators=[
        MinLengthValidator(6),
        RegexValidator(r'^\d+$', 'Only numbers are allowed'),
    ])
    date_created = models.DateField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.account_owner_firstname} - {self.bank_account_number[-4:]}"
    
  
#Stores credit card details    
#replace with stripe later, just for development
class UserCreditCard(models.Model):
    card_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment_method_id = models.OneToOneField(UserPaymentMethod, on_delete=models.CASCADE)
    account_owner_firstname = models.CharField(max_length=25, null=False, blank=False)
    account_owner_lastname = models.CharField(max_length=50, null=False, blank=False)
    card_number = models.CharField(max_length=16, validators=[
        MinLengthValidator(15),
        RegexValidator(r'^\d+$', 'Only numbers are allowed'),
    ])
    exp_date = models.CharField(max_length=5, validators=[
        RegexValidator(r'^\d{2}/\d{2}$', 'Date must be formatted as MM/YY')
    ])
    cvv = models.CharField(max_length=4 ,null=False, blank=False, validators=[
        MinLengthValidator(3),
        RegexValidator(r'^\d+$', 'Only numbers are allowed'),
    ])
    date_created = models.DateField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.account_owner_firstname} - {self.card_number[-4:]}"


#Bill Models
    
#Defines a bill linked to a billage and the basic details of the bill    
class LinkedBill(models.Model):
    BILL_TYPES = (
        ('Electric', 'Electric'),
        ('Rent', 'Rent'),
        ('Gas', 'Gas'),
        ('Water', 'Water'),
        ('Television', 'Television'),
        ('Internet', 'Internet'),
        )
    
    linked_bill_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    billage_link = models.ForeignKey(Billage, on_delete=models.CASCADE)
    bill_type = models.CharField(max_length=50, choices=BILL_TYPES, null=False, blank=False)
    bill_provider_name = models.CharField(max_length=100, null=False, blank=False)
    
    date_created = models.DateField(auto_now_add=True, null=True)
    
    def __str__(self):
        return f"{self.billage_link.billage_name} - {self.bill_provider_name}"
    

#Defines a linked bill in the active billing cycle     
class BillageBillActiveBill(models.Model):
    bill_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    linked_bill = models.ForeignKey(LinkedBill, on_delete=models.CASCADE)
    bill_due_amount = models.DecimalField(max_digits = 7, decimal_places = 2, default=0)
    bill_due_date = models.DateField(auto_now=False)
    date_created = models.DateField(auto_now_add=True)
    
    def __str__(self):
     return f"{self.linked_bill.billage_link.billage_name} - {self.linked_bill.bill_provider_name}"
    
    
#Defines how a user will pay for a linked bill and what percentage they will pay    
class LinkedBillSplit(models.Model):
    linked_bill_split_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    bill_being_split = models.ForeignKey(LinkedBill, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    split_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, validators=[MinValueValidator(0.0), MaxValueValidator(1.0)])
    payment_method = models.ForeignKey(UserPaymentMethod, on_delete=models.CASCADE)
    date_created = models.DateField(auto_now_add=True, null=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.bill_being_split.billage_link.billage_name} - {self.bill_being_split.bill_provider_name}"
    
    
#Shows user level history of bills which have been paid
class UserBillDetailsHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    userid = models.ForeignKey(User, on_delete=models.CASCADE)
    bill_id = models.ForeignKey(LinkedBill, on_delete=models.CASCADE)
    payment_method = models.ForeignKey(UserPaymentMethod, on_delete=models.CASCADE)
    split_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, 
        validators=[
        MinValueValidator(0.0), 
        MaxValueValidator(1.0)
        ])
    amount_paid = models.DecimalField(max_digits = 7, decimal_places = 2, default=0)
    due_date = models.DateField()
    paid_date = models.DateField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.userid.username} - {self.bill_id.billage_link.billage_name} - {self.bill_id.bill_provider_name} - {self.due_date}"