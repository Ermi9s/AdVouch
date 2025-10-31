from rest_framework.generics import ListAPIView, DestroyAPIView, RetrieveAPIView, CreateAPIView, UpdateAPIView
from rest_framework.views import APIView
from .serializers import UserSerializer
from .models import User
from .pagination import UserPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status
from .permission import IsAuthenticated, IsSelf
from .authentication import JWTAuthentication
from rest_framework.response import Response
from datetime import datetime
import base64
from django.core.files.base import ContentFile


class GetMyProfile(RetrieveAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class ListUsers(ListAPIView):
    queryset = User.objects.filter(public=True)
    serializer_class = UserSerializer
    pagination_class = UserPagination
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['full_name', 'phone_number']
    search_fields = ['^full_name', 'phone_number']
    ordering_fields = ['created_at']
    


class DeleteUser(DestroyAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsSelf]
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'id'


class SyncUserProfile(APIView):
    """
    Create or update user profile from OAuth authentication data.
    This endpoint is called after successful OAuth authentication to sync user data.

    NOTE: User profile data comes from Fayda eSignet (national identity system)
    and is treated as the source of truth. Users CANNOT manually update this data.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Expected payload from OAuth userinfo:
        {
            "sub": "unique_fayda_id",
            "name": "Full Name",
            "email": "user@example.com",
            "phone_number": "+251912345678",
            "birthdate": "1990-01-01",
            "gender": "Male"
        }
        """
        # Get user data from request (already authenticated via JWT)
        user = request.user
        data = request.data

        # Update user profile with OAuth data from Fayda (source of truth)
        if 'name' in data:
            user.full_name = data['name']
        if 'email' in data:
            user.email = data['email']
        if 'phone_number' in data and not user.phone_number:
            # Only update phone if not already set (phone is unique identifier)
            user.phone_number = data['phone_number']
        if 'birthdate' in data:
            try:
                user.birthdate = datetime.strptime(data['birthdate'], '%Y-%m-%d').date()
            except (ValueError, TypeError):
                # Try alternative format
                try:
                    user.birthdate = datetime.strptime(data['birthdate'], '%Y/%m/%d').date()
                except (ValueError, TypeError):
                    pass
        if 'gender' in data:
            user.gender = data['gender']

        # Handle profile picture from Fayda (base64 encoded)
        if 'picture' in data and data['picture']:
            try:
                picture_data = data['picture']
                # Check if it's a base64 data URI
                if picture_data.startswith('data:image'):
                    # Extract format and base64 string
                    format_part, imgstr = picture_data.split(';base64,')
                    ext = format_part.split('/')[-1]  # e.g., 'jpeg', 'png'

                    # Decode base64 and save
                    file = ContentFile(
                        base64.b64decode(imgstr),
                        name=f"{user.phone_number}_profile.{ext}"
                    )
                    user.profile_picture.save(file.name, file, save=False)
                    print(f"[SyncProfile] Saved profile picture for user {user.phone_number}")
            except Exception as e:
                print(f"[SyncProfile] Failed to save profile picture: {e}")
                # Don't fail the entire sync if picture save fails

        user.save()

        serializer = UserSerializer(user)
        return Response({
            'message': 'User profile synced successfully',
            'data': serializer.data
        }, status=status.HTTP_200_OK)
