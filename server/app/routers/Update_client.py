from fastapi import APIRouter

router = APIRouter(
    tags=['Clients'],
    prefix='/clients'
)

@router.post('/')
def create_client():
    return 