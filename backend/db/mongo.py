from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings
from core.logger import logger

client: AsyncIOMotorClient = None
db = None

async def connect_mongo():
    global client, db
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client.get_default_database()
    logger.info("MongoDB connected")

async def close_mongo():
    global client
    if client:
        client.close()
        logger.info("MongoDB disconnected")

def get_db():
    return db