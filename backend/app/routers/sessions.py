"""Session management endpoints."""

from fastapi import APIRouter
from app.models.schemas import SessionResponse
from app.models.session_store import store

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.post("", response_model=SessionResponse)
async def create_session():
    """Create a new user session."""
    session = store.create_session()
    return SessionResponse(session_id=session.session_id)
