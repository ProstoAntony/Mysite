from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path
from . import views


urlpatterns = [
    path('token/' , views.MytokenObtainPairView.as_view( ) , name= 'token_obtain_pair' ),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/' , views.RegisterView.as_view( ) , name= 'auth_register' ),
    path('test/' , views.dashboard , name= 'test' ),
    path('' , views.getRoutes ),
    path('profile/' , views.get_profile , name= 'profile' ),
    path('profile/update/' , views.update_profile , name= 'profile_update' ),
]