from userauths.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from store.models import Order  # Add this import
from userauths.models import SupportRequest  # Add this import
from .models import ChatMessage

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_active', 'is_staff']

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['full_name'] = user.profile.full_name
        token['username'] = user.username
        token['email'] = user.email
        token['bio'] = user.profile.bio
        token['mobile'] = user.profile.mobile
        token['user_type'] = user.profile.user_type
        token['image'] = str(user.profile.image)
        token['verified'] = user.profile.verified
        token['is_staff'] = user.is_staff
        token['is_superuser'] = user.is_superuser
        token['user_id'] = user.id

        return token

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField( write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField( write_only=True, required=True)

    class Meta:
        model = User
        fields = [ 'email', 'username','password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Password fields does noy match"}
            )
        return attrs
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class PayPalOrderSerializer(serializers.ModelSerializer):
    order_items = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = ['id', 'total', 'order_status', 'payment_status', 'payment_id', 'date', 'order_items', 'customer']
        read_only_fields = ['payment_id', 'payment_status', 'customer']
    
    def get_order_items(self, obj):
        from store.serializers import OrderItemSerializer
        # Use orderitem_set to access related OrderItem objects
        order_items = obj.orderitem_set.all()
        return OrderItemSerializer(order_items, many=True).data

    def create(self, validated_data):
        # Явно устанавливаем customer из текущего пользователя
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            validated_data['customer'] = request.user
            print(f"Setting customer to user: {request.user.username} (ID: {request.user.id})")
        else:
            print("Warning: No authenticated user found in request context")
            
        order = super().create(validated_data)
        
        # Проверяем, что customer был установлен
        if not order.customer and request and hasattr(request, 'user') and request.user.is_authenticated:
            order.customer = request.user
            order.save()
            print(f"Fixed customer field for order {order.id} to user {request.user.username}")
            
        # Initialize payment process
        try:
            from store.views import get_paypal_accsess_token
            # Store the payment ID instead of a URL that doesn't exist in the model
            order.payment_id = get_paypal_accsess_token()
            order.save()
        except Exception as e:
            print(f"PayPal initialization error: {str(e)}")
        return order

class SupportRequestSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = SupportRequest
        fields = [
            'id', 'user', 'user_username', 'subject', 'message', 
            'user_email', 'order_number', 'status', 'admin_reply', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'status', 'admin_reply', 'created_at', 'updated_at']

class SupportRequestReplySerializer(serializers.Serializer):
    message = serializers.CharField(required=True)

class SupportTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportRequest
        fields = ['id', 'subject', 'message', 'user_email', 'order_number', 
                 'status', 'admin_reply', 'created_at', 'updated_at']

class SupportTicketListSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = SupportRequest
        fields = [
            'id', 'subject', 'message', 'status', 
            'status_display', 'created_at', 'admin_reply'
        ]

class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    receiver_name = serializers.CharField(source='receiver.username', read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'receiver', 'sender_name', 'receiver_name', 
                 'message', 'related_ticket', 'created_at', 'is_read']
        read_only_fields = ['sender', 'created_at']
