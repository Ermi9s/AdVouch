from .models import Review, ServiceRatting
from .pagination import InteractionPagination
from .serializers import ReviewSerializer, RattingSerializer
from rest_framework.generics import ListAPIView, CreateAPIView, UpdateAPIView, DestroyAPIView
from django_filters.rest_framework import DjangoFilterBackend


class ListReviews(ListAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    pagination_class = InteractionPagination

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user', 'ad']
    
class CreateReview(CreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer


class UpdateReview(UpdateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    lookup_field = 'id'


class DeleteReview(DestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    lookup_field = 'id'


class ListRattings(ListAPIView):
    queryset = ServiceRatting.objects.all()
    serializer_class = RattingSerializer
    pagination_class = InteractionPagination
    
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['ratting', 'user', 'ad']
    
class CreateRatting(CreateAPIView):
    queryset = ServiceRatting.objects.all()
    serializer_class = RattingSerializer
    

class UpdateRattting(UpdateAPIView):
    queryset = ServiceRatting.objects.all()
    serializer_class = RattingSerializer
    lookup_field = 'id'


class DeleteRatting(DestroyAPIView):
    queryset = ServiceRatting.objects.all()
    serializer_class = RattingSerializer
    lookup_field = 'id'
    