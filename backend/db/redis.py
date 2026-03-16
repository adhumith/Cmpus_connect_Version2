import redis.asyncio as aioredis
from core.config import settings
from core.logger import logger

redis_client: aioredis.Redis = None

async def connect_redis():
    global redis_client
    redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    await redis_client.ping()
    logger.info("Redis connected")

async def close_redis():
    global redis_client
    if redis_client:
        await redis_client.close()

def get_redis():
    return redis_client