"""Pydantic models for LegalTruth API."""

from pydantic import BaseModel, Field
from enum import Enum


class PageContent(BaseModel):
    """Extracted text content from a single PDF page."""
    page_number: int
    text: str


class DocumentChunk(BaseModel):
    """A chunk of document text with location metadata."""
    chunk_id: str
    page_number: int
    text: str
    section_hint: str = ""


class ParsedDocument(BaseModel):
    """Result of parsing a PDF document."""
    filename: str
    total_pages: int
    pages: list[PageContent]
    chunks: list[DocumentChunk]
    full_text: str


class EvidenceStatus(str, Enum):
    SUPPORTED = "SUPPORTED"
    NOT_FOUND = "NOT_FOUND"
    PARTIAL = "PARTIAL"


class EvidenceItem(BaseModel):
    """A single piece of evidence supporting a claim."""
    page_number: int
    section: str = ""
    quote: str
    relevance: str = ""


class WebSource(BaseModel):
    """An external web source used in fallback."""
    title: str
    url: str
    snippet: str
    source_type: str = "web"


class AnswerResponse(BaseModel):
    """Complete response to a user question."""
    answer: str
    evidence_status: EvidenceStatus
    evidence: list[EvidenceItem] = Field(default_factory=list)
    reasoning: str = ""
    web_sources: list[WebSource] = Field(default_factory=list)
    source_boundary: str = ""
    why_cant_answer: str = ""
    action_guidance: list[str] = Field(default_factory=list)
    disclaimer: str = "This is AI-generated analysis, not legal advice. Consult a qualified legal professional for decisions."


class QuestionRequest(BaseModel):
    """User question request."""
    question: str = Field(..., min_length=1, max_length=2000, description="The legal question to answer")
    mode: str = Field(default="document_and_web", pattern="^(document_only|document_and_web)$")
    session_id: str = Field(..., min_length=1, max_length=128)
    document_id: str = Field(..., min_length=1, max_length=128)


class ClauseRequest(BaseModel):
    """Request to explain a specific clause."""
    clause_text: str = Field(..., min_length=1, max_length=10000, description="Highlighted clause text")
    page_number: int = Field(..., ge=1, le=10000, description="Page number of the clause")
    session_id: str = Field(..., min_length=1, max_length=128)
    document_id: str = Field(..., min_length=1, max_length=128)


class UploadResponse(BaseModel):
    """Response after uploading a document."""
    document_id: str
    filename: str
    total_pages: int
    status: str = "processed"


class SessionResponse(BaseModel):
    """Response for session creation."""
    session_id: str
