from django.shortcuts import render
from userauths.models import Profile, User
from userauths.serializers import UserSerializer, MyTokenObtainPairSerializer, RegisterSerializer
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics, status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.http import JsonResponse
from .models import Profile, SupportRequest, ChatMessage
from .serializers import UserSerializer, SupportRequestSerializer, SupportRequestReplySerializer, SupportTicketSerializer, SupportTicketListSerializer, ChatMessageSerializer
from django.db import models

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
    if request.method == 'GET':
        data = f"Welcome to admin dashboard, {request.user}"
        return Response({'response': data}, status=status.HTTP_200_OK)
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

class SupportRequestViewSet(viewsets.ModelViewSet):
    serializer_class = SupportRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return SupportRequest.objects.all()
        return SupportRequest.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
            user_email=self.request.user.email
        )

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def reply(self, request, pk=None):
        support_request = self.get_object()
        serializer = SupportRequestReplySerializer(data=request.data)
        
        if serializer.is_valid():
            support_request.admin_reply = serializer.validated_data['message']
            support_request.status = 'resolved'
            support_request.save()
            return Response(SupportRequestSerializer(support_request).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_support_ticket(request):
    try:
        # Получаем данные из запроса
        data = {
            'subject': request.data.get('subject'),
            'message': request.data.get('message'),
            'order_number': request.data.get('order_number'),
        }

        # Если пользователь авторизован, используем его данные
        if request.user.is_authenticated:
            data['user'] = request.user
            data['user_email'] = request.user.email
        else:
            # Для неавторизованных пользователей берем email из формы
            data['user_email'] = request.data.get('email')

        # Создаем запрос в поддержку
        support_request = SupportRequest.objects.create(
            subject=data['subject'],
            message=data['message'],
            user_email=data['user_email'],
            order_number=data['order_number'] if data['order_number'] else None,
            user=data.get('user', None)  # Пользователь может быть None для неавторизованных
        )

        # Сериализуем ответ
        serializer = SupportTicketSerializer(support_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        print(f"Error creating support ticket: {str(e)}")  # Добавляем логирование ошибки
        return Response(
            {'error': 'Failed to create support ticket', 'detail': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_tickets(request):
    """
    Получение тикетов текущего пользователя
    """
    if request.user.is_staff:
        # Если админ, показываем все тикеты
        tickets = SupportRequest.objects.all().order_by('-created_at')
    else:
        # Если обычный пользователь, показываем только его тикеты
        tickets = SupportRequest.objects.filter(user=request.user).order_by('-created_at')
    
    serializer = SupportTicketSerializer(tickets, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ticket_detail(request, ticket_id):
    try:
        ticket = SupportRequest.objects.get(id=ticket_id, user=request.user)
        serializer = SupportTicketSerializer(ticket)
        return Response(serializer.data)
    except SupportRequest.DoesNotExist:
        return Response(
            {'error': 'Ticket not found'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def user_list(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def support_tickets_list(request):
    """
    Получение всех тикетов поддержки (только для админов)
    """
    tickets = SupportRequest.objects.all().order_by('-created_at')
    serializer = SupportRequestSerializer(tickets, many=True)
    print("Returning tickets:", serializer.data)  # Добавим для отладки
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def reply_to_ticket(request, ticket_id):
    try:
        ticket = SupportRequest.objects.get(id=ticket_id)
        ticket.admin_reply = request.data.get('message')
        ticket.status = 'resolved'
        ticket.save()
        serializer = SupportRequestSerializer(ticket)
        return Response(serializer.data)
    except SupportRequest.DoesNotExist:
        return Response({'error': 'Ticket not found'}, status=404)

class ChatMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ChatMessageSerializer
    
    def get_queryset(self):
        user = self.request.user
        return ChatMessage.objects.filter(
            models.Q(sender=user) | models.Q(receiver=user)
        ).order_by('created_at')

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    @action(detail=False, methods=['GET'])
    def unread_count(self, request):
        count = ChatMessage.objects.filter(
            receiver=request.user,
            is_read=False
        ).count()
        return Response({'unread_count': count})

    @action(detail=False, methods=['POST'])
    def mark_as_read(self, request):
        ChatMessage.objects.filter(
            receiver=request.user,
            is_read=False
        ).update(is_read=True)
        return Response({'status': 'messages marked as read'})

    @action(detail=False, methods=['GET'])
    def admin_chat(self, request):
        admin = User.objects.filter(is_superuser=True).first()
        if not admin:
            return Response(
                {'error': 'No admin found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        messages = ChatMessage.objects.filter(
            (models.Q(sender=request.user) & models.Q(receiver=admin)) |
            (models.Q(sender=admin) & models.Q(receiver=request.user))
        ).order_by('created_at')
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def messages(self, request, user_id=None):
        """
        Получение сообщений чата с конкретным пользователем
        """
        try:
            other_user = User.objects.get(id=user_id)
            messages = ChatMessage.objects.filter(
                (models.Q(sender=request.user) & models.Q(receiver=other_user)) |
                (models.Q(sender=other_user) & models.Q(receiver=request.user))
            ).order_by('created_at')
            serializer = self.get_serializer(messages, many=True)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
