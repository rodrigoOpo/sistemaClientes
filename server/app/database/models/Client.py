from ..database import Base
from sqlalchemy import Column, String, Integer

class Client(Base):
    __tablename__='client'
    id=Column(Integer, primary_key=True, index=True)
    name=Column(String, nullable=False)
    email=Column(String, nullable=False)
    phone=Column(String, nullable=False)