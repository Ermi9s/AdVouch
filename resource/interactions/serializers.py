from .models import Review, ServiceRatting, Share, AdClick, AdView, SearchQuery
from rest_framework import serializers


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['created_at']


class RattingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceRatting
        fields = '__all__'
        read_only_fields = ['created_at']


class ShareSerializer(serializers.ModelSerializer):
    class Meta:
        model = Share
        fields = '__all__'
        read_only_fields = ['created_at']


class AdClickSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdClick
        fields = '__all__'
        read_only_fields = ['created_at']


class AdViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdView
        fields = '__all__'
        read_only_fields = ['created_at']


class SearchQuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchQuery
        fields = '__all__'
        read_only_fields = ['created_at']


class TrackClickSerializer(serializers.Serializer):
    """Simplified serializer for tracking clicks from frontend"""
    ad_id = serializers.IntegerField(required=True)
    referrer = serializers.CharField(required=False, allow_blank=True, max_length=512)
    user_agent = serializers.CharField(required=False, allow_blank=True, max_length=512)


class TrackViewSerializer(serializers.Serializer):
    """Simplified serializer for tracking views from frontend"""
    ad_id = serializers.IntegerField(required=True)


class TrackShareSerializer(serializers.Serializer):
    """Simplified serializer for tracking shares from frontend"""
    ad_id = serializers.IntegerField(required=True)


class TrackSearchSerializer(serializers.Serializer):
    """Simplified serializer for tracking searches from frontend"""
    query = serializers.CharField(required=True, max_length=255)
    results_count = serializers.IntegerField(required=False, default=0)
    clicked_ad_id = serializers.IntegerField(required=False, allow_null=True)
    clicked_business_id = serializers.IntegerField(required=False, allow_null=True)

