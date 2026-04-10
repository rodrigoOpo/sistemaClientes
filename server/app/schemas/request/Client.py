from pydantic import BaseModel

class Client(BaseModel):
    name:str
    email:str
    phone_number:str