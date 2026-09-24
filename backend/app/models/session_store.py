"""In-memory session and document storage.

For the prototype, all state is held in memory. Documents and sessions
are ephemeral — they disappear when the server restarts.
"""

import uuid
from datetime import datetime, timezone
from dataclasses import dataclass, field
from app.models.schemas import ParsedDocument


@dataclass
class ConversationEntry:
    role: str
    content: str
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class DocumentData:
    document_id: str
    filename: str
    pdf_bytes: bytes
    parsed: ParsedDocument
    uploaded_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class Session:
    session_id: str
    documents: dict[str, DocumentData] = field(default_factory=dict)
    conversation: list[ConversationEntry] = field(default_factory=list)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    active_document_id: str | None = None


class SessionStore:
    """Thread-safe in-memory session store."""

    def __init__(self):
        self._sessions: dict[str, Session] = {}

    def create_session(self) -> Session:
        session_id = str(uuid.uuid4())
        session = Session(session_id=session_id)
        self._sessions[session_id] = session
        return session

    def get_session(self, session_id: str) -> Session | None:
        return self._sessions.get(session_id)

    def add_document(self, session_id: str, doc_data: DocumentData) -> None:
        session = self._sessions.get(session_id)
        if session:
            session.documents[doc_data.document_id] = doc_data
            session.active_document_id = doc_data.document_id

    def get_document(self, session_id: str, document_id: str) -> DocumentData | None:
        session = self._sessions.get(session_id)
        if session:
            return session.documents.get(document_id)
        return None

    def add_conversation_entry(self, session_id: str, role: str, content: str) -> None:
        session = self._sessions.get(session_id)
        if session:
            session.conversation.append(ConversationEntry(role=role, content=content))

    def get_conversation(self, session_id: str) -> list[ConversationEntry]:
        session = self._sessions.get(session_id)
        return session.conversation if session else []

    def clear_conversation(self, session_id: str) -> None:
        session = self._sessions.get(session_id)
        if session:
            session.conversation = []


# Global singleton
store = SessionStore()
