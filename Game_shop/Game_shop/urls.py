from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from store.views import create_order, paypal_success, paypal_cancel, complete_order


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include("store.urls")),
    path('api/', include("userauths.urls")),
    path('api/', include("vendor.urls")),
    path('api/', include("customer.urls")),
    path('api/orders/', create_order, name='create-order'),
    path('api/orders/<int:order_id>/complete/', complete_order, name='complete-order'),
    path('api/payments/paypal/success/', paypal_success, name='paypal-success'),
    path('api/payments/paypal/cancel/', paypal_cancel, name='paypal-cancel'),
    path("ckeditor5/",include("django_ckeditor_5.urls")),
    
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


# Add these to your urlpatterns