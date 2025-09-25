from rest_framework.generics import ListAPIView, CreateAPIView, UpdateAPIView, DestroyAPIView
from .pagination import PageNumberPagination
from .serializers import AdSerializer
from .models import Ad
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from users.permission import IsAuthenticated, IsOwner
from users.authentication import JWTAuthentication



# GET
class MyAdsView(ListAPIView):
    serializer_class = AdSerializer
    pagination_class = PageNumberPagination
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status'] 
    search_fields = ['^title', 'description']
    ordering_fields = ['created_at', 'share_count']

    def get_queryset(self):
        return Ad.objects.filter(owner=self.request.user)
    


class ListAds(ListAPIView):
    queryset = Ad.objects.filter(status='active') #since users will only see the active ads 
    pagination_class = PageNumberPagination
    serializer_class = AdSerializer
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['owner', 'business'] 
    search_fields = ['^title', 'description']
    ordering_fields = ['created_at', 'share_count']


# POST
class CreateAd(CreateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    queryset = Ad.objects.all()
    serializer_class = AdSerializer

# PUT and PATCH
class UpdateAd(UpdateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsOwner]
    
    queryset = Ad.objects.all()
    serializer_class = AdSerializer
    lookup_field = 'id'
    

# DELETE
class DeleteAd(DestroyAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsOwner]
    
    queryset = Ad.objects.all()
    serializer_class = AdSerializer
    lookup_field = 'id'

