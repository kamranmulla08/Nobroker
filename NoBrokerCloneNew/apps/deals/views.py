from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.properties.models import InterestRequest
from .models import Deal
from .serializers import DealSerializer


class DealCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        interest_request_id = request.data.get("interest_request")
        agreed_price = request.data.get("agreed_price")

        if not interest_request_id:
            return Response(
                {"error": "interest_request is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not agreed_price:
            return Response(
                {"error": "agreed_price is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            interest_request = InterestRequest.objects.select_related(
                "property",
                "buyer",
                "property__owner",
            ).get(id=interest_request_id)
        except InterestRequest.DoesNotExist:
            return Response(
                {"error": "Interest request not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only the property owner can create the deal.
        if interest_request.property.owner != request.user:
            return Response(
                {"error": "Only the property owner can create a deal."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # A deal can only be created from an accepted interest.
        if interest_request.status != InterestRequest.Status.ACCEPTED:
            return Response(
                {"error": "Deal can only be created from an accepted interest request."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Prevent creating another deal for the same interest.
        if Deal.objects.filter(interest_request=interest_request).exists():
            return Response(
                {"error": "A deal already exists for this interest request."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        deal = Deal.objects.create(
            property=interest_request.property,
            buyer=interest_request.buyer,
            owner=interest_request.property.owner,
            interest_request=interest_request,
            agreed_price=agreed_price,
        )

        serializer = DealSerializer(deal)

        return Response(
            {
                "message": "Deal created successfully.",
                "deal": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )


class DealListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        deals = Deal.objects.filter(
            buyer=request.user
        ) | Deal.objects.filter(
            owner=request.user
        )

        deals = deals.distinct()

        serializer = DealSerializer(deals, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class DealDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, deal_id):
        try:
            return Deal.objects.get(id=deal_id)
        except Deal.DoesNotExist:
            return None

    def get(self, request, deal_id):
        deal = self.get_object(deal_id)

        if not deal:
            return Response(
                {"error": "Deal not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.user not in [deal.buyer, deal.owner]:
            return Response(
                {"error": "You are not part of this deal."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(
            DealSerializer(deal).data,
            status=status.HTTP_200_OK,
        )

    def patch(self, request, deal_id):
        deal = self.get_object(deal_id)

        if not deal:
            return Response(
                {"error": "Deal not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.user != deal.owner:
            return Response(
                {"error": "Only the property owner can update the deal."},
                status=status.HTTP_403_FORBIDDEN,
            )

        new_status = request.data.get("status")

        if new_status not in [
            Deal.Status.COMPLETED,
            Deal.Status.CANCELLED,
        ]:
            return Response(
                {"error": "Status must be COMPLETED or CANCELLED."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if deal.status != Deal.Status.ACTIVE:
            return Response(
                {"error": "Only an active deal can be updated."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        deal.status = new_status
        deal.save()

        return Response(
            {
                "message": "Deal updated successfully.",
                "deal": DealSerializer(deal).data,
            },
            status=status.HTTP_200_OK,
        )