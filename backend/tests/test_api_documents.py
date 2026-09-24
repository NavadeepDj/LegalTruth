"""Tests for document upload and management API."""

import io
import fitz
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def _make_pdf() -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), "Section 1: Notice Period\n\nNotice of 90 days required.", fontsize=12)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


def test_create_session():
    resp = client.post("/api/sessions")
    assert resp.status_code == 200
    data = resp.json()
    assert "session_id" in data
    assert len(data["session_id"]) > 0


def test_upload_document():
    session = client.post("/api/sessions").json()
    pdf_bytes = _make_pdf()

    resp = client.post(
        "/api/documents/upload",
        files={"file": ("test.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
        data={"session_id": session["session_id"]},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["filename"] == "test.pdf"
    assert data["total_pages"] == 1
    assert data["status"] == "processed"
    assert "document_id" in data


def test_upload_non_pdf_rejected():
    session = client.post("/api/sessions").json()
    resp = client.post(
        "/api/documents/upload",
        files={"file": ("test.txt", io.BytesIO(b"hello"), "text/plain")},
        data={"session_id": session["session_id"]},
    )
    assert resp.status_code == 400


def test_upload_without_session_rejected():
    pdf_bytes = _make_pdf()
    resp = client.post(
        "/api/documents/upload",
        files={"file": ("test.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
        data={"session_id": "nonexistent"},
    )
    assert resp.status_code == 404


def test_get_document_pdf():
    session = client.post("/api/sessions").json()
    pdf_bytes = _make_pdf()
    upload = client.post(
        "/api/documents/upload",
        files={"file": ("test.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
        data={"session_id": session["session_id"]},
    ).json()

    resp = client.get(
        f"/api/documents/{upload['document_id']}/pdf",
        params={"session_id": session["session_id"]},
    )
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"
