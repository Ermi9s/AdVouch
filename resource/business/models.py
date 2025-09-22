from django.db import models



class Business(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    owner = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='owner')
    
    