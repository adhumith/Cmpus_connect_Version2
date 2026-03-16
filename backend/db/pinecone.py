from pinecone import Pinecone
from core.config import settings
from core.logger import logger

_index = None

def init_pinecone():
    global _index
    pc = Pinecone(api_key=settings.PINECONE_API_KEY)
    existing = [i.name for i in pc.list_indexes()]
    if settings.PINECONE_INDEX_NAME not in existing:
        pc.create_index(
            name=settings.PINECONE_INDEX_NAME,
            dimension=768,
            metric="cosine",
            spec={"serverless": {"cloud": "aws", "region": "us-east-1"}}
        )
        logger.info(f"Pinecone index '{settings.PINECONE_INDEX_NAME}' created")
    _index = pc.Index(settings.PINECONE_INDEX_NAME)
    logger.info("Pinecone connected")

def get_pinecone_index():
    return _index