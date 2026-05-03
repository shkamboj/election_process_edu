"""FastAPI backend for the Indian Election Process Education Assistant."""

from __future__ import annotations

import os
import pathlib

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

load_dotenv()

from rag.embeddings import build_index
from rag.retriever import retrieve_and_answer

STATIC_DIR = pathlib.Path(__file__).resolve().parent.parent / "frontend" / "dist"

app = FastAPI(
    title="Indian Election Process Education Assistant",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AskRequest(BaseModel):
    question: str


class AskResponse(BaseModel):
    answer: str
    sources: list[str]


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/index")
def index_knowledge():
    """Rebuild the vector index from knowledge base files."""
    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key or api_key == "your-api-key-here":
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not configured.")
    count = build_index()
    return {"indexed_chunks": count}


@app.post("/ask", response_model=AskResponse)
def ask(req: AskRequest):
    """Answer a question about the Indian election process."""
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key or api_key == "your-api-key-here":
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not configured.")
    result = retrieve_and_answer(req.question)
    return AskResponse(**result)


# --- Serve frontend static files (production) ---
if STATIC_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=str(STATIC_DIR / "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        """Serve the SPA index.html for all non-API routes."""
        file_path = STATIC_DIR / full_path
        if full_path and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(STATIC_DIR / "index.html")
