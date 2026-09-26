"""Tests for query caching and sub-millisecond cache hits."""

import time
from app.services.cache_service import QueryCache
from app.models.schemas import AnswerResponse, EvidenceStatus, EvidenceItem


def test_query_cache_set_and_get():
    """Verify that cached answers are returned accurately."""
    cache = QueryCache(max_size=10, ttl_seconds=3600)
    response = AnswerResponse(
        answer="Notice period is 90 days.",
        evidence_status=EvidenceStatus.SUPPORTED,
        evidence=[EvidenceItem(page_number=1, quote="90 days notice", relevance="test")],
    )

    # Miss
    assert cache.get("doc1", "notice period?", "document_only") is None

    # Set
    cache.set("doc1", "notice period?", response, "document_only")

    # Hit
    cached = cache.get("doc1", "notice period?", "document_only")
    assert cached is not None
    assert cached.answer == "Notice period is 90 days."


def test_query_cache_ttl_expiration():
    """Verify that entries expire after ttl_seconds."""
    cache = QueryCache(max_size=10, ttl_seconds=1)  # 1 second TTL
    response = AnswerResponse(
        answer="Expiring answer",
        evidence_status=EvidenceStatus.SUPPORTED,
    )

    cache.set("doc1", "test?", response)
    assert cache.get("doc1", "test?") is not None

    time.sleep(1.1)
    assert cache.get("doc1", "test?") is None


def test_query_cache_lru_eviction():
    """Verify that oldest entries are evicted when max_size is exceeded."""
    cache = QueryCache(max_size=2, ttl_seconds=3600)
    r1 = AnswerResponse(answer="A1", evidence_status=EvidenceStatus.SUPPORTED)
    r2 = AnswerResponse(answer="A2", evidence_status=EvidenceStatus.SUPPORTED)
    r3 = AnswerResponse(answer="A3", evidence_status=EvidenceStatus.SUPPORTED)

    cache.set("doc1", "q1", r1)
    cache.set("doc1", "q2", r2)
    assert cache.size() == 2

    # Adding a 3rd should evict q1 (oldest)
    cache.set("doc1", "q3", r3)
    assert cache.size() == 2
    assert cache.get("doc1", "q1") is None
    assert cache.get("doc1", "q2") is not None
    assert cache.get("doc1", "q3") is not None
