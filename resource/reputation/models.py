from django.db import models


class Reputation(models.Model):
    business = models.ForeignKey('business.Business', on_delete=models.CASCADE, related_name='business-reputation')
    share_count = models.BigIntegerField()
    average_ratting = models.FloatField()
    review_count = models.BigIntegerField()
    overall_score = models.BigIntegerField(default=50)
    


