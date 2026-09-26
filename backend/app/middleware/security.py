"""Security headers middleware for LegalTruth.

Applies OWASP recommended security headers to all responses to protect against
clickjacking, MIME sniffing, XSS, and unauthorized framing.
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Enforces essential security headers across all HTTP responses."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response: Response = await call_next(request)

        # Standard OWASP security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"

        # Allow trusted frontend origins to frame PDF documents in viewer, deny framing for all other API endpoints
        if "/pdf" in request.url.path:
            response.headers["Content-Security-Policy"] = "frame-ancestors 'self' http://localhost:3000 http://127.0.0.1:3000 https://*.vercel.app"
        else:
            response.headers["X-Frame-Options"] = "DENY"
            response.headers["Content-Security-Policy"] = "frame-ancestors 'none'"

        return response
