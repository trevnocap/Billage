from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from rest_framework.authentication import TokenAuthentication

from django.contrib.auth import authenticate, login
from django.core.exceptions import ObjectDoesNotExist


from .serializers import *

#Reusable functions
def payment_methods_fetch(user_id):
        user = User.objects.get(id=user_id)
        payment_methods = UserPaymentMethod.objects.filter(user=user)
        bank_account_data = None
        cc_data = None
        for method in payment_methods:
            if method.payment_type == "bank_account":
                bank_account = UserBankAccount.objects.get(payment_method_id = method.payment_method_id)
                serializer = UserBankAccountSerializer(bank_account)
                bank_account_data = {"bank_account": serializer.data}
            else:
                cc = UserCreditCard.objects.get(payment_method_id = method.payment_method_id)
                serializer = UserCreditCardSerializer(cc)
                cc_data = {"credit_card": serializer.data}
        
        response_data = {}

        if bank_account_data is not None:
            response_data.update(bank_account_data)
        if cc_data is not None:
            response_data.update(cc_data)
        if not payment_methods:
            response_data.update({"bank_account": None, "credit_card": None})
            
        return response_data



# Create your views here.

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = [TokenAuthentication]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            user = authenticate(username=serializer.validated_data['username'], password=serializer.validated_data['password'])
            
            if user is not None:
                login(request, user)
                token, created = Token.objects.get_or_create(user=user)
                return Response({'success': True, 'token': token.key, 'id': user.id})
            else:
                return Response({'success': False, 'error': 'Invalid username or password.'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({'success': False, 'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        

class RegisterView(APIView):
    permission_classes= [permissions.AllowAny]
    
    def post(self, request):
        serializer = RegisterUserSerializer(data=request.data)
        
        if serializer.is_valid():
            user = User.objects.create_user(**serializer.validated_data)
            return Response(serializer.validated_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
 
##View still needs work. Currently you can update any userid's data from any user_id endpoint   
class PaymentMethodsView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, user_id):
        payment_method_data = payment_methods_fetch(user_id)
        return Response(payment_method_data)
        
    
    """def post(self, request, user_id):
        user = User.objects.get(id=user_id)
        payment_method_type = request.data.get("payment_method_type")
        
        if payment_method_type == "bank_account":
            serializer = UserBankAccountSerializer(data=request.data)
            
            if serializer.is_valid():
                serializer.save(userid = user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        elif payment_method_type == "credit_card":
            serializer = UserCreditCardSerializer(data=request.data)
            
            if serializer.is_valid():
                serializer.save(userid = user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        else:
            return Response({"error": "payment_method_type is invalid. Please user either bank_account or credit_card"}, status=status.HTTP_400_BAD_REQUEST)
        
    def put(self, request, user_id):
        user = User.objects.get(id=user_id)
        payment_method_type = request.data.get('payment_method_type')
        
        if payment_method_type == 'bank_account':
            bank_account_data = request.data.get('bank_account')
            bank_account, created = UserBankAccount.objects.get_or_create(userid=user)
            serializer = UserBankAccountSerializer(bank_account, data=bank_account_data)
            
        elif payment_method_type == 'credit_card':
            credit_card_data = request.data.get('credit_card')
            credit_card, created = UserCreditCard.objects.get_or_create(userid=user)
            serializer = UserCreditCardSerializer(credit_card, data=credit_card_data)
            
        else:
            return Response({"error": "payment_method_type is invalid. Please user either bank_account or credit_card"}, status=status.HTTP_400_BAD_REQUEST)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, user_id):
        user = User.objects.get(id=user_id)
        payment_method_type = request.data.get('payment_method_type')
        
        if payment_method_type == "bank_account":
            try:
                bank_account = UserCreditCard.objects.get(userid = user_id)
            except ObjectDoesNotExist:
                return Response({"message": "credit card not found"}, status=status.HTTP_404_NOT_FOUND)
            
            if bank_account is not None:
                bank_account.delete()
                return Response({"message": "bank account deleted"}, status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({"message": "bank account npt found"}, status=status.HTTP_404_NOT_FOUND)
            
        elif payment_method_type == "credit_card":
            try:
                cc = UserCreditCard.objects.get(userid = user_id)
            except ObjectDoesNotExist:
                return Response({"message": "credit card not found"}, status=status.HTTP_404_NOT_FOUND)
                
            if cc is not None:
                cc.delete()
                return Response({"message": "credit card deleted"}, status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({"message": "credit card not found"}, status=status.HTTP_404_NOT_FOUND)
            
        else:
            return Response({"error": "payment_method_type is invalid. Please user either bank_account or credit_card"}, status=status.HTTP_400_BAD_REQUEST)"""
        
class DashboardView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, user_id):
        #user data
        user = User.objects.get(id=user_id)
        serializer = UserSerializer(user)
        user_data = {"user": serializer.data}
        
        #billage data
        billages = Billage.objects.filter(billage_members__in=[user.id])
        serializer = BillageSerializer(billages, many=True)
        billage_data = {"billages": serializer.data}
        
        #linked bills
        linked_bills_by_billage = {}
        for billage in billages:
            linked_bills = LinkedBill.objects.filter(billage_link = billage)
            serializer = LinkedBillSerializer(linked_bills, many=True)
            linked_bills_by_billage[billage.billage_id] = serializer.data
        
        #payment methods data
        payment_methods_data = payment_methods_fetch(user_id)
        
        #active bills data
        ## need to limit this to at most 8 active bills
        active_bills_by_billage = {}
        active_bills_list = []
        for billage in billages:
            linked_bills = LinkedBill.objects.filter(billage_link = billage)
            active_bill_query = BillageBillActiveBill.objects.filter(linked_bill__in = linked_bills)
            active_bills = active_bill_query.order_by("bill_due_date")
            active_bills_list += active_bill_query
            serializer = BillageBillActiveBillSerializer(active_bills, many=True)
            active_bills_by_billage[billage.billage_id] = serializer.data
        
        
        active_bill_count = len(active_bills_list)  
        
        #bill history
        #improve handling of active bill count >= display max
        dashboard_bill_display_count = 8
        bill_history_by_billage = {}
        
        if active_bill_count >= dashboard_bill_display_count:
            bill_history_by_billage = None
            
        if active_bill_count < dashboard_bill_display_count:
            for billage in billages:
                bill_history = UserBillDetailsHistory.objects.filter(userid= user_id).order_by('-due_date')[:dashboard_bill_display_count-active_bill_count]
                serializer = UserBillDetailsHistorySerliazer(bill_history, many=True)
                bill_history_by_billage[billage.billage_id] = serializer.data
        

        #response
        response_data = {}
        response_data.update(user_data)
        response_data.update(billage_data)
        response_data.update({"linked_bills_by_billage": linked_bills_by_billage})
        response_data.update({"payment_methods": payment_methods_data})
        response_data.update({"active_bills_by_billage": active_bills_by_billage})
        response_data.update({"bill_history_by_billage": bill_history_by_billage})
        
        
        return Response(response_data)