"""Tests for chat Q&A API endpoints."""

import io
import json
from unittest.mock import patch, MagicMock
import fitz
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def _setup_session_with_doc():
    """Helper: create session and upload a test document."""
    session = client.post("/api/sessions").json()

    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), "Section 7.2: Notice Period\n\nEither party may terminate this agreement subject to a notice period of ninety (90) days.", fontsize=12)
    pdf_bytes = doc.tobytes()
    doc.close()

    upload = client.post(
        "/api/documents/upload",
        files={"file": ("agreement.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
        data={"session_id": session["session_id"]},
    ).json()

    return session["session_id"], upload["document_id"]


@patch("app.services.gemini_service._get_client")
def test_ask_supported_question(mock_client):
    """Test asking a question that IS answered by the document."""
    session_id, doc_id = _setup_session_with_doc()

    mock_response = MagicMock()
    mock_response.text = json.dumps({
        "answer": "Your notice period is 90 days.",
        "evidence_status": "SUPPORTED",
        "evidence": [{
            "page_number": 1,
            "section": "Section 7.2",
            "quote": "Either party may terminate this agreement subject to a notice period of ninety (90) days.",
            "relevance": "Directly states the notice period."
        }],
        "reasoning": "Section 7.2 explicitly states a 90-day notice period.",
        "why_cant_answer": "",
        "action_guidance": ["Review the full termination clause for additional conditions."],
        "source_boundary": "DOCUMENT"
    })
    mock_client.return_value.models.generate_content.return_value = mock_response

    resp = client.post("/api/chat/ask", json={
        "question": "What is my notice period?",
        "mode": "document_only",
        "session_id": session_id,
        "document_id": doc_id,
    })

    assert resp.status_code == 200
    data = resp.json()
    assert data["evidence_status"] == "SUPPORTED"
    assert len(data["evidence"]) > 0
    assert data["evidence"][0]["page_number"] == 1


@patch("app.services.gemini_service._get_client")
def test_ask_not_found_question(mock_client):
    """Test asking a question NOT answered by the document."""
    session_id, doc_id = _setup_session_with_doc()

    mock_response = MagicMock()
    mock_response.text = json.dumps({
        "answer": "This information was not found in your uploaded document.",
        "evidence_status": "NOT_FOUND",
        "evidence": [],
        "reasoning": "The document does not contain salary withholding provisions.",
        "why_cant_answer": "Your question requires information about salary deduction rules, but the document only contains notice period provisions.",
        "action_guidance": [],
        "source_boundary": "DOCUMENT"
    })
    mock_client.return_value.models.generate_content.return_value = mock_response

    resp = client.post("/api/chat/ask", json={
        "question": "Can my employer withhold my salary?",
        "mode": "document_only",
        "session_id": session_id,
        "document_id": doc_id,
    })

    assert resp.status_code == 200
    data = resp.json()
    assert data["evidence_status"] == "NOT_FOUND"
    assert len(data["evidence"]) == 0
    assert data["why_cant_answer"] != ""


def test_ask_without_session():
    resp = client.post("/api/chat/ask", json={
        "question": "test",
        "mode": "document_only",
        "session_id": "fake",
        "document_id": "fake",
    })
    assert resp.status_code == 404


def test_get_chat_history():
    session = client.post("/api/sessions").json()
    resp = client.get(f"/api/chat/history?session_id={session['session_id']}")
    assert resp.status_code == 200
    assert resp.json()["history"] == []
