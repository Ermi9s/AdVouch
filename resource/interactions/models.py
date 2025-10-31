from django.db import models


class Share(models.Model):
    ad = models.ForeignKey('ads.Ad', on_delete=models.CASCADE, related_name='ad_share')
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='user_share', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'shares'

    def __str__(self):
        return f"Share of ad {self.ad.id} by user {self.user.id if self.user else 'anonymous'}"


class Review(models.Model):
    ad = models.ForeignKey('ads.Ad', on_delete=models.CASCADE, related_name='ad_review')
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='reviewer')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reviews'

    def __str__(self):
        return f"user {self.user} reviewed {self.ad}"


class ServiceRatting(models.Model):
    ad = models.ForeignKey('ads.Ad', on_delete=models.CASCADE, related_name='ad_rratting')
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='ratting')
    ratting = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ratings'

    def __str__(self):
        return f"user {self.user} rated {self.ad}"


class AdClick(models.Model):
    """Track clicks on ads"""
    ad = models.ForeignKey('ads.Ad', on_delete=models.CASCADE, related_name='clicks')
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='ad_clicks', null=True, blank=True)
    # Track anonymous users by session or IP
    session_id = models.CharField(max_length=255, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    # Track where the click came from
    referrer = models.CharField(max_length=512, null=True, blank=True)
    user_agent = models.CharField(max_length=512, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ad_clicks'
        indexes = [
            models.Index(fields=['ad', 'created_at']),
            models.Index(fields=['user', 'created_at']),
        ]

    def __str__(self):
        return f"Click on ad {self.ad.id} at {self.created_at}"


class AdView(models.Model):
    """Track views/impressions of ads"""
    ad = models.ForeignKey('ads.Ad', on_delete=models.CASCADE, related_name='views')
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='ad_views', null=True, blank=True)
    session_id = models.CharField(max_length=255, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ad_views'
        indexes = [
            models.Index(fields=['ad', 'created_at']),
            models.Index(fields=['user', 'created_at']),
        ]

    def __str__(self):
        return f"View of ad {self.ad.id} at {self.created_at}"


class SearchQuery(models.Model):
    """Track search queries to understand user intent"""
    query = models.CharField(max_length=255)
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='searches', null=True, blank=True)
    session_id = models.CharField(max_length=255, null=True, blank=True)
    # Track which ad/business was clicked from search results
    clicked_ad = models.ForeignKey('ads.Ad', on_delete=models.SET_NULL, related_name='search_clicks', null=True, blank=True)
    clicked_business = models.ForeignKey('business.Business', on_delete=models.SET_NULL, related_name='search_clicks', null=True, blank=True)
    results_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'search_queries'
        indexes = [
            models.Index(fields=['query', 'created_at']),
            models.Index(fields=['user', 'created_at']),
        ]

    def __str__(self):
        return f"Search: '{self.query}' at {self.created_at}"


