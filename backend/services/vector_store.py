import asyncio
from typing import List, Dict

async def upsert_to_pinecone(index, vectors: List[Dict]):
    await asyncio.to_thread(index.upsert, vectors=vectors)

async def query_pinecone(index, query_vector: List[float], top_k: int = 3):
    result = await asyncio.to_thread(
        index.query, vector=query_vector, top_k=top_k, include_metadata=True
    )
    return result

async def clear_pinecone(index):
    await asyncio.to_thread(index.delete, delete_all=True)