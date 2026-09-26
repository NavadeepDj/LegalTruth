"""Tests for PDF magic-byte validation and filename sanitization."""

import io
import fitz
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_reject_disguised_non_pdf_file():
    """Verify that uploading a text/binary file with a .pdf extension is rejected."""
    session = client.post("/api/sessions").json()
    fake_pdf_content = b"<html><script>alert('malicious')</script></html>"

    resp = client.post(
        "/api/documents/upload",
        files={"file": ("malicious.pdf", io.BytesIO(fake_pdf_content), "application/pdf")},
        data={"session_id": session["session_id"]},
    )

    assert resp.status_code == 400
    assert "Missing %PDF- file header" in resp.json()["detail"]


def test_accept_valid_pdf_magic_bytes():
    """Verify that a legitimate PDF with %PDF- header is accepted."""
    session = client.post("/api/sessions").json()

    doc = fitz.open()
    doc.new_page().insert_text((72, 72), "Valid PDF document content.")
    pdf_bytes = doc.tobytes()
    doc.close()

    assert pdf_bytes.startswith(b"%PDF-")

    resp = client.post(
        "/api/documents/upload",
        files={"file": ("legit.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
        data={"session_id": session["session_id"]},
    )

    assert resp.status_code == 200
    data = resp.json()
    assert data["total_pages"] == 1
    assert data["filename"] == "legit.pdf"
