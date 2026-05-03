"""FastAPI backend for the Indian Election Process Education Assistant."""

from __future__ import annotations

import logging
import os
import pathlib
import re

import bleach
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, field_validator
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

load_dotenv()

# --- Logging ---
try:
    import google.cloud.logging as cloud_logging
    cloud_client = cloud_logging.Client()
    cloud_client.setup_logging()
    logger = logging.getLogger(__name__)
    logger.info("Google Cloud Logging initialised.")
except Exception:
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    logger.info("Using standard logging (Google Cloud Logging not available).")

# --- Startup environment validation ---
_api_key = os.getenv("GOOGLE_API_KEY", "")
if not _api_key or _api_key == "your-api-key-here":
    logger.warning("GOOGLE_API_KEY is not configured. /ask and /index endpoints will return 503.")

from rag.embeddings import build_index
from rag.retriever import retrieve_and_answer

STATIC_DIR = pathlib.Path(__file__).resolve().parent.parent / "frontend" / "dist"

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Indian Election Process Education Assistant",
    version="1.0.0",
)
app.state.limiter = limiter
app.add_middleware(GZipMiddleware, minimum_size=500)


# --- Security: rate limit error handler ---
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429, content={"detail": "Too many requests. Please try again later."})


# --- Security: CSP and security headers ---
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' https://www.googletagmanager.com; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https://www.google-analytics.com; "
        "font-src 'self'; "
        "connect-src 'self' https://www.google-analytics.com https://analytics.google.com; "
        "frame-ancestors 'none'"
    )
    # Cache-Control for static assets
    if request.url.path.startswith("/assets/"):
        response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


# --- Security: input validation ---
MAX_QUESTION_LENGTH = 500


class AskRequest(BaseModel):
    question: str
    country: str = "india"

    @field_validator("question")
    @classmethod
    def sanitize_question(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Question cannot be empty.")
        if len(v) > MAX_QUESTION_LENGTH:
            raise ValueError(f"Question must be under {MAX_QUESTION_LENGTH} characters.")
        # Strip HTML/script tags
        v = bleach.clean(v, tags=[], strip=True)
        return v


class AskResponse(BaseModel):
    answer: str
    sources: list[str]


@app.get("/health")
def health():
    return {"status": "ok"}


def _check_api_key():
    """Verify the Google API key is available."""
    api_key = os.getenv("GOOGLE_API_KEY", "")
    if not api_key or api_key == "your-api-key-here":
        raise HTTPException(status_code=503, detail="Service temporarily unavailable. Please try again later.")


@app.post("/index")
@limiter.limit("5/minute")
def index_knowledge(request: Request):
    """Rebuild the vector index from knowledge base files."""
    _check_api_key()
    count = build_index()
    return {"indexed_chunks": count}


@app.post("/ask", response_model=AskResponse)
@limiter.limit("20/minute")
def ask(req: AskRequest, request: Request):
    """Answer a question about the Indian election process."""
    _check_api_key()
    result = retrieve_and_answer(req.question, country=req.country)
    return AskResponse(**result)


# --- Serve frontend static files (production) ---
if STATIC_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=str(STATIC_DIR / "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        """Serve the SPA index.html for all non-API routes."""
        # Security: prevent path traversal
        safe_path = pathlib.Path(full_path)
        if ".." in safe_path.parts:
            raise HTTPException(status_code=400, detail="Invalid path.")
        file_path = STATIC_DIR / safe_path
        if full_path and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(STATIC_DIR / "index.html")
