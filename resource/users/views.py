from rest_framework.generics import ListAPIView, CreateAPIView, UpdateAPIView, DestroyAPIView
from .serializers import UserSerializer
from .models import User
from .pagination import UserPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

class ListUsers(ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    pagination_class = UserPagination
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['full_name', 'phone_number']
    search_fields = ['^full_name', 'phone_number']
    ordering_fields = ['created_at']
    

class CreateUser(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class UpdateUser(UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'id'


class DeleteUser(DestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'id'
    