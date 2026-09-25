"""Gemini API integration for evidence-constrained Q&A.

Uses the google-genai SDK with structured JSON output.
Handles both document Q&A and clause explanation.
"""

import json
import logging
from google import genai
from google.genai import types
from app.config import settings
from app.models.schemas import AnswerResponse, EvidenceStatus, EvidenceItem
from app.prompts.system_prompt import SYSTEM_PROMPT, build_document_context, build_question_prompt
from app.prompts.clause_prompt import CLAUSE_SYSTEM_PROMPT, build_clause_prompt

logger = logging.getLogger(__name__)


def _get_client() -> genai.Client:
    """Create a Gemini client."""
    return genai.Client(api_key=settings.GEMINI_API_KEY)


def _parse_gemini_response(text: str) -> dict:
    """Parse the JSON response from Gemini, handling markdown code fences."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        lines = [l for l in lines[1:] if l.strip() != "```"]
        cleaned = "\n".join(lines)
    return json.loads(cleaned)


def ask_document_question(
    document_text: str,
    question: str,
    mode: str,
    conversation_history: list[dict] | None = None,
) -> AnswerResponse:
    """Ask a question about the document using Gemini.

    Args:
        document_text: Full text of the parsed document with page markers.
        question: The user's question.
        mode: "document_only" or "document_and_web".
        conversation_history: Previous Q&A pairs for context.

    Returns:
        AnswerResponse with evidence, status, and guidance.
    """
    client = _get_client()

    contents = []

    # Add document context as first user message
    doc_context = build_document_context(document_text)
    contents.append(types.Content(role="user", parts=[types.Part(text=doc_context)]))
    contents.append(types.Content(role="model", parts=[types.Part(text="I have received the document. I will answer questions based solely on this document's content, citing exact pages and sections. I will never invent citations.")]))

    # Add conversation history (last 3 Q&A pairs for context)
    if conversation_history:
        for entry in conversation_history[-6:]:
            contents.append(types.Content(
                role="user" if entry["role"] == "user" else "model",
                parts=[types.Part(text=entry["content"])],
            ))

    # Add current question
    question_prompt = build_question_prompt(question, mode)
    contents.append(types.Content(role="user", parts=[types.Part(text=question_prompt)]))

    models_to_try = [settings.GEMINI_MODEL, "gemini-flash-latest", "gemini-3.5-flash"]
    # Deduplicate while preserving order
    seen = set()
    candidate_models = [m for m in models_to_try if m and not (m in seen or seen.add(m))]

    last_error = None
    for model_name in candidate_models:
        try:
            logger.info(f"Attempting question generation with model: {model_name}")
            response = client.models.generate_content(
                model=model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    temperature=0.1,
                    response_mime_type="application/json",
                ),
            )

            result = _parse_gemini_response(response.text)

            return AnswerResponse(
                answer=result.get("answer", ""),
                evidence_status=EvidenceStatus(result.get("evidence_status", "NOT_FOUND")),
                evidence=[EvidenceItem(**e) for e in result.get("evidence", [])],
                reasoning=result.get("reasoning", ""),
                why_cant_answer=result.get("why_cant_answer", ""),
                action_guidance=result.get("action_guidance", []),
                source_boundary=result.get("source_boundary", "DOCUMENT"),
            )

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini response as JSON: {e}")
            return AnswerResponse(
                answer="I was unable to process this question. Please try rephrasing.",
                evidence_status=EvidenceStatus.NOT_FOUND,
                reasoning=f"Response parsing error: {str(e)}",
                source_boundary="DOCUMENT",
            )
        except Exception as e:
            logger.warning(f"Model {model_name} failed with {type(e).__name__}: {e}. Trying fallback model if available...")
            last_error = e
            continue

    logger.error(f"All candidate models exhausted. Last error: {last_error}")
    return AnswerResponse(
        answer="The AI model is currently experiencing high demand. Spikes in demand are usually temporary. Please try asking again in a few moments.",
        evidence_status=EvidenceStatus.NOT_FOUND,
        why_cant_answer=f"Service temporarily busy (503/429): {str(last_error)}",
        action_guidance=["Wait 5-10 seconds and try re-submitting your question."],
        source_boundary="DOCUMENT",
    )


def explain_clause(
    clause_text: str,
    page_number: int,
    document_text: str,
) -> AnswerResponse:
    """Explain a specific clause from the document."""
    client = _get_client()

    doc_context = build_document_context(document_text)
    clause_prompt = build_clause_prompt(clause_text, page_number)

    contents = [
        types.Content(role="user", parts=[types.Part(text=doc_context)]),
        types.Content(role="model", parts=[types.Part(text="I have received the document. Ready to explain specific clauses.")]),
        types.Content(role="user", parts=[types.Part(text=clause_prompt)]),
    ]

    models_to_try = [settings.GEMINI_MODEL, "gemini-flash-latest", "gemini-3.5-flash"]
    seen = set()
    candidate_models = [m for m in models_to_try if m and not (m in seen or seen.add(m))]

    last_error = None
    for model_name in candidate_models:
        try:
            logger.info(f"Attempting clause explanation with model: {model_name}")
            response = client.models.generate_content(
                model=model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=CLAUSE_SYSTEM_PROMPT,
                    temperature=0.1,
                    response_mime_type="application/json",
                ),
            )

            result = _parse_gemini_response(response.text)

            return AnswerResponse(
                answer=result.get("answer", ""),
                evidence_status=EvidenceStatus.SUPPORTED,
                evidence=[EvidenceItem(**e) for e in result.get("evidence", [])],
                reasoning=result.get("reasoning", ""),
                action_guidance=result.get("action_guidance", []),
                source_boundary="DOCUMENT",
            )

        except Exception as e:
            logger.warning(f"Clause explanation model {model_name} failed with {type(e).__name__}: {e}. Trying fallback model...")
            last_error = e
            continue

    logger.error(f"All candidate models exhausted for clause explanation. Last error: {last_error}")
    return AnswerResponse(
        answer="The clause analysis model is currently experiencing high demand. Please try again shortly.",
        evidence_status=EvidenceStatus.NOT_FOUND,
        why_cant_answer=f"Service temporarily busy (503/429): {str(last_error)}",
        source_boundary="DOCUMENT",
    )
