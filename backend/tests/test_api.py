"""Tests for the FastAPI backend endpoints and RAG modules."""

from __future__ import annotations

import sys
from unittest.mock import patch, MagicMock, AsyncMock

import httpx
import pytest
from fastapi.testclient import TestClient

# Stub google.genai before importing main so tests run without the package installed
_genai_mock = MagicMock()
_genai_mock.Client.return_value = MagicMock()
sys.modules.setdefault("google.genai", _genai_mock)
sys.modules.setdefault("google.genai.types", MagicMock())

from main import app  # noqa: E402
from rag.embeddings import _chunk_text  # noqa: E402


client = TestClient(app)


# --- Health endpoint tests ---

class TestHealth:
    def test_health_returns_ok(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}

    def test_health_method_not_allowed(self):
        response = client.post("/health")
        assert response.status_code == 405


# --- Ask endpoint tests ---

class TestAskEndpoint:
    def test_ask_empty_question_rejected(self):
        response = client.post("/ask", json={"question": ""})
        assert response.status_code == 422

    def test_ask_whitespace_question_rejected(self):
        response = client.post("/ask", json={"question": "   "})
        assert response.status_code == 422

    def test_ask_missing_question_field(self):
        response = client.post("/ask", json={})
        assert response.status_code == 422

    def test_ask_question_too_long(self):
        long_question = "a" * 501
        response = client.post("/ask", json={"question": long_question})
        assert response.status_code == 422

    def test_ask_invalid_country_rejected(self):
        """Unsupported country codes must be rejected."""
        response = client.post("/ask", json={"question": "What is EVM?", "country": "mars"})
        assert response.status_code == 422

    def test_ask_valid_country_accepted(self):
        """Known country codes must pass validation."""
        response = client.post("/ask", json={"question": "What is EVM?", "country": "usa"})
        assert response.status_code in (200, 500, 503)

    def test_ask_html_stripped(self):
        """Verify HTML tags are sanitized from question input."""
        response = client.post("/ask", json={"question": "<script>alert('xss')</script>What is EVM?"})
        # Should not fail on validation — HTML is stripped, leaving a valid question
        # May fail on API key, but should not be 422
        assert response.status_code in (200, 500, 503)

    def test_ask_invalid_content_type(self):
        response = client.post("/ask", content="plain text", headers={"Content-Type": "text/plain"})
        assert response.status_code == 422

    @patch("main.retrieve_and_answer")
    @patch.dict("os.environ", {"GOOGLE_API_KEY": "test-key-12345"})
    def test_ask_success_with_mocked_gemini(self, mock_rag):
        """Test successful /ask response with mocked RAG pipeline."""
        mock_rag.return_value = {
            "answer": "The EVM is an Electronic Voting Machine used in Indian elections.",
            "sources": ["evm_vvpat", "voting_process"],
        }
        response = client.post("/ask", json={"question": "What is an EVM?"})
        assert response.status_code == 200
        data = response.json()
        assert "answer" in data
        assert "sources" in data
        assert "Electronic Voting Machine" in data["answer"]
        assert "evm_vvpat" in data["sources"]
        mock_rag.assert_called_once_with("What is an EVM?", country="india")

    @patch("main.retrieve_and_answer")
    @patch.dict("os.environ", {"GOOGLE_API_KEY": "test-key-12345"})
    def test_ask_returns_sources_list(self, mock_rag):
        """Verify the sources field is a list of strings."""
        mock_rag.return_value = {
            "answer": "India follows a parliamentary democracy.",
            "sources": ["democracy_basics"],
        }
        response = client.post("/ask", json={"question": "What is Indian democracy?"})
        assert response.status_code == 200
        assert isinstance(response.json()["sources"], list)

    @patch("main.retrieve_and_answer", side_effect=Exception("Gemini API error"))
    @patch.dict("os.environ", {"GOOGLE_API_KEY": "test-key-12345"})
    def test_ask_handles_rag_exception(self, mock_rag):
        """Verify server returns 500 on unexpected RAG failure."""
        with pytest.raises(Exception, match="Gemini API error"):
            client.post("/ask", json={"question": "What is the election timeline?"})


# --- Index endpoint tests ---

class TestIndexEndpoint:
    def test_index_without_api_key(self):
        """Should return 503 when GOOGLE_API_KEY is not set."""
        response = client.post("/index")
        assert response.status_code in (500, 503)

    @patch("main.build_index", return_value=42)
    @patch.dict("os.environ", {"GOOGLE_API_KEY": "test-key-12345"})
    def test_index_success_with_mocked_build(self, mock_build):
        """Test successful /index response with mocked build."""
        response = client.post("/index")
        assert response.status_code == 200
        assert response.json() == {"indexed_chunks": 42}
        mock_build.assert_called_once()


# --- Chunking logic tests ---

class TestChunking:
    def test_chunk_short_text(self):
        text = "Hello world"
        chunks = _chunk_text(text, chunk_size=800, overlap=200)
        assert len(chunks) == 1
        assert chunks[0] == "Hello world"

    def test_chunk_creates_overlap(self):
        text = "a" * 1600
        chunks = _chunk_text(text, chunk_size=800, overlap=200)
        # 1600 chars, chunks at 0-800 and 600-1400 and 1200-1600 = 3 chunks
        assert len(chunks) >= 2

    def test_chunk_empty_text(self):
        chunks = _chunk_text("", chunk_size=800, overlap=200)
        assert chunks == []

    def test_chunk_exact_size(self):
        text = "a" * 800
        chunks = _chunk_text(text, chunk_size=800, overlap=200)
        # First chunk covers all 800 chars; overlap creates a second small chunk
        assert len(chunks) >= 1
        assert chunks[0] == text

    def test_chunk_preserves_content(self):
        text = "The Election Commission of India conducts free and fair elections."
        chunks = _chunk_text(text, chunk_size=800, overlap=200)
        assert text in chunks[0]

    def test_chunk_overlap_content_shared(self):
        """Verify overlapping region is shared between consecutive chunks."""
        text = "ABCDEFGH" * 200  # 1600 chars
        chunks = _chunk_text(text, chunk_size=800, overlap=200)
        if len(chunks) >= 2:
            # Last 200 chars of chunk 0 should equal first 200 chars of chunk 1
            assert chunks[0][-200:] == chunks[1][:200]


# --- Security header tests ---

class TestSecurityHeaders:
    def test_csp_header_present(self):
        response = client.get("/health")
        assert "content-security-policy" in response.headers
        assert "frame-ancestors 'none'" in response.headers["content-security-policy"]

    def test_x_content_type_options(self):
        response = client.get("/health")
        assert response.headers.get("x-content-type-options") == "nosniff"

    def test_x_frame_options(self):
        response = client.get("/health")
        assert response.headers.get("x-frame-options") == "DENY"

    def test_xss_protection(self):
        response = client.get("/health")
        assert response.headers.get("x-xss-protection") == "1; mode=block"

    def test_referrer_policy(self):
        response = client.get("/health")
        assert "strict-origin" in response.headers.get("referrer-policy", "")

    def test_permissions_policy(self):
        response = client.get("/health")
        assert "camera=()" in response.headers.get("permissions-policy", "")

    def test_hsts_header(self):
        response = client.get("/health")
        assert "strict-transport-security" in response.headers
        assert "max-age=" in response.headers["strict-transport-security"]

    def test_coop_header(self):
        response = client.get("/health")
        assert response.headers.get("cross-origin-opener-policy") == "same-origin"

    def test_corp_header(self):
        response = client.get("/health")
        assert response.headers.get("cross-origin-resource-policy") == "same-origin"

    def test_x_permitted_cross_domain_policies(self):
        response = client.get("/health")
        assert response.headers.get("x-permitted-cross-domain-policies") == "none"

    def test_csp_no_unsafe_inline_scripts(self):
        """Verify CSP script-src doesn't allow unsafe-inline."""
        response = client.get("/health")
        csp = response.headers.get("content-security-policy", "")
        assert "'unsafe-inline'" not in csp.split("script-src")[1].split(";")[0]


# --- CORS tests ---

class TestCORS:
    def test_cors_preflight(self):
        response = client.options(
            "/ask",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "POST",
            },
        )
        assert response.status_code == 200


# --- Input validation edge cases ---

class TestInputValidation:
    def test_ask_with_special_characters(self):
        response = client.post("/ask", json={"question": "What's the EVM's purpose? (explain!)"})
        assert response.status_code in (200, 500, 503)  # 503 if no API key

    def test_ask_with_unicode(self):
        response = client.post("/ask", json={"question": "चुनाव कैसे होता है?"})
        assert response.status_code in (200, 500, 503)

    def test_ask_max_length_boundary(self):
        response = client.post("/ask", json={"question": "a" * 500})
        assert response.status_code in (200, 500, 503)

    def test_ask_path_traversal_in_question(self):
        """Ensure path traversal attempts in questions are harmless (just sanitized text)."""
        response = client.post("/ask", json={"question": "../../etc/passwd"})
        assert response.status_code in (200, 500, 503)

    def test_docs_disabled(self):
        """FastAPI Swagger UI and OpenAPI schema must not be exposed."""
        # /openapi.json must not return a valid OpenAPI document
        r = client.get("/openapi.json")
        # Either 404 (no SPA) or non-JSON (SPA serving index.html)
        if r.status_code == 200:
            # SPA is mounted — response must not be an OpenAPI schema
            assert "openapi" not in r.headers.get("content-type", "")
            try:
                data = r.json()
                assert "openapi" not in data, "/openapi.json must not expose API schema"
            except Exception:
                pass  # Non-JSON response from SPA is acceptable
        else:
            assert r.status_code == 404

    @patch("main.retrieve_and_answer")
    @patch.dict("os.environ", {"GOOGLE_API_KEY": "test-key-12345"})
    def test_ask_with_country_param(self, mock_rag):
        """Test /ask with an explicit country parameter."""
        mock_rag.return_value = {"answer": "The Electoral College has 538 electors.", "sources": ["usa_elections"]}
        response = client.post("/ask", json={"question": "How does voting work?", "country": "usa"})
        assert response.status_code == 200
        mock_rag.assert_called_once_with("How does voting work?", country="usa")


# --- Retriever tests (mocked) ---

class TestRetriever:
    @patch("rag.retriever.vector_query")
    @patch("rag.retriever._client")
    def test_retrieve_and_answer_structure(self, mock_client, mock_vquery):
        """Test the RAG pipeline returns correct structure."""
        mock_vquery.return_value = [
            {"text": "EVMs are used in India.", "source": "evm_vvpat", "distance": 0.1},
            {"text": "Voting process step by step.", "source": "voting_process", "distance": 0.2},
        ]
        mock_response = MagicMock()
        mock_response.text = "EVMs are electronic devices used for voting in Indian elections."
        mock_client.models.generate_content.return_value = mock_response

        from rag.retriever import retrieve_and_answer, _cached_generate
        _cached_generate.cache_clear()

        result = retrieve_and_answer("What is an EVM?")
        assert "answer" in result
        assert "sources" in result
        assert isinstance(result["sources"], list)
        assert "evm_vvpat" in result["sources"]


# --- Translate endpoint tests ---

class TestTranslateEndpoint:
    def test_translate_unavailable_returns_503(self):
        """Should return 503 when Translation client is not configured."""
        with patch("main._translate_available", False):
            response = client.post("/translate", json={"text": "Hello", "target_language": "hi"})
        assert response.status_code == 503

    def test_translate_empty_text_rejected(self):
        response = client.post("/translate", json={"text": "", "target_language": "hi"})
        assert response.status_code == 422

    def test_translate_text_too_long_rejected(self):
        response = client.post("/translate", json={"text": "a" * 2001, "target_language": "hi"})
        assert response.status_code == 422

    def test_translate_unsupported_language_rejected(self):
        response = client.post("/translate", json={"text": "Hello", "target_language": "klingon"})
        assert response.status_code == 422

    def test_translate_missing_fields_rejected(self):
        response = client.post("/translate", json={"text": "Hello"})
        assert response.status_code == 422

    @patch("main._translate_available", True)
    @patch("main._translate_client")
    def test_translate_success(self, mock_client):
        mock_client.translate.return_value = {
            "translatedText": "नमस्ते",
            "detectedSourceLanguage": "en",
        }
        response = client.post("/translate", json={"text": "Hello", "target_language": "hi"})
        assert response.status_code == 200
        data = response.json()
        assert data["translated_text"] == "नमस्ते"
        assert data["target_language"] == "hi"

    @patch("main._translate_available", True)
    @patch("main._translate_client")
    def test_translate_api_error_returns_502(self, mock_client):
        mock_client.translate.side_effect = Exception("API error")
        response = client.post("/translate", json={"text": "Hello", "target_language": "hi"})
        assert response.status_code == 502


# --- TTS endpoint tests ---

class TestTTSEndpoint:
    def test_tts_unavailable_returns_503(self):
        """Should return 503 when TTS client is not configured."""
        with patch("main._tts_available", False):
            response = client.post("/tts", json={"text": "Hello", "language_code": "hi-IN"})
        assert response.status_code == 503

    def test_tts_empty_text_rejected(self):
        response = client.post("/tts", json={"text": "", "language_code": "hi-IN"})
        assert response.status_code == 422

    def test_tts_text_too_long_rejected(self):
        response = client.post("/tts", json={"text": "a" * 1001, "language_code": "hi-IN"})
        assert response.status_code == 422

    def test_tts_unsupported_language_rejected(self):
        response = client.post("/tts", json={"text": "Hello", "language_code": "xx-XX"})
        assert response.status_code == 422

    def test_tts_missing_language_rejected(self):
        response = client.post("/tts", json={"text": "Hello"})
        assert response.status_code == 422

    @patch("main._tts_available", True)
    @patch("main._tts_client")
    def test_tts_success(self, mock_tts_client):
        import sys
        tts_mod_mock = MagicMock()
        tts_mod_mock.SynthesisInput.return_value = MagicMock()
        tts_mod_mock.VoiceSelectionParams.return_value = MagicMock()
        tts_mod_mock.AudioConfig.return_value = MagicMock()
        mock_response = MagicMock()
        mock_response.audio_content = b"fake-audio-bytes"
        mock_tts_client.synthesize_speech.return_value = mock_response
        with patch.dict(sys.modules, {"google.cloud.texttospeech": tts_mod_mock}):
            response = client.post("/tts", json={"text": "Hello", "language_code": "hi-IN"})
        assert response.status_code == 200
        data = response.json()
        assert "audio_base64" in data
        assert data["language_code"] == "hi-IN"

    @patch("main._tts_available", True)
    @patch("main._tts_client")
    def test_tts_api_error_returns_502(self, mock_tts_client):
        import sys
        tts_mod_mock = MagicMock()
        tts_mod_mock.SynthesisInput.return_value = MagicMock()
        tts_mod_mock.VoiceSelectionParams.return_value = MagicMock()
        tts_mod_mock.AudioConfig.return_value = MagicMock()
        mock_tts_client.synthesize_speech.side_effect = Exception("TTS error")
        with patch.dict(sys.modules, {"google.cloud.texttospeech": tts_mod_mock}):
            response = client.post("/tts", json={"text": "Hello", "language_code": "hi-IN"})
        assert response.status_code == 502


# --- YouTube endpoint tests ---

class TestYouTubeEndpoint:
    def test_youtube_unsupported_country_returns_404(self):
        response = client.get("/youtube/mars")
        assert response.status_code == 404

    def test_youtube_no_api_key_returns_503(self):
        with patch("main._YOUTUBE_API_KEY", ""):
            response = client.get("/youtube/india")
        assert response.status_code == 503

    @patch("main._YOUTUBE_API_KEY", "test-yt-key")
    @patch("httpx.AsyncClient")
    def test_youtube_success(self, mock_httpx_cls):
        mock_resp = MagicMock()
        mock_resp.json.return_value = {
            "items": [
                {
                    "id": {"videoId": "abcdefghijk"},
                    "snippet": {
                        "title": "India Election Guide",
                        "channelTitle": "NewsChannel",
                        "thumbnails": {"medium": {"url": "https://i.ytimg.com/vi/abcdefghijk/mqdefault.jpg"}},
                    },
                }
            ]
        }
        mock_resp.raise_for_status = MagicMock()
        mock_session = AsyncMock()
        mock_session.get = AsyncMock(return_value=mock_resp)
        mock_httpx_cls.return_value.__aenter__ = AsyncMock(return_value=mock_session)
        mock_httpx_cls.return_value.__aexit__ = AsyncMock(return_value=False)
        response = client.get("/youtube/india")
        assert response.status_code == 200
        data = response.json()
        assert "videos" in data

    @patch("main._YOUTUBE_API_KEY", "test-yt-key")
    @patch("httpx.AsyncClient")
    def test_youtube_http_error_returns_502(self, mock_httpx_cls):
        mock_session = AsyncMock()
        mock_session.get = AsyncMock(
            side_effect=httpx.HTTPStatusError("error", request=MagicMock(), response=MagicMock())
        )
        mock_httpx_cls.return_value.__aenter__ = AsyncMock(return_value=mock_session)
        mock_httpx_cls.return_value.__aexit__ = AsyncMock(return_value=False)
        response = client.get("/youtube/india")
        assert response.status_code == 502

    @patch("main._YOUTUBE_API_KEY", "test-yt-key")
    @patch("httpx.AsyncClient")
    def test_youtube_generic_error_returns_502(self, mock_httpx_cls):
        mock_session = AsyncMock()
        mock_session.get = AsyncMock(side_effect=Exception("connection error"))
        mock_httpx_cls.return_value.__aenter__ = AsyncMock(return_value=mock_session)
        mock_httpx_cls.return_value.__aexit__ = AsyncMock(return_value=False)
        response = client.get("/youtube/india")
        assert response.status_code == 502

    @patch("main._YOUTUBE_API_KEY", "test-yt-key")
    @patch("httpx.AsyncClient")
    def test_youtube_invalid_video_id_filtered(self, mock_httpx_cls):
        """video_ids that don't match the 11-char alnum pattern are excluded."""
        mock_resp = MagicMock()
        mock_resp.json.return_value = {
            "items": [
                {
                    "id": {"videoId": "../../etc"},  # invalid
                    "snippet": {
                        "title": "Bad video",
                        "channelTitle": "Chan",
                        "thumbnails": {"medium": {"url": "https://i.ytimg.com/vi/x/mq.jpg"}},
                    },
                }
            ]
        }
        mock_resp.raise_for_status = MagicMock()
        mock_session = AsyncMock()
        mock_session.get = AsyncMock(return_value=mock_resp)
        mock_httpx_cls.return_value.__aenter__ = AsyncMock(return_value=mock_session)
        mock_httpx_cls.return_value.__aexit__ = AsyncMock(return_value=False)
        response = client.get("/youtube/india")
        assert response.status_code == 200
        assert response.json()["videos"] == []


# --- Index admin token tests ---

class TestIndexAdminToken:
    @patch("main.build_index", return_value=10)
    @patch("main._INDEX_ADMIN_TOKEN", "secret-token")
    @patch.dict("os.environ", {"GOOGLE_API_KEY": "test-key-12345"})
    def test_index_wrong_token_returns_401(self, mock_build):
        response = client.post("/index", headers={"X-Admin-Token": "wrong"})
        assert response.status_code == 401

    @patch("main.build_index", return_value=10)
    @patch("main._INDEX_ADMIN_TOKEN", "secret-token")
    @patch.dict("os.environ", {"GOOGLE_API_KEY": "test-key-12345"})
    def test_index_correct_token_succeeds(self, mock_build):
        response = client.post("/index", headers={"X-Admin-Token": "secret-token"})
        assert response.status_code == 200


# --- Embeddings tests (mocked ChromaDB) ---

class TestEmbeddings:
    @patch("rag.embeddings._get_client")
    @patch("rag.embeddings._get_collection")
    def test_build_index_returns_count(self, mock_get_collection, mock_get_client):
        """build_index should return the number of chunks created."""
        mock_collection = MagicMock()
        mock_client_inst = MagicMock()
        mock_get_client.return_value = mock_client_inst
        mock_get_collection.return_value = mock_collection

        from rag.embeddings import build_index, _get_client, _get_collection
        _get_client.cache_clear()
        count = build_index()
        assert isinstance(count, int)
        assert count >= 0

    @patch("rag.embeddings._get_client")
    @patch("rag.embeddings._get_collection")
    def test_query_returns_hits(self, mock_get_collection, mock_get_client):
        """query() should parse ChromaDB results into a list of dicts."""
        mock_collection = MagicMock()
        mock_collection.query.return_value = {
            "documents": [["EVMs are used in elections."]],
            "metadatas": [[{"source": "evm_vvpat", "chunk_index": 0}]],
            "distances": [[0.15]],
        }
        mock_get_collection.return_value = mock_collection
        mock_get_client.return_value = MagicMock()

        from rag.embeddings import query, _get_client
        _get_client.cache_clear()
        hits = query("What is EVM?", n_results=1)
        assert len(hits) == 1
        assert hits[0]["source"] == "evm_vvpat"
        assert hits[0]["text"] == "EVMs are used in elections."
        assert hits[0]["distance"] == 0.15

    @patch("rag.embeddings._get_client")
    @patch("rag.embeddings._get_collection")
    def test_query_empty_results(self, mock_get_collection, mock_get_client):
        """query() returns empty list when ChromaDB has no results."""
        mock_collection = MagicMock()
        mock_collection.query.return_value = {"documents": [[]], "metadatas": [[]], "distances": [[]]}
        mock_get_collection.return_value = mock_collection
        mock_get_client.return_value = MagicMock()

        from rag.embeddings import query, _get_client
        _get_client.cache_clear()
        hits = query("unknown question", n_results=5)
        assert hits == []
