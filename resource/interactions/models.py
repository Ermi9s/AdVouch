from django.db import models


class Share(models.Model):
    ad = models.ForeignKey('ads.Ad', on_delete=models.CASCADE, related_name='ad-share')
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='user-share')
    created_at = models.DateTimeField(auto_now_add=True)



class Review(models.Model):
    ad = models.ForeignKey('ads.Ad', on_delete=models.CASCADE, related_name='ad_review')
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='reviewer')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"user {self.user} reviewed {self.ad}"


class ServiceRatting(models.Model):
    ad = models.ForeignKey('ads.Ad', on_delete=models.CASCADE, related_name='ad_review')
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='reviewer')
    ratting = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"user {self.user} rated {self.ad}"


