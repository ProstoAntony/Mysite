from django.urls import path, include
from rest_framework.routers import DefaultRouter
from customer import views

router = DefaultRouter()
router.register(r'wishlist', views.WishlistViewSet, basename='wishlist')
router.register(r'addresses', views.AddressViewSet, basename='address')
router.register(r'notifications', views.NotificationsViewSet, basename='notification')
router.register(r'orders', views.OrderViewSet, basename='customer-orders')

urlpatterns = router.urls
