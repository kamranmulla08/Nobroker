from rest_framework import serializers

from .models import Deal


class DealSerializer(serializers.ModelSerializer):
    buyer = serializers.PrimaryKeyRelatedField(read_only=True)
    owner = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Deal
        fields = [
            "id",
            "property",
            "buyer",
            "owner",
            "interest_request",
            "agreed_price",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "buyer",
            "owner",
            "status",
            "created_at",
            "updated_at",
        ]