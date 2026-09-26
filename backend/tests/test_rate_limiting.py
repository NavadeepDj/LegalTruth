"""Tests for rate limiting and DoS prevention."""

from fastapi.testclient import TestClient
from fastapi import FastAPI
from app.middleware.rate_limit import RateLimiterMiddleware

# Create test app with low threshold for rapid verification
test_app = FastAPI()
test_app.add_middleware(RateLimiterMiddleware, max_chat_requests_per_minute=3, max_uploads_per_minute=2)


@test_app.post("/api/chat/ask")
async def dummy_chat():
    return {"status": "ok"}


@test_app.post("/api/documents/upload")
async def dummy_upload():
    return {"status": "ok"}


def test_chat_rate_limiting():
    """Verify that exceeding chat RPM threshold returns 429 Too Many Requests."""
    client = TestClient(test_app)

    # 3 allowed requests
    for _ in range(3):
        resp = client.post("/api/chat/ask")
        assert resp.status_code == 200

    # 4th request should be throttled
    blocked_resp = client.post("/api/chat/ask")
    assert blocked_resp.status_code == 429
    assert "Too many requests" in blocked_resp.json()["detail"]
    assert blocked_resp.headers.get("retry-after") == "60"
