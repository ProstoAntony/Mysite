from userauths.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from store.models import Order  # Add this import

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

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
    class Meta:
        model = Order
        fields = ['id', 'total', 'status', 'payment_status', 'payment_url', 'created_at', 'order_items']
        read_only_fields = ['payment_url', 'payment_status']

    def create(self, validated_data):
        order = super().create(validated_data)
        # Initialize payment process
        try:
            from Game_shop.utils.paypal import get_paypal_accsess_token
            order.payment_url = f"https://www.sandbox.paypal.com/checkoutnow?token={get_paypal_accsess_token()}"
            order.save()
        except Exception as e:
            print(f"PayPal initialization error: {str(e)}")
        return order
