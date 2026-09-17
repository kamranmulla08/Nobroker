
from django.db.models import Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.properties.models import Property

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer


class ConversationListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversations = Conversation.objects.filter(
            Q(buyer=request.user) | Q(owner=request.user)
        ).select_related(
            "property",
            "buyer",
            "owner",
        ).prefetch_related(
            "messages",
        )

        serializer = ConversationSerializer(
            conversations,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        if request.user.role != "BUYER":
            return Response(
                {"error": "Only buyers can start a conversation with a property owner."},
                status=status.HTTP_403_FORBIDDEN,
            )

        property_id = request.data.get("property")

        if not property_id:
            return Response(
                {"error": "property is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            property_obj = Property.objects.select_related(
                "owner"
            ).get(id=property_id)
        except Property.DoesNotExist:
            return Response(
                {"error": "Property not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # The property owner cannot start a buyer conversation
        # with themselves.
        if property_obj.owner == request.user:
            return Response(
                {
                    "error": (
                        "Property owners cannot create a "
                        "conversation with themselves."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check whether a conversation already exists.
        conversation = Conversation.objects.filter(
            property=property_obj,
            buyer=request.user,
            owner=property_obj.owner,
        ).first()

        if conversation:
            return Response(
                {
                    "message": "Conversation already exists.",
                    "conversation": ConversationSerializer(
                        conversation
                    ).data,
                },
                status=status.HTTP_200_OK,
            )

        conversation = Conversation.objects.create(
            property=property_obj,
            buyer=request.user,
            owner=property_obj.owner,
        )

        serializer = ConversationSerializer(conversation)

        return Response(
            {
                "message": "Conversation created successfully.",
                "conversation": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )


class ConversationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, conversation_id):
        try:
            return Conversation.objects.select_related(
                "property",
                "buyer",
                "owner",
            ).prefetch_related(
                "messages",
            ).get(id=conversation_id)
        except Conversation.DoesNotExist:
            return None

    def get(self, request, conversation_id):
        conversation = self.get_object(conversation_id)

        if not conversation:
            return Response(
                {"error": "Conversation not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.user not in [
            conversation.buyer,
            conversation.owner,
        ]:
            return Response(
                {"error": "You are not part of this conversation."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ConversationSerializer(conversation)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


class MessageCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id):
        try:
            conversation = Conversation.objects.select_related(
                "buyer",
                "owner",
            ).get(id=conversation_id)
        except Conversation.DoesNotExist:
            return Response(
                {"error": "Conversation not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.user not in [
            conversation.buyer,
            conversation.owner,
        ]:
            return Response(
                {"error": "You are not part of this conversation."},
                status=status.HTTP_403_FORBIDDEN,
            )

        content = request.data.get("content")

        if not content or not str(content).strip():
            return Response(
                {"error": "Message content is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=str(content).strip(),
        )

        conversation.save(update_fields=["updated_at"])

        serializer = MessageSerializer(message)

        return Response(
            {
                "message": "Message sent successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )


class MessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id):
        try:
            conversation = Conversation.objects.select_related(
                "buyer",
                "owner",
            ).get(id=conversation_id)
        except Conversation.DoesNotExist:
            return Response(
                {"error": "Conversation not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.user not in [
            conversation.buyer,
            conversation.owner,
        ]:
            return Response(
                {"error": "You are not part of this conversation."},
                status=status.HTTP_403_FORBIDDEN,
            )

        messages = Message.objects.filter(
            conversation=conversation
        ).select_related(
            "sender",
        )

        serializer = MessageSerializer(
            messages,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


class MessageReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, conversation_id):
        try:
            conversation = Conversation.objects.get(
                id=conversation_id
            )
        except Conversation.DoesNotExist:
            return Response(
                {"error": "Conversation not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.user not in [
            conversation.buyer,
            conversation.owner,
        ]:
            return Response(
                {"error": "You are not part of this conversation."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Mark only messages sent by the other participant as read.
        updated_count = Message.objects.filter(
            conversation=conversation
        ).exclude(
            sender=request.user
        ).filter(
            is_read=False
        ).update(
            is_read=True
        )

        return Response(
            {
                "message": "Messages marked as read.",
                "updated_count": updated_count,
            },
            status=status.HTTP_200_OK,
        )
