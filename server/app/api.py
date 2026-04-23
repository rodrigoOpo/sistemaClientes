from fastapi import FastAPI, Websocket, WebsocketDisconnect
from .routers import Update_client
from .database.models import Client
from .database.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
from typing import Set

Base.metadata.create_all(bind=engine)

app = FastAPI()
listeners: Set[Websocket] = set()

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

app.include_router(Update_client.router)