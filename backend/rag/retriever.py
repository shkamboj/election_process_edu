"""Retriever: combines RAG context with OpenAI chat completion."""

from __future__ import annotations

import os

from openai import OpenAI

from .embeddings import query as vector_query

SYSTEM_PROMPT = """You are an expert assistant on the Indian election process. Your role is to help users understand how elections work in India — including the Election Commission, types of elections, voter registration, the voting process, EVMs, VVPAT, Model Code of Conduct, election timelines, key legislation, and post-election procedures.

Rules:
- Answer based ONLY on the provided context. If the context does not contain enough information, say so honestly.
- Be clear, concise, and educational. Use simple language suitable for first-time voters and students.
- When citing steps or processes, use numbered lists for clarity.
- If the user asks about a specific state, mention that state-level rules may vary and suggest checking the State Election Commission website.
- Do not provide personal opinions or political bias. Remain neutral and factual.
- When relevant, mention official resources like eci.gov.in, voters.eci.gov.in, or the Voter Helpline (1950).
- Use Indian English spelling conventions.
"""


def retrieve_and_answer(question: str) -> dict:
    """Retrieve relevant context from the knowledge base and generate an answer."""
    # Step 1: Retrieve relevant chunks
    hits = vector_query(question, n_results=5)
    context_text = "\n\n---\n\n".join(h["text"] for h in hits)
    sources = list({h["source"] for h in hits})

    # Step 2: Build messages
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": f"Context from knowledge base:\n\n{context_text}\n\n---\n\nUser question: {question}",
        },
    ]

    # Step 3: Call OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY", ""))
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.3,
        max_tokens=1024,
    )

    answer = response.choices[0].message.content
    return {"answer": answer, "sources": sources}
