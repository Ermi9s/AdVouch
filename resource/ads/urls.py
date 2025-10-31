from django.urls import path
from .views import (
    ListAds, CreateAd, UpdateAd, DeleteAd, MyAdsView, RetrieveAd,
    AdEmbedView, AdEmbedCodeView, AdExportDataView
)


urlpatterns = [
    path('ads/', ListAds.as_view(), name='list-ads'),
    path('ads/my/', MyAdsView.as_view(), name='list-my-ads'),
    path('ads/<int:id>/', RetrieveAd.as_view(), name='retrieve-ad'),
    path('ads/<int:id>/update/', UpdateAd.as_view(), name='update-ad'),
    path('ads/<int:id>/delete/', DeleteAd.as_view(), name='delete-ad'),
    path('ads/create/', CreateAd.as_view(), name='create-ad'),

    # Export endpoints
    path('ads/<int:id>/embed/', AdEmbedView.as_view(), name='ad-embed'),
    path('ads/<int:id>/embed-code/', AdEmbedCodeView.as_view(), name='ad-embed-code'),
    path('ads/<int:id>/export/', AdExportDataView.as_view(), name='ad-export'),
]