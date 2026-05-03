"""FastAPI backend for the Election Process Education Assistant."""

from __future__ import annotations

import base64
import logging
import os
import pathlib

import bleach
import httpx
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

# --- Google Cloud Translation client ---
try:
    from google.api_core.client_options import ClientOptions as _ClientOptions
    from google.cloud import translate_v2 as _cloud_translate
    _translate_client = _cloud_translate.Client(
        client_options=_ClientOptions(api_key=os.getenv("GOOGLE_CLOUD_API_KEY") or _api_key)
    )
    _translate_available = True
    logger.info("Google Cloud Translation client initialised.")
except Exception as _e:
    _translate_client = None
    _translate_available = False
    logger.warning("Google Cloud Translation not available: %s", _e)

# --- Google Cloud Text-to-Speech client ---
try:
    from google.cloud import texttospeech as _texttospeech
    _tts_client = _texttospeech.TextToSpeechClient(
        client_options=_ClientOptions(api_key=os.getenv("GOOGLE_CLOUD_API_KEY") or _api_key)
    )
    _tts_available = True
    logger.info("Google Cloud Text-to-Speech client initialised.")
except Exception as _e:
    _tts_client = None
    _tts_available = False
    logger.warning("Google Cloud Text-to-Speech not available: %s", _e)

from rag.embeddings import build_index
from rag.retriever import retrieve_and_answer


STATIC_DIR = pathlib.Path(__file__).resolve().parent.parent / "frontend" / "dist"

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Election Process Education Assistant",
    version="1.0.0",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
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
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    response.headers["Cross-Origin-Resource-Policy"] = "same-origin"
    response.headers["X-Permitted-Cross-Domain-Policies"] = "none"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' https://www.googletagmanager.com; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https://www.google-analytics.com https://maps.gstatic.com https://maps.googleapis.com https://i.ytimg.com; "
        "font-src 'self'; "
        "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://maps.googleapis.com; "
        "frame-src https://www.google.com https://maps.google.com https://www.youtube.com; "
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

VALID_COUNTRIES: set[str] = {
    "india", "usa", "indonesia", "brazil", "pakistan",
    "nigeria", "bangladesh", "japan", "mexico", "philippines",
}


class AskRequest(BaseModel):
    question: str
    country: str = "india"

    @field_validator("country")
    @classmethod
    def validate_country(cls, v: str) -> str:
        v = v.strip().lower()
        if v not in VALID_COUNTRIES:
            raise ValueError(f"Unsupported country: {v}")
        return v

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


# --- Translation models ---
MAX_TRANSLATE_LENGTH = 2000

SUPPORTED_LANGUAGES: set[str] = {
    "hi", "id", "pt", "ur", "yo", "bn", "ja", "es", "fil", "en",
}


class TranslateRequest(BaseModel):
    text: str
    target_language: str  # BCP-47 code, e.g. "hi", "id"

    @field_validator("text")
    @classmethod
    def check_text(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Text cannot be empty.")
        if len(v) > MAX_TRANSLATE_LENGTH:
            raise ValueError(f"Text must be under {MAX_TRANSLATE_LENGTH} characters.")
        return bleach.clean(v, tags=[], strip=True)

    @field_validator("target_language")
    @classmethod
    def check_language(cls, v: str) -> str:
        v = v.strip().lower()
        if v not in SUPPORTED_LANGUAGES:
            raise ValueError(f"Unsupported language code: {v}")
        return v


class TranslateResponse(BaseModel):
    translated_text: str
    source_language: str
    target_language: str


# --- TTS models ---
MAX_TTS_LENGTH = 1000

SUPPORTED_TTS_LANGUAGES: set[str] = {
    "hi-IN", "id-ID", "pt-BR", "ur-PK", "bn-BD", "ja-JP", "es-MX",
    "fil-PH", "en-US", "en-GB", "yo-NG",
}


class TTSRequest(BaseModel):
    text: str
    language_code: str  # BCP-47 with region, e.g. "hi-IN"

    @field_validator("text")
    @classmethod
    def check_tts_text(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Text cannot be empty.")
        if len(v) > MAX_TTS_LENGTH:
            raise ValueError(f"Text must be under {MAX_TTS_LENGTH} characters.")
        return bleach.clean(v, tags=[], strip=True)

    @field_validator("language_code")
    @classmethod
    def check_tts_language(cls, v: str) -> str:
        if v not in SUPPORTED_TTS_LANGUAGES:
            raise ValueError(f"Unsupported TTS language code: {v}")
        return v


class TTSResponse(BaseModel):
    audio_base64: str  # base64-encoded MP3
    language_code: str


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


def _check_api_key() -> None:
    """Verify the Google API key is available."""
    api_key = os.getenv("GOOGLE_API_KEY", "")
    if not api_key or api_key == "your-api-key-here":
        raise HTTPException(status_code=503, detail="Service temporarily unavailable. Please try again later.")


_INDEX_ADMIN_TOKEN = os.getenv("INDEX_ADMIN_TOKEN", "")


@app.post("/index")
@limiter.limit("5/minute")
def index_knowledge(request: Request) -> dict[str, int]:
    """Rebuild the vector index from knowledge base files."""
    _check_api_key()
    if _INDEX_ADMIN_TOKEN:
        auth = request.headers.get("X-Admin-Token", "")
        if auth != _INDEX_ADMIN_TOKEN:
            raise HTTPException(status_code=401, detail="Unauthorized.")
    count = build_index()
    return {"indexed_chunks": count}


@app.post("/ask", response_model=AskResponse)
@limiter.limit("20/minute")
async def ask(req: AskRequest, request: Request) -> AskResponse:
    """Answer a question about the election process for the selected country."""
    _check_api_key()
    result = retrieve_and_answer(req.question, country=req.country)
    return AskResponse(**result)


@app.post("/translate", response_model=TranslateResponse)
@limiter.limit("30/minute")
def translate(req: TranslateRequest, request: Request) -> TranslateResponse:
    """Translate text using Google Cloud Translation API."""
    if not _translate_available or _translate_client is None:
        raise HTTPException(
            status_code=503,
            detail="Translation service is temporarily unavailable.",
        )
    try:
        result = _translate_client.translate(
            req.text,
            target_language=req.target_language,
            source_language="en",
            format_="text",
        )
        return TranslateResponse(
            translated_text=result["translatedText"],
            source_language=result.get("detectedSourceLanguage", "en"),
            target_language=req.target_language,
        )
    except Exception as exc:
        logger.error("Translation error: %s", exc)
        raise HTTPException(status_code=502, detail="Translation failed. Please try again.") from exc


@app.post("/tts", response_model=TTSResponse)
@limiter.limit("15/minute")
def text_to_speech(req: TTSRequest, request: Request) -> TTSResponse:
    """Convert text to speech using Google Cloud Text-to-Speech API."""
    if not _tts_available or _tts_client is None:
        raise HTTPException(
            status_code=503,
            detail="Text-to-Speech service is temporarily unavailable.",
        )
    try:
        synthesis_input = _texttospeech.SynthesisInput(text=req.text)
        voice = _texttospeech.VoiceSelectionParams(
            language_code=req.language_code,
            ssml_gender=_texttospeech.SsmlVoiceGender.NEUTRAL,
        )
        audio_config = _texttospeech.AudioConfig(
            audio_encoding=_texttospeech.AudioEncoding.MP3,
            speaking_rate=0.9,
        )
        response = _tts_client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config,
        )
        audio_b64 = base64.b64encode(response.audio_content).decode("utf-8")
        return TTSResponse(audio_base64=audio_b64, language_code=req.language_code)
    except Exception as exc:
        logger.error("TTS error: %s", exc)
        raise HTTPException(status_code=502, detail="Text-to-Speech failed. Please try again.") from exc


# --- YouTube Data API v3 ---
_YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY") or os.getenv("GOOGLE_CLOUD_API_KEY") or ""
_YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
_ALLOWED_THUMB_PREFIXES = ("https://i.ytimg.com/", "https://img.youtube.com/")

YOUTUBE_COUNTRY_QUERIES: dict[str, str] = {
    "india": "India election process how elections work",
    "usa": "United States election process how presidential elections work",
    "indonesia": "Indonesia election process pemilu",
    "brazil": "Brazil election process eleições como funciona",
    "pakistan": "Pakistan election process how elections work",
    "nigeria": "Nigeria election process INEC how voting works",
    "bangladesh": "Bangladesh election process how elections work",
    "japan": "Japan election process how elections work 選挙",
    "mexico": "Mexico election process INE como funcionan las elecciones",
    "philippines": "Philippines election process COMELEC how voting works",
}


class YouTubeVideo(BaseModel):
    video_id: str
    title: str
    channel: str
    thumbnail: str


class YouTubeResponse(BaseModel):
    videos: list[YouTubeVideo]


@app.get("/youtube/{country}", response_model=YouTubeResponse)
@limiter.limit("30/minute")
async def youtube_videos(country: str, request: Request) -> YouTubeResponse:
    """Fetch election explainer videos from YouTube Data API v3."""
    if country not in YOUTUBE_COUNTRY_QUERIES:
        raise HTTPException(status_code=404, detail="Country not supported.")
    if not _YOUTUBE_API_KEY:
        raise HTTPException(status_code=503, detail="YouTube service is temporarily unavailable.")
    query = YOUTUBE_COUNTRY_QUERIES[country]
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                _YOUTUBE_SEARCH_URL,
                params={
                    "part": "snippet",
                    "q": query,
                    "type": "video",
                    "maxResults": 4,
                    "relevanceLanguage": "en",
                    "safeSearch": "strict",
                    "key": _YOUTUBE_API_KEY,
                },
            )
            resp.raise_for_status()
            data = resp.json()
        videos = [
            YouTubeVideo(
                video_id=item["id"]["videoId"],
                title=bleach.clean(item["snippet"]["title"], tags=[], strip=True),
                channel=bleach.clean(item["snippet"]["channelTitle"], tags=[], strip=True),
                thumbnail=(
                    thumb_url
                    if (thumb_url := item["snippet"]["thumbnails"].get("medium", {}).get("url", ""))
                    and any(thumb_url.startswith(p) for p in _ALLOWED_THUMB_PREFIXES)
                    else ""
                ),
            )
            for item in data.get("items", [])
            if (
                (vid := item.get("id", {}).get("videoId"))
                and len(vid) == 11
                and vid.replace("-", "").replace("_", "").isalnum()
            )
        ]
        return YouTubeResponse(videos=videos)
    except Exception as exc:
        logger.error("YouTube API error: %s", exc)
        raise HTTPException(status_code=502, detail="Could not fetch videos. Please try again.") from exc


# --- Serve frontend static files (production) ---
if STATIC_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=str(STATIC_DIR / "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str) -> FileResponse:
        """Serve the SPA index.html for all non-API routes."""
        # Security: prevent path traversal — resolve and check path is within STATIC_DIR
        try:
            file_path = (STATIC_DIR / full_path).resolve()
            if not file_path.is_relative_to(STATIC_DIR.resolve()):
                raise HTTPException(status_code=400, detail="Invalid path.")
        except (ValueError, OSError):
            raise HTTPException(status_code=400, detail="Invalid path.")
        if full_path and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(STATIC_DIR / "index.html")
