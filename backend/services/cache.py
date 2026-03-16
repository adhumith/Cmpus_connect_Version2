import json
from db.redis import get_redis

async def get_cache(key: str):
    r = get_redis()
    val = await r.get(key)
    return json.loads(val) if val else None

async def set_cache(key: str, value, ttl: int = 300):
    r = get_redis()
    await r.setex(key, ttl, json.dumps(value))

async def delete_cache(key: str):
    r = get_redis()
    await r.delete(key)