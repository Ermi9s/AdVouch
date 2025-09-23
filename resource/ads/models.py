from django.db import models

class Ad(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('archived', 'Archived'),
    ]

    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    share_count = models.BigIntegerField(default=0)
    business = models.ForeignKey('business.Business', on_delete=models.CASCADE, related_name='ads')
    owner = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='user_ads', null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')  
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'ads'

   

class Media(models.Model):
    ad = models.ForeignKey(Ad, on_delete=models.CASCADE, related_name='media_files')
    business = models.ForeignKey('business.Business', on_delete=models.CASCADE, related_name='business_media')
    url = models.CharField(max_length=1024)
    media_type = models.CharField(
        max_length=20,
        choices=[('image', 'Image'), ('video', 'Video')],
        default='image'
    )

    def __str__(self):
        return f"{self.media_type}: {self.url}"
    
    
