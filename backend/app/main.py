"""FastAPI application entry point for LegalTruth backend."""

import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware
from app.config import settings
from app.middleware.security import SecurityHeadersMiddleware
from app.middleware.rate_limit import RateLimiterMiddleware
from app.models.session_store import store

logger = logging.getLogger("legaltruth")


async def _session_cleanup_worker():
    """Background task to periodically evict expired sessions and free memory."""
    while True:
        try:
            await asyncio.sleep(900)  # Run every 15 minutes
            purged = store.cleanup_expired_sessions(settings.SESSION_TTL_HOURS)
            if purged > 0:
                logger.info(f"Purged {purged} expired sessions from memory.")
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.warning(f"Error in session cleanup worker: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown background tasks."""
    cleanup_task = asyncio.create_task(_session_cleanup_worker())
    try:
        yield
    finally:
        cleanup_task.cancel()
        try:
            await cleanup_task
        except asyncio.CancelledError:
            pass


app = FastAPI(
    title="LegalTruth API",
    description="Evidence-first legal document assistant backend",
    version="1.0.0",
    lifespan=lifespan,
)

# 1. Security Headers Middleware (OWASP protection)
app.add_middleware(SecurityHeadersMiddleware)

# 2. Rate Limiting Middleware (DoS and abuse prevention)
app.add_middleware(RateLimiterMiddleware, max_chat_requests_per_minute=60, max_uploads_per_minute=15)

# 3. GZip Compression Middleware (bandwidth and latency optimization)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# 4. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler to sanitize error messages and prevent data/path leaks."""
    logger.error(f"Unhandled error processing {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again."},
    )


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "legaltruth-api"}


# Register routers
from app.routers import sessions, documents, chat  # noqa: E402

app.include_router(sessions.router)
app.include_router(documents.router)
app.include_router(chat.router)
