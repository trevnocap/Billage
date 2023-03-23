from django.urls import path
from .views import *

urlpatterns = [
    path('login/', LoginView.as_view()),
    path('register/', RegisterView.as_view()),
    path('paymentmethods/<str:user_id>', PaymentMethodsView.as_view()),
    path('dashboardview/<str:user_id>', DashboardView.as_view()),
]