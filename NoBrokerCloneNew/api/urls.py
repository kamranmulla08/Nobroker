from django.urls import include, path


urlpatterns = [
    # User APIs
    path("users/", include("apps.users.urls")),

    # Property APIs
    path("properties/", include("apps.properties.urls")),
]