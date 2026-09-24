"""PDF parsing service using PyMuPDF.

Extracts text from PDF pages with metadata for evidence tracing.
Chunks text by page paragraphs for retrieval context.
"""

import re
import fitz  # PyMuPDF
from app.models.schemas import ParsedDocument, PageContent, DocumentChunk


def parse_pdf(file_bytes: bytes, filename: str) -> ParsedDocument:
    """Parse a PDF file and extract structured text with metadata.

    Args:
        file_bytes: Raw PDF file bytes.
        filename: Original filename for reference.

    Returns:
        ParsedDocument with pages, chunks, and full text.

    Raises:
        ValueError: If the bytes are empty or not a valid PDF.
    """
    if not file_bytes:
        raise ValueError("Invalid PDF: empty file")

    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception:
        raise ValueError("Invalid PDF: could not parse file")

    if doc.page_count == 0:
        doc.close()
        raise ValueError("Invalid PDF: no pages found")

    pages: list[PageContent] = []
    chunks: list[DocumentChunk] = []
    full_text_parts: list[str] = []

    for page_idx in range(doc.page_count):
        page = doc[page_idx]
        page_number = page_idx + 1
        text = page.get_text("text").strip()

        pages.append(PageContent(page_number=page_number, text=text))
        full_text_parts.append(f"[PAGE {page_number}]\n{text}")

        # Chunk by paragraphs
        paragraphs = _split_into_chunks(text)
        for chunk_idx, para_text in enumerate(paragraphs):
            if para_text.strip():
                section_hint = _detect_section(para_text)
                chunks.append(DocumentChunk(
                    chunk_id=f"{filename}-p{page_number}-c{chunk_idx}",
                    page_number=page_number,
                    text=para_text.strip(),
                    section_hint=section_hint,
                ))

    doc.close()

    return ParsedDocument(
        filename=filename,
        total_pages=len(pages),
        pages=pages,
        chunks=chunks,
        full_text="\n\n".join(full_text_parts),
    )


def _split_into_chunks(text: str) -> list[str]:
    """Split page text into meaningful chunks (paragraphs or sections)."""
    parts = re.split(r'\n\s*\n|\n(?=\d+\.\s)|(?=Section\s+\d)', text)
    return [p for p in parts if p.strip()]


def _detect_section(text: str) -> str:
    """Attempt to detect a section number or heading from text."""
    patterns = [
        r'Section\s+([\d.]+)',
        r'Article\s+([IVXLCDM]+|\d+)',
        r'Clause\s+([\d.()a-z]+)',
        r'^(\d+\.[\d.]*)\s',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(0).strip()
    return ""
