from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import CategoryViewSet, ProductViewSet, WishlistViewSet

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('products', ProductViewSet, basename='product')
router.register('wishlist', WishlistViewSet, basename='wishlist')

urlpatterns = [
    path('', include(router.urls)),
    path('products/discounted/', views.get_discounted_products, name='discounted-products'),
    
    path('cart/', views.CartViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='cart-list'),
    path('cart/<int:pk>/', views.CartViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
    }), name='cart-detail'),
    
    path('orders/', views.OrderViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='order-list'),
    path('orders/<int:pk>/', views.OrderViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
    }), name='order-detail'),
    
    path('variants/', views.VariantViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='variant-list'),
    path('variants/<int:pk>/', views.VariantViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
    }), name='variant-detail'),
    
    path('variant-items/', views.VariantItemViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='variant-item-list'),
    path('variant-items/<int:pk>/', views.VariantItemViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
    }), name='variant-item-detail'),
    # Add this to your urlpatterns
    path('orders/<str:order_id>/capture/', views.capture_payment, name='capture_payment'),
]