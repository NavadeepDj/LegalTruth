"""Chat Q&A endpoints."""

from fastapi import APIRouter, HTTPException
from app.models.schemas import QuestionRequest, ClauseRequest, AnswerResponse
from app.models.session_store import store
from app.services.evidence_service import answer_question, answer_clause
from app.services.cache_service import query_cache

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/ask", response_model=AnswerResponse)
async def ask_question_endpoint(request: QuestionRequest):
    """Ask a question about the uploaded document."""
    session = store.get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    doc = store.get_document(request.session_id, request.document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Check query cache for instant sub-millisecond response
    cached_response = query_cache.get(request.document_id, request.question, request.mode)
    if cached_response:
        store.add_conversation_entry(request.session_id, "user", request.question)
        store.add_conversation_entry(request.session_id, "assistant", cached_response.answer)
        return cached_response

    history = [
        {"role": e.role, "content": e.content}
        for e in store.get_conversation(request.session_id)
    ]

    response = answer_question(
        document_text=doc.parsed.full_text,
        question=request.question,
        mode=request.mode,
        conversation_history=history if history else None,
    )

    query_cache.set(request.document_id, request.question, response, request.mode)
    store.add_conversation_entry(request.session_id, "user", request.question)
    store.add_conversation_entry(request.session_id, "assistant", response.answer)

    return response


@router.post("/clause", response_model=AnswerResponse)
async def explain_clause_endpoint(request: ClauseRequest):
    """Explain a specific clause highlighted by the user."""
    session = store.get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    doc = store.get_document(request.session_id, request.document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Check cache for clause explanation
    cached_response = query_cache.get(request.document_id, request.clause_text, str(request.page_number))
    if cached_response:
        return cached_response

    response = answer_clause(
        clause_text=request.clause_text,
        page_number=request.page_number,
        document_text=doc.parsed.full_text,
    )

    query_cache.set(request.document_id, request.clause_text, response, str(request.page_number))
    return response


@router.get("/history")
async def get_chat_history(session_id: str):
    """Get conversation history for the session."""
    session = store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    entries = store.get_conversation(session_id)
    return {
        "history": [
            {"role": e.role, "content": e.content, "timestamp": e.timestamp.isoformat()}
            for e in entries
        ]
    }
