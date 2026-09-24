"""Tests for the PDF parsing service."""

import pytest
from app.services.pdf_parser import parse_pdf


def test_parse_pdf_returns_parsed_document(sample_pdf_bytes):
    result = parse_pdf(sample_pdf_bytes, "test.pdf")
    assert result.filename == "test.pdf"
    assert len(result.pages) == 2


def test_parse_pdf_extracts_page_text(sample_pdf_bytes):
    result = parse_pdf(sample_pdf_bytes, "test.pdf")
    assert "Introduction" in result.pages[0].text
    assert result.pages[0].page_number == 1


def test_parse_pdf_extracts_second_page(sample_pdf_bytes):
    result = parse_pdf(sample_pdf_bytes, "test.pdf")
    assert "Confidentiality" in result.pages[1].text
    assert result.pages[1].page_number == 2


def test_parse_pdf_generates_chunks(sample_pdf_bytes):
    result = parse_pdf(sample_pdf_bytes, "test.pdf")
    assert len(result.chunks) > 0
    for chunk in result.chunks:
        assert chunk.page_number >= 1
        assert chunk.text.strip() != ""
        assert chunk.chunk_id != ""


def test_parse_pdf_empty_bytes_raises():
    with pytest.raises(ValueError, match="Invalid PDF"):
        parse_pdf(b"", "empty.pdf")


def test_parse_pdf_invalid_bytes_raises():
    with pytest.raises(ValueError, match="Invalid PDF"):
        parse_pdf(b"not a pdf", "bad.pdf")
