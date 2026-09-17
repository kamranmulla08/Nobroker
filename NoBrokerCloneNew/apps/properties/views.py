from decimal import Decimal, InvalidOperation

from django.core.paginator import EmptyPage, Paginator
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Property, PropertyImage, InterestRequest
from .serializers import (
    PropertySerializer,
    PropertyImageSerializer,
    InterestRequestSerializer,
)


def is_owner(user):
    return user.role == "OWNER"


def is_buyer(user):
    return user.role == "BUYER"


def query_error(detail):
    return Response({"detail": detail}, status=status.HTTP_400_BAD_REQUEST)


# ============================================================
# PROPERTY LIST + CREATE
# ============================================================

class PropertyListCreateView(APIView):

    def get_permissions(self):
        # Anyone can browse/search properties
        if self.request.method == "GET":
            return [AllowAny()]

        # Login required to create a property
        return [IsAuthenticated()]

    def get(self, request):
        properties = Property.objects.all()

        # Filter by city
        city = request.query_params.get("city")
        if city:
            properties = properties.filter(
                city__iexact=city
            )

        # Filter by listing type
        listing_type = request.query_params.get("listing_type")
        if listing_type:
            properties = properties.filter(
                listing_type__iexact=listing_type
            )

        # Filter by property type
        property_type = request.query_params.get("property_type")
        if property_type:
            properties = properties.filter(
                property_type__iexact=property_type
            )

        # Filter by number of bedrooms
        bedrooms = request.query_params.get("bedrooms")
        if bedrooms:
            try:
                bedroom_count = int(bedrooms)
                if bedroom_count < 0:
                    raise ValueError
            except ValueError:
                return query_error("bedrooms must be a non-negative whole number.")
            properties = properties.filter(bedrooms=bedroom_count)

        # Filter by minimum price
        min_price = request.query_params.get("min_price")
        if min_price:
            try:
                properties = properties.filter(price__gte=Decimal(min_price))
            except InvalidOperation:
                return query_error("min_price must be a valid number.")

        # Filter by maximum price
        max_price = request.query_params.get("max_price")
        if max_price:
            try:
                properties = properties.filter(price__lte=Decimal(max_price))
            except InvalidOperation:
                return query_error("max_price must be a valid number.")

        if min_price and max_price:
            try:
                if Decimal(min_price) > Decimal(max_price):
                    return query_error("min_price cannot be greater than max_price.")
            except InvalidOperation:
                pass

        sort = request.query_params.get("sort", "newest")
        ordering = {
            "newest": "-created_at",
            "price_low_to_high": "price",
            "price_high_to_low": "-price",
        }.get(sort)
        if ordering is None:
            return query_error(
                "sort must be newest, price_low_to_high, or price_high_to_low."
            )
        properties = properties.order_by(ordering)

        page = request.query_params.get("page")
        page_size = request.query_params.get("page_size")
        if page is not None or page_size is not None:
            try:
                page_number = int(page or 1)
                requested_page_size = int(page_size or 9)
                if page_number < 1 or not 1 <= requested_page_size <= 50:
                    raise ValueError
            except ValueError:
                return query_error("page must be positive and page_size must be between 1 and 50.")

            paginator = Paginator(properties, requested_page_size)
            try:
                page_obj = paginator.page(page_number)
            except EmptyPage:
                return query_error("The requested page does not exist.")

            return Response(
                {
                    "count": paginator.count,
                    "page": page_obj.number,
                    "page_size": requested_page_size,
                    "total_pages": paginator.num_pages,
                    "results": PropertySerializer(page_obj.object_list, many=True).data,
                },
                status=status.HTTP_200_OK,
            )

        serializer = PropertySerializer(
            properties,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        if not is_owner(request.user):
            return Response(
                {"detail": "Only property owners can create listings."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = PropertySerializer(
            data=request.data,
        )

        if serializer.is_valid():
            property_obj = serializer.save(
                owner=request.user,
            )

            return Response(
                PropertySerializer(property_obj).data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class MyPropertyListView(APIView):
    """Listings belonging to the authenticated property owner."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_owner(request.user):
            return Response(
                {"detail": "Only property owners have property management listings."},
                status=status.HTTP_403_FORBIDDEN,
            )

        properties = Property.objects.filter(owner=request.user).prefetch_related("images")
        return Response(PropertySerializer(properties, many=True).data)


# ============================================================
# PROPERTY DETAIL
# GET / UPDATE / DELETE
# ============================================================

class PropertyDetailView(APIView):

    def get_permissions(self):
        # Anyone can view a property
        if self.request.method == "GET":
            return [AllowAny()]

        # Login required for update/delete
        return [IsAuthenticated()]

    def get_object(self, property_id):
        try:
            return Property.objects.get(
                id=property_id
            )
        except Property.DoesNotExist:
            return None

    # GET PROPERTY
    def get(self, request, property_id):
        property_obj = self.get_object(property_id)

        if property_obj is None:
            return Response(
                {"detail": "Property not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = PropertySerializer(
            property_obj
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    # UPDATE PROPERTY
    def put(self, request, property_id):
        property_obj = self.get_object(property_id)

        if property_obj is None:
            return Response(
                {"detail": "Property not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only owner can update the property
        if property_obj.owner != request.user:
            return Response(
                {
                    "detail": (
                        "You can only update your own property."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = PropertySerializer(
            property_obj,
            data=request.data,
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    # PARTIAL UPDATE PROPERTY
    def patch(self, request, property_id):
        property_obj = self.get_object(property_id)

        if property_obj is None:
            return Response(
                {"detail": "Property not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only owner can update the property
        if property_obj.owner != request.user:
            return Response(
                {
                    "detail": (
                        "You can only update your own property."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = PropertySerializer(
            property_obj,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    # DELETE PROPERTY
    def delete(self, request, property_id):
        property_obj = self.get_object(property_id)

        if property_obj is None:
            return Response(
                {"detail": "Property not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only owner can delete the property
        if property_obj.owner != request.user:
            return Response(
                {
                    "detail": (
                        "You can only delete your own property."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        property_obj.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT,
        )


# ============================================================
# PROPERTY IMAGE UPLOAD
# ============================================================

class PropertyImageUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, property_id):
        try:
            property_obj = Property.objects.get(
                id=property_id
            )

        except Property.DoesNotExist:
            return Response(
                {"detail": "Property not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only property owner can upload images
        if property_obj.owner != request.user:
            return Response(
                {
                    "detail": (
                        "You can only upload images "
                        "to your own property."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = PropertyImageSerializer(
            data=request.data
        )

        if serializer.is_valid():
            image = serializer.save(
                property=property_obj
            )

            return Response(
                PropertyImageSerializer(image).data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


# ============================================================
# CREATE INTEREST REQUEST
# ============================================================

class InterestRequestCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, property_id):
        try:
            property_obj = Property.objects.get(
                id=property_id
            )

        except Property.DoesNotExist:
            return Response(
                {"detail": "Property not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not is_buyer(request.user):
            return Response(
                {"detail": "Only buyers can submit an interest request."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Owner cannot show interest in own property
        if property_obj.owner == request.user:
            return Response(
                {
                    "detail": (
                        "You cannot show interest "
                        "in your own property."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        interest_request, created = (
            InterestRequest.objects.get_or_create(
                property=property_obj,
                buyer=request.user,
            )
        )

        if not created:
            return Response(
                {
                    "detail": (
                        "You have already shown "
                        "interest in this property."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            InterestRequestSerializer(
                interest_request
            ).data,
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# OWNER INTEREST REQUEST LIST
# ============================================================

class OwnerInterestRequestListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_owner(request.user):
            return Response(
                {"detail": "Only property owners can view incoming interest requests."},
                status=status.HTTP_403_FORBIDDEN,
            )

        interest_requests = (
            InterestRequest.objects.filter(
                property__owner=request.user
            )
            .select_related(
                "property",
                "buyer",
            )
        )

        serializer = InterestRequestSerializer(
            interest_requests,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


class BuyerInterestRequestListView(APIView):
    """Interest requests submitted by the authenticated buyer."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_buyer(request.user):
            return Response(
                {"detail": "Only buyers have submitted interest requests."},
                status=status.HTTP_403_FORBIDDEN,
            )

        interests = InterestRequest.objects.filter(buyer=request.user).select_related(
            "property", "property__owner", "buyer"
        ).prefetch_related("property__images")
        return Response(InterestRequestSerializer(interests, many=True).data)


# ============================================================
# ACCEPT / REJECT INTEREST REQUEST
# ============================================================

class InterestRequestUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, interest_id):
        try:
            interest_request = (
                InterestRequest.objects.select_related(
                    "property",
                    "buyer",
                ).get(
                    id=interest_id
                )
            )

        except InterestRequest.DoesNotExist:
            return Response(
                {
                    "detail": (
                        "Interest request not found."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only property owner can accept/reject
        if interest_request.property.owner != request.user:
            return Response(
                {
                    "detail": (
                        "Only the property owner "
                        "can update this request."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        new_status = request.data.get(
            "status"
        )

        if new_status not in [
            InterestRequest.Status.ACCEPTED,
            InterestRequest.Status.REJECTED,
        ]:
            return Response(
                {
                    "detail": (
                        "Status must be either "
                        "ACCEPTED or REJECTED."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Only pending requests can be updated
        if (
            interest_request.status
            != InterestRequest.Status.PENDING
        ):
            return Response(
                {
                    "detail": (
                        "Only pending requests "
                        "can be updated."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        interest_request.status = new_status
        interest_request.save()

        return Response(
            InterestRequestSerializer(
                interest_request
            ).data,
            status=status.HTTP_200_OK,
        )
