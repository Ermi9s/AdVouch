from rest_framework.generics import ListAPIView
from .pagination import PageNumberPagination
from .serializers import AdSerializer
from .models import Ad
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters


class ListAds(ListAPIView):
    queryset = Ad.objects.all()
    pagination_class = PageNumberPagination
    serializer_class = AdSerializer
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status'] # owner and business should be added 
    search_fields = ['^title', 'description']
    ordering_fields = ['created_at', 'share_count']
    