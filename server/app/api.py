from fastapi import FastAPI
from fastapi import File, UploadFile
from typing import Annotated

app = FastAPI()

#Annotated allows developers to attach runtime-accesible metadata to type hints without affecting static type checking
@app.get('/forms')
def get_form(file: Annotated[bytes, File()]):
    return