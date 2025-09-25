from rest_framework import serializers 
from .models import Socials, User

class SocialsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Socials
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    socials = SocialsSerializer(many=True)
    
    class Meta:
        model = User
        fields = [
            'full_name',
            'phone_number',
            'email',
            'public',
            'profile_picture',
            'birthdate',
            'socials',
        ]
    
    def create(self, validated_data):
        socials_data = validated_data.pop('socials', [])
        user = User.objects.create(**validated_data)
        
        for social in socials_data:
            Socials.objects.create(user=user, **social)
        
        return user
    