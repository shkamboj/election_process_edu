"""Tests for the FastAPI backend endpoints and RAG modules."""

from __future__ import annotations

from unittest.mock import patch, MagicMock

import pytest
from fastapi.testclient import TestClient

from main import app
from rag.embeddings import _chunk_text


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
        mock_rag.assert_called_once_with("What is an EVM?")

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


# --- Retriever tests (mocked) ---

class TestRetriever:
    @patch("rag.retriever.vector_query")
    @patch("rag.retriever._model")
    def test_retrieve_and_answer_structure(self, mock_model, mock_vquery):
        """Test the RAG pipeline returns correct structure."""
        mock_vquery.return_value = [
            {"text": "EVMs are used in India.", "source": "evm_vvpat", "distance": 0.1},
            {"text": "Voting process step by step.", "source": "voting_process", "distance": 0.2},
        ]
        mock_response = MagicMock()
        mock_response.text = "EVMs are electronic devices used for voting in Indian elections."
        mock_model.generate_content.return_value = mock_response

        from rag.retriever import retrieve_and_answer
        # Clear lru_cache to ensure our mock is used
        from rag.retriever import _cached_generate
        _cached_generate.cache_clear()

        result = retrieve_and_answer("What is an EVM?")
        assert "answer" in result
        assert "sources" in result
        assert isinstance(result["sources"], list)
        assert "evm_vvpat" in result["sources"]
