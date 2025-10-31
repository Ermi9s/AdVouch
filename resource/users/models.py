from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UserManager(BaseUserManager):
    def create_user(self, phone_number, email, full_name, password=None, **extra_fields):
        if not phone_number:
            raise ValueError('Users must have a phone number')
        if not email:
            raise ValueError('Users must have an email')

        user = self.model(
            phone_number=phone_number,
            email=email,
            full_name=full_name,
            **extra_fields
        )
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, email, full_name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(phone_number, email, full_name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20, unique=True)
    email = models.CharField(max_length=255)
    gender = models.CharField(max_length=50, null=True, blank=True)
    birthdate = models.DateField(null=True, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    # Required for Django admin
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['email', 'full_name']

    class Meta:
        db_table = 'users_user'

    def __str__(self):
        return self.full_name
    

class Socials(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='socials')
    name = models.CharField(max_length=255)
    url = models.CharField(max_length=255)

