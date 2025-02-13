"""
Redis Configuration Module
"""
import os
from dotenv import load_dotenv
import redis.asyncio as aioredis # type: ignore

load_dotenv()

host = os.getenv('REDIS_HOST_DOCKER')

"Create Redis connection pool"
redis_client = aioredis.from_url(
  host,
  decode_responses=True,
  max_connections=10
)
async def get_redis_client():
    "Initialize redis client"
    return redis_client