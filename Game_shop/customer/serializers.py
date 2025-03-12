from rest_framework import serializers
from .models import Wishlist, Address, Notifications
from store.models import Product
from userauths.models import User

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'image', 'description', 'price', 'regular_price', 'stock', 'status']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class WishlistSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    product = ProductSerializer()

    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'product']

class AddressSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Address
        fields = ['id', 'user', 'full_name', 'mobile', 'email', 'country', 'state', 'city', 'address', 'zipcode']

class NotificationsSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Notifications
        fields = ['id', 'user', 'type', 'seen', 'date']
