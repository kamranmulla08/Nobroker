from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    class Role(models.TextChoices):
        OWNER = "OWNER", "Property Owner"
        BUYER = "BUYER", "Buyer / Tenant"

    username = None

    name = models.CharField(max_length=150)

    email = models.EmailField(unique=True)

    phone = models.CharField(max_length=15, unique=True)

    role = models.CharField(
        max_length=20,
        choices=Role.choices
    )

    profile_photo = models.ImageField(
        upload_to="profile_photos/",
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name", "phone", "role"]

    def __str__(self):
        return self.email