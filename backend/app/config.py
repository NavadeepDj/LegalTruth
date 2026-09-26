"""Application configuration loaded from environment variables.

Centralizes all runtime settings for the LegalTruth backend including
Gemini API credentials, CORS origins, file limits, session TTL, and
performance tuning knobs.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Immutable application settings loaded once at module import time."""

    __slots__ = (
        "GEMINI_API_KEY",
        "GEMINI_MODEL",
        "ALLOWED_ORIGINS",
        "MAX_FILE_SIZE_MB",
        "SESSION_TTL_HOURS",
        "GEMINI_TIMEOUT_SECONDS",
        "CACHE_MAX_SIZE",
        "CACHE_TTL_SECONDS",
        "SESSION_CLEANUP_INTERVAL_SECONDS",
        "MAX_CONVERSATION_HISTORY",
        "FALLBACK_MODELS",
    )

    def __init__(self) -> None:
        self.GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
        self.GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
        self.ALLOWED_ORIGINS: list[str] = os.getenv(
            "ALLOWED_ORIGINS", "http://localhost:3000"
        ).split(",")
        self.MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "20"))
        self.SESSION_TTL_HOURS: int = int(os.getenv("SESSION_TTL_HOURS", "24"))

        # Performance tuning
        self.GEMINI_TIMEOUT_SECONDS: int = int(os.getenv("GEMINI_TIMEOUT_SECONDS", "30"))
        self.CACHE_MAX_SIZE: int = int(os.getenv("CACHE_MAX_SIZE", "500"))
        self.CACHE_TTL_SECONDS: int = int(os.getenv("CACHE_TTL_SECONDS", "3600"))
        self.SESSION_CLEANUP_INTERVAL_SECONDS: int = int(
            os.getenv("SESSION_CLEANUP_INTERVAL_SECONDS", "900")
        )
        self.MAX_CONVERSATION_HISTORY: int = int(
            os.getenv("MAX_CONVERSATION_HISTORY", "6")
        )

        # Model fallback chain (deduplicated at init, not per-request)
        primary = self.GEMINI_MODEL
        fallbacks = [
            "gemini-3.5-flash-lite",
            "gemini-flash-lite-latest",
            "gemini-3.1-flash-lite",
            "gemini-3.6-flash",
            "gemini-3.7-flash",
        ]
        seen: set[str] = set()
        chain: list[str] = []
        for m in [primary] + fallbacks:
            if m and m not in seen:
                seen.add(m)
                chain.append(m)
        self.FALLBACK_MODELS: tuple[str, ...] = tuple(chain)


settings = Settings()
