from django.urls import path
from . import views

urlpatterns = [
    path('products/', views.ProductViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='product-list'),
    path('products/<int:pk>/', views.ProductViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='product-detail'),
    path('products/discounted/', views.get_discounted_products, name='discounted-products'),
    
    path('categories/', views.CategoryViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='category-list'),
    path('categories/<int:pk>/', views.CategoryViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
    }), name='category-detail'),
    
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