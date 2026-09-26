"""Tests for session TTL cleanup and memory leak prevention."""

from datetime import datetime, timezone, timedelta
from app.models.session_store import SessionStore, Session


def test_cleanup_expired_sessions():
    """Verify that sessions older than max_age_hours are purged."""
    store = SessionStore()

    # Create active session
    active_session = store.create_session()

    # Create expired session manually with old timestamp
    expired_session = Session(
        session_id="expired-123",
        created_at=datetime.now(timezone.utc) - timedelta(hours=25),
    )
    store._sessions[expired_session.session_id] = expired_session

    assert len(store._sessions) == 2

    # Run cleanup
    purged_count = store.cleanup_expired_sessions(max_age_hours=24)

    assert purged_count == 1
    assert store.get_session(active_session.session_id) is not None
    assert store.get_session("expired-123") is None
