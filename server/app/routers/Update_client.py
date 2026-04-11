from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..schemas.request.Client import Client
from ..database import models
from ..database.database import get_db

router = APIRouter(
    tags=['Clients'],
    prefix='/clients'
)

@router.post('/')
def create_client(client : Client, db: Session = Depends(get_db)):
    new_client = models.Client(name=client.name, email=client.email, phone_number=client.phone_number)
    db.add(new_client)
    db.commit() 