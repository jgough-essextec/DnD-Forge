"""
PDFGenerationService: orchestrates rendering Django HTML templates
to PDF via WeasyPrint.

The service is decoupled from views so it can be reused by character
export endpoints, campaign export, and future batch/async flows.
"""

import logging
import os
import re

from django.conf import settings
from django.template.loader import render_to_string

from .context import build_character_context

logger = logging.getLogger(__name__)

# Attempt to import weasyprint. If system dependencies (cairo, pango)
# are missing, fall back gracefully so the rest of the module can still
# be imported and tests can mock the render step.
try:
    import weasyprint

    WEASYPRINT_AVAILABLE = True
except (ImportError, OSError) as exc:
    weasyprint = None
    WEASYPRINT_AVAILABLE = False
    logger.warning("WeasyPrint not available: %s. PDF generation will fail at runtime.", exc)


class PDFGenerationError(Exception):
    """Raised when PDF generation fails."""


class PDFGenerationService:
    """
    Renders a Character model instance into a multi-page PDF using Django
    templates and WeasyPrint.

    Usage:
        service = PDFGenerationService()
        pdf_bytes = service.generate(character)
    """

    TEMPLATE_NAME = "pdf/character_sheet.html"

    def generate(self, character) -> bytes:
        """
        Generate a PDF for the given character.

        Args:
            character: A Character model instance.

        Returns:
            Raw PDF bytes.

        Raises:
            PDFGenerationError: If WeasyPrint is unavailable or rendering fails.
        """
        if not WEASYPRINT_AVAILABLE:
            raise PDFGenerationError(
                "WeasyPrint is not installed or system dependencies are missing. "
                "PDF generation requires cairo, pango, and gdk-pixbuf."
            )

        context = build_character_context(character)

        try:
            html_string = render_to_string(self.TEMPLATE_NAME, context)
        except Exception as exc:
            raise PDFGenerationError(f"Template rendering failed: {exc}") from exc

        # Determine the base URL so WeasyPrint can resolve relative CSS/font refs.
        base_url = self._resolve_base_url()

        try:
            html_doc = weasyprint.HTML(string=html_string, base_url=base_url)
            pdf_bytes = html_doc.write_pdf()
        except Exception as exc:
            raise PDFGenerationError(f"WeasyPrint rendering failed: {exc}") from exc

        return pdf_bytes

    def render_html(self, character) -> str:
        """
        Render the character sheet HTML without converting to PDF.
        Useful for template testing.
        """
        context = build_character_context(character)
        return render_to_string(self.TEMPLATE_NAME, context)

    def _resolve_base_url(self) -> str:
        """
        Determine the base URL for WeasyPrint so that static file references
        (CSS, fonts) in the templates resolve correctly.
        """
        # Prefer STATIC_ROOT if it has been collected
        static_root = getattr(settings, "STATIC_ROOT", None)
        if static_root and os.path.isdir(str(static_root)):
            return f"file://{static_root}"

        # Fall back to the first STATICFILES_DIR
        staticfiles_dirs = getattr(settings, "STATICFILES_DIRS", [])
        if staticfiles_dirs:
            first_dir = str(staticfiles_dirs[0])
            if os.path.isdir(first_dir):
                return f"file://{first_dir}"

        # Fall back to the pdf app's own static directory
        app_static = os.path.join(os.path.dirname(__file__), "static")
        if os.path.isdir(app_static):
            return f"file://{app_static}"

        return ""

    @staticmethod
    def build_filename(character) -> str:
        """
        Build a sanitized PDF filename from the character's name, level, and class.

        Format: CharacterName_Level5_Fighter.pdf
        """
        name = character.name or "Character"
        safe_name = re.sub(r"[^\w\s-]", "", name).strip().replace(" ", "_")
        if not safe_name:
            safe_name = "Character"
        class_name = character.class_name or "Unknown"
        safe_class = re.sub(r"[^\w\s-]", "", class_name).strip().replace(" ", "_")
        level = character.level or 1
        return f"{safe_name}_Level{level}_{safe_class}.pdf"
