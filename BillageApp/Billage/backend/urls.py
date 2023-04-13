from django.urls import path
from django.urls import path, include
from .views import *

urlpatterns = [
    #path('login/', LoginView.as_view()),
    path('register/', RegisterView.as_view()),
    path('dashboardview/<str:user_id>', DashboardView.as_view()),
    path('create-join-billage/', CreateJoinBillage.as_view()),
    path('create_shareable_link/<str:billage_id>/', CreateShareableLink.as_view(), name='create_shareable_link'),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
]