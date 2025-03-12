from django.urls import path, include
from rest_framework.routers import DefaultRouter
from vendor import views

router = DefaultRouter()
router.register(r'vendors', views.VendorViewSet)
router.register(r'payouts', views.PayoutViewSet)
router.register(r'bank-accounts', views.BankAccountViewSet)
router.register(r'notifications', views.NotificationViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
