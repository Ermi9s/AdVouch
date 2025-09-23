from .models import Review, ServiceRatting
from rest_framework import serializers


class ReviewSerializer(serializers.Serializer):
    class Meta:
        model = Review
        fields = '__all__'


class RattingSerializer(serializers.Serializer):
    class Meta:
        model = ServiceRatting
        fields = '__all__'

