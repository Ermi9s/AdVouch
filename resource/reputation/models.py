from django.db import models
from django.db.models import Count, Avg


class Reputation(models.Model):
    business = models.ForeignKey('business.Business', on_delete=models.CASCADE, related_name='business_reputation')
    share_count = models.BigIntegerField(default=0)
    average_ratting = models.FloatField(default=0.0)
    review_count = models.BigIntegerField(default=0)
    click_count = models.BigIntegerField(default=0)
    view_count = models.BigIntegerField(default=0)
    search_count = models.BigIntegerField(default=0)  # How many times business appeared in searches
    overall_score = models.BigIntegerField(default=50)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reputation'
        verbose_name_plural = 'Reputations'

    def __str__(self):
        return f"Reputation for {self.business.name}: {self.overall_score}"

    def calculate_score(self):
        """
        Calculate overall reputation score based on various metrics
        Score range: 0-100

        Weights:
        - Average Rating: 40%
        - Engagement (clicks, views, shares): 30%
        - Reviews: 20%
        - Search Visibility: 10%
        """
        # Rating score (0-40 points)
        rating_score = (self.average_ratting / 5.0) * 40 if self.average_ratting else 0

        # Engagement score (0-30 points)
        # Normalize based on typical engagement levels
        engagement_total = self.click_count + (self.view_count * 0.1) + (self.share_count * 5)
        engagement_score = min(engagement_total / 100, 1.0) * 30

        # Review score (0-20 points)
        review_score = min(self.review_count / 50, 1.0) * 20

        # Search visibility score (0-10 points)
        search_score = min(self.search_count / 100, 1.0) * 10

        # Calculate total score
        total_score = rating_score + engagement_score + review_score + search_score

        # Update and return
        self.overall_score = int(total_score)
        return self.overall_score

    def update_from_business(self, business):
        """
        Update reputation metrics from business's ads
        """
        from interactions.models import Share, Review, ServiceRatting, AdClick, AdView, SearchQuery

        # Get all ads for this business
        ads = business.ads.all()

        # Count shares
        self.share_count = Share.objects.filter(ad__in=ads).count()

        # Count and average ratings
        ratings = ServiceRatting.objects.filter(ad__in=ads)
        self.review_count = Review.objects.filter(ad__in=ads).count()
        avg_rating = ratings.aggregate(Avg('ratting'))['ratting__avg']
        self.average_ratting = avg_rating if avg_rating else 0.0

        # Count clicks and views
        self.click_count = AdClick.objects.filter(ad__in=ads).count()
        self.view_count = AdView.objects.filter(ad__in=ads).count()

        # Count search appearances
        self.search_count = SearchQuery.objects.filter(clicked_business=business).count()

        # Calculate overall score
        self.calculate_score()
        self.save()

        return self
    


