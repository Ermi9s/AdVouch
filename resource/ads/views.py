from rest_framework.generics import ListAPIView, CreateAPIView, UpdateAPIView, DestroyAPIView, RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from .pagination import PageNumberPagination
from .serializers import AdSerializer
from .models import Ad
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from users.permission import IsAuthenticated, IsOwner
from users.authentication import JWTAuthentication
import json



# GET
class MyAdsView(ListAPIView):
    serializer_class = AdSerializer
    pagination_class = PageNumberPagination
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status'] 
    search_fields = ['^title', 'description']
    ordering_fields = ['created_at', 'share_count']

    def get_queryset(self):
        return Ad.objects.filter(owner=self.request.user)
    


class ListAds(ListAPIView):
    queryset = Ad.objects.filter(status='active') #since users will only see the active ads 
    pagination_class = PageNumberPagination
    serializer_class = AdSerializer
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['owner', 'business'] 
    search_fields = ['^title', 'description']
    ordering_fields = ['created_at', 'share_count']


# POST
class CreateAd(CreateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    queryset = Ad.objects.all()
    serializer_class = AdSerializer

# PUT and PATCH
class UpdateAd(UpdateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsOwner]
    
    queryset = Ad.objects.all()
    serializer_class = AdSerializer
    lookup_field = 'id'
    

# DELETE
class DeleteAd(DestroyAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsOwner]

    queryset = Ad.objects.all()
    serializer_class = AdSerializer
    lookup_field = 'id'


# GET - Retrieve single ad
class RetrieveAd(RetrieveAPIView):
    queryset = Ad.objects.filter(status='active')
    serializer_class = AdSerializer
    lookup_field = 'id'


# Ad Export Views
class AdEmbedView(APIView):
    """
    Generate embeddable HTML for an ad with AdVouch branding
    """
    def get(self, request, id):
        ad = get_object_or_404(Ad, id=id, status='active')
        business = ad.business if hasattr(ad, 'business') else None

        context = {
            'ad': ad,
            'business': business,
        }

        return render(request, 'ad_embed.html', context)


class AdEmbedCodeView(APIView):
    """
    Generate embed code (iframe) for an ad
    """
    def get(self, request, id):
        ad = get_object_or_404(Ad, id=id, status='active')

        # Generate iframe embed code
        base_url = request.build_absolute_uri('/').rstrip('/')
        embed_url = f"{base_url}/api/v1/ads/{id}/embed/"

        iframe_code = f'''<iframe
    src="{embed_url}"
    width="600"
    height="auto"
    frameborder="0"
    scrolling="no"
    style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
    title="{ad.title} - AdVouch">
</iframe>'''

        # Also generate a direct link code
        direct_link = f'<a href="{base_url}/ads/{id}" target="_blank" rel="noopener noreferrer">{ad.title} - View on AdVouch</a>'

        return Response({
            'ad_id': ad.id,
            'ad_title': ad.title,
            'embed_url': embed_url,
            'iframe_code': iframe_code,
            'direct_link': direct_link,
            'preview_url': embed_url,
        })


class AdExportDataView(APIView):
    """
    Export ad data in various formats (JSON, with branding info)
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsOwner]

    def get(self, request, id):
        ad = get_object_or_404(Ad, id=id, owner=request.user)
        business = ad.business if hasattr(ad, 'business') else None

        # Prepare export data with AdVouch branding
        export_data = {
            'ad': {
                'id': ad.id,
                'title': ad.title,
                'description': ad.description,
                'status': ad.status,
                'share_count': ad.share_count,
                'created_at': ad.created_at.isoformat(),
                'media_files': [
                    {
                        'url': media.url,
                        'type': media.media_type
                    } for media in ad.media_files.all()
                ]
            },
            'business': {
                'id': business.id if business else None,
                'name': business.name if business else None,
            } if business else None,
            'branding': {
                'platform': 'AdVouch',
                'tagline': 'Verified & Trusted Advertising',
                'website': 'https://advouch.com',
                'badge_text': 'Advertised via AdVouch',
            },
            'export_info': {
                'exported_at': request.META.get('HTTP_DATE', ''),
                'format': 'json',
                'version': '1.0'
            }
        }

        return Response(export_data)

