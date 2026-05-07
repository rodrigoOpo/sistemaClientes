import asyncio
import uuid
import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status

from app.core.config import settings
from app.core.logging import logger
from app.services.pubsub_broker import pubsub_broker

router = APIRouter()

# Canales permitidos — whitelist explícita para evitar suscripciones arbitrarias
ALLOWED_CHANNELS = {"pedidos", "stock", "alertas"}


@router.websocket("/ws/{channel}")
async def websocket_endpoint(
    websocket: WebSocket,
    channel: str,
    # token: str = Query(...),  # descomentar cuando añadas autenticación
) -> None:
    """
    Endpoint WebSocket que suscribe al cliente a un canal en tiempo real.

    Protocolo:
    - Conexión: el servidor envía {"type": "connected", "channel": "..."}
    - Mensajes: el servidor envía {"type": "event", "data": {...}}
    - Heartbeat: el servidor envía {"type": "ping"} cada WS_HEARTBEAT_INTERVAL segundos
    - El cliente puede responder {"type": "pong"} (opcional, el server no lo requiere)
    - Cierre limpio: el cliente cierra la conexión WebSocket normalmente
    """

    # --- Validación del canal ---
    if channel not in ALLOWED_CHANNELS:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        logger.warning("Rejected WebSocket connection to unknown channel '%s'", channel)
        return

    # TODO: validar token JWT aquí antes de aceptar la conexión
    # payload = decode_jwt(token)

    client_id = str(uuid.uuid4())
    await websocket.accept()
    logger.info("WebSocket connected: client=%s channel=%s", client_id, channel)

    # Suscribir al broker — obtenemos la queue exclusiva de este cliente
    queue = await pubsub_broker.subscribe(channel, client_id)

    try:
        await _handle_connection(websocket, queue, channel, client_id)
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected: client=%s", client_id)
    except Exception as exc:
        logger.error("WebSocket error: client=%s error=%s", client_id, exc)
    finally:
        await pubsub_broker.unsubscribe(channel, client_id)


async def _handle_connection(
    websocket: WebSocket,
    queue: asyncio.Queue,
    channel: str,
    client_id: str,
) -> None:
    """
    Gestiona el ciclo de vida de una conexión WebSocket activa.

    Corre dos tareas concurrentes:
    - _sender: consume la queue y envía mensajes al cliente
    - _heartbeat: envía pings periódicos para detectar conexiones muertas

    Si cualquiera de las dos falla, se cancela la otra y se cierra la conexión.
    """
    await websocket.send_json({"type": "connected", "channel": channel, "client_id": client_id})

    sender_task = asyncio.create_task(_sender(websocket, queue, client_id))
    heartbeat_task = asyncio.create_task(_heartbeat(websocket, client_id))

    # Esperar a que cualquiera de las dos tareas termine (lo que ocurra primero)
    done, pending = await asyncio.wait(
        [sender_task, heartbeat_task],
        return_when=asyncio.FIRST_COMPLETED,
    )

    # Cancelar las tareas pendientes al cerrar
    for task in pending:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass

    # Propagar excepción si la hubo
    for task in done:
        if task.exception():
            raise task.exception()


async def _sender(
    websocket: WebSocket,
    queue: asyncio.Queue,
    client_id: str,
) -> None:
    """Consume mensajes de la queue y los envía al WebSocket."""
    while True:
        payload = await queue.get()
        try:
            await websocket.send_json({"type": "event", "data": payload})
        except Exception as exc:
            logger.warning("Failed to send to client=%s: %s", client_id, exc)
            raise


async def _heartbeat(websocket: WebSocket, client_id: str) -> None:
    """Envía pings periódicos para mantener la conexión y detectar clientes muertos."""
    while True:
        await asyncio.sleep(settings.WS_HEARTBEAT_INTERVAL)
        try:
            await websocket.send_json({"type": "ping"})
        except Exception as exc:
            logger.warning("Heartbeat failed for client=%s: %s", client_id, exc)
            raise
