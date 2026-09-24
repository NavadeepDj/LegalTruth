"""Shared test fixtures."""

import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def sample_pdf_bytes():
    """Create a minimal PDF in memory for testing."""
    import fitz  # PyMuPDF
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), "Section 1: Introduction\n\nThis is the introduction.", fontsize=12)
    page.insert_text((72, 150), "Section 2: Notice Period\n\nEither party may terminate subject to ninety (90) days notice.", fontsize=12)
    page2 = doc.new_page()
    page2.insert_text((72, 72), "Section 3: Confidentiality\n\nAll information is confidential.", fontsize=12)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes
