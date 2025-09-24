from rest_framework.generics import ListAPIView, CreateAPIView, UpdateAPIView, DestroyAPIView
from .models import Offer
from .pagination import OfferPagination
from .serializers import OfferSerializer
from rest_framework import filters


# Create your views here.

class ListOffer(ListAPIView):
    queryset = Offer.objects.filter(status='active') 
    pagination_class = OfferPagination
    serializer_class = OfferSerializer
    
    ordering_fields = ['created_at']
    search_fields = [ 'description']


# POST
class CreateOffer(CreateAPIView):
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer

# PUT and PATCH
class UpdateOffer(UpdateAPIView):
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer
    lookup_field = 'id'
    

# DELETE
class DeleteOffer(DestroyAPIView):
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer
    lookup_field = 'id'