from rest_framework import serializers

from django.contrib.auth.models import User
from .models import *


###User Auth Serializers

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
class RegisterUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    username = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'password']
        
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']
        
        
        
### DASHBOARD SERIALIZERS

#Payment Method Serializers
class PaymentMethodsSerializer(serializers.ModelSerializer):
    payment_details = serializers.SerializerMethodField()
    
    class Meta:
        model = UserPaymentMethod
        exclude = ('user', 'payment_method_id',)
        
    def get_payment_details(self, obj):
        if obj.payment_type == 'bank_account':
            bank_account = UserBankAccount.objects.get(payment_method_id=obj)
            return bank_account.bank_account_number[-4:]
        elif obj.payment_type == 'credit_card':
            credit_card = UserCreditCard.objects.get(payment_method_id=obj)
            return credit_card.card_number[-4:]
        else:
            return None
        
#Billage Serializers  
class BillageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Billage
        exclude = ('date_created',)
        
        
#Bill Serializers
class BillageBillSerializer(serializers.ModelSerializer):
    class Meta:
        model = BillageBill
        exclude = ('date_created',)

class LinkedBillSerializer(serializers.ModelSerializer):
    class Meta:
        model = LinkedBill
        exclude = ('date_created',)
        
class UserActiveBillDueSerializer(serializers.ModelSerializer):
    billage = serializers.CharField(source = "linked_bill.billage_link.billage_name")
    bill_provider_name = serializers.CharField(source = 'linked_bill.bill_provider_name')
    bill_type = serializers.CharField(source = 'linked_bill.bill_type')
    payment_method_name = serializers.CharField(source = "payment_method.name")
    payment_method_type = serializers.CharField(source = "payment_method.payment_type")
    
    
    class Meta:
        model = UserActiveBillDue
        exclude = ('id', 'user', 'active_bill', 'linked_bill', "payment_method",)
        
        
class UserBillDetailsHistorySerliazer(serializers.ModelSerializer):
    billage = serializers.CharField(source = "linked_bill.billage_link.billage_name")
    bill_provider_name = serializers.CharField(source = 'linked_bill.bill_provider_name')
    payment_method_name = serializers.CharField(source = "payment_method.name")
    payment_method_type = serializers.CharField(source = "payment_method.payment_type")
    
    class Meta:
        model = UserBillDetailsHistory
        exclude = ('id', 'user', 'linked_bill', "payment_method",)


### Billage Serializer
class CreateBillageSerializer(serializers.ModelSerializer):
    billage_members = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), many=True)
    
    class Meta:
        model = Billage
        exclude = ('date_created', 'billage_image',)

class JoinBillageSerializer(serializers.Serializer):
    link_uuid = serializers.UUIDField(required=False)
    billage_id = serializers.CharField(required=False)
    user_id = serializers.IntegerField()

    def validate(self, data):
        if 'link_uuid' not in data and 'billage_id' not in data:
            raise serializers.ValidationError("Either link_uuid or billage_id must be provided.")
        return data
    
from .models import ShareableLink

class ShareableLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShareableLink
        fields = ('billage', 'uuid', 'expires_at')

#manage billage serializers

class ManageViewBillageSerializer(serializers.ModelSerializer):
    billage_members = UserSerializer(many=True)
    
    class Meta:
        model = Billage
        fields = '__all__'
        
class ManageViewLinkedBillSerializer(LinkedBillSerializer):
    class Meta(LinkedBillSerializer.Meta):
        exclude = ('date_created', 'billage_link',)
        
class ManageViewBillageBillSerializer(BillageBillSerializer):
    linked_bill = serializers.CharField(source = 'linked_bill.bill_provider_name')
    bill_type = serializers.CharField(source = 'linked_bill.bill_type')
    
    class Meta(BillageBillSerializer.Meta):
        exclude = ('date_created',)
        