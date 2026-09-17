import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from .models import Conversation, Message


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        print("CHAT CONSUMER: connect started")

        self.conversation_id = self.scope["url_route"]["kwargs"]["conversation_id"]
        self.room_group_name = f"chat_{self.conversation_id}"
        self.group_joined = False

        user = self.scope.get("user")

        print(
            "CHAT CONSUMER: user =",
            user,
            "authenticated =",
            bool(user and user.is_authenticated),
        )

        if not user or not user.is_authenticated:
            print("CHAT CONSUMER: authentication failed")
            await self.close(code=4001)
            return

        print("CHAT CONSUMER: checking membership")

        is_member = await self.check_conversation_member(
            user.id,
            self.conversation_id,
        )

        print("CHAT CONSUMER: membership =", is_member)

        if not is_member:
            print("CHAT CONSUMER: membership failed")
            await self.close(code=4003)
            return

        try:
            print("CHAT CONSUMER: GROUP ADD starting")

            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name,
            )

            print("CHAT CONSUMER: GROUP ADD finished")

            self.group_joined = True

            print("CHAT CONSUMER: ACCEPT starting")

            await self.accept()

            print("CHAT CONSUMER: ACCEPT finished")

        except Exception as exc:
            print("CHAT CONSUMER: connect error =", repr(exc))
            await self.close(code=1011)

    async def disconnect(self, close_code):
        print(
            "CHAT CONSUMER: disconnect started, code =",
            close_code,
        )

        if getattr(self, "group_joined", False):
            try:
                print("CHAT CONSUMER: GROUP DISCARD starting")

                await self.channel_layer.group_discard(
                    self.room_group_name,
                    self.channel_name,
                )

                print("CHAT CONSUMER: GROUP DISCARD finished")

            except Exception as exc:
                print(
                    "CHAT CONSUMER: disconnect error =",
                    repr(exc),
                )

    async def receive(self, text_data):
        print("CHAT CONSUMER: RECEIVE =", text_data)

        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            await self.send(
                text_data=json.dumps({
                    "error": "Invalid JSON."
                })
            )
            return

        content = data.get("content")

        if not content or not str(content).strip():
            await self.send(
                text_data=json.dumps({
                    "error": "Message content is required."
                })
            )
            return

        user = self.scope["user"]

        try:
            print("CHAT CONSUMER: creating message")

            message = await self.create_message(
                user.id,
                self.conversation_id,
                str(content).strip(),
            )

            print(
                "CHAT CONSUMER: message created =",
                message,
            )

            print("CHAT CONSUMER: GROUP SEND starting")

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": message,
                },
            )

            print("CHAT CONSUMER: GROUP SEND finished")

        except Exception as exc:
            print(
                "CHAT CONSUMER: receive error =",
                repr(exc),
            )

            await self.send(
                text_data=json.dumps({
                    "error": "Failed to send message."
                })
            )

    async def chat_message(self, event):
        print("CHAT CONSUMER: CHAT MESSAGE =", event)

        await self.send(
            text_data=json.dumps(event["message"])
        )

    @database_sync_to_async
    def check_conversation_member(
        self,
        user_id,
        conversation_id,
    ):
        return (
            Conversation.objects.filter(
                id=conversation_id,
                buyer_id=user_id,
            ).exists()
            or
            Conversation.objects.filter(
                id=conversation_id,
                owner_id=user_id,
            ).exists()
        )

    @database_sync_to_async
    def create_message(
        self,
        user_id,
        conversation_id,
        content,
    ):
        conversation = Conversation.objects.get(
            id=conversation_id,
        )

        message = Message.objects.create(
            conversation=conversation,
            sender_id=user_id,
            content=content,
        )

        conversation.save(
            update_fields=["updated_at"],
        )

        return {
            "id": message.id,
            "conversation": conversation.id,
            "sender": user_id,
            "content": message.content,
            "is_read": message.is_read,
            "created_at": message.created_at.isoformat(),
        }