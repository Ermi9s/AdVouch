from django.db import models

class Business(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    description = models.TextField()
    owner = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='businesses')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'businesses'
        verbose_name_plural = 'Businesses'
