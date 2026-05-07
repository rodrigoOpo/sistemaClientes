from fastapi import FastAPI
from .routers import Clients
from .database.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import asyncpg
import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import json
from app.core.logging import logger
from app.core.redis import redis_client

load_dotenv()

SQL_DATABASE_URL = os.getenv('SQL_URL_DATABASE')

Base.metadata.create_all(bind=engine)

#It will store the data that we pass from the database to the client through ws
queue = asyncio.Queue()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await redis_client.connect()
    asyncio.create_task(listener())
    yield
    await redis_client.disconnect()

app = FastAPI(lifespan=lifespan)

#For the table connection we need 2 technologies
#We need them because the client will not ask for the data, so the database and later the api will send data to the client
#1)LISTEN/NOTIFY in the database
#2)Websockets in the api

app.add_middleware(
    CORSMiddleware,
    allow_origins=['https://sistema-clientes-six.vercel.app'],
    allow_methods=['*'],
    allow_headers=['*']
)

app.include_router(Clients.router)


#El listener
async def listener():
    conn = await asyncpg.connect(SQL_DATABASE_URL)

    async def callback(channel, payload):
        print(f"📡 Evento recibido en {channel}: {payload}")
        await forward_to_redis(channel,payload)

    await conn.add_listener("activity_channel", callback)

    print("👂 Escuchando canal 'client_channel'...")

    while True:
        await asyncio.sleep(3600)  # mantener vivo






#redis
async def forward_to_redis(redis_chanel: str, raw_payload: str)-> None:
    try:
        payload = json.loads(raw_payload)
    except json.JSONDecodeError:
        logger.warning("Non JSON payload from PostgresSQL: %s", raw_payload)
        return

    await redis_client.publisher.publish(redis_chanel, json.dumps(payload))
    logger.debug("Forwaded to redis channel '%s' : %s", redis_chanel, payload)
