from django.conf import settings
from django.db import models


class Property(models.Model):

    class PropertyType(models.TextChoices):
        FLAT = "FLAT", "Flat"
        HOUSE = "HOUSE", "House"
        PG = "PG", "PG"

    class ListingType(models.TextChoices):
        RENT = "RENT", "Rent"
        SALE = "SALE", "Sale"

    class AvailabilityStatus(models.TextChoices):
        AVAILABLE = "AVAILABLE", "Available"
        SOLD = "SOLD", "Sold"
        RENTED = "RENTED", "Rented"

    # Owner
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="properties",
    )

    # Basic property information
    title = models.CharField(max_length=200)

    description = models.TextField()

    property_type = models.CharField(
        max_length=20,
        choices=PropertyType.choices,
    )

    listing_type = models.CharField(
        max_length=10,
        choices=ListingType.choices,
    )

    # Property specifications
    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    bedrooms = models.PositiveIntegerField()

    bathrooms = models.PositiveIntegerField()

    area = models.PositiveIntegerField(
        help_text="Area in square feet",
    )

    # Location
    city = models.CharField(max_length=100)

    address = models.TextField()

    # Availability
    availability_status = models.CharField(
        max_length=20,
        choices=AvailabilityStatus.choices,
        default=AvailabilityStatus.AVAILABLE,
    )

    # Dates
    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

        indexes = [
            models.Index(fields=["city"]),
            models.Index(fields=["listing_type"]),
            models.Index(fields=["property_type"]),
            models.Index(fields=["price"]),
            models.Index(fields=["bedrooms"]),
            models.Index(fields=["availability_status"]),
            models.Index(fields=["-created_at"]),
        ]

    def __str__(self):
        return self.title


class PropertyImage(models.Model):

    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="images",
    )

    image = models.ImageField(
        upload_to="property_images/",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.property.title}"

class InterestRequest(models.Model):

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        ACCEPTED = "ACCEPTED", "Accepted"
        REJECTED = "REJECTED", "Rejected"

    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="interest_requests",
    )

    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="interest_requests",
    )

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

        constraints = [
            models.UniqueConstraint(
                fields=["property", "buyer"],
                name="unique_property_buyer_interest",
            ),
        ]

    def __str__(self):
        return f"{self.buyer.email} - {self.property.title} - {self.status}"