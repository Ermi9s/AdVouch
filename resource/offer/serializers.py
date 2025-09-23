from rest_framework import serializers
from .models import Offer


class OfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offer
        fields = [
            'id',
            'ad',
            'business',
            'maximum_offer_amount',
            'description',
            'status',
            'created_at'
        ]
        
