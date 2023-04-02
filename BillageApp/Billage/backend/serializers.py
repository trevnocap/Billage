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
        fields = ['username', 'first_name', 'last_name', 'email']
        
        
        
### DASHBOARD SERIALIZERS

#Payment Method Serializers
class UserBankAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserBankAccount
        fields = ("bankaccount_id", "bank_routing_number", "bank_account_number",)

class UserCreditCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCreditCard
        fields = ("card_id", "card_number",)


class PaymentMethodsSerializer(serializers.ModelSerializer):
    bank_account = UserBankAccountSerializer(source='userbankaccount')
    credit_card = UserCreditCardSerializer(source='usercreditcard')

    class Meta:
        model = UserPaymentMethod
        fields = '__all__'

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
        
class UserBillDetailsHistorySerliazer(serializers.ModelSerializer):
    class Meta:
        model = UserBillDetailsHistory
        exclude = ('userid', 'id',)
