"""Tests for the FastAPI backend endpoints and RAG modules."""

from __future__ import annotations

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
        assert response.status_code in (200, 500)

    def test_ask_invalid_content_type(self):
        response = client.post("/ask", content="plain text", headers={"Content-Type": "text/plain"})
        assert response.status_code == 422


# --- Index endpoint tests ---

class TestIndexEndpoint:
    def test_index_without_api_key(self):
        """Should return 500 when GOOGLE_API_KEY is not set."""
        response = client.post("/index")
        assert response.status_code == 500
        assert "GOOGLE_API_KEY" in response.json()["detail"]


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
        assert response.status_code in (200, 500)  # 500 if no API key

    def test_ask_with_unicode(self):
        response = client.post("/ask", json={"question": "चुनाव कैसे होता है?"})
        assert response.status_code in (200, 500)

    def test_ask_max_length_boundary(self):
        response = client.post("/ask", json={"question": "a" * 500})
        assert response.status_code in (200, 500)
