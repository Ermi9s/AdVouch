from rest_framework.generics import ListAPIView, DestroyAPIView, RetrieveAPIView
from .serializers import UserSerializer
from .models import User
from .pagination import UserPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from .permission import IsAuthenticated, IsSelf
from .authentication import JWTAuthentication
from rest_framework.response import Response


class GetMyProfile(RetrieveAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class ListUsers(ListAPIView):
    queryset = User.objects.filter(public=True)
    serializer_class = UserSerializer
    pagination_class = UserPagination
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['full_name', 'phone_number']
    search_fields = ['^full_name', 'phone_number']
    ordering_fields = ['created_at']
    


class DeleteUser(DestroyAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsSelf]
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'id'
    