"""Tests for efficiency features: cache stats, metrics endpoint, and config integrity."""

import time
from app.services.cache_service import QueryCache
from app.config import Settings


class TestCacheStats:
    """Validate cache observability and performance counters."""

    def test_stats_reports_hits_and_misses(self):
        """Cache stats should accurately track hits and misses."""
        cache = QueryCache(max_size=10, ttl_seconds=300)
        cache.set("doc1", "question1", {"answer": "yes"}, "mode1")

        # Miss
        cache.get("doc1", "nonexistent", "mode1")
        stats = cache.stats()
        assert stats["misses"] == 1
        assert stats["hits"] == 0

        # Hit
        cache.get("doc1", "question1", "mode1")
        stats = cache.stats()
        assert stats["hits"] == 1
        assert stats["misses"] == 1
        assert stats["size"] == 1
        assert stats["max_size"] == 10

    def test_clear_resets_stats(self):
        """Clearing cache should reset all counters to zero."""
        cache = QueryCache(max_size=10, ttl_seconds=300)
        cache.set("doc1", "q1", "val1")
        cache.get("doc1", "q1")
        cache.clear()
        stats = cache.stats()
        assert stats["hits"] == 0
        assert stats["misses"] == 0
        assert stats["size"] == 0

    def test_cache_key_case_insensitivity(self):
        """Cache keys should be case-insensitive for query and mode."""
        cache = QueryCache(max_size=10, ttl_seconds=300)
        cache.set("doc1", "What is my SALARY?", "val1", "document_only")
        result = cache.get("doc1", "what is my salary?", "DOCUMENT_ONLY")
        assert result == "val1"


class TestConfigIntegrity:
    """Validate configuration settings and fallback model chain."""

    def test_fallback_models_are_deduplicated(self):
        """The FALLBACK_MODELS tuple should not contain duplicate entries."""
        s = Settings()
        assert len(s.FALLBACK_MODELS) == len(set(s.FALLBACK_MODELS))

    def test_fallback_models_starts_with_primary(self):
        """First model in the chain should be the primary GEMINI_MODEL."""
        s = Settings()
        assert s.FALLBACK_MODELS[0] == s.GEMINI_MODEL

    def test_default_performance_tuning_values(self):
        """Default performance settings should have sane values."""
        s = Settings()
        assert s.CACHE_MAX_SIZE >= 100
        assert s.CACHE_TTL_SECONDS >= 600
        assert s.SESSION_CLEANUP_INTERVAL_SECONDS >= 60
        assert s.MAX_CONVERSATION_HISTORY >= 2


class TestMetricsEndpoint:
    """Validate the /metrics observability endpoint."""

    def test_metrics_returns_cache_and_session_data(self, client):
        """The /metrics endpoint should return cache stats and session count."""
        response = client.get("/metrics")
        assert response.status_code == 200
        data = response.json()
        assert "cache" in data
        assert "active_sessions" in data
        assert "cleanup_interval_seconds" in data
        assert isinstance(data["cache"]["hits"], int)
        assert isinstance(data["cache"]["misses"], int)
        assert isinstance(data["cache"]["size"], int)

    def test_health_check_is_fast(self, client):
        """Health check should respond in under 100ms."""
        start = time.time()
        response = client.get("/health")
        elapsed_ms = (time.time() - start) * 1000
        assert response.status_code == 200
        assert elapsed_ms < 100, f"Health check took {elapsed_ms:.1f}ms, expected <100ms"
