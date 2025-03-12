from django.urls import path, include
from rest_framework.routers import DefaultRouter
from store import views

router = DefaultRouter()
router.register(r'products', views.ProductViewSet, basename='product')
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'variants', views.VariantViewSet, basename='variant')
router.register(r'variant-items', views.VariantItemViewSet, basename='variant-item')
router.register(r'cart', views.CartViewSet, basename='cart')
router.register(r'orders', views.OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
]