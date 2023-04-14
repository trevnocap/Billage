from django.shortcuts import render
from django.contrib.auth.models import User

# Create your views here.
from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse, HttpResponse

# Create your views here.

def dashboard_view(request):
    return render(request, 'frontend/dashboard.html')

def login_view(request):
    return render(request, 'frontend/login.html')

def logout_view(request):
    logout(request)
    return HttpResponse('logged out')

def register_view(request):
    return render(request, 'frontend/register.html')

def manage_billage_view(request):
    return render(request, 'frontend/manage-billage.html')

from django.views import View

class InviteView(View):
    def get(self, request, link_uuid):
        return render(request, 'frontend/invite.html', {'link_uuid': link_uuid})
