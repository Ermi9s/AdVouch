from django.db import models

# Create your models here.

class Offer(models.Model):
    STATUS_CHOICES = [('Active', 'Active'), ('Inactive', 'Inactive')]
    
    ad = models.ForeignKey('ad.Ad', on_delete=models.CASCADE, related_name='ad_offers')
    business = models.ForeignKey('businesses.Business', on_delete=models.CASCADE, related_name='business_offers' )
    maximum_offer_amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="active")
    created_at = models.DateTimeField(auto_now_add=True)
    
