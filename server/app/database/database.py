from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
import asyncpg
import asyncio
import json
from dotenv import load_dotenv
from ..api import listeners

load_dotenv()

SQL_DATABASE_URL = os.getenv('SQL_URL_DATABASE')

engine = create_engine(SQL_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



#LISTENER
async def pg_listener():
    conn = await asyncpg.connect(SQL_DATABASE_URL)
    await conn.add_listener('order_events', handle_notification)
    #Keep the connection alive
    while True:
        await asyncio.sleep(60)

#Callback triggered for each notification; it parses the JSON payload and broadcasts to all active WebSocket clients.
async def handle_notification(connection, pid, channel, payload):
    data = json.loads(payload)
    #Broadcast to all connected websockets
    for ws in set(listeners):
        try:
            await ws.send_json(data)
        except RuntimeError:
        #Connection closed, removed from set
            listeners.remove(ws)
