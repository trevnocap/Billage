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
        
        
        #payment methods data
        payment_methods_data = payment_methods_fetch(user_id)
        
        #active bills data
        
        
        #bill history
     
        

        #response
        response_data = {}
        response_data.update(user_data)
        response_data.update(billage_data)
        response_data.update({"payment_methods": payment_methods_data})
        
        
        return Response(response_data)