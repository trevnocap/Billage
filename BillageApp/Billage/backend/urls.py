from django.urls import path
from django.urls import path, include
from .views import *

urlpatterns = [
    #path('login/', LoginView.as_view()),
    path('register/', RegisterView.as_view()),
    
    path('dashboardview/<str:user_id>', DashboardView.as_view()),
    path('create-billage/', CreateBillage.as_view(), name='create_billage'),
    path('join-billage/', JoinBillage.as_view(), name='join_billage'),
    path('create_shareable_link/<str:billage_id>/', CreateShareableLink.as_view(), name='create_shareable_link'),
    
    path('manage-billage/<str:billage_id>/', ManageBillageDashboardView.as_view(), name='manage-billage'),
    path('manage-billage/<str:billage_id>/remove-user/<str:user_id>/', RemoveUserFromBillageView.as_view(), name='remove_user_from_billage'),
    path('manage-billage/<str:billage_id>/promote-user/<str:user_id>/', PromoteUserToAdminView.as_view(), name='promote_user_to_admin'),
    path('manage-billage/change-name/<str:billage_id>/<str:new_name>', ChangeBillageNameView.as_view(), name='change_billage_name'),
    path('manage-billage/change-image/<str:billage_id>', ChangeBillageImageView.as_view(), name='change_billage_image'),
    
    path('view-user-bills/<str:user_id>/<int:display_count>/<int:page_number>', UserBillHistoryTableView.as_view(), name='user_bill_history'),
    
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
]
