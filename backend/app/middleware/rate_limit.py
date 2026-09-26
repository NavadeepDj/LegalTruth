"""Rate limiting middleware for LegalTruth.

Protects against denial of service (DoS), brute force, and API quota exhaustion
using an in-memory sliding window algorithm per client IP.
"""

import time
from collections import defaultdict
from threading import Lock
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """Sliding-window IP rate limiter."""

    def __init__(self, app, max_chat_requests_per_minute: int = 60, max_uploads_per_minute: int = 15):
        super().__init__(app)
        self.max_chat_rpm = max_chat_requests_per_minute
        self.max_upload_rpm = max_uploads_per_minute
        self._history = defaultdict(list)
        self._lock = Lock()

    def _get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    async def dispatch(self, request: Request, call_next) -> Response:
        path = request.url.path

        # Determine limit by route
        limit = None
        if "/api/chat" in path and request.method == "POST":
            limit = self.max_chat_rpm
        elif "/api/documents/upload" in path and request.method == "POST":
            limit = self.max_upload_rpm

        if limit is not None:
            client_ip = self._get_client_ip(request)
            key = f"{client_ip}:{path}"
            now = time.time()

            with self._lock:
                window_start = now - 60.0
                # Filter timestamps in the current 60s window
                self._history[key] = [t for t in self._history[key] if t > window_start]

                if len(self._history[key]) >= limit:
                    return JSONResponse(
                        status_code=429,
                        content={"detail": "Too many requests. Please slow down."},
                        headers={"Retry-After": "60"},
                    )

                self._history[key].append(now)

        return await call_next(request)
