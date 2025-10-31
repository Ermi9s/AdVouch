from django.urls import path
from .views import (
    ListReviews, ListRattings, CreateReview, CreateRatting,
    UpdateReview, UpdateRattting, DeleteRatting, DeleteReview,
    ListShares, CreateShare,
    TrackAdClickView, TrackAdViewView, TrackShareView, TrackSearchView
)

urlpatterns = [
    # Reviews
    path('review/<int:ad_id>', ListReviews.as_view(), name='list-review'),
    path('review/', CreateReview.as_view(), name='create-review'),
    path('review/<int:id>/', UpdateReview.as_view(), name='update-review'),
    path('review/<int:id>/', DeleteReview.as_view(), name='delete-review'),

    # Ratings
    path('rating/<int:ad_id>', ListRattings.as_view(), name='list-rattings'),
    path('rating/', CreateRatting.as_view(), name='create-ratting'),
    path('rating/<int:id>/', UpdateRattting.as_view(), name='update-ratting'),
    path('rating/<int:id>/', DeleteRatting.as_view(), name='delete-ratting'),

    # Shares
    path('share/', ListShares.as_view(), name='list-shares'),
    path('share/create/', CreateShare.as_view(), name='create-share'),

    # Interaction Tracking (Public endpoints)
    path('track/click/', TrackAdClickView.as_view(), name='track-click'),
    path('track/view/', TrackAdViewView.as_view(), name='track-view'),
    path('track/share/', TrackShareView.as_view(), name='track-share'),
    path('track/search/', TrackSearchView.as_view(), name='track-search'),
]