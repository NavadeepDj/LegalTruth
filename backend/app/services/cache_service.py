"""In-memory LRU and TTL query cache service.

Caches Q&A responses and clause explanations to maximize efficiency,
reduce API token consumption, and deliver sub-millisecond responses
for repeated queries.  Cache parameters are driven by ``settings``
to avoid magic numbers and enable runtime tuning.
"""

import time
import hashlib
from typing import Any
from collections import OrderedDict
from threading import Lock

from app.config import settings


class QueryCache:
    """Thread-safe LRU cache with TTL expiration.

    Attributes:
        _max_size: Maximum number of cached entries before LRU eviction.
        _ttl_seconds: Time-to-live in seconds for each cached entry.
        _cache: OrderedDict mapping hashed keys to (timestamp, value).
        _lock: Threading lock for concurrent access safety.
        _hits: Counter tracking cache hit events for observability.
        _misses: Counter tracking cache miss events for observability.
    """

    __slots__ = ("_max_size", "_ttl_seconds", "_cache", "_lock", "_hits", "_misses")

    def __init__(self, max_size: int = 500, ttl_seconds: int = 3600) -> None:
        self._max_size = max_size
        self._ttl_seconds = ttl_seconds
        self._cache: OrderedDict[str, tuple[float, Any]] = OrderedDict()
        self._lock = Lock()
        self._hits: int = 0
        self._misses: int = 0

    def _make_key(self, doc_id: str, query: str, mode: str = "") -> str:
        """Generate a deterministic SHA-256 cache key from input parameters."""
        raw = f"{doc_id}:{query.strip().lower()}:{mode.strip().lower()}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    def get(self, doc_id: str, query: str, mode: str = "") -> Any | None:
        """Retrieve a cached response if present and not expired."""
        key = self._make_key(doc_id, query, mode)
        with self._lock:
            if key not in self._cache:
                self._misses += 1
                return None

            created_at, val = self._cache[key]
            if time.time() - created_at > self._ttl_seconds:
                del self._cache[key]
                self._misses += 1
                return None

            # Move to end (most recently used)
            self._cache.move_to_end(key)
            self._hits += 1
            return val

    def set(self, doc_id: str, query: str, value: Any, mode: str = "") -> None:
        """Store a response in cache with LRU eviction and timestamp."""
        key = self._make_key(doc_id, query, mode)
        with self._lock:
            if key in self._cache:
                self._cache.move_to_end(key)
            self._cache[key] = (time.time(), value)

            if len(self._cache) > self._max_size:
                self._cache.popitem(last=False)

    def clear(self) -> None:
        """Clear all entries in the cache."""
        with self._lock:
            self._cache.clear()
            self._hits = 0
            self._misses = 0

    def size(self) -> int:
        """Return count of active entries."""
        with self._lock:
            return len(self._cache)

    def stats(self) -> dict[str, int]:
        """Return cache performance statistics for observability."""
        with self._lock:
            return {
                "size": len(self._cache),
                "hits": self._hits,
                "misses": self._misses,
                "max_size": self._max_size,
            }


# Global singleton instance using centralized configuration
query_cache = QueryCache(
    max_size=settings.CACHE_MAX_SIZE,
    ttl_seconds=settings.CACHE_TTL_SECONDS,
)
