from .models import Review, ServiceRatting
from .pagination import InteractionPagination
from .serializers import ReviewSerializer, RattingSerializer
from rest_framework.generics import ListAPIView, CreateAPIView, UpdateAPIView, DestroyAPIView
from django_filters.rest_framework import DjangoFilterBackend
from users.permission import IsAuthenticated, IsOwner
from users.authentication import JWTAuthentication



class ListReviews(ListAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    pagination_class = InteractionPagination

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user']
    
    def get_queryset(self):
        ad_id = self.kwargs.get('ad_id')
        return Review.objects.filter(ad_id=ad_id)

class CreateReview(CreateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer


class UpdateReview(UpdateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsOwner]
    
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    lookup_field = 'id'


class DeleteReview(DestroyAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsOwner]
    
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    lookup_field = 'id'


class ListRattings(ListAPIView):
    queryset = ServiceRatting.objects.all()
    serializer_class = RattingSerializer
    pagination_class = InteractionPagination
    
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['ratting', 'user']
    
    def get_queryset(self):
        ad_id = self.kwargs.get('ad_id')
        return ServiceRatting.objects.filter(ad_id=ad_id)


class CreateRatting(CreateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    queryset = ServiceRatting.objects.all()
    serializer_class = RattingSerializer
    

class UpdateRattting(UpdateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsOwner]

    queryset = ServiceRatting.objects.all()
    serializer_class = RattingSerializer
    lookup_field = 'id'


class DeleteRatting(DestroyAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsOwner]

    queryset = ServiceRatting.objects.all()
    serializer_class = RattingSerializer
    lookup_field = 'id'
    