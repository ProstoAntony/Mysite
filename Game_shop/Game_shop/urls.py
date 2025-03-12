from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include("store.urls")),
    path('api/', include("userauths.urls")),
    path('api/', include("vendor.urls")),
    path('api/', include("customer.urls")),

    path("ckeditor5/",include("django_ckeditor_5.urls")),
    
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)