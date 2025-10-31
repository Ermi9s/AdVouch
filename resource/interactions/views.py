from .models import Review, ServiceRatting, Share, AdClick, AdView, SearchQuery
from .pagination import InteractionPagination
from .serializers import (
    ReviewSerializer, RattingSerializer, ShareSerializer,
    AdClickSerializer, AdViewSerializer, SearchQuerySerializer,
    TrackClickSerializer, TrackViewSerializer, TrackShareSerializer, TrackSearchSerializer
)
from rest_framework.generics import ListAPIView, CreateAPIView, UpdateAPIView, DestroyAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django_filters.rest_framework import DjangoFilterBackend
from users.permission import IsAuthenticated, IsOwner
from users.authentication import JWTAuthentication
from django.utils import timezone



class ListReviews(ListAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    pagination_class = InteractionPagination

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user']
    
    def get_queryset(self):
        ad_id = self.kwargs.get('ad_id')
        return Review.objects.filter(ad_id=ad_id)

class CreateReview(CreateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer


class UpdateReview(UpdateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsOwner]
    
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    lookup_field = 'id'


class DeleteReview(DestroyAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsOwner]
    
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    lookup_field = 'id'


class ListRattings(ListAPIView):
    queryset = ServiceRatting.objects.all()
    serializer_class = RattingSerializer
    pagination_class = InteractionPagination
    
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['ratting', 'user']
    
    def get_queryset(self):
        ad_id = self.kwargs.get('ad_id')
        return ServiceRatting.objects.filter(ad_id=ad_id)


class CreateRatting(CreateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    queryset = ServiceRatting.objects.all()
    serializer_class = RattingSerializer
    

class UpdateRattting(UpdateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsOwner]

    queryset = ServiceRatting.objects.all()
    serializer_class = RattingSerializer
    lookup_field = 'id'


class DeleteRatting(DestroyAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsOwner]

    queryset = ServiceRatting.objects.all()
    serializer_class = RattingSerializer
    lookup_field = 'id'


# ============================================================================
# SHARE VIEWS
# ============================================================================

class ListShares(ListAPIView):
    queryset = Share.objects.all()
    serializer_class = ShareSerializer
    pagination_class = InteractionPagination

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user', 'ad']


class CreateShare(CreateAPIView):
    queryset = Share.objects.all()
    serializer_class = ShareSerializer

    def perform_create(self, serializer):
        # Allow anonymous shares
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(user=user)


# ============================================================================
# INTERACTION TRACKING VIEWS (Public endpoints for analytics)
# ============================================================================

class TrackAdClickView(APIView):
    """
    Track ad clicks - can be called by authenticated or anonymous users
    POST /api/v1/interactions/track/click/
    Body: {"ad_id": 123, "referrer": "...", "user_agent": "..."}
    """
    def post(self, request):
        serializer = TrackClickSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        ad_id = serializer.validated_data['ad_id']

        # Get client IP
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')

        # Get session ID
        session_id = request.session.session_key
        if not session_id:
            request.session.create()
            session_id = request.session.session_key

        # Create click record
        click = AdClick.objects.create(
            ad_id=ad_id,
            user=request.user if request.user.is_authenticated else None,
            session_id=session_id,
            ip_address=ip_address,
            referrer=serializer.validated_data.get('referrer', ''),
            user_agent=serializer.validated_data.get('user_agent', request.META.get('HTTP_USER_AGENT', ''))
        )

        return Response({
            'success': True,
            'click_id': click.id,
            'message': 'Click tracked successfully'
        }, status=status.HTTP_201_CREATED)


class TrackAdViewView(APIView):
    """
    Track ad views/impressions
    POST /api/v1/interactions/track/view/
    Body: {"ad_id": 123}
    """
    def post(self, request):
        serializer = TrackViewSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        ad_id = serializer.validated_data['ad_id']

        # Get client IP
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        else:
            ip_address = request.META.get('REMOTE_ADDR')

        # Get session ID
        session_id = request.session.session_key
        if not session_id:
            request.session.create()
            session_id = request.session.session_key

        # Create view record
        view = AdView.objects.create(
            ad_id=ad_id,
            user=request.user if request.user.is_authenticated else None,
            session_id=session_id,
            ip_address=ip_address
        )

        return Response({
            'success': True,
            'view_id': view.id,
            'message': 'View tracked successfully'
        }, status=status.HTTP_201_CREATED)


class TrackShareView(APIView):
    """
    Track ad shares
    POST /api/v1/interactions/track/share/
    Body: {"ad_id": 123}
    """
    def post(self, request):
        serializer = TrackShareSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        ad_id = serializer.validated_data['ad_id']

        # Create share record
        share = Share.objects.create(
            ad_id=ad_id,
            user=request.user if request.user.is_authenticated else None
        )

        return Response({
            'success': True,
            'share_id': share.id,
            'message': 'Share tracked successfully'
        }, status=status.HTTP_201_CREATED)


class TrackSearchView(APIView):
    """
    Track search queries
    POST /api/v1/interactions/track/search/
    Body: {"query": "coffee shop", "results_count": 5, "clicked_ad_id": 123}
    """
    def post(self, request):
        serializer = TrackSearchSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Get session ID
        session_id = request.session.session_key
        if not session_id:
            request.session.create()
            session_id = request.session.session_key

        # Create search record
        search = SearchQuery.objects.create(
            query=serializer.validated_data['query'],
            user=request.user if request.user.is_authenticated else None,
            session_id=session_id,
            results_count=serializer.validated_data.get('results_count', 0),
            clicked_ad_id=serializer.validated_data.get('clicked_ad_id'),
            clicked_business_id=serializer.validated_data.get('clicked_business_id')
        )

        return Response({
            'success': True,
            'search_id': search.id,
            'message': 'Search tracked successfully'
        }, status=status.HTTP_201_CREATED)
