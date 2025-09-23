from .models import Business
from ads.models import Media
from rest_framework import serializers
from ads.serializers import MediaSerializer


class BussinessSerializer(serializers.ModelSerializer):
    media_files = MediaSerializer(many=True)

    class Meta:
        model = Business
        fields = [
            'id',
            'name',
            'description',
            'location',
            'owner',
            'media_files',
            'created_at'
        ]
    
    def create(self, validated_data):
        media_data = validated_data.pop('media_files', [])
        business = Business.objects.create(**validated_data)
        
        for media in media_data:
            Media.objects.create(business=business, **media)
        
        return business