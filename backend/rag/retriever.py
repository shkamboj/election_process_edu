"""Retriever: combines RAG context with Google Gemini chat completion."""

from __future__ import annotations

import os
from functools import lru_cache

from google import genai
from google.genai import types

from .embeddings import query as vector_query

# Configure Gemini client lazily — avoids crash when API key is missing at import time
_client = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.getenv("GOOGLE_API_KEY", "")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY is not configured.")
        _client = genai.Client(api_key=api_key)
    return _client

COUNTRY_NAMES = {
    "india": "India",
    "usa": "United States",
    "indonesia": "Indonesia",
    "brazil": "Brazil",
    "pakistan": "Pakistan",
    "nigeria": "Nigeria",
    "bangladesh": "Bangladesh",
    "japan": "Japan",
    "mexico": "Mexico",
    "philippines": "Philippines",
}

_BASE_SYSTEM_PROMPT = """You are an expert assistant on the election process of {country}. Your role is to help users understand how elections work in {country}.

Rules:
- Answer based ONLY on the provided context. If the context does not contain enough information, say so honestly.
- Be clear, concise, and educational. Use simple language suitable for first-time voters and students.
- When citing steps or processes, use numbered lists for clarity.
- Do not provide personal opinions or political bias. Remain neutral and factual.
- When relevant, mention official election body websites or helplines for {country}.
"""


def _make_config(country: str) -> types.GenerateContentConfig:
    country_name = COUNTRY_NAMES.get(country, country.title())
    return types.GenerateContentConfig(
        system_instruction=_BASE_SYSTEM_PROMPT.format(country=country_name),
        temperature=0.3,
        max_output_tokens=1024,
    )


@lru_cache(maxsize=128)
def _cached_generate(question: str, context_text: str, country: str) -> str:
    """Cache Gemini responses for identical question+context+country."""
    prompt = f"Context from knowledge base:\n\n{context_text}\n\n---\n\nUser question: {question}"
    response = _get_client().models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
        config=_make_config(country),
    )
    return response.text


def retrieve_and_answer(question: str, country: str = "india") -> dict[str, str | list[str]]:
    """Retrieve relevant context from the knowledge base and generate an answer."""
    hits = vector_query(question, n_results=5)
    context_text = "\n\n---\n\n".join(h["text"] for h in hits)
    sources = list({h["source"] for h in hits})

    answer = _cached_generate(question, context_text, country)

    return {"answer": answer, "sources": sources}
