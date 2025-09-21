from django.urls import path
from .views import ListAds


urlpatterns = [
    path('ads/', ListAds.as_view(), name='list-ads')
]