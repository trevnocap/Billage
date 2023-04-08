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
        payment_methods_query = UserPaymentMethod.objects.filter(user=user)
        serializer = PaymentMethodsSerializer(payment_methods_query, many=True)
        payment_method_data = {"payment_methods": serializer.data}
            
        return payment_method_data



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
        
        ##User Bill Details to display
        max_bill_display_count = 7
        #active bills data
        active_bills_query = UserActiveBillDue.objects.filter(user = user_id)
        active_bills_to_display = active_bills_query.order_by('bill_due_date')[:max_bill_display_count]
        serializer = UserActiveBillDueSerializer(active_bills_to_display, many=True)
        active_bills_data = {"active_bills": serializer.data}
        
        #bill history
        bill_history_display_count = max_bill_display_count - active_bills_to_display.count()
        bill_history_query = UserBillDetailsHistory.objects.filter(user = user_id)
        bill_history_to_display = bill_history_query.order_by('date_closed')[:bill_history_display_count]
        serializer = UserBillDetailsHistorySerliazer(bill_history_to_display, many=True)
        bill_history_data = {"bill_history": serializer.data}
        

        #response
        response_data = {}
        response_data.update(user_data)
        response_data.update(billage_data)
        response_data.update(active_bills_data)
        response_data.update(bill_history_data)
        response_data.update(payment_methods_data)
        
        
        return Response(response_data)