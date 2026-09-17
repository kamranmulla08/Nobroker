from rest_framework import serializers

from apps.users.serializers import PublicUserSerializer, UserSerializer
from .models import Property, PropertyImage, InterestRequest


class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = [
            "id",
            "image",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
        ]


class PropertySerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(
        read_only=True
    )

    images = PropertyImageSerializer(
        many=True,
        read_only=True
    )
    owner_details = PublicUserSerializer(source="owner", read_only=True)

    class Meta:
        model = Property
        fields = [
            "id",
            "owner",
            "owner_details",
            "title",
            "description",
            "property_type",
            "listing_type",
            "price",
            "bedrooms",
            "bathrooms",
            "area",
            "city",
            "address",
            "availability_status",
            "images",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "owner",
            "owner_details",
            "images",
            "created_at",
            "updated_at",
        ]


class InterestRequestSerializer(serializers.ModelSerializer):
    buyer = serializers.PrimaryKeyRelatedField(
        read_only=True
    )
    buyer_details = UserSerializer(source="buyer", read_only=True)
    property_details = PropertySerializer(source="property", read_only=True)

    class Meta:
        model = InterestRequest
        fields = [
            "id",
            "property",
            "buyer",
            "buyer_details",
            "property_details",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "buyer",
            "status",
            "created_at",
            "updated_at",
        ]
