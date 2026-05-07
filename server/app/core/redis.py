import redis.asyncio as aioredis
from redis.asyncio import Redis
from app.core.config import settings
from app.core.logging import logger


class RedisClient:
    """
    Gestiona dos conexiones separadas:
    - `publisher`: para PUBLISH. Puede usarse para otros comandos Redis también.
    - `subscriber`: conexión dedicada exclusivamente a SUBSCRIBE/PSUBSCRIBE.
      Una conexión en modo suscripción no puede ejecutar otros comandos.
    """

    def __init__(self) -> None:
        self._publisher: Redis | None = None
        self._subscriber: Redis | None = None

    async def connect(self) -> None:
        self._publisher = await aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            max_connections=20,
        )
        self._subscriber = await aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
        logger.info("Redis connections established")

    async def disconnect(self) -> None:
        if self._publisher:
            await self._publisher.aclose()
        if self._subscriber:
            await self._subscriber.aclose()
        logger.info("Redis connections closed")

    @property
    def publisher(self) -> Redis:
        if not self._publisher:
            raise RuntimeError("Redis publisher not connected. Call connect() first.")
        return self._publisher

    @property
    def subscriber(self) -> Redis:
        if not self._subscriber:
            raise RuntimeError("Redis subscriber not connected. Call connect() first.")
        return self._subscriber


redis_client = RedisClient()