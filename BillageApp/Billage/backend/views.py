from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny

from django.core.paginator import Paginator

from .serializers import *

#Reusable functions
def payment_methods_fetch(user_id):
        user = User.objects.get(id=user_id)
        payment_methods_query = UserPaymentMethod.objects.filter(user=user)
        serializer = PaymentMethodsSerializer(payment_methods_query, many=True)
        payment_method_data = {"payment_methods": serializer.data}
            
        return payment_method_data

def user_active_bills_fetch(user_id, bill_count):
    active_bills_query = UserActiveBillDue.objects.filter(user = user_id, bill_status = 'pending payment')
    bills_to_return = active_bills_query.order_by('bill_due_date')[:bill_count]
    
    return bills_to_return

def user_historical_bills_fetch(user_id, bill_count):
    historical_bills_query = UserBillDetailsHistory.objects.filter(user = user_id)
    bills_to_return = historical_bills_query.order_by('bill_due_date')[:bill_count]
    
    return bills_to_return

def user_bills_fetch(user_id):
    active_bills_query = UserActiveBillDue.objects.filter(user = user_id)
    historical_bills_query = UserBillDetailsHistory.objects.filter(user = user_id)
    
    bills_list = list(active_bills_query) + list(historical_bills_query)
    ordered_list = sorted(bills_list, key=lambda x: x.bill_due_date, reverse=True)
    
    return ordered_list

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
        serializer = UserActiveBillDueSerializer(user_active_bills_fetch(user_id, max_bill_display_count), many=True)
        active_bills_data = {"active_bills": serializer.data}


        #response
        response_data = {}
        response_data.update(user_data)
        response_data.update(billage_data)
        response_data.update(active_bills_data)
        response_data.update(payment_methods_data)
        
        
        return Response(response_data)
    
    
class ManageBillageDashboardView(APIView):
    permission_classes = (IsAuthenticated,)
    
    def get(self, request, billage_id):
        try:
            billage = Billage.objects.get(pk=billage_id)  
        except:
             return Response({'detail': 'This Billage ID does not exist.'}, status=status.HTTP_404_NOT_FOUND)
        
        if request.user not in billage.billage_members.all():
            return Response({'detail': 'You are not a member of this Billage.'}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = ManageViewBillageSerializer(billage)
        billage_data = {'billage': serializer.data}
        
        
        #linked Bills
        linked_bills = LinkedBill.objects.filter(billage_link = billage_id, is_active = True)
        serializer = ManageViewLinkedBillSerializer(linked_bills, many= True)
        linked_bill_data = {'linked_bills': serializer.data}
        
        #billage bills
        max_bill_display_count = 10
        billage_bills_query = BillageBill.objects.filter(linked_bill__billage_link = billage_id)
        billage_bills_to_display = billage_bills_query.order_by('-bill_due_date')[:max_bill_display_count]
        serializer = ManageViewBillageBillSerializer(billage_bills_to_display, many=True)
        billage_bill_data = {'billage_bills': serializer.data}
        
        #User Payment Method
        payment_methods_data = payment_methods_fetch(request.user.id)
        
        #response
        response_data = {}
        response_data.update(billage_data)
        response_data.update(linked_bill_data)
        response_data.update(billage_bill_data)
        response_data.update(payment_methods_data)
        
        
        
        return Response(response_data)
        
        
class UserBillHistoryTableView(APIView):
    permission_classes= [permissions.AllowAny]
    
    def get(self, request, display_count, page_number):
        user = request.user.id
        bills = user_bills_fetch(user)
        
        paginator = Paginator(bills, display_count)
    
        page = paginator.page(page_number)
        
        serializer = ViewUserBillsSerializer(page, many=True, context={'user': request.user})
        bills_data = {'user_bills': serializer.data}
        
        response_data = {}
        response_data.update(bills_data)
        response_data['total_pages'] = paginator.num_pages

        return Response(response_data)
        
    
    ### Functionality API
        
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

            for user in serializer.validated_data['billage_admins']:
                billage.billage_admins.add(user)
                
            billage.save()
            # Serialize the created Billage instance
            serializer = CreateBillageSerializer(billage)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from django.shortcuts import get_object_or_404

class RemoveUserFromBillageView(APIView):
    permission_classes = (IsAuthenticated,)
    
    def post(self, request, billage_id, user_id, format=None):
        billage = get_object_or_404(Billage, billage_id=billage_id)
        user_to_remove = get_object_or_404(User, id=user_id)

        if user_to_remove in billage.billage_members.all():
            billage.billage_members.remove(user_to_remove)
            
            if not billage.check_and_delete_if_empty():
                # Save the Billage instance
                billage.save()
                if user_to_remove in billage.get_admins():
                    billage.billage_admins.remove(user_to_remove)
                
                if billage.get_admins() is None:
                    new_admin = billage.billage_members.first()
                    
                    billage.billage_admins.add(new_admin)
                    billage.save()
            # Return a success response
            return Response({"detail": "User removed from Billage."}, status=status.HTTP_200_OK)
        else:
            # Return an error response if the user is not in the Billage
            return Response({"detail": "User is not a member of the Billage."}, status=status.HTTP_404_NOT_FOUND)

class PromoteUserToAdminView(APIView):
    permission_classes = (IsAuthenticated,)
    
    def post(self, request, billage_id, user_id, format=None):
        billage = get_object_or_404(Billage, billage_id=billage_id)
        user_to_promote = get_object_or_404(User, id=user_id)
        if user_to_promote not in billage.billage_members.all():
            return Response({"detail": "User is not a member of the Billage."}, status=status.HTTP_404_NOT_FOUND)

        if user_to_promote not in billage.billage_admins.all():
            billage.billage_admins.add(user_to_promote)
            billage.save()
            return Response({"detail": "User successfully promoted to admin."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "User is already an admin of the Billage."}, status=status.HTTP_400_BAD_REQUEST)
        
        
class ChangeBillageNameView(APIView):
    permission_classes = (IsAuthenticated,)
    
    def put(self, request, billage_id, new_name):
        billage = get_object_or_404(Billage, billage_id=billage_id)
        user = request.user
        
        if user not in billage.billage_members.all():
             return Response({"detail": "User is not a member of the Billage."}, status=status.HTTP_401_UNAUTHORIZED)
        billage.billage_name = new_name
        billage.save()
        return Response({"detail": f"Billage name was changed to {new_name}"})
    
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
import os

class ChangeBillageImageView(APIView):
    permission_classes = (IsAuthenticated,)

    def put(self, request, billage_id):
        billage = get_object_or_404(Billage, billage_id=billage_id)
        old_image = billage.billage_image
        user = request.user

        if user not in billage.billage_members.all():
            return Response({"detail": "User is not a member of the Billage."}, status=status.HTTP_401_UNAUTHORIZED)

        if 'billage_image' in request.FILES:
            new_image = request.FILES['billage_image']
            folder_path = 'billageimages/'

            # Save the image to the static files directory
            file_path = default_storage.save(folder_path + f'{billage_id}{new_image.name}', ContentFile(new_image.read()))

            billage.billage_image = file_path
            billage.save()
            
        if old_image != new_image and old_image != 'billageimages/villageicon.png':
            default_storage.delete(old_image.path)

            return Response({"detail": f"Billage image was changed to {file_path}"})
        else:
            return Response({"detail": "No image file provided."}, status=status.HTTP_400_BAD_REQUEST)



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
    
class AddLinkedBill(APIView):
    #permission_classes = (IsAuthenticated, IsAdminUser,)
    permission_classes = (AllowAny,)
    
    def post(self, request, billage_id):
        try:
            billage = get_object_or_404(Billage, pk= billage_id)
        except:
            return Response({'detail': f'Billage: {billage_id} not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = LinkedBillSerializer(data=request.data)
    
        # if request.user not in billage.billage_members.all():
        #     return Response({'detail': 'You are not a member of this Billage.'}, status=status.HTTP_403_FORBIDDEN)
        if not serializer.is_valid():
            return Response({'detail': 'Invalid Request, review supported bill_types and bill_provider_name validations'}, status=status.HTTP_400_BAD_REQUEST)
        
        
        if 'linked_bill' not in serializer.validated_data:
            linked_bill = LinkedBill.objects.create(
                    billage_link = serializer.validated_data['billage_link'],
                    bill_type = serializer.validated_data['bill_type'],
                    bill_provider_name = serializer.validated_data['bill_provider_name'],
                    is_active = True
            )
            linked_bill.save()
            bill_json = LinkedBillSerializer(linked_bill)
            
            return Response({"created":bill_json.data}, status= status.HTTP_201_CREATED)
            
        linked_bill = LinkedBill.objects.create(
                linked_bill = serializer.validated_data['linked_bill'],
                billage_link = serializer.validated_data['billage_link'],
                bill_type = serializer.validated_data['bill_type'],
                bill_provider_name = serializer.validated_data['bill_provider_name'],
                is_active = True
        )
            
        linked_bill.save()
        bill_json = LinkedBillSerializer(linked_bill)
        
        return Response({"created":bill_json.data}, status= status.HTTP_201_CREATED)

class RemoveLinkedBill(APIView):
    permission_classes = (IsAuthenticated, IsAdminUser,)
    
    def post(self, request, billage_id):
        try:
            billage = get_object_or_404(Billage, pk= billage_id)
        except:
            return Response({'detail': f'Billage: {billage_id} not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if request.user not in billage.billage_members.all():
            return Response({'detail': 'You are not a member of this Billage and cannot modify linked bills.'}, status=status.HTTP_403_FORBIDDEN)
        
        linked_bill_to_remove = request.data['linked_bill']
        
        try:
            linked_bill = LinkedBill.objects.get(pk = linked_bill_to_remove)
            linked_bill.is_active = False
            linked_bill.save()
            return Response({"removed":linked_bill_to_remove}, status= status.HTTP_200_OK)
        except:
            return Response({'detail': f'Linked Bill: {linked_bill_to_remove} not found'}, status=status.HTTP_404_NOT_FOUND)
        

class UserPaymentMethods(APIView):
    #permission_classes = (IsAuthenticated, IsAdminUser,)
    permission_classes = (AllowAny,)
    
    def get(self, request, user_id):
        try:
            user = get_object_or_404(User, pk=user_id)
        except:
            return Response({'detail': f'User: {user_id} not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if request.user.id != user_id:
            return Response({'detail': f'You cannot view the requested users payment methods'}, status=status.HTTP_403_FORBIDDEN)
        
        return Response(payment_methods_fetch(user_id), status=status.HTTP_200_OK)

    