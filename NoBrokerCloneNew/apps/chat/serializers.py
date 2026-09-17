from rest_framework import serializers

from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.PrimaryKeyRelatedField(
        read_only=True
    )

    class Meta:
        model = Message

        fields = [
            "id",
            "conversation",
            "sender",
            "content",
            "is_read",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "sender",
            "is_read",
            "created_at",
        ]


class PropertySummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    city = serializers.CharField()


class BuyerSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    email = serializers.EmailField()
    phone = serializers.CharField()


class ConversationSerializer(serializers.ModelSerializer):
    buyer = serializers.PrimaryKeyRelatedField(
        read_only=True
    )

    owner = serializers.PrimaryKeyRelatedField(
        read_only=True
    )

    property_details = serializers.SerializerMethodField()
    buyer_details = serializers.SerializerMethodField()

    messages = MessageSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Conversation

        fields = [
            "id",
            "property",
            "property_details",
            "buyer",
            "buyer_details",
            "owner",
            "messages",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "property",
            "property_details",
            "buyer",
            "buyer_details",
            "owner",
            "messages",
            "created_at",
            "updated_at",
        ]

    def get_property_details(self, obj):
        property_obj = obj.property

        return {
            "id": property_obj.id,
            "title": property_obj.title,
            "city": property_obj.city,
        }

    def get_buyer_details(self, obj):
        buyer = obj.buyer

        return {
            "id": buyer.id,
            "name": buyer.name,
            "email": buyer.email,
            "phone": buyer.phone,
        }