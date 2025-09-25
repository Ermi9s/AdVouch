from django.db import models


class User(models.Model):
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    email = models.CharField(max_length=255)
    birthdate = models.DateField(null=True, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    

class Socials(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='socials')
    name = models.CharField(max_length=255)
    url = models.CharField(max_length=255)

