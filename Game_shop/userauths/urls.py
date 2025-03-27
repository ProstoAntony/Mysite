from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import ChatMessageViewSet

router = DefaultRouter()
router.register(r'support-requests', views.SupportRequestViewSet, basename='support-requests')
router.register(r'chat', ChatMessageViewSet, basename='chat')

urlpatterns = [
    path('token/' , views.MytokenObtainPairView.as_view( ) , name= 'token_obtain_pair' ),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/' , views.RegisterView.as_view( ) , name= 'auth_register' ),
    path('test/' , views.dashboard , name= 'test' ),
    path('' , views.getRoutes ),
    path('profile/' , views.get_profile , name= 'profile' ),
    path('profile/update/' , views.update_profile , name= 'profile_update' ),
    path('support/tickets/', views.support_tickets_list, name='support-tickets-list'),
    path('support/my-tickets/', views.user_tickets, name='user-tickets'),
    path('support/create/', views.create_support_ticket, name='create-support-ticket'),
    path('support/ticket/<int:ticket_id>/', views.ticket_detail, name='ticket-detail'),
    path('support/reply/<int:ticket_id>/', views.reply_to_ticket, name='reply-to-ticket'),
    path('users/list/', views.user_list, name='user-list'),
    path('api/', include(router.urls)),
    path('api/chat/messages/<int:user_id>/', ChatMessageViewSet.as_view({'get': 'messages'}), name='chat-messages'),
]