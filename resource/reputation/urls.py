from django.urls import path
from .views import BusinessReputationView, UpdateBusinessReputationView, BulkUpdateReputationView

urlpatterns = [
    path('business/<int:business_id>/', BusinessReputationView.as_view(), name='business-reputation'),
    path('business/<int:business_id>/update/', UpdateBusinessReputationView.as_view(), name='update-business-reputation'),
    path('update-all/', BulkUpdateReputationView.as_view(), name='bulk-update-reputation'),
]

