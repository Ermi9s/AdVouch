from .models import Business
from .pagination import BusinessPagination
from .serializers import BussinessSerializer
from rest_framework.generics import ListAPIView, CreateAPIView, UpdateAPIView, DestroyAPIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from users.permission import IsAuthenticated, IsOwner
from users.authentication import JWTAuthentication


class GetMyBusinesses(ListAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    pagination_class = BusinessPagination
    serializer_class = BussinessSerializer
    
    filter_backends = [DjangoFilterBackend,filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['name', 'owner']
    search_fields = ['^name', 'description']
    ordering_fields = ['created_at']

    def get_queryset(self):
        return Business.objects.filter(owner=self.request.user)


class ListBusiness(ListAPIView):
    queryset = Business.objects.all().order_by('-created_at')
    pagination_class = BusinessPagination
    serializer_class = BussinessSerializer

    filter_backends = [DjangoFilterBackend,filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['name', 'owner']
    search_fields = ['^name', 'description']
    ordering_fields = ['created_at']


class CreateBusiness(CreateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Business.objects.all()
    serializer_class = BussinessSerializer


class UpdateBusiness(UpdateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsOwner]
    
    queryset = Business.objects.all()
    serializer_class = BussinessSerializer
    lookup_field = 'id'


class DeleteBusiness(DestroyAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsOwner]
    
    queryset = Business.objects.all()
    serializer_class = BussinessSerializer
    lookup_field = 'id'

