from django.urls import path, include
from rest_framework.routers import DefaultRouter
from customer import views

router = DefaultRouter()
router.register(r'wishlist', views.WishlistViewSet)
router.register(r'addresses', views.AddressViewSet)
router.register(r'notifications', views.NotificationsViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
