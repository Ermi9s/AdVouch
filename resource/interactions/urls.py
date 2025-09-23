from django.urls import path
from .views import ListReviews, ListRattings, CreateReview, CreateRatting, UpdateReview, UpdateRattting, DeleteRatting, DeleteReview

urlpatterns = [
    path('review/', ListReviews.as_view(), name='list-review'),
    path('review/', CreateReview.as_view(), name='create-review'),
    path('review/<int:id>/', UpdateReview.as_view(), name='update-review'),
    path('review/<int:id>/', DeleteReview.as_view(), name='delete-review'),
    
    path('rating/', ListRattings.as_view(), name='list-rattings'),
    path('rating/', CreateRatting.as_view(), name='create-ratting'),
    path('rating/<int:id>/', UpdateRattting.as_view(), name='update-ratting'),
    path('rating/<int:id>/', DeleteRatting.as_view(), name='delete-ratting')
]