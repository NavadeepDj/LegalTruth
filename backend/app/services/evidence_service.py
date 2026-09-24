"""Evidence orchestration service.

Coordinates the document Q&A and web fallback workflow:
1. Ask Gemini about the document
2. If NOT_FOUND and mode is document_and_web, search external sources
3. Combine results with clear source boundaries
"""

from app.models.schemas import AnswerResponse, EvidenceStatus
from app.services.gemini_service import ask_document_question, explain_clause
from app.services.search_service import search_external_sources


def answer_question(
    document_text: str,
    question: str,
    mode: str,
    conversation_history: list[dict] | None = None,
) -> AnswerResponse:
    """Full evidence-first question answering workflow."""
    # Step 1: Ask the document
    response = ask_document_question(
        document_text=document_text,
        question=question,
        mode=mode,
        conversation_history=conversation_history,
    )

    # Step 2: If not found and web mode enabled, search externally
    if (
        response.evidence_status == EvidenceStatus.NOT_FOUND
        and mode == "document_and_web"
    ):
        web_result = search_external_sources(
            question=question,
            document_context=response.why_cant_answer,
        )

        if web_result["web_sources"]:
            response.web_sources = web_result["web_sources"]
            response.source_boundary = "BOTH"
            response.answer = (
                f"{response.answer}\n\n"
                f"**External guidance:** {web_result['answer']}"
            )
            response.action_guidance = (
                response.action_guidance + web_result.get("action_guidance", [])
            )

    return response


def answer_clause(
    clause_text: str,
    page_number: int,
    document_text: str,
) -> AnswerResponse:
    """Explain a specific clause from the document."""
    return explain_clause(
        clause_text=clause_text,
        page_number=page_number,
        document_text=document_text,
    )
