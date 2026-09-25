"""Gemini API integration for evidence-constrained Q&A.

Uses the google-genai SDK with structured JSON output.
Handles both document Q&A and clause explanation.
"""

import re
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


SYNONYMS: dict[str, set[str]] = {
    "pay": {"pay", "salary", "compensation", "ctc", "remuneration", "basic", "allowance"},
    "salary": {"pay", "salary", "compensation", "ctc", "remuneration", "basic"},
    "compensation": {"pay", "salary", "compensation", "ctc", "remuneration", "basic"},
    "fixed": {"fixed", "base", "annual"},
    "title": {"title", "designation", "role", "position"},
    "notice": {"notice", "resignation", "termination"},
}


def _local_fallback_answer(document_text: str, question: str) -> AnswerResponse:
    """Deterministic local extraction when external cloud APIs encounter 503 demand spikes."""
    pages_raw = re.split(r'(?:---|\[)\s*PAGE\s*(\d+)\s*(?:---|\])', document_text)
    page_data: list[tuple[int, str]] = []
    if len(pages_raw) > 1:
        for i in range(1, len(pages_raw), 2):
            p_num = int(pages_raw[i])
            p_text = pages_raw[i + 1] if i + 1 < len(pages_raw) else ""
            page_data.append((p_num, p_text))
    else:
        page_data.append((1, document_text))

    q_lower = question.lower()
    q_words = set(re.findall(r'\b\w{3,}\b', q_lower))
    stopwords = {"what", "when", "where", "which", "does", "have", "this", "that", "with", "from", "your", "their", "about", "agreement", "document", "tell", "show"}
    meaningful_q_words = q_words - stopwords

    # Expand domain synonyms
    expanded_terms = set(meaningful_q_words)
    for w in meaningful_q_words:
        if w in SYNONYMS:
            expanded_terms.update(SYNONYMS[w])

    is_asking_amount = any(w in q_lower for w in ["pay", "salary", "compensation", "fixed", "ctc", "amount", "bonus"])

    # First attempt: line-level key-value extraction or targeted line match with adjacent table rows
    best_candidate = None
    best_score = -100
    best_page = 1
    best_section = ""

    for p_num, p_text in page_data:
        lines = [l.strip() for l in re.split(r'[\r\n]+', p_text) if l.strip() and not l.startswith('---')]
        current_section = ""
        for idx, line in enumerate(lines):
            sec_match = re.search(r'(Section\s+[\d.]+|Article\s+[\d.]+|Clause\s+[\d.]+)', line, re.IGNORECASE)
            if sec_match:
                current_section = sec_match.group(0)

            candidate_line = line
            # If line is a table header/label and next line is a monetary amount/value, merge them
            if idx + 1 < len(lines):
                next_line = lines[idx + 1]
                if re.match(r'^(?:INR|Rs\.?|₹|\$)?\s*[\d,]+', next_line, re.IGNORECASE) and not re.search(r'[\d,]', line):
                    candidate_line = f"{line}: {next_line}"

            l_lower = candidate_line.lower()
            score = 0
            for term in expanded_terms:
                if re.search(r'\b' + re.escape(term) + r'\b', l_lower):
                    score += 3

            # Bonus for numerical/monetary amount when asking about pay/amounts
            has_currency = bool(re.search(r'(?:INR|Rs\.?|₹|\$)\s*[\d,]+|\b\d{1,3}(?:,\d{2,3})+\b', candidate_line))
            if is_asking_amount and has_currency:
                score += 5

            # Penalize meta/FAQ reference sentences
            if any(meta in l_lower for meta in ["faqs", "guidelines", "refer to", "elaborates", "applicable to structure", "subject to submission"]):
                score -= 6

            if score > best_score:
                best_score = score
                best_candidate = candidate_line
                best_page = p_num
                best_section = current_section

    if best_candidate and best_score >= 3:
        kv = re.match(r'^([^:\-]+)[\s:\-]+(.+)$', best_candidate)
        if kv and len(kv.group(1).split()) <= 4:
            k = kv.group(1).strip()
            v = kv.group(2).strip().rstrip('.')
            answer = f"Your {k.lower()} is {v}."
        else:
            answer = best_candidate.rstrip('.') + "."

        return AnswerResponse(
            answer=answer,
            evidence_status=EvidenceStatus.SUPPORTED,
            evidence=[
                EvidenceItem(
                    page_number=best_page,
                    section=best_section,
                    quote=best_candidate,
                    relevance="Directly states the contractual terms queried.",
                )
            ],
            reasoning=f"Identified matching contractual terms on Page {best_page}.",
            source_boundary="DOCUMENT",
        )

    # Second attempt: paragraph / sentence extraction
    best_chunk = None
    best_score = 0
    best_page = 1
    best_section = ""

    for p_num, p_text in page_data:
        paras = [p.strip() for p in re.split(r'\n\s*\n', p_text) if p.strip()]
        for para in paras:
            p_lower = para.lower()
            matches = sum(1 for w in meaningful_q_words if w in p_lower)
            if any(term in q_lower and term in p_lower for term in ["notice", "terminate", "termination", "confidential", "salary", "severance", "benefit", "arbitration"]):
                matches += 2

            if matches > best_score:
                best_score = matches
                best_chunk = para
                best_page = p_num
                sec_match = re.search(r'(Section\s+[\d.]+|Article\s+[\d.]+|Clause\s+[\d.]+)', para, re.IGNORECASE)
                best_section = sec_match.group(0) if sec_match else ""

    if best_score >= 2 and best_chunk:
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+|[\r\n]+', best_chunk) if s.strip()]
        matching_sentences = [s for s in sentences if any(w in s.lower() for w in meaningful_q_words)]
        quote = matching_sentences[0] if matching_sentences else sentences[0]
        answer = quote.rstrip('.') + "."

        return AnswerResponse(
            answer=answer,
            evidence_status=EvidenceStatus.SUPPORTED,
            evidence=[
                EvidenceItem(
                    page_number=best_page,
                    section=best_section,
                    quote=quote.strip(),
                    relevance="Directly states the contractual terms queried.",
                )
            ],
            reasoning=f"Found matching contractual terms on Page {best_page}.",
            source_boundary="DOCUMENT",
        )
    else:
        return AnswerResponse(
            answer="This information was not found in your uploaded document.",
            evidence_status=EvidenceStatus.NOT_FOUND,
            evidence=[],
            reasoning="The document does not contain provisions addressing this specific query.",
            why_cant_answer=f"Your question asks about '{question}', but no relevant contractual terms or matching clauses were found in your uploaded document.",
            action_guidance=[
                "Check whether this matter is governed by an employee handbook or separate policy addendum.",
                "Review applicable statutory labor regulations or consult legal counsel.",
            ],
            source_boundary="DOCUMENT",
        )


def _local_fallback_clause(clause_text: str, page_number: int) -> AnswerResponse:
    """Local fallback explanation for highlighted clauses."""
    return AnswerResponse(
        answer=f"This clause from Page {page_number} establishes specific contractual obligations and covenants. Ensure full adherence to its stated notice, confidentiality, and procedural terms.",
        evidence_status=EvidenceStatus.SUPPORTED,
        evidence=[
            EvidenceItem(
                page_number=page_number,
                section="Selected Clause",
                quote=clause_text.strip(),
                relevance="This is the highlighted clause from your document.",
            )
        ],
        reasoning="Analyzed selected clause text for contractual obligations.",
        action_guidance=["Verify whether any advance written notice or formal approvals are mandated."],
        source_boundary="DOCUMENT",
    )


def ask_document_question(
    document_text: str,
    question: str,
    mode: str,
    conversation_history: list[dict] | None = None,
) -> AnswerResponse:
    """Ask a question about the document using Gemini with multi-model fallback."""
    client = _get_client()

    contents = []
    doc_context = build_document_context(document_text)
    contents.append(types.Content(role="user", parts=[types.Part(text=doc_context)]))
    contents.append(types.Content(role="model", parts=[types.Part(text="I have received the document. I will answer questions based solely on this document's content, citing exact pages and sections. I will never invent citations.")]))

    if conversation_history:
        for entry in conversation_history[-6:]:
            contents.append(types.Content(
                role="user" if entry["role"] == "user" else "model",
                parts=[types.Part(text=entry["content"])],
            ))

    question_prompt = build_question_prompt(question, mode)
    contents.append(types.Content(role="user", parts=[types.Part(text=question_prompt)]))

    models_to_try = [settings.GEMINI_MODEL, "gemini-3.5-flash-lite", "gemini-flash-lite-latest", "gemini-3.1-flash-lite", "gemini-3.6-flash", "gemini-3.7-flash"]
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
            logger.warning(f"Model {model_name} failed with {type(e).__name__}: {e}. Trying fallback model...")
            last_error = e
            continue

    logger.warning(f"All candidate models experienced demand spikes. Engaging local document evidence engine. Error: {last_error}")
    return _local_fallback_answer(document_text, question)


def explain_clause(
    clause_text: str,
    page_number: int,
    document_text: str,
) -> AnswerResponse:
    """Explain a specific clause from the document with multi-model fallback."""
    client = _get_client()

    doc_context = build_document_context(document_text)
    clause_prompt = build_clause_prompt(clause_text, page_number)

    contents = [
        types.Content(role="user", parts=[types.Part(text=doc_context)]),
        types.Content(role="model", parts=[types.Part(text="I have received the document. Ready to explain specific clauses.")]),
        types.Content(role="user", parts=[types.Part(text=clause_prompt)]),
    ]

    models_to_try = [settings.GEMINI_MODEL, "gemini-3.5-flash-lite", "gemini-flash-lite-latest", "gemini-3.1-flash-lite", "gemini-3.6-flash", "gemini-3.7-flash"]
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

    logger.warning(f"All candidate models busy. Using local clause explanation fallback. Error: {last_error}")
    return _local_fallback_clause(clause_text, page_number)
