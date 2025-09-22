from django.urls import path
from .views import ListAds, CreateAd, UpdateAd, DeleteAd


urlpatterns = [
    path('ads/', ListAds.as_view(), name='list-ads'),
    path('ads/<int:id>/',UpdateAd.as_view(), name='update-ad'),
    path('ads/', CreateAd.as_view(), name='create-ad'),
    path('ads/', DeleteAd.as_view(), name='delete-ad')
]