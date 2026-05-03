"""Retriever: combines RAG context with Google Gemini chat completion."""

from __future__ import annotations

import os
from functools import lru_cache

import google.generativeai as genai

from .embeddings import query as vector_query

# Configure Gemini once at module level
genai.configure(api_key=os.getenv("GOOGLE_API_KEY", ""))

_model = genai.GenerativeModel(
    model_name="gemini-2.0-flash",
    system_instruction="""You are an expert assistant on the Indian election process. Your role is to help users understand how elections work in India — including the Election Commission, types of elections, voter registration, the voting process, EVMs, VVPAT, Model Code of Conduct, election timelines, key legislation, and post-election procedures.

Rules:
- Answer based ONLY on the provided context. If the context does not contain enough information, say so honestly.
- Be clear, concise, and educational. Use simple language suitable for first-time voters and students.
- When citing steps or processes, use numbered lists for clarity.
- If the user asks about a specific state, mention that state-level rules may vary and suggest checking the State Election Commission website.
- Do not provide personal opinions or political bias. Remain neutral and factual.
- When relevant, mention official resources like eci.gov.in, voters.eci.gov.in, or the Voter Helpline (1950).
- Use Indian English spelling conventions.
""",
    generation_config=genai.GenerationConfig(
        temperature=0.3,
        max_output_tokens=1024,
    ),
)


@lru_cache(maxsize=128)
def _cached_generate(question: str, context_text: str) -> str:
    """Cache Gemini responses for identical question+context pairs."""
    prompt = f"Context from knowledge base:\n\n{context_text}\n\n---\n\nUser question: {question}"
    response = _model.generate_content(prompt)
    return response.text


def retrieve_and_answer(question: str) -> dict:
    """Retrieve relevant context from the knowledge base and generate an answer."""
    # Step 1: Retrieve relevant chunks
    hits = vector_query(question, n_results=5)
    context_text = "\n\n---\n\n".join(h["text"] for h in hits)
    sources = list({h["source"] for h in hits})

    # Step 2: Generate (with caching)
    answer = _cached_generate(question, context_text)

    return {"answer": answer, "sources": sources}
