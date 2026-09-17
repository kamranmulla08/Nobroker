from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import InterestRequest, Property


class PropertyAndInterestApiTests(APITestCase):
    def setUp(self):
        user_model = get_user_model()
        self.owner = user_model.objects.create_user(
            email="owner@example.com",
            name="Owner",
            phone="9000000001",
            role="OWNER",
            password="secure-password-123",
        )
        self.buyer = user_model.objects.create_user(
            email="buyer@example.com",
            name="Buyer",
            phone="9000000002",
            role="BUYER",
            password="secure-password-123",
        )
        self.other_owner = user_model.objects.create_user(
            email="other-owner@example.com",
            name="Other Owner",
            phone="9000000003",
            role="OWNER",
            password="secure-password-123",
        )
        self.property = Property.objects.create(
            owner=self.owner,
            title="Two bedroom flat",
            description="Well-lit flat",
            property_type="FLAT",
            listing_type="RENT",
            price="25000.00",
            bedrooms=2,
            bathrooms=2,
            area=900,
            city="Pune",
            address="Baner, Pune",
        )

    def test_only_owners_can_create_properties(self):
        payload = {
            "title": "New flat", "description": "Description",
            "property_type": "FLAT", "listing_type": "SALE",
            "price": "5000000.00", "bedrooms": 2, "bathrooms": 2,
            "area": 1000, "city": "Pune", "address": "Pune",
        }
        self.client.force_authenticate(self.buyer)
        response = self.client.post("/api/properties/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.owner)
        response = self.client.post("/api/properties/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["owner"], self.owner.id)

    def test_property_updates_require_ownership(self):
        self.client.force_authenticate(self.other_owner)
        response = self.client.patch(
            f"/api/properties/{self.property.id}/",
            {"title": "Unauthorized edit"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.property.refresh_from_db()
        self.assertEqual(self.property.title, "Two bedroom flat")

    def test_interest_lifecycle_and_duplicate_protection(self):
        self.client.force_authenticate(self.buyer)
        response = self.client.post(
            f"/api/properties/{self.property.id}/interest/", {}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        interest_id = response.data["id"]

        duplicate = self.client.post(
            f"/api/properties/{self.property.id}/interest/", {}, format="json"
        )
        self.assertEqual(duplicate.status_code, status.HTTP_400_BAD_REQUEST)

        self.client.force_authenticate(self.owner)
        update = self.client.patch(
            f"/api/properties/interests/{interest_id}/",
            {"status": "ACCEPTED"},
            format="json",
        )
        self.assertEqual(update.status_code, status.HTTP_200_OK)
        self.assertEqual(update.data["status"], InterestRequest.Status.ACCEPTED)

        self.client.force_authenticate(self.buyer)
        mine = self.client.get("/api/properties/interests/mine/")
        self.assertEqual(mine.status_code, status.HTTP_200_OK)
        self.assertEqual(mine.data[0]["status"], InterestRequest.Status.ACCEPTED)
