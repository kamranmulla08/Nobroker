from django.urls import path

from .views import (
    DealCreateView,
    DealListView,
    DealDetailView,
)

urlpatterns = [
    path("", DealListView.as_view(), name="deal_list"),
    path("create/", DealCreateView.as_view(), name="deal_create"),
    path("<int:deal_id>/", DealDetailView.as_view(), name="deal_detail"),
]