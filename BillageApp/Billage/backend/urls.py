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
    
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
]
