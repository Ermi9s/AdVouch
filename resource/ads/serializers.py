from rest_framework import serializers
from .models import Ad, Media


class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ['id', 'url', 'media_type']


class AdSerializer(serializers.ModelSerializer):
    media_files = MediaSerializer(many=True)

    class Meta:
        model = Ad
        fields = [
            'id',
            'title',
            'description',
            'share_count',
            # 'business',
            # 'owner',
            'status',
            'created_at',
            'media_files',
        ]

    def create(self, validated_data):
        media_data = validated_data.pop('media_files', [])
        ad = Ad.objects.create(**validated_data)
        for media in media_data:
            Media.objects.create(ad=ad, **media)
        return ad
