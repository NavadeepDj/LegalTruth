"""Tests for evidence orchestration service."""

from unittest.mock import patch
from app.models.schemas import AnswerResponse, EvidenceStatus, EvidenceItem
from app.services.evidence_service import answer_question, answer_clause


@patch("app.services.evidence_service.ask_document_question")
def test_answer_question_document_found(mock_ask):
    mock_ask.return_value = AnswerResponse(
        answer="Notice period is 90 days.",
        evidence_status=EvidenceStatus.SUPPORTED,
        evidence=[EvidenceItem(page_number=1, section="Section 7", quote="90 days notice", relevance="states notice")],
        source_boundary="DOCUMENT",
    )

    resp = answer_question("sample text", "What is notice period?", "document_only")
    assert resp.evidence_status == EvidenceStatus.SUPPORTED
    assert resp.source_boundary == "DOCUMENT"
    assert len(resp.evidence) == 1


@patch("app.services.evidence_service.search_external_sources")
@patch("app.services.evidence_service.ask_document_question")
def test_answer_question_not_found_fallback(mock_ask, mock_search):
    mock_ask.return_value = AnswerResponse(
        answer="Not found in document.",
        evidence_status=EvidenceStatus.NOT_FOUND,
        why_cant_answer="Document lacks salary withholding rules.",
        source_boundary="DOCUMENT",
    )
    mock_search.return_value = {
        "answer": "Under state labor code, salary deductions require written consent.",
        "web_sources": [{"title": "Labor Code", "url": "https://labor.gov/rules", "snippet": "rules", "source_type": "government"}],
        "action_guidance": ["Consult labor department website."],
    }

    resp = answer_question("sample text", "Can employer withhold salary?", "document_and_web")
    assert resp.evidence_status == EvidenceStatus.NOT_FOUND
    assert resp.source_boundary == "BOTH"
    assert len(resp.web_sources) == 1
    assert "External guidance:" in resp.answer


@patch("app.services.evidence_service.explain_clause")
def test_answer_clause(mock_explain):
    mock_explain.return_value = AnswerResponse(
        answer="This clause creates a confidentiality obligation.",
        evidence_status=EvidenceStatus.SUPPORTED,
        evidence=[EvidenceItem(page_number=2, quote="Information is confidential")],
        source_boundary="DOCUMENT",
    )

    resp = answer_clause("Information is confidential", 2, "full doc")
    assert resp.evidence_status == EvidenceStatus.SUPPORTED
    assert "confidentiality" in resp.answer.lower()


def test_local_fallback_job_title_concise():
    """Verify that local fallback extracts concise answers without raw paragraph dumping."""
    from app.services.gemini_service import _local_fallback_answer

    offer_letter_text = (
        "--- PAGE 1 ---\n"
        "Ongole 523001\n"
        "Dear Maruthi Navadeep Marella,\n"
        "We are pleased to extend an Offer to join Accenture Solutions Private Limited:\n"
        "Management Level - 12\n"
        "Job Title - Packaged App Development Associate\n"
        "Job Family Group - Software Engineering\n"
        "All employees are expected to work from their assigned office."
    )

    resp = _local_fallback_answer(offer_letter_text, "my job title?")
    assert resp.evidence_status == EvidenceStatus.SUPPORTED
    assert resp.answer == "Your job title is Packaged App Development Associate."
    assert len(resp.evidence) == 1
    assert resp.evidence[0].quote == "Job Title - Packaged App Development Associate"
    assert "Ongole" not in resp.answer
    assert "Dear" not in resp.answer


def test_local_fallback_fixed_pay_picks_amount_not_faqs():
    """Verify that 'what is my fixed pay?' extracts the actual compensation amount and rejects FAQ references."""
    from app.services.gemini_service import _local_fallback_answer

    doc_text = (
        "[PAGE 1]\n"
        "Management Level - 12\n"
        "Job Title - Packaged App Development Associate\n\n"
        "[PAGE 2]\n"
        "Annexure 1: Compensation Details\n"
        "Annual Fixed Compensation: INR 3,83,000\n"
        "Annual Total Cash: INR 4,50,000\n\n"
        "[PAGE 4]\n"
        "Allsec Payroll FAQs which elaborates the guidelines applicable to structure your Fixed Compensation.\n"
    )

    resp = _local_fallback_answer(doc_text, "what is my fixed pay?")
    assert resp.evidence_status == EvidenceStatus.SUPPORTED
    assert "3,83,000" in resp.answer
    assert "Your annual fixed compensation is INR 3,83,000." in resp.answer
    assert resp.evidence[0].page_number == 2
    assert "FAQs" not in resp.answer
    assert "Allsec" not in resp.answer


