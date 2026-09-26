"""In-memory LRU and TTL query cache service.

Caches Q&A responses and clause explanations to maximize efficiency,
reduce API token consumption, and deliver sub-millisecond responses for repeated queries.
"""

import time
import hashlib
from typing import Any
from collections import OrderedDict
from threading import Lock


class QueryCache:
    """Thread-safe LRU cache with TTL expiration."""

    def __init__(self, max_size: int = 500, ttl_seconds: int = 3600):
        self._max_size = max_size
        self._ttl_seconds = ttl_seconds
        self._cache: OrderedDict[str, tuple[float, Any]] = OrderedDict()
        self._lock = Lock()

    def _make_key(self, doc_id: str, query: str, mode: str = "") -> str:
        raw = f"{doc_id}:{query.strip().lower()}:{mode.strip().lower()}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    def get(self, doc_id: str, query: str, mode: str = "") -> Any | None:
        """Retrieve a cached response if present and not expired."""
        key = self._make_key(doc_id, query, mode)
        with self._lock:
            if key not in self._cache:
                return None

            created_at, val = self._cache[key]
            if time.time() - created_at > self._ttl_seconds:
                del self._cache[key]
                return None

            # Move to end (most recently used)
            self._cache.move_to_end(key)
            return val

    def set(self, doc_id: str, query: str, value: Any, mode: str = "") -> None:
        """Store a response in cache with LRU eviction and timestamp."""
        key = self._make_key(doc_id, query, mode)
        with self._lock:
            if key in self._cache:
                self._cache.move_to_end(key)
            self._cache[key] = (time.time(), value)

            if len(self._cache) > self._max_size:
                # Evict oldest item
                self._cache.popitem(last=False)

    def clear(self) -> None:
        """Clear all entries in the cache."""
        with self._lock:
            self._cache.clear()

    def size(self) -> int:
        """Return count of active entries."""
        with self._lock:
            return len(self._cache)


# Global singleton instance
query_cache = QueryCache()
