from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from .routers import Clients
from .database.models import Client
from .database.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import asyncpg
import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager

load_dotenv()


SQL_DATABASE_URL = os.getenv('SQL_URL_DATABASE')

Base.metadata.create_all(bind=engine)

#It will store the data that we pass from the database to the client through ws
queue = asyncio.Queue()

@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(listener())
    yield

app = FastAPI(lifespan=lifespan)

#For the table connection we need 2 technologies
#We need them because the client will not ask for the data, so the database and later the api will send data to the client
#1)LISTEN/NOTIFY in the database
#2)Websockets in the api

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000'],
    allow_methods=['*'],
    allow_headers=['*']
)

app.include_router(Clients.router)

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    try:
        while True:
            data = await ws.receive_text()
            await ws.send_text(f"Echo: {data}")
    except:
        print("Client disconnect")



#El listener
async def listener():
    conn = await asyncpg.connect(SQL_DATABASE_URL)

    async def callback(connection, pid, channel, payload):
        print(f"📡 Evento recibido en {channel}: {payload}")

    await conn.add_listener("activity_channel", callback)

    print("👂 Escuchando canal 'client_channel'...")

    while True:
        await asyncio.sleep(3600)  # mantener vivo

