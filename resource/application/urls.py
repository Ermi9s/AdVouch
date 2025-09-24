from django.urls import path
from .views import ListApplication, CreateApplication, UpdateApplication, DeleteApplication

urlpatterns = [
    path('application/', ListApplication.as_view(), name= 'list-application'),
    path('application/', CreateApplication.as_view(), name= 'create-application'),
    path('application/<int:id>/', UpdateApplication.as_view(), name= 'update-application'),
    path('application/<int:id>/', DeleteApplication.as_view(), name= 'delete-application')
]
