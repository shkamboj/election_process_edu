"""Build and query the ChromaDB vector store from knowledge base Markdown files."""

from __future__ import annotations

import os
import pathlib

import chromadb
from chromadb.utils import embedding_functions

KNOWLEDGE_DIR = pathlib.Path(__file__).resolve().parent.parent / "knowledge"
CHROMA_DIR = pathlib.Path(__file__).resolve().parent.parent / "chroma_db"


def _get_embedding_function():
    return embedding_functions.OpenAIEmbeddingFunction(
        api_key=os.getenv("OPENAI_API_KEY", ""),
        model_name="text-embedding-3-small",
    )


def _get_client() -> chromadb.ClientAPI:
    return chromadb.PersistentClient(path=str(CHROMA_DIR))


def _get_collection(client: chromadb.ClientAPI):
    return client.get_or_create_collection(
        name="election_knowledge",
        embedding_function=_get_embedding_function(),
    )


def _chunk_text(text: str, chunk_size: int = 800, overlap: int = 200) -> list[str]:
    """Split text into overlapping chunks by character count."""
    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks


def build_index() -> int:
    """Read all .md files in the knowledge directory and index them into ChromaDB.
    Returns the number of chunks indexed."""
    client = _get_client()
    # Reset collection for a clean rebuild
    try:
        client.delete_collection("election_knowledge")
    except Exception:
        pass
    collection = _get_collection(client)

    all_docs: list[str] = []
    all_ids: list[str] = []
    all_meta: list[dict] = []

    for md_file in sorted(KNOWLEDGE_DIR.rglob("*.md")):
        content = md_file.read_text(encoding="utf-8")
        source = md_file.stem
        chunks = _chunk_text(content)
        for i, chunk in enumerate(chunks):
            all_docs.append(chunk)
            all_ids.append(f"{source}_chunk_{i}")
            all_meta.append({"source": source, "chunk_index": i})

    if all_docs:
        # ChromaDB has a batch limit; add in batches of 100
        batch_size = 100
        for start in range(0, len(all_docs), batch_size):
            end = start + batch_size
            collection.add(
                documents=all_docs[start:end],
                ids=all_ids[start:end],
                metadatas=all_meta[start:end],
            )

    return len(all_docs)


def query(question: str, n_results: int = 5) -> list[dict]:
    """Query the vector store and return the most relevant chunks."""
    client = _get_client()
    collection = _get_collection(client)
    results = collection.query(query_texts=[question], n_results=n_results)

    hits: list[dict] = []
    if results and results["documents"]:
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
        ):
            hits.append({"text": doc, "source": meta["source"], "distance": dist})
    return hits
