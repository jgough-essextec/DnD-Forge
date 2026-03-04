"""
PDF export views for character sheets.
"""

import logging

from django.http import HttpResponse
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from characters.models import Character
from characters.permissions import IsOwner

from .services import PDFGenerationError, PDFGenerationService

logger = logging.getLogger(__name__)


class CharacterPDFView(APIView):
    """
    GET /api/characters/:id/pdf/

    Returns a downloadable PDF character sheet for the given character.
    Only the character owner may access this endpoint.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, character_id):
        # Fetch the character, returning 404 if not found.
        try:
            character = Character.objects.get(pk=character_id)
        except Character.DoesNotExist:
            return Response(
                {"detail": "Character not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Ownership check.
        if character.owner != request.user:
            return Response(
                {"detail": "You do not have permission to access this character."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Generate PDF.
        service = PDFGenerationService()
        try:
            pdf_bytes = service.generate(character)
        except PDFGenerationError as exc:
            logger.error("PDF generation failed for character %s: %s", character_id, exc)
            return Response(
                {"detail": "Failed to generate PDF. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        filename = service.build_filename(character)

        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        return response
