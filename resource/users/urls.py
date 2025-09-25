from django.urls import path
from .views import ListUsers, DeleteUser, GetMyProfile


urlpatterns = [
    path('me/', GetMyProfile.as_view(), name='get-me'),
    path('user/', ListUsers.as_view(), name='list-users'),
    path('user/<int:id>', DeleteUser.as_view(), name='delete-user')
]