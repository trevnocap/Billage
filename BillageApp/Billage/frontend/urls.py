from django.urls import path
from .views import *

urlpatterns = [
    path('', login_view, name='login'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('dashboard/', dashboard_view, name='dashboard'),
    path('register/', register_view, name='register'),
    path('invite/<str:link_uuid>/', InviteView.as_view(), name='invite'),
]
