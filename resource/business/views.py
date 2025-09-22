from .models import Business
from .pagination import BusinessPagination
from .serializers import BussinessSerializer
from rest_framework.generics import ListAPIView, CreateAPIView, UpdateAPIView, DestroyAPIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters


class ListBusiness(ListAPIView):
    queryset = Business.objects.all()
    pagination_class = BusinessPagination
    serializer_class = BussinessSerializer
    
    filter_backends = [DjangoFilterBackend,filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['name', 'owner']
    search_fields = ['^name', 'description']
    ordering_fields = ['created_at']


class CreateBusiness(CreateAPIView):
    queryset = Business.objects.all()
    serializer_class = BussinessSerializer


class UpdateBusiness(UpdateAPIView):
    queryset = Business.objects.all()
    serializer_class = BussinessSerializer
    lookup_field = 'id'


class DeleteBusiness(DestroyAPIView):
    queryset = Business.objects.all()
    serializer_class = BussinessSerializer
    lookup_field = 'id'

