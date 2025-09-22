from django.urls import path
from .views import ListBusiness, CreateBusiness, UpdateBusiness, DeleteBusiness


urlpatterns = [
    path('business/', ListBusiness.as_view(), name='list-business'),
    path('business/', CreateBusiness.as_view(), name='create-business'),
    path('business/<int:id>/', UpdateBusiness.as_view(), name='update-business'),
    path('business/', DeleteBusiness.as_view(), name='delete-business')
]

