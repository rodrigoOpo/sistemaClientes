from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
#Tienes que importar la clase no el archivo
from ..schemas.request.Client import Client
from ..database import models
from ..database.database import get_db

router = APIRouter(
    tags=['Clients'],
    prefix='/clients'
)

@router.post('/')
def create_client(client : Client, db: Session = Depends(get_db)):
    #Tienes que usar la clase no el archivo por eso pongo dos veces Client(una por el archivo y otra por la clase)
    new_client = models.Client.Client(name=client.name, email=client.email, phone_number=client.phone_number)
    db.add(new_client)
    db.commit() 