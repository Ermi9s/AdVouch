from django.urls import path
from .views import ListUsers, CreateUser, UpdateUser, DeleteUser


urlpatterns = [
    path('user/', ListUsers.as_view(), name='list-users'),
    path('user/<int:id>/',UpdateUser.as_view(), name='update-use'),
    path('user/', CreateUser.as_view(), name='create-user'),
    path('user/', DeleteUser.as_view(), name='delete-user')
]