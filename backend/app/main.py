"""FastAPI application entry point for LegalTruth backend."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

app = FastAPI(
    title="LegalTruth API",
    description="Evidence-first legal document assistant backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "legaltruth-api"}


# Register routers
from app.routers import sessions, documents, chat  # noqa: E402

app.include_router(sessions.router)
app.include_router(documents.router)
app.include_router(chat.router)
