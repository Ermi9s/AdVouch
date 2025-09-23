from rest_framework.generics import ListAPIView, CreateAPIView, UpdateAPIView, DestroyAPIView
from .pagination import PageNumberPagination
from .serializers import AdSerializer
from .models import Ad
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters




#reminder: add my ad lists with authentication class only me

# GET
class ListAds(ListAPIView):
    queryset = Ad.objects.filter(status='active') #since users will only see the active ads 
    pagination_class = PageNumberPagination
    serializer_class = AdSerializer
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'owner', 'business'] 
    search_fields = ['^title', 'description']
    ordering_fields = ['created_at', 'share_count']


# POST
class CreateAd(CreateAPIView):
    queryset = Ad.objects.all()
    serializer_class = AdSerializer

# PUT and PATCH
class UpdateAd(UpdateAPIView):
    queryset = Ad.objects.all()
    serializer_class = AdSerializer
    lookup_field = 'id'
    

# DELETE
class DeleteAd(DestroyAPIView):
    queryset = Ad.objects.all()
    serializer_class = AdSerializer
    lookup_field = 'id'

