import asyncio
import json
from collections import defaultdict
from typing import AsyncGenerator

from app.core.config import settings
from app.core.logging import logger
from app.core.redis import redis_client


class PubSubBroker:
    """
    Broker interno que hace fan-out de mensajes de Redis a las colas
    individuales de cada cliente WebSocket.

    Flujo:
        Redis SUBSCRIBE → _listen_redis() → fan-out → Queue por cliente → WebSocket

    Cada canal tiene un dict de { client_id: asyncio.Queue }.
    """

    def __init__(self) -> None:
        # { canal: { client_id: Queue } }
        self._subscribers: dict[str, dict[str, asyncio.Queue]] = defaultdict(dict)
        self._listen_tasks: dict[str, asyncio.Task] = {}

    # ------------------------------------------------------------------ #
    # API pública                                                          #
    # ------------------------------------------------------------------ #

    async def subscribe(self, channel: str, client_id: str) -> asyncio.Queue:
        """
        Registra un cliente en un canal.
        Si es el primer cliente del canal, arranca el listener de Redis.
        Devuelve la Queue del cliente para que el WebSocket la consuma.
        """
        queue: asyncio.Queue = asyncio.Queue(maxsize=settings.WS_MAX_QUEUE_SIZE)
        self._subscribers[channel][client_id] = queue

        if channel not in self._listen_tasks:
            task = asyncio.create_task(
                self._listen_redis(channel),
                name=f"redis-listener:{channel}",
            )
            self._listen_tasks[channel] = task
            logger.info("Started Redis listener for channel '%s'", channel)

        logger.debug("Client '%s' subscribed to channel '%s'", client_id, channel)
        return queue


    async def unsubscribe(self, channel: str, client_id: str) -> None:
        """
        Elimina un cliente. Si era el último, cancela el listener de Redis.
        """
        channel_subs = self._subscribers.get(channel, {})
        channel_subs.pop(client_id, None)
        logger.debug("Client '%s' unsubscribed from channel '%s'", client_id, channel)

        if not channel_subs:
            task = self._listen_tasks.pop(channel, None)
            if task:
                task.cancel()
            logger.info("Stopped Redis listener for channel '%s' (no subscribers)", channel)

    async def publish(self, channel: str, payload: dict) -> None:
        """Publica un mensaje en Redis desde la aplicación."""
        await redis_client.publisher.publish(channel, json.dumps(payload))

    # ------------------------------------------------------------------ #
    # Internals                                                            #
    # ------------------------------------------------------------------ #

    async def _listen_redis(self, channel: str) -> None:
        """
        Coroutine dedicada a escuchar un canal de Redis.
        Se ejecuta en segundo plano como asyncio.Task.
        Se reconecta automáticamente con backoff exponencial si Redis cae.
        """
        backoff = 1
        while True:
            try:
                pubsub = redis_client.subscriber.pubsub()
                await pubsub.subscribe(channel)
                backoff = 1  # reset en cada conexión exitosa

                async for raw in pubsub.listen():
                    if raw["type"] != "message":
                        continue

                    try:
                        payload = json.loads(raw["data"])
                    except json.JSONDecodeError:
                        logger.warning("Non-JSON message on channel '%s': %s", channel, raw["data"])
                        continue

                    await self._fanout(channel, payload)

            except asyncio.CancelledError:
                logger.info("Redis listener for '%s' cancelled", channel)
                return
            except Exception as exc:
                logger.error(
                    "Redis listener for '%s' crashed: %s. Retrying in %ds",
                    channel, exc, backoff,
                )
                await asyncio.sleep(backoff)
                backoff = min(backoff * 2, 60)  # backoff exponencial, máx 60s

    async def _fanout(self, channel: str, payload: dict) -> None:
        """
        Distribuye el payload a todos los clientes suscritos al canal.
        Si la queue de un cliente está llena (cliente lento), descarta el mensaje
        y lo desconecta en lugar de bloquear a los demás.
        """
        dead_clients: list[str] = []

        for client_id, queue in self._subscribers.get(channel, {}).items():
            try:
                queue.put_nowait(payload)
            except asyncio.QueueFull:
                logger.warning(
                    "Queue full for client '%s' on channel '%s'. Dropping client.",
                    client_id, channel,
                )
                dead_clients.append(client_id)

        for client_id in dead_clients:
            await self.unsubscribe(channel, client_id)


# Instancia singleton — compartida en todo el proceso
pubsub_broker = PubSubBroker()
