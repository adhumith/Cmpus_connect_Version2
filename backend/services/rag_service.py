import asyncio
from fastapi import UploadFile
import google.generativeai as genai
from utils.text_processing import extract_text_from_pdf, chunk_text
from services.vector_store import upsert_to_pinecone, query_pinecone, clear_pinecone
from db.pinecone import get_pinecone_index
from core.logger import logger

async def process_document_for_rag(file: UploadFile) -> dict:
    logger.info(f"RAG processing: {file.filename}")
    content = await file.read()
    text = await extract_text_from_pdf(content)
    chunks = chunk_text(text, chunk_size=1000, overlap=200)
    index = get_pinecone_index()

    for i in range(0, len(chunks), 100):
        batch = chunks[i:i + 100]
        response = await asyncio.to_thread(
            genai.embed_content,
            model="models/gemini-embedding-001",
            content=batch,
            task_type="retrieval_document",
            output_dimensionality=768
        )
        vectors = [
            {
                "id": f"{file.filename}-chunk-{i+j}",
                "values": emb,
                "metadata": {"text": batch[j], "source": file.filename}
            }
            for j, emb in enumerate(response["embedding"])
        ]
        await upsert_to_pinecone(index, vectors)
        await asyncio.sleep(1)

    return {"status": "success", "chunks": len(chunks), "file": file.filename}

async def generate_chat_response(question: str) -> str:
    index = get_pinecone_index()
    emb_resp = await asyncio.to_thread(
        genai.embed_content,
        model="models/gemini-embedding-001",
        content=question,
        task_type="retrieval_query",
        output_dimensionality=768
    )
    results = await query_pinecone(index, emb_resp["embedding"], top_k=3)
    context = "\n---\n".join(
        m["metadata"]["text"] for m in results["matches"] if "metadata" in m
    )
    prompt = f"""You are a helpful university assistant. Use the context below to answer the student's question.
If the answer is not in the context, say "I don't have that information."

Context:
{context}

Question: {question}"""
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = await asyncio.to_thread(model.generate_content, prompt)
    return response.text

async def wipe_knowledge_base():
    index = get_pinecone_index()
    await clear_pinecone(index)