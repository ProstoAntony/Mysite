from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Wishlist, Address, Notifications
from userauths.serializers import PayPalOrderSerializer
from store.models import Order
from .serializers import WishlistSerializer, AddressSerializer, NotificationsSerializer
import logging

logger = logging.getLogger(__name__)

class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Wishlist.objects.none()
            
        if user.is_staff:
            # Администраторы видят все записи
            logger.info(f"Admin user {user.username} accessing all wishlist items")
            return Wishlist.objects.all()
        
        # Фильтруем записи по текущему пользователю
        user_wishlist = Wishlist.objects.filter(user=user)
        logger.info(f"User {user.username} (ID: {user.id}): Found {user_wishlist.count()} wishlist items")
        
        return user_wishlist

class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Address.objects.none()
            
        if user.is_staff:
            # Администраторы видят все записи
            logger.info(f"Admin user {user.username} accessing all addresses")
            return Address.objects.all()
        
        # Фильтруем записи по текущему пользователю
        user_addresses = Address.objects.filter(user=user)
        logger.info(f"User {user.username} (ID: {user.id}): Found {user_addresses.count()} addresses")
        
        return user_addresses

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = PayPalOrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(customer=user)

class NotificationsViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Notifications.objects.none()
            
        if user.is_staff:
            # Администраторы видят все записи
            logger.info(f"Admin user {user.username} accessing all notifications")
            return Notifications.objects.all()
        
        # Фильтруем записи по текущему пользователю
        user_notifications = Notifications.objects.filter(user=user)
        logger.info(f"User {user.username} (ID: {user.id}): Found {user_notifications.count()} notifications")
        
        return user_notifications
