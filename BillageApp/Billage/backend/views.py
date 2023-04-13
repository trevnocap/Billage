from datetime import timedelta
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from .serializers import *

#Reusable functions
def payment_methods_fetch(user_id):
        user = User.objects.get(id=user_id)
        payment_methods_query = UserPaymentMethod.objects.filter(user=user)
        serializer = PaymentMethodsSerializer(payment_methods_query, many=True)
        payment_method_data = {"payment_methods": serializer.data}
            
        return payment_method_data



### Page View APIs
    
        
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
    
    
    
    ### Functionality APIs


    """
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
            return Response({'success': False, 'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)"""
        

class RegisterView(APIView):
    permission_classes= [permissions.AllowAny]
    
    def post(self, request):
        serializer = RegisterUserSerializer(data=request.data)
        
        if serializer.is_valid():
            user = User.objects.create_user(**serializer.validated_data)
            return Response(serializer.validated_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class CreateBillage(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = CreateBillageSerializer(data=request.data)

        if serializer.is_valid():
            # Create Billage object
            billage = Billage.objects.create(
                billage_name=serializer.validated_data['billage_name'],
            )

            # Add users to billage_members field
            for user in serializer.validated_data['billage_members']:
                billage.billage_members.add(user)

            billage.save()

            # Serialize the created Billage instance
            serializer = CreateBillageSerializer(billage)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
class JoinBillage(APIView):
    permission_classes = [permissions.AllowAny]

    def put(self, request):
        serializer = JoinBillageSerializer(data=request.data)

        if serializer.is_valid():
            user_id = serializer.validated_data['user_id']

            try:
                if 'link_uuid' in serializer.validated_data:
                    link_uuid = serializer.validated_data['link_uuid']
                    link = ShareableLink.objects.get(uuid=link_uuid)
                    if link.expires_at < timezone.now():
                        link.delete()
                        return Response({'detail': 'Link has expired.'}, status=status.HTTP_410_GONE)

                    billage = link.billage
                elif 'billage_id' in serializer.validated_data:
                    billage_id = serializer.validated_data['billage_id']
                    billage = Billage.objects.get(pk=billage_id)

                user = User.objects.get(pk=user_id)

                for member in billage.billage_members.all():
                    if member.id == user.id:
                        return Response({"message": "User already is in the Billage"}, status=status.HTTP_400_BAD_REQUEST)

                billage.billage_members.add(user)
                billage.save()

                return Response({"message": "User successfully joined the Billage"}, status=status.HTTP_200_OK)

            except ShareableLink.DoesNotExist:
                return Response({"error": "Invalid link."}, status=status.HTTP_404_NOT_FOUND)
            except Billage.DoesNotExist:
                return Response({"error": "Billage not found"}, status=status.HTTP_404_NOT_FOUND)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.permissions import IsAuthenticated
from .serializers import ShareableLinkSerializer

class CreateShareableLink(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, billage_id):
        billage = Billage.objects.get(pk=billage_id)

        if request.user not in billage.billage_members.all():
            return Response({'detail': 'You are not a member of this Billage.'}, status=status.HTTP_403_FORBIDDEN)

        link = ShareableLink(billage=billage, expires_at=timezone.now() + timedelta(hours=1))
        link.save()
        serializer = ShareableLinkSerializer(link)

        # Update the serialized data with the full link using hardcoded base URL
        serialized_data = serializer.data
        serialized_data['shareable_link'] = f"http://127.0.0.1:8000/invite/{link.uuid}/"

        return Response(serialized_data)

