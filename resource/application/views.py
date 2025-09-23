from django.shortcuts import render
from .pagination import ApplicationPagination
from .serializers import ApplicationSerializer
from .models import Application
from rest_framework.generics import ListAPIView, CreateAPIView, UpdateAPIView, DestroyAPIView
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
# Create your views here.
class ListApplication(ListAPIView):
    queryset = Application.objects.all()
    pagination_class = ApplicationPagination
    serializer_class = ApplicationSerializer
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'offer']
    ordering_fields = ['offer_bid']


class CreateApplication(CreateAPIView):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    
class UpdateApplication(UpdateAPIView):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    lookup_field = 'id'

class DeleteApplication(DestroyAPIView):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    lookup_field = 'id'
    