from django.shortcuts import render
from userauths.models import Profile, User
from userauths.serializers import UserSerializer, MyTokenObtainPairSerializer, RegisterSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.http import JsonResponse
from .models import Profile
from .serializers import UserSerializer

def testEndPoint(request):
    return JsonResponse({'message': 'Test successful'})

class MytokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = ([AllowAny])
    serializer_class = RegisterSerializer

@api_view(['GET', 'POST'])
def getRoutes(request):
    routes = [
        '/api/token/',
        '/api/register/',
        '/api/token/refresh/'
    ]
    return Response(routes)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    if request.method == 'GET' :
        data = f"Congratulation {request.user}, your API just responded to GET request"
        return Response ( { 'response' : data } , status = status.HTTP_200_OK )
    elif request.method == 'POST' :
        text = "Hello buddy"
        data = f'Congratulation {request.user}, your API just responded to POST request with text: {text}'
        return Response ( { 'response' : data } , status = status.HTTP_200_OK )
    return Response ( { } , status.HTTP_400_BAD_REQUEST )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    data = {
        'username': user.username,
        'email': user.email,
        'full_name': user.profile.full_name,
        'bio': user.profile.bio,
        'mobile': user.profile.mobile,
        'user_type': user.profile.user_type,
        'image': request.build_absolute_uri(user.profile.image.url) if user.profile.image else None,
        'verified': user.profile.verified
    }
    return Response(data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    profile = request.user.profile
    
    if 'full_name' in request.data:
        profile.full_name = request.data['full_name']
    if 'bio' in request.data:
        profile.bio = request.data['bio']
    if 'mobile' in request.data:
        profile.mobile = request.data['mobile']
    if 'user_type' in request.data:
        profile.user_type = request.data['user_type']
    if 'image' in request.FILES:
        profile.image = request.FILES['image']
    
    profile.save()
    
    data = {
        'username': request.user.username,
        'email': request.user.email,
        'full_name': profile.full_name,
        'bio': profile.bio,
        'mobile': profile.mobile,
        'user_type': profile.user_type,
        'image': request.build_absolute_uri(profile.image.url) if profile.image else None,
        'verified': profile.verified
    }
    return Response(data)
