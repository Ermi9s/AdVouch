from django.db import models

# Create your models here.
class Application(models.Model):
    STATUS_CHOICES = [('Active', 'active'), ('Inactive', 'inactive')]
    
    user = models.ForeignKey('users.User', on_delete = models.CASCADE, related_name = 'owner')
    offer = models.ForeignKey('offer.Offer', on_delete = models.CASCADE)
    offer_bid = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        ordering = ['offer_bid']
    additional_description = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="active")