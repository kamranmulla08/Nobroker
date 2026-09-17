from django.urls import path

from .views import (
    PropertyListCreateView,
    MyPropertyListView,
    PropertyDetailView,
    PropertyImageUploadView,
    InterestRequestCreateView,
    OwnerInterestRequestListView,
    BuyerInterestRequestListView,
    InterestRequestUpdateView,
)


urlpatterns = [
    path("mine/", MyPropertyListView.as_view(), name="my_properties"),
    # Property CRUD
    path(
        "",
        PropertyListCreateView.as_view(),
        name="property_list_create",
    ),

    path(
        "<int:property_id>/",
        PropertyDetailView.as_view(),
        name="property_detail",
    ),

    # Property images
    path(
        "<int:property_id>/images/",
        PropertyImageUploadView.as_view(),
        name="property_image_upload",
    ),

    # Interest request
    path(
        "<int:property_id>/interest/",
        InterestRequestCreateView.as_view(),
        name="interest_request_create",
    ),

    path(
        "interests/",
        OwnerInterestRequestListView.as_view(),
        name="owner_interest_requests",
    ),

    path(
        "interests/mine/",
        BuyerInterestRequestListView.as_view(),
        name="buyer_interest_requests",
    ),

    path(
        "interests/<int:interest_id>/",
        InterestRequestUpdateView.as_view(),
        name="interest_request_update",
    ),
]
