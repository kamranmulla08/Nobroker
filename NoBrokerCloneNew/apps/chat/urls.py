
from django.urls import path

from .views import (
    ConversationListCreateView,
    ConversationDetailView,
    MessageCreateView,
    MessageListView,
    MessageReadView,
)


urlpatterns = [
    # Conversations
    path(
        "conversations/",
        ConversationListCreateView.as_view(),
        name="conversation_list_create",
    ),

    path(
        "conversations/<int:conversation_id>/",
        ConversationDetailView.as_view(),
        name="conversation_detail",
    ),

    # Messages
    path(
        "conversations/<int:conversation_id>/messages/",
        MessageListView.as_view(),
        name="message_list",
    ),

    path(
        "conversations/<int:conversation_id>/messages/send/",
        MessageCreateView.as_view(),
        name="message_create",
    ),

    path(
        "conversations/<int:conversation_id>/read/",
        MessageReadView.as_view(),
        name="message_read",
    ),
]
