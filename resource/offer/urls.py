from django.urls import path
from .views import ListOffer, CreateOffer, UpdateOffer, DeleteOffer

urlpatterns =[
    path('offer/', ListOffer.as_view(), name='list-offers'),
    path('offer/<int:id>/',UpdateOffer.as_view(), name='update-offer'),
    path('offer/', CreateOffer.as_view(), name='create-offer'),
    path('offer/', DeleteOffer.as_view(), name='delete-offer')
    
    
]