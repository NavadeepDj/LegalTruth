"""Tests for input validation, schema boundaries, and edge cases."""


class TestInputValidation:
    """Validate that API endpoints properly reject malformed input."""

    def test_ask_with_empty_question_rejected(self, client):
        """Empty question string should be rejected by Pydantic validation."""
        # Create session first
        session_res = client.post("/api/sessions")
        session_id = session_res.json()["session_id"]

        response = client.post("/api/chat/ask", json={
            "question": "",
            "mode": "document_only",
            "session_id": session_id,
            "document_id": "fake-doc-id",
        })
        assert response.status_code == 422

    def test_ask_with_invalid_mode_rejected(self, client):
        """Invalid mode value should be rejected by Pydantic regex validation."""
        session_res = client.post("/api/sessions")
        session_id = session_res.json()["session_id"]

        response = client.post("/api/chat/ask", json={
            "question": "What is my salary?",
            "mode": "invalid_mode",
            "session_id": session_id,
            "document_id": "fake-doc-id",
        })
        assert response.status_code == 422

    def test_clause_with_zero_page_number_rejected(self, client):
        """Page number 0 should be rejected (minimum is 1)."""
        session_res = client.post("/api/sessions")
        session_id = session_res.json()["session_id"]

        response = client.post("/api/chat/clause", json={
            "clause_text": "Test clause text",
            "page_number": 0,
            "session_id": session_id,
            "document_id": "fake-doc-id",
        })
        assert response.status_code == 422

    def test_upload_without_file_fails(self, client):
        """Upload endpoint with no file should return 422."""
        session_res = client.post("/api/sessions")
        session_id = session_res.json()["session_id"]

        response = client.post(
            "/api/documents/upload",
            data={"session_id": session_id},
        )
        assert response.status_code == 422

    def test_get_document_info_with_invalid_session(self, client):
        """Requesting document info with nonexistent session should return 404."""
        response = client.get("/api/documents/fake-doc-id?session_id=nonexistent-session")
        assert response.status_code == 404

    def test_get_chat_history_with_invalid_session(self, client):
        """Chat history for nonexistent session should return 404."""
        response = client.get("/api/chat/history?session_id=nonexistent-session")
        assert response.status_code == 404

    def test_upload_non_pdf_extension_rejected(self, client):
        """Files with non-PDF extension should be rejected."""
        session_res = client.post("/api/sessions")
        session_id = session_res.json()["session_id"]

        import io
        response = client.post(
            "/api/documents/upload",
            data={"session_id": session_id},
            files={"file": ("malware.exe", io.BytesIO(b"MZ\x90\x00"), "application/octet-stream")},
        )
        assert response.status_code == 400

    def test_multiple_sessions_are_independent(self, client):
        """Documents in one session should not be visible in another."""
        s1 = client.post("/api/sessions").json()["session_id"]
        s2 = client.post("/api/sessions").json()["session_id"]

        # s2 should not see documents from s1
        response = client.get(f"/api/documents/fake-doc?session_id={s2}")
        assert response.status_code == 404
