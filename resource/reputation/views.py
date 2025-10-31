from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import RetrieveAPIView
from django.shortcuts import get_object_or_404
from .models import Reputation
from business.models import Business
from users.authentication import JWTAuthentication
from users.permission import IsAuthenticated


class ReputationSerializer:
    """Simple serializer for reputation data"""
    @staticmethod
    def serialize(reputation):
        return {
            'id': reputation.id,
            'business_id': reputation.business.id,
            'business_name': reputation.business.name,
            'share_count': reputation.share_count,
            'average_rating': reputation.average_ratting,
            'review_count': reputation.review_count,
            'click_count': reputation.click_count,
            'view_count': reputation.view_count,
            'search_count': reputation.search_count,
            'overall_score': reputation.overall_score,
            'last_updated': reputation.last_updated.isoformat() if reputation.last_updated else None
        }


class BusinessReputationView(APIView):
    """
    Get reputation for a specific business
    GET /api/v1/reputation/business/{business_id}/
    """
    def get(self, request, business_id):
        business = get_object_or_404(Business, id=business_id)

        # Get or create reputation
        reputation, created = Reputation.objects.get_or_create(
            business=business,
            defaults={
                'share_count': 0,
                'average_ratting': 0.0,
                'review_count': 0,
                'click_count': 0,
                'view_count': 0,
                'search_count': 0,
                'overall_score': 50
            }
        )

        # If just created or data is stale, update it
        if created:
            reputation.update_from_business(business)

        return Response(ReputationSerializer.serialize(reputation))


class UpdateBusinessReputationView(APIView):
    """
    Manually trigger reputation update for a business
    POST /api/v1/reputation/business/{business_id}/update/
    Requires authentication and business ownership
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, business_id):
        business = get_object_or_404(Business, id=business_id)

        # Check if user owns this business
        if business.owner != request.user:
            return Response(
                {'error': 'You do not have permission to update this business reputation'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get or create reputation
        reputation, created = Reputation.objects.get_or_create(
            business=business,
            defaults={
                'share_count': 0,
                'average_ratting': 0.0,
                'review_count': 0,
                'click_count': 0,
                'view_count': 0,
                'search_count': 0,
                'overall_score': 50
            }
        )

        # Update reputation
        reputation.update_from_business(business)

        return Response({
            'success': True,
            'message': 'Reputation updated successfully',
            'reputation': ReputationSerializer.serialize(reputation)
        })


class BulkUpdateReputationView(APIView):
    """
    Update reputation for all businesses (admin only)
    POST /api/v1/reputation/update-all/
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Check if user is admin/staff
        if not request.user.is_staff:
            return Response(
                {'error': 'Only administrators can perform bulk updates'},
                status=status.HTTP_403_FORBIDDEN
            )

        businesses = Business.objects.all()
        updated_count = 0

        for business in businesses:
            reputation, created = Reputation.objects.get_or_create(
                business=business,
                defaults={
                    'share_count': 0,
                    'average_ratting': 0.0,
                    'review_count': 0,
                    'click_count': 0,
                    'view_count': 0,
                    'search_count': 0,
                    'overall_score': 50
                }
            )
            reputation.update_from_business(business)
            updated_count += 1

        return Response({
            'success': True,
            'message': f'Updated reputation for {updated_count} businesses',
            'count': updated_count
        })
