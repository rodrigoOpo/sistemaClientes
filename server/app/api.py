from fastapi import FastAPI
from .routers import Update_client
from .database.models import Client
from .database.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(Update_client.router)