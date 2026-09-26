"""Tests for security headers and framing policies."""

import io
import fitz
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_security_headers_present_on_api_endpoints():
    """Verify that OWASP security headers are present on API responses."""
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.headers.get("x-content-type-options") == "nosniff"
    assert resp.headers.get("x-xss-protection") == "1; mode=block"
    assert resp.headers.get("referrer-policy") == "strict-origin-when-cross-origin"
    assert "geolocation=()" in resp.headers.get("permissions-policy", "")
    assert resp.headers.get("x-frame-options") == "DENY"


def test_pdf_endpoint_allows_trusted_framing():
    """Verify that the /pdf endpoint allows framing from trusted origins and does not set DENY."""
    # Create session and upload a minimal PDF
    session_resp = client.post("/api/sessions")
    session_id = session_resp.json()["session_id"]

    doc = fitz.open()
    doc.new_page().insert_text((72, 72), "Minimal test document.")
    pdf_bytes = doc.tobytes()
    doc.close()

    upload_resp = client.post(
        "/api/documents/upload",
        files={"file": ("test.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
        data={"session_id": session_id},
    )
    doc_id = upload_resp.json()["document_id"]

    # Fetch PDF
    pdf_resp = client.get(f"/api/documents/{doc_id}/pdf?session_id={session_id}")
    assert pdf_resp.status_code == 200
    # Must NOT have DENY, to prevent viewer breakage
    assert pdf_resp.headers.get("x-frame-options") is None
    # Must specify frame-ancestors for trusted domains
    csp = pdf_resp.headers.get("content-security-policy", "")
    assert "frame-ancestors" in csp
    assert "localhost:3000" in csp
