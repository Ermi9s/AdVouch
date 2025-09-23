from rest_framework.generics import ListAPIView, CreateAPIView, UpdateAPIView, DestroyAPIView
from .models import Offer
from .serializers import OfferSerializer

# Create your views here.

class ListOffer(ListAPIView):
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer

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